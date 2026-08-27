import type { CorrespondenceDiagnostics, ParallaxClassification, SceneScanGeometryInputV01, SpatialPrecheckV01 } from './types.js';

const legacyClassification = (value: CorrespondenceDiagnostics): ParallaxClassification => {
  if (value.tracked_feature_count < 20 || value.inlier_ratio < .35 || value.failure_reason) return 'UNCLASSIFIED';
  if (value.median_parallax_px <= .75 && value.p75_parallax_px <= 1.5) return 'ROTATION_DOMINANT';
  if (value.median_parallax_px < 2) return 'LOW_PARALLAX';
  return 'TRANSLATION_EVIDENCE_PRESENT';
};

export const buildSpatialPrecheck = (input: SceneScanGeometryInputV01, correspondence: CorrespondenceDiagnostics, selectionLatencyMs: number): SpatialPrecheckV01 => {
  const started = performance.now();
  const diagonals = input.frames.map(frame => Math.hypot(frame.width, frame.height)).filter(value => value > 0);
  const diagonal = correspondence.working_image_diagonal_px || (diagonals.length ? diagonals.reduce((sum, value) => sum + value, 0) / diagonals.length : 1);
  const normalizedMedian = correspondence.median_parallax_px / diagonal;
  const normalizedP75 = correspondence.p75_parallax_px / diagonal;
  const unreliable = input.frames.length < 3 || correspondence.tracked_feature_count < 20 || correspondence.inlier_ratio < .35 || Boolean(correspondence.failure_reason);
  // Calibrated from the prior 160x120 diagnostic envelope: 0.75/200, 1.5/200 and 2/200.
  const rotationCompatible = normalizedMedian <= .00375 && normalizedP75 <= .0075;
  const status = unreliable ? 'UNRELIABLE' : normalizedMedian >= .01 ? 'POSSIBLE' : 'NO_SIGNAL';
  const reason = unreliable ? (correspondence.failure_reason ?? 'CORRESPONDENCE_UNRELIABLE') : status === 'POSSIBLE' ? 'NORMALIZED_RESIDUAL_SIGNAL_POSSIBLE' : rotationCompatible ? 'ROTATION_COMPATIBLE_NO_SIGNAL' : 'LOW_NORMALIZED_RESIDUAL_NO_SIGNAL';
  return {
    schema: 'xfx.spatial-precheck', schema_version: '0.1', source_sweep_id: input.source_sweep_id,
    status, authority: 'ROUTING_HINT_ONLY', reason,
    diagnostics: { correspondence_engine: 'LIGHTWEIGHT_BLOCK_FLOW', selected_frame_count: input.frames.length, tracked_feature_count: correspondence.tracked_feature_count, overlap_ratio: correspondence.match_retention, motion_inlier_ratio: correspondence.inlier_ratio, median_residual_px: correspondence.median_parallax_px, p75_residual_px: correspondence.p75_parallax_px, normalized_median_residual: normalizedMedian, normalized_p75_residual: normalizedP75, image_diagonal_px: diagonal, selection_latency_ms: selectionLatencyMs, precheck_latency_ms: correspondence.latency_ms, total_latency_ms: selectionLatencyMs + correspondence.latency_ms + performance.now() - started, estimated_memory_bytes: input.estimated_memory_bytes, legacy_calibration_classification: legacyClassification(correspondence) },
    routing: { backend_solve_recommended: status === 'POSSIBLE', evaluation_override_allowed: true },
    privacy: { raw_frames_transient: true, raw_video_uploaded: false, frame_stream_uploaded: false, selected_geometry_frame_upload: 'FIRST_PARTY_BACKEND_ONLY', provider_calls: 0, luna_calls: 0 },
  };
};
