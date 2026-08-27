import type { PixelFrame } from '../p1/types.js';
import type { CorrespondenceDiagnostics, SceneScanGeometryInputV01 } from './types.js';

export const MAX_LIGHTWEIGHT_PAIRS = 4;
const MAX_FEATURES = 48;
const PATCH_RADIUS = 1;
type Point = { x: number; y: number };
type Track = Point & { dx: number; dy: number };

const median = (values: number[]): number => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2; };
const percentile75 = (values: number[]): number => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .75))]!; };
const grayscale = (frame: PixelFrame): Uint8Array => { const gray = new Uint8Array(frame.width * frame.height); for (let i = 0, p = 0; i < gray.length; i++, p += 4) gray[i] = Math.round(frame.data[p]! * .299 + frame.data[p + 1]! * .587 + frame.data[p + 2]! * .114); return gray; };

const detectCorners = (gray: Uint8Array, width: number, height: number): Point[] => {
  const scored: (Point & { score: number })[] = [];
  for (let y = 3; y < height - 3; y += 3) for (let x = 3; x < width - 3; x += 3) {
    const i = y * width + x; const gx = Math.abs(gray[i + 1]! - gray[i - 1]!); const gy = Math.abs(gray[i + width]! - gray[i - width]!); const score = Math.min(gx, gy) + Math.min(64, Math.abs(gx - gy));
    if (score >= 28) scored.push({ x, y, score });
  }
  scored.sort((a, b) => b.score - a.score); const selected: Point[] = [];
  for (const candidate of scored) { if (selected.every(point => Math.abs(point.x - candidate.x) > 4 || Math.abs(point.y - candidate.y) > 4)) selected.push(candidate); if (selected.length >= MAX_FEATURES) break; }
  return selected;
};

const patchSad = (a: Uint8Array, b: Uint8Array, width: number, first: Point, second: Point): number => { let total = 0; for (let oy = -PATCH_RADIUS; oy <= PATCH_RADIUS; oy++) for (let ox = -PATCH_RADIUS; ox <= PATCH_RADIUS; ox++) total += Math.abs(a[(first.y + oy) * width + first.x + ox]! - b[(second.y + oy) * width + second.x + ox]!); return total / 9; };
const track = (first: Uint8Array, second: Uint8Array, width: number, height: number, points: Point[]): Track[] => {
  const tracks: Track[] = [];
  for (const point of points) { let best = { x: point.x, y: point.y, error: Number.POSITIVE_INFINITY }; for (let dy = -6; dy <= 6; dy++) for (let dx = -10; dx <= 10; dx++) { const x = point.x + dx; const y = point.y + dy; if (x <= PATCH_RADIUS || x >= width - PATCH_RADIUS || y <= PATCH_RADIUS || y >= height - PATCH_RADIUS) continue; const error = patchSad(first, second, width, point, { x, y }); if (error < best.error) best = { x, y, error }; } if (best.error <= 42) tracks.push({ ...point, dx: best.x - point.x, dy: best.y - point.y }); }
  return tracks;
};

export const lightweightPairEndIndices = (frameCount: number): number[] => { const pairCount = Math.min(MAX_LIGHTWEIGHT_PAIRS, Math.max(0, frameCount - 1)); if (!pairCount) return []; return [...new Set(Array.from({ length: pairCount }, (_, i) => Math.max(1, Math.round(1 + i * (frameCount - 2) / Math.max(1, pairCount - 1)))))]; };

export const analyzeLightweightCorrespondence = (input: SceneScanGeometryInputV01): CorrespondenceDiagnostics => {
  const started = performance.now(); let detected = 0; let tracked = 0; let inliers = 0; const displacements: number[] = []; const residuals: number[] = []; const pairIndices = lightweightPairEndIndices(input.frames.length);
  for (const end of pairIndices) { const a = input.frames[end - 1]!.pixels; const b = input.frames[end]!.pixels; if (a.width !== b.width || a.height !== b.height) continue; const first = grayscale(a); const points = detectCorners(first, a.width, a.height); const tracks = track(first, grayscale(b), a.width, a.height, points); detected += points.length; tracked += tracks.length; const globalDx = median(tracks.map(value => value.dx)); const globalDy = median(tracks.map(value => value.dy)); for (const value of tracks) { const displacement = Math.hypot(value.dx, value.dy); const residual = Math.hypot(value.dx - globalDx, value.dy - globalDy); displacements.push(displacement); residuals.push(residual); if (residual <= 2.5) inliers++; } }
  const failure = detected < 8 ? 'INSUFFICIENT_FEATURES' : tracked < 8 ? 'INSUFFICIENT_TRACKS' : null;
  return { engine: 'LIGHTWEIGHT_BLOCK_FLOW', detected_feature_count: detected, tracked_feature_count: tracked, match_retention: detected ? tracked / detected : 0, inlier_ratio: tracked ? inliers / tracked : 0, median_displacement_px: median(displacements), median_parallax_px: median(residuals), p75_parallax_px: percentile75(residuals), latency_ms: Math.round((performance.now() - started) * 10) / 10, pair_count: pairIndices.length, failure_reason: failure };
};
