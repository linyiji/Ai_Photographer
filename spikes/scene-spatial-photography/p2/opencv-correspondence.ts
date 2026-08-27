import type { PixelFrame } from '../p1/types.js';
import type { CorrespondenceDiagnostics, CorrespondenceEngine, SceneScanGeometryInputV01 } from './types.js';

type Point = { x: number; y: number };
const median = (values: readonly number[]): number => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2; };
const percentile = (values: readonly number[], ratio: number): number => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor((sorted.length - 1) * ratio)]!; };
const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
const grayMat = (cv: any, frame: PixelFrame): any => { const rgba = cv.matFromArray(frame.height, frame.width, cv.CV_8UC4, frame.data); const gray = new cv.Mat(); cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY); rgba.delete(); return gray; };
const pointsMat = (cv: any, points: readonly Point[]): any => cv.matFromArray(points.length, 1, cv.CV_32FC2, points.flatMap(point => [point.x, point.y]));
const matPoints = (mat: any): Point[] => { const data: Float32Array = mat.data32F; const points: Point[] = []; for (let i = 0; i + 1 < data.length; i += 2) points.push({ x: data[i]!, y: data[i + 1]! }); return points; };
const homographyResiduals = (cv: any, source: readonly Point[], target: readonly Point[]): { residuals: number[]; inlierRatio: number } => {
  if (source.length < 4) return { residuals: [], inlierRatio: 0 };
  const src = pointsMat(cv, source), dst = pointsMat(cv, target), mask = new cv.Mat();
  try {
    const h = cv.findHomography(src, dst, cv.RANSAC, 3, mask); if (!h || h.empty()) { h?.delete(); return { residuals: [], inlierRatio: 0 }; }
    const at = (row: number, column: number): number => h.type() === cv.CV_64F ? h.doubleAt(row, column) : h.floatAt(row, column);
    const residuals = source.map((p, index) => { const z = at(2, 0) * p.x + at(2, 1) * p.y + at(2, 2); const q = { x: (at(0, 0) * p.x + at(0, 1) * p.y + at(0, 2)) / z, y: (at(1, 0) * p.x + at(1, 1) * p.y + at(1, 2)) / z }; return distance(q, target[index]!); });
    let inliers = 0; for (let i = 0; i < mask.rows; i++) if (mask.ucharAt(i, 0)) inliers++; h.delete(); return { residuals, inlierRatio: inliers / source.length };
  } finally { src.delete(); dst.delete(); mask.delete(); }
};
type PairResult = { detected: number; tracked: number; displacement: number[]; residuals: number[]; inlierRatio: number };
export const MAX_CORRESPONDENCE_PAIRS = 7;
export const correspondencePairEndIndices = (frameCount: number, maxPairs = MAX_CORRESPONDENCE_PAIRS): number[] => {
  const available = Math.max(0, frameCount - 1); if (available <= maxPairs) return Array.from({ length: available }, (_, index) => index + 1);
  return [...new Set(Array.from({ length: maxPairs }, (_, index) => 1 + Math.round(index * (available - 1) / (maxPairs - 1))))];
};
const gfttPair = (cv: any, a: PixelFrame, b: PixelFrame): PairResult => {
  const ga = grayMat(cv, a), gb = grayMat(cv, b), p0 = new cv.Mat(), p1 = new cv.Mat(), status = new cv.Mat(), error = new cv.Mat(), mask = new cv.Mat();
  try {
    cv.goodFeaturesToTrack(ga, p0, 180, .01, 7, mask, 3, false, .04); const detected = p0.rows;
    cv.calcOpticalFlowPyrLK(ga, gb, p0, p1, status, error, new cv.Size(15, 15), 2, new cv.TermCriteria(cv.TermCriteria_COUNT | cv.TermCriteria_EPS, 20, .02));
    const before = matPoints(p0), after = matPoints(p1), source: Point[] = [], target: Point[] = [];
    for (let i = 0; i < before.length; i++) if (status.ucharAt(i, 0)) { source.push(before[i]!); target.push(after[i]!); }
    const h = homographyResiduals(cv, source, target); return { detected, tracked: source.length, displacement: source.map((p, i) => distance(p, target[i]!)), residuals: h.residuals, inlierRatio: h.inlierRatio };
  } finally { ga.delete(); gb.delete(); p0.delete(); p1.delete(); status.delete(); error.delete(); mask.delete(); }
};
const orbPair = (cv: any, a: PixelFrame, b: PixelFrame): PairResult => {
  const ga = grayMat(cv, a), gb = grayMat(cv, b), orb = new cv.ORB(400), ka = new cv.KeyPointVector(), kb = new cv.KeyPointVector(), da = new cv.Mat(), db = new cv.Mat(), mask = new cv.Mat(), matches = new cv.DMatchVector(), matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);
  try {
    orb.detectAndCompute(ga, mask, ka, da); orb.detectAndCompute(gb, mask, kb, db); if (da.empty() || db.empty()) return { detected: ka.size(), tracked: 0, displacement: [], residuals: [], inlierRatio: 0 };
    matcher.match(da, db, matches); const ordered = Array.from({ length: matches.size() }, (_, i) => matches.get(i)).sort((x: any, y: any) => x.distance - y.distance).slice(0, 250);
    const source = ordered.map((m: any) => ka.get(m.queryIdx).pt), target = ordered.map((m: any) => kb.get(m.trainIdx).pt); const h = homographyResiduals(cv, source, target);
    return { detected: ka.size(), tracked: source.length, displacement: source.map((p: Point, i: number) => distance(p, target[i]!)), residuals: h.residuals, inlierRatio: h.inlierRatio };
  } finally { ga.delete(); gb.delete(); orb.delete(); ka.delete(); kb.delete(); da.delete(); db.delete(); mask.delete(); matches.delete(); matcher.delete(); }
};
export const analyzeCorrespondence = (cv: any, input: SceneScanGeometryInputV01, engine: CorrespondenceEngine): CorrespondenceDiagnostics => {
  const started = performance.now(), results: PairResult[] = [];
  try {
    for (const i of correspondencePairEndIndices(input.frames.length)) results.push(engine === 'GFTT_PYRLK' ? gfttPair(cv, input.frames[i - 1]!.pixels, input.frames[i]!.pixels) : orbPair(cv, input.frames[i - 1]!.pixels, input.frames[i]!.pixels));
    const detected = results.reduce((s, r) => s + r.detected, 0), tracked = results.reduce((s, r) => s + r.tracked, 0), displacement = results.flatMap(r => r.displacement), residuals = results.flatMap(r => r.residuals);
    return { engine, detected_feature_count: detected, tracked_feature_count: tracked, match_retention: detected ? tracked / detected : 0, inlier_ratio: results.length ? results.reduce((s, r) => s + r.inlierRatio, 0) / results.length : 0, median_displacement_px: median(displacement), median_parallax_px: median(residuals), p75_parallax_px: percentile(residuals, .75), latency_ms: performance.now() - started, pair_count: results.length, failure_reason: results.length && tracked >= 20 ? null : input.frames.length < 2 ? 'INSUFFICIENT_FRAMES' : 'INSUFFICIENT_TRACKS' };
  } catch (error) {
    return { engine, detected_feature_count: 0, tracked_feature_count: 0, match_retention: 0, inlier_ratio: 0, median_displacement_px: 0, median_parallax_px: 0, p75_parallax_px: 0, latency_ms: performance.now() - started, pair_count: 0, failure_reason: error instanceof Error ? error.message : 'CORRESPONDENCE_FAILED' };
  }
};
export const selectPrimaryCorrespondence = (gftt: CorrespondenceDiagnostics, orb: CorrespondenceDiagnostics): CorrespondenceDiagnostics => {
  const score = (d: CorrespondenceDiagnostics): number => (d.failure_reason ? -10 : 0) + d.inlier_ratio * 2 + d.match_retention - d.latency_ms / 5000;
  return score(gftt) >= score(orb) ? gftt : orb;
};
