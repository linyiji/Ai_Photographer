import test from 'node:test';
import assert from 'node:assert/strict';
import { GeometryFrameSelector } from '../p2/geometry-frame-selector.js';
import { normalizeGeometryHttpError } from '../p2/geometry-backend-client.js';
import { boundedLongEdgeSize, frameSetSha256, sha256Hex } from '../p2/geometry-transport.js';
import { correspondencePairEndIndices, MAX_CORRESPONDENCE_PAIRS } from '../p2/opencv-correspondence.js';
import { analyzeLightweightCorrespondence, lightweightPairEndIndices, MAX_LIGHTWEIGHT_PAIRS } from '../p2/lightweight-correspondence.js';
import { buildSpatialPrecheck } from '../p2/spatial-precheck.js';
import type { CorrespondenceDiagnostics, SceneScanGeometryInputV01 } from '../p2/types.js';
import type { FrameMetrics } from '../sweep/types.js';

const pixels = { width: 8, height: 6, data: new Uint8ClampedArray(8 * 6 * 4).fill(128) };
const metrics = (timestamp: number, yaw: number, blur = 30, exposure = 128): FrameMetrics => ({ timestamp_ms: timestamp, yaw_deg: yaw, width: 8, height: 6, blur_score: blur, exposure_mean: exposure, highlight_clipping_ratio: 0, shadow_clipping_ratio: 0, fingerprint: [yaw / 100, 1 - yaw / 100] });
const diagnostics = (median: number, p75 = median, tracks = 100, inliers = .8): CorrespondenceDiagnostics => ({ engine: 'LIGHTWEIGHT_BLOCK_FLOW', detected_feature_count: 120, tracked_feature_count: tracks, match_retention: tracks / 120, inlier_ratio: inliers, median_displacement_px: 5, median_parallax_px: median, p75_parallax_px: p75, latency_ms: 12, pair_count: 4, failure_reason: null, working_image_diagonal_px: 200 });
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

