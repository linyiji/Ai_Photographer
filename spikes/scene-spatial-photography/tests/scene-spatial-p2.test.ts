import test from 'node:test';
import assert from 'node:assert/strict';
import { GeometryFrameSelector } from '../p2/geometry-frame-selector.js';
import { buildClientSpatialEvidence, buildValidatedSpatialEvidence, classifyParallax, probePhotographyAffordance } from '../p2/spatial-evidence.js';
import type { CorrespondenceDiagnostics, SceneScanGeometryInputV01 } from '../p2/types.js';
import type { FrameMetrics } from '../sweep/types.js';

const pixels = { width: 8, height: 6, data: new Uint8ClampedArray(8 * 6 * 4).fill(128) };
const metrics = (timestamp: number, yaw: number, blur = 30, exposure = 128): FrameMetrics => ({ timestamp_ms: timestamp, yaw_deg: yaw, width: 8, height: 6, blur_score: blur, exposure_mean: exposure, highlight_clipping_ratio: 0, shadow_clipping_ratio: 0, fingerprint: [yaw / 100, 1 - yaw / 100] });
const diagnostics = (median: number, p75 = median, tracks = 100, inliers = .8): CorrespondenceDiagnostics => ({ engine: 'GFTT_PYRLK', detected_feature_count: 120, tracked_feature_count: tracks, match_retention: tracks / 120, inlier_ratio: inliers, median_displacement_px: 5, median_parallax_px: median, p75_parallax_px: p75, latency_ms: 12, pair_count: 7, failure_reason: null });
const input = (): SceneScanGeometryInputV01 => { const selector = new GeometryFrameSelector(); for (let i = 0; i < 8; i++) selector.observe(metrics(i * 125, i * 2), pixels, 'CONTROLLED_FIXTURE'); return selector.input('fixture'); };

test('GeometryFrameSelector is independent and bounded at sixteen frames', () => { const selector = new GeometryFrameSelector(); for (let i = 0; i < 40; i++) selector.observe(metrics(i * 125, i * .4), pixels, 'CONTROLLED_FIXTURE'); assert.equal(selector.frames.length, 16); });
test('GeometryFrameSelector prefers temporal adjacency', () => { const selector = new GeometryFrameSelector(); assert.equal(selector.observe(metrics(0, 0), pixels, 'CONTROLLED_FIXTURE'), true); assert.equal(selector.observe(metrics(40, 1), pixels, 'CONTROLLED_FIXTURE'), false); assert.equal(selector.observe(metrics(125, 2), pixels, 'CONTROLLED_FIXTURE'), true); });
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
test('validated non-metric reference produces usable sparse relative evidence', () => { const value = buildValidatedSpatialEvidence({ source_sweep_id: 'controlled-right', correspondence: diagnostics(3, 5, 100, .9), selected_frame_count: 8, estimated_memory_bytes: 1024, translation_direction: 'RIGHT', pose_stability: .95, triangulated_point_count: 90, positive_depth_ratio: .98, reprojection_error: .4, geometry_coverage: .7, pose_latency_ms: 4, triangulation_latency_ms: 2 }); assert.equal(value.status, 'USABLE'); assert.equal(value.relative_camera_motion.translation_direction, 'RIGHT'); assert.equal(value.relative_depth_summary.status, 'AVAILABLE'); assert.equal(value.metric_scale_available, false); });
test('validated pure rotation still cannot become usable', () => { const value = buildValidatedSpatialEvidence({ source_sweep_id: 'controlled-rotation', correspondence: diagnostics(.2, .4, 100, .99), selected_frame_count: 8, estimated_memory_bytes: 1024, translation_direction: 'UNKNOWN', pose_stability: 1, triangulated_point_count: 100, positive_depth_ratio: 1, reprojection_error: 0, geometry_coverage: 1, pose_latency_ms: 1, triangulation_latency_ms: 1 }); assert.equal(value.status, 'INSUFFICIENT'); });
