import type { CameraPlacementCandidateV01, CandidateShotV01, CorrespondenceDiagnostics, ParallaxClassification, SceneScanGeometryInputV01, SpatialEvidenceV01, SubjectPlacementCandidateV01 } from './types.js';
import type { PhotographyViewCandidateV01 } from '../p1/types.js';

export const classifyParallax = (d: CorrespondenceDiagnostics): ParallaxClassification => {
  if (d.tracked_feature_count < 20 || d.inlier_ratio < .35 || d.failure_reason) return 'UNCLASSIFIED';
  if (d.median_parallax_px <= .75 && d.p75_parallax_px <= 1.5) return 'ROTATION_DOMINANT';
  if (d.median_parallax_px < 2.0) return 'LOW_PARALLAX';
  return 'TRANSLATION_EVIDENCE_PRESENT';
};
export const buildClientSpatialEvidence = (input: SceneScanGeometryInputV01, correspondence: CorrespondenceDiagnostics, selectionLatencyMs: number): SpatialEvidenceV01 => {
  const started = performance.now(), classification = classifyParallax(correspondence);
  const partial = classification === 'TRANSLATION_EVIDENCE_PRESENT';
  const reasons = input.frames.length < 3 ? ['INSUFFICIENT_FRAMES'] : classification === 'ROTATION_DOMINANT' ? ['PURE_ROTATION_OR_HOMOGRAPHY_DOMINANT'] : classification === 'LOW_PARALLAX' ? ['LOW_PARALLAX'] : classification === 'TRANSLATION_EVIDENCE_PRESENT' ? ['TRANSLATION_EVIDENCE_CLIENT_ONLY', 'POSE_TRIANGULATION_UNAVAILABLE_IN_CLIENT_BUILD'] : ['CORRESPONDENCE_UNRELIABLE'];
  return { schema: 'xfx.spatial-evidence', schema_version: '0.1', source_sweep_id: input.source_sweep_id, status: partial ? 'PARTIAL' : 'INSUFFICIENT', geometry_type: partial ? 'SPARSE_RELATIVE' : 'UNKNOWN', metric_scale_available: false, confidence: partial ? Math.min(.74, correspondence.inlier_ratio) : 0,
    parallax_classification: classification,
    diagnostics: { correspondence_engine: correspondence.engine, selected_frame_count: input.frames.length, tracked_feature_count: correspondence.tracked_feature_count, inlier_ratio: correspondence.inlier_ratio, median_parallax: correspondence.median_parallax_px, pose_stability: null, triangulated_point_count: 0, positive_depth_ratio: null, reprojection_error: null, geometry_coverage: 0, selection_latency_ms: selectionLatencyMs, correspondence_latency_ms: correspondence.latency_ms, pose_latency_ms: 0, triangulation_latency_ms: 0, total_latency_ms: selectionLatencyMs + correspondence.latency_ms + performance.now() - started, estimated_memory_bytes: input.estimated_memory_bytes },
    relative_camera_motion: { rotation: classification === 'UNCLASSIFIED' ? 'UNKNOWN' : 'ESTIMATED', translation_direction: 'UNKNOWN', evidence_class: 'UNKNOWN', metric_distance: 'UNKNOWN', coordinate_convention: 'CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD' },
    relative_depth_summary: { source: 'NONE', categories: [], status: 'UNKNOWN' }, visibility_summary: { status: 'UNKNOWN', note: 'NO_VALIDATED_TRIANGULATION' }, occlusion_summary: { status: 'UNKNOWN', note: 'NO_SEMANTIC_OR_DENSE_GEOMETRY' }, evidence_refs: input.frames.map(frame => frame.frame_id), limitations: ['NON_METRIC', 'CLIENT_HAS_NO_ESSENTIAL_MATRIX_RECOVER_POSE_OR_TRIANGULATION', 'NO_PHYSICAL_SAFETY_AUTHORITY'], reasons,
    privacy: { raw_frames_transient: true, raw_media_persisted: false, raw_media_uploaded: false, provider_calls: 0, backend_per_frame_calls: 0, luna_calls: 0 } };
};
export interface ValidatedGeometryReference {
  source_sweep_id: string; correspondence: CorrespondenceDiagnostics; selected_frame_count: number; estimated_memory_bytes: number;
  translation_direction: 'LEFT' | 'RIGHT' | 'FORWARD' | 'BACKWARD' | 'UNKNOWN'; pose_stability: number;
  triangulated_point_count: number; positive_depth_ratio: number; reprojection_error: number; geometry_coverage: number;
  pose_latency_ms: number; triangulation_latency_ms: number;
}
export const buildValidatedSpatialEvidence = (reference: ValidatedGeometryReference): SpatialEvidenceV01 => {
  const classification = classifyParallax(reference.correspondence);
  const usable = classification === 'TRANSLATION_EVIDENCE_PRESENT' && reference.correspondence.inlier_ratio >= .35 && reference.pose_stability >= .75 && reference.triangulated_point_count >= 20 && reference.positive_depth_ratio >= .75 && reference.reprojection_error <= 2;
  const status = usable ? 'USABLE' : classification === 'TRANSLATION_EVIDENCE_PRESENT' ? 'PARTIAL' : 'INSUFFICIENT';
  return { schema: 'xfx.spatial-evidence', schema_version: '0.1', source_sweep_id: reference.source_sweep_id, status, geometry_type: usable ? 'SPARSE_RELATIVE' : 'UNKNOWN', metric_scale_available: false, confidence: usable ? Math.min(reference.correspondence.inlier_ratio, reference.pose_stability, reference.positive_depth_ratio) : 0, parallax_classification: classification,
    diagnostics: { correspondence_engine: reference.correspondence.engine, selected_frame_count: reference.selected_frame_count, tracked_feature_count: reference.correspondence.tracked_feature_count, inlier_ratio: reference.correspondence.inlier_ratio, median_parallax: reference.correspondence.median_parallax_px, pose_stability: reference.pose_stability, triangulated_point_count: reference.triangulated_point_count, positive_depth_ratio: reference.positive_depth_ratio, reprojection_error: reference.reprojection_error, geometry_coverage: reference.geometry_coverage, selection_latency_ms: 0, correspondence_latency_ms: reference.correspondence.latency_ms, pose_latency_ms: reference.pose_latency_ms, triangulation_latency_ms: reference.triangulation_latency_ms, total_latency_ms: reference.correspondence.latency_ms + reference.pose_latency_ms + reference.triangulation_latency_ms, estimated_memory_bytes: reference.estimated_memory_bytes },
    relative_camera_motion: { rotation: 'ESTIMATED', translation_direction: usable ? reference.translation_direction : 'UNKNOWN', evidence_class: usable ? 'FACT' : 'UNKNOWN', metric_distance: 'UNKNOWN', coordinate_convention: 'CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD' }, relative_depth_summary: { source: usable ? 'SPARSE_GEOMETRY' : 'NONE', categories: usable ? ['NEAR', 'MID', 'FAR'] : [], status: usable ? 'AVAILABLE' : 'UNKNOWN' }, visibility_summary: { status: usable ? 'PARTIAL' : 'UNKNOWN', note: usable ? 'SPARSE_POINT_VISIBILITY_ONLY' : 'NO_VALIDATED_TRIANGULATION' }, occlusion_summary: { status: usable ? 'PARTIAL' : 'UNKNOWN', note: usable ? 'SPARSE_OBSTRUCTION_PROXY_ONLY' : 'NO_SEMANTIC_OR_DENSE_GEOMETRY' }, evidence_refs: [`reference:${reference.source_sweep_id}`], limitations: ['NON_METRIC', 'SPARSE_GEOMETRY_ONLY', 'NO_PHYSICAL_SAFETY_AUTHORITY'], reasons: usable ? ['ROBUST_CORRESPONDENCE', 'PARALLAX_PRESENT', 'POSE_AND_TRIANGULATION_VALIDATED'] : ['GEOMETRY_VALIDATION_FAILED'], privacy: { raw_frames_transient: true, raw_media_persisted: false, raw_media_uploaded: false, provider_calls: 0, backend_per_frame_calls: 0, luna_calls: 0 } };
};
export const probePhotographyAffordance = (evidence: SpatialEvidenceV01, views: readonly PhotographyViewCandidateV01[]): { subjects: SubjectPlacementCandidateV01[]; cameras: CameraPlacementCandidateV01[]; shots: CandidateShotV01[] } => {
  if (evidence.status !== 'USABLE') return { subjects: [], cameras: [], shots: [] };
  // Sparse geometry alone does not prove support or free space. Keep physical placement unresolved.
  const cameras = views.map((view, index): CameraPlacementCandidateV01 => ({ candidate_id: `camera-${index + 1}`, direction: view.relative_camera_yaw_deg < -8 ? 'SLIGHTLY_LEFT' : view.relative_camera_yaw_deg > 8 ? 'SLIGHTLY_RIGHT' : 'CURRENT', confidence: Math.min(.7, evidence.confidence), evidence_class: 'CANDIDATE', metric_distance: 'UNKNOWN', limitations: ['NON_METRIC', 'PHYSICAL_SAFETY_UNKNOWN'] }));
  return { subjects: [], cameras, shots: [] };
};