test('GeometryFrameSelector is independent and bounded at eight frames', () => { const selector = new GeometryFrameSelector(); for (let i = 0; i < 40; i++) selector.observe(metrics(i * 250, i * .4), pixels, 'CONTROLLED_FIXTURE'); assert.equal(selector.frames.length, 8); });
test('GeometryFrameSelector prefers temporal adjacency', () => { const selector = new GeometryFrameSelector(); assert.equal(selector.observe(metrics(0, 0), pixels, 'CONTROLLED_FIXTURE'), true); assert.equal(selector.observe(metrics(125, 1), pixels, 'CONTROLLED_FIXTURE'), false); assert.equal(selector.observe(metrics(250, 2), pixels, 'CONTROLLED_FIXTURE'), true); });
test('GeometryFrameSelector rejects blur and exposure failures', () => { const selector = new GeometryFrameSelector(); assert.equal(selector.observe(metrics(0, 0, 1), pixels, 'CONTROLLED_FIXTURE'), false); assert.equal(selector.observe(metrics(125, 0, 30, 250), pixels, 'CONTROLLED_FIXTURE'), false); });
test('geometry working image uses bounded long edge for portrait landscape square and small inputs', () => { assert.deepEqual(boundedLongEdgeSize(1080, 1920), { width: 360, height: 640 }); assert.deepEqual(boundedLongEdgeSize(1920, 1080), { width: 640, height: 360 }); assert.deepEqual(boundedLongEdgeSize(1200, 1200), { width: 640, height: 640 }); assert.deepEqual(boundedLongEdgeSize(300, 500), { width: 300, height: 500 }); assert.deepEqual(boundedLongEdgeSize(500, 300), { width: 500, height: 300 }); });
test('geometry resize never exceeds target and never upscales', () => { for (const [width, height] of [[1080, 1920], [1920, 1080], [1200, 1200], [300, 500], [500, 300]]) { const output = boundedLongEdgeSize(width!, height!); assert.ok(Math.max(output.width, output.height) <= 640); assert.ok(output.width <= width!); assert.ok(output.height <= height!); } });
test('raw binary frame hashes and ordered frame-set hash are deterministic', async () => { const a = new Uint8Array([0xff, 0xd8, 0, 13, 10, 0x80, 0xff, 0xd9]); const b = new Uint8Array([0, 1, 2, 13, 10, 255]); const hashes = await Promise.all([sha256Hex(a.buffer), sha256Hex(b.buffer)]); assert.equal(hashes[0], await sha256Hex(a.buffer)); const forward = await frameSetSha256([{ frame_id: 'f1', frame_sha256: hashes[0]! }, { frame_id: 'f2', frame_sha256: hashes[1]! }]); const repeat = await frameSetSha256([{ frame_id: 'f1', frame_sha256: hashes[0]! }, { frame_id: 'f2', frame_sha256: hashes[1]! }]); const reversed = await frameSetSha256([{ frame_id: 'f2', frame_sha256: hashes[1]! }, { frame_id: 'f1', frame_sha256: hashes[0]! }]); assert.equal(forward, repeat); assert.notEqual(forward, reversed); });
test('backend JSON and text HTTP error bodies are preserved', async () => { const jsonError = await normalizeGeometryHttpError(new Response(JSON.stringify({ error: 'FRAME_SET_HASH_MISMATCH', message: 'declared hash differs', details: { frame: 1 } }), { status: 400, headers: { 'content-type': 'application/json' } })); assert.equal(jsonError.status, 400); assert.equal(jsonError.code, 'FRAME_SET_HASH_MISMATCH'); assert.equal(jsonError.message, 'declared hash differs'); assert.deepEqual(jsonError.details, { error: 'FRAME_SET_HASH_MISMATCH', message: 'declared hash differs', details: { frame: 1 } }); const textError = await normalizeGeometryHttpError(new Response('proxy unavailable', { status: 502, headers: { 'content-type': 'text/plain' } })); assert.equal(textError.code, 'HTTP_502'); assert.equal(textError.message, 'proxy unavailable'); });
test('Geometry input has transient privacy boundary and bounded memory', () => { const value = input(); assert.equal(value.lifecycle, 'TRANSIENT_LOCAL_MEMORY'); assert.equal(value.raw_media_persisted, false); assert.equal(value.frames.length, 8); assert.equal(value.estimated_memory_bytes, 8 * pixels.data.byteLength); });
test('rotation-compatible client evidence becomes NO_SIGNAL routing hint', () => assert.equal(buildSpatialPrecheck(input(), diagnostics(.3, .7), 1).status, 'NO_SIGNAL'));
test('low residual client evidence remains NO_SIGNAL routing hint', () => assert.equal(buildSpatialPrecheck(input(), diagnostics(1.2, 1.8), 1).status, 'NO_SIGNAL'));
test('translation-like residual becomes POSSIBLE routing hint', () => assert.equal(buildSpatialPrecheck(input(), diagnostics(3, 5), 1).status, 'POSSIBLE'));
test('weak correspondence becomes UNRELIABLE routing hint', () => assert.equal(buildSpatialPrecheck(input(), diagnostics(3, 5, 8, .2), 1).status, 'UNRELIABLE'));
test('client precheck authority is routing only and has no spatial status', () => { const value = buildSpatialPrecheck(input(), diagnostics(3, 5), 1); assert.equal(value.authority, 'ROUTING_HINT_ONLY'); assert.equal('metric_scale_available' in value, false); });
test('client precheck normalizes residual by diagnostic diagonal', () => assert.equal(buildSpatialPrecheck(input(), diagnostics(3), 1).diagnostics.normalized_median_residual, .015));
test('exportable precheck contains no raw pixels', () => assert.equal(JSON.stringify(buildSpatialPrecheck(input(), diagnostics(3), 1)).includes('pixels'), false));
test('correspondence analysis bounds work to seven distributed adjacent pairs', () => { const indices = correspondencePairEndIndices(10); assert.equal(indices.length, MAX_CORRESPONDENCE_PAIRS); assert.equal(indices[0], 1); assert.equal(indices.at(-1), 9); assert.deepEqual(indices, [...indices].sort((a, b) => a - b)); });
test('lightweight client analysis is bounded to four distributed pairs', () => { const indices = lightweightPairEndIndices(10); assert.equal(indices.length, MAX_LIGHTWEIGHT_PAIRS); assert.equal(indices[0], 1); assert.equal(indices.at(-1), 9); });
test('lightweight client analysis tracks global image motion without claiming parallax', () => { const value = analyzeLightweightCorrespondence(syntheticInput()); assert.equal(value.engine, 'LIGHTWEIGHT_BLOCK_FLOW'); assert.ok(value.tracked_feature_count >= 8); assert.ok(value.median_parallax_px <= 1); });
test('lightweight client analysis detects layered residual motion', () => { const global = analyzeLightweightCorrespondence(syntheticInput()); const layered = analyzeLightweightCorrespondence(syntheticInput(true)); assert.ok(layered.p75_parallax_px > global.p75_parallax_px); assert.ok(layered.latency_ms < 250); });
