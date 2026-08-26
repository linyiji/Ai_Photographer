import type { FrameMetrics } from './types.js';
export const fingerprintDistance = (a?: readonly number[], b?: readonly number[]): number => {
  if (!a || !b || a.length !== b.length) return Infinity;
  return a.reduce((sum, value, index) => sum + Math.abs(value - (b[index] ?? 0)), 0);
};
export const isDuplicate = (candidate: FrameMetrics, accepted: FrameMetrics, minYawDeg = 4, maxFingerprintDistance = 0.08): boolean =>
  Math.abs(candidate.yaw_deg - accepted.yaw_deg) < minYawDeg && fingerprintDistance(candidate.fingerprint, accepted.fingerprint) <= maxFingerprintDistance;
