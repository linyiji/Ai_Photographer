import test from 'node:test';
import assert from 'node:assert/strict';
import { GeometryFrameSelector } from '../p2/geometry-frame-selector.js';
import { correspondencePairEndIndices, MAX_CORRESPONDENCE_PAIRS } from '../p2/opencv-correspondence.js';
import { analyzeLightweightCorrespondence, lightweightPairEndIndices, MAX_LIGHTWEIGHT_PAIRS } from '../p2/lightweight-correspondence.js';
import { buildClientSpatialEvidence, buildValidatedSpatialEvidence, classifyParallax, probePhotographyAffordance } from '../p2/spatial-evidence.js';
import type { CorrespondenceDiagnostics, SceneScanGeometryInputV01 } from '../p2/types.js';
import type { FrameMetrics } from '../sweep/types.js';

const pixels = { width: 8, height: 6, data: new Uint8ClampedArray(8 * 6 * 4).fill(128) };
const metrics = (timestamp: number, yaw: number, blur = 30, exposure = 128): FrameMetrics => ({ timestamp_ms: timestamp, yaw_deg: yaw, width: 8, height: 6, blur_score: blur, exposure_mean: exposure, highlight_clipping_ratio: 0, shadow_clipping_ratio: 0, fingerprint: [yaw / 100, 1 - yaw / 100] });
const diagnostics = (median: number, p75 = median, tracks = 100, inliers = .8): CorrespondenceDiagnostics => ({ engine: 'GFTT_PYRLK', detected_feature_count: 120, tracked_feature_count: tracks, match_retention: tracks / 120, inlier_ratio: inliers, median_displacement_px: 5, median_parallax_px: median, p75_parallax_px: p75, latency_ms: 12, pair_count: 7, failure_reason: null });
const input = (): SceneScanGeometryInputV01 => { const selector = new GeometryFrameSelector(); for (let i = 0; i < 8; i++) selector.observe(metrics(i * 250, i * 2), pixels, 'CONTROLLED_FIXTURE'); return selector.input('fixture'); };
const syntheticInput = (layered = false): SceneScanGeometryInputV01 => {
  const selector = new GeometryFrameSelector(); const width = 72; const height = 48;
  for (let frame = 0; frame < 8; frame++) {
    const data = new Uint8ClampedArray(width * height * 4); data.fill(24);
    for (let y = 6; y < height - 6; y += 8) for (let x = 6; x < width - 12; x += 9) {
      const dx = frame * (layered && y > height / 2 ? 2 : 1); const px = x + dx; const py = y;
      for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) { const offset = ((py + oy) * width + px + ox) * 4; const value = (ox === 0 || oy === 0) ? 240 : 72; data[offset] = value; data[offset + 1] = value; data[offset + 2] = value; data[offset + 3] = 255; }
    }
    selector.observe(metrics(frame * 250, frame * 2), { width, height, data }, 'CONTROLLED_FIXTURE');
  }
  return selector.input(layered ? 'layered' : 'global');
};

test('GeometryFrameSelector is independent and bounded at ten frames', () => { const selector = new GeometryFrameSelector(); for (let i = 0; i < 40; i++) selector.observe(metrics(i * 250, i * .4), pixels, 'CONTROLLED_FIXTURE'); assert.equal(selector.frames.length, 10); });
test('GeometryFrameSelector prefers temporal adjacency', () => { const selector = new GeometryFrameSelector(); assert.equal(selector.observe(metrics(0, 0), pixels, 'CONTROLLED_FIXTURE'), true); assert.equal(selector.observe(metrics(125, 1), pixels, 'CONTROLLED_FIXTURE'), false); assert.equal(selector.observe(metrics(250, 2), pixels, 'CONTROLLED_FIXTURE'), true); });
test('GeometryFrameSelector rejects blur and exposure failures', () => { const selector = new GeometryFrameSelector(); assert.equal(selector.observe(metrics(0, 0, 1), pixels, 'CONTROLLED_FIXTURE'), false); assert.equal(selector.observe(metrics(125, 0, 30, 250), pixels, 'CONTROLLED_FIXTURE'), false); });
test('Geometry input has transient privacy boundary and bounded memory', () => { const value = input(); assert.equal(value.lifecycle, 'TRANSIENT_LOCAL_MEMORY'); assert.equal(value.raw_media_persisted, false); assert.equal(value.frames.length, 8); assert.equal(value.estimated_memory_bytes, 8 * pixels.data.byteLength); });
test('pure rotation classifier is deterministic', () => assert.equal(classifyParallax(diagnostics(.3, .7)), 'ROTATION_DOMINANT'));
test('low parallax classifier is deterministic', () => assert.equal(classifyParallax(diagnostics(1.2, 1.8)), 'LOW_PARALLAX'));
test('translation evidence classifier is deterministic', () => assert.equal(classifyParallax(diagnostics(3, 5)), 'TRANSLATION_EVIDENCE_PRESENT'));
test('weak correspondence remains unclassified', () => assert.equal(classifyParallax(diagnostics(3, 5, 8, .2)), 'UNCLASSIFIED'));
test('pure rotation false usable is zero', () => assert.equal(buildClientSpatialEvidence(input(), diagnostics(.3, .7), 1).status, 'INSUFFICIENT'));
test('low parallax false usable is zero', () => assert.equal(buildClientSpatialEvidence(input(), diagnostics(1.2, 1.8), 1).status, 'INSUFFICIENT'));
test('client translation is partial without pose and triangulation', () => { const value = buildClientSpatialEvidence(input(), diagnostics(3, 5), 1); assert.equal(value.status, 'PARTIAL'); assert.equal(value.diagnostics.triangulated_point_count, 0); });
test('SpatialEvidence never provides metric scale', () => assert.equal(buildClientSpatialEvidence(input(), diagnostics(3), 1).metric_scale_available, false));
test('affordance does not manufacture STAND zones from partial geometry', () => assert.deepEqual(probePhotographyAffordance(buildClientSpatialEvidence(input(), diagnostics(3), 1), []), { subjects: [], cameras: [], shots: [] }));
test('exportable SpatialEvidence contains no raw pixels', () => assert.equal(JSON.stringify(buildClientSpatialEvidence(input(), diagnostics(3), 1)).includes('pixels'), false));
test('correspondence analysis bounds work to seven distributed adjacent pairs', () => { const indices = correspondencePairEndIndices(10); assert.equal(indices.length, MAX_CORRESPONDENCE_PAIRS); assert.equal(indices[0], 1); assert.equal(indices.at(-1), 9); assert.deepEqual(indices, [...indices].sort((a, b) => a - b)); });
test('lightweight client analysis is bounded to four distributed pairs', () => { const indices = lightweightPairEndIndices(10); assert.equal(indices.length, MAX_LIGHTWEIGHT_PAIRS); assert.equal(indices[0], 1); assert.equal(indices.at(-1), 9); });
test('lightweight client analysis tracks global image motion without claiming parallax', () => { const value = analyzeLightweightCorrespondence(syntheticInput()); assert.equal(value.engine, 'LIGHTWEIGHT_BLOCK_FLOW'); assert.ok(value.tracked_feature_count >= 8); assert.ok(value.median_parallax_px <= 1); });
test('lightweight client analysis detects layered residual motion', () => { const global = analyzeLightweightCorrespondence(syntheticInput()); const layered = analyzeLightweightCorrespondence(syntheticInput(true)); assert.ok(layered.p75_parallax_px > global.p75_parallax_px); assert.ok(layered.latency_ms < 250); });
test('validated non-metric reference produces usable sparse relative evidence', () => { const value = buildValidatedSpatialEvidence({ source_sweep_id: 'controlled-right', correspondence: diagnostics(3, 5, 100, .9), selected_frame_count: 8, estimated_memory_bytes: 1024, translation_direction: 'RIGHT', pose_stability: .95, triangulated_point_count: 90, positive_depth_ratio: .98, reprojection_error: .4, geometry_coverage: .7, pose_latency_ms: 4, triangulation_latency_ms: 2 }); assert.equal(value.status, 'USABLE'); assert.equal(value.relative_camera_motion.translation_direction, 'RIGHT'); assert.equal(value.relative_depth_summary.status, 'AVAILABLE'); assert.equal(value.metric_scale_available, false); });
test('validated pure rotation still cannot become usable', () => { const value = buildValidatedSpatialEvidence({ source_sweep_id: 'controlled-rotation', correspondence: diagnostics(.2, .4, 100, .99), selected_frame_count: 8, estimated_memory_bytes: 1024, translation_direction: 'UNKNOWN', pose_stability: 1, triangulated_point_count: 100, positive_depth_ratio: 1, reprojection_error: 0, geometry_coverage: 1, pose_latency_ms: 1, triangulation_latency_ms: 1 }); assert.equal(value.status, 'INSUFFICIENT'); });
