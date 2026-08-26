import type { FrameMetrics, RejectionReason } from './types.js';
export interface QualityDecision { accepted: boolean; reason?: Extract<RejectionReason, 'BLUR' | 'UNDEREXPOSED' | 'OVEREXPOSED'>; }
export interface QualityPolicy { min_blur_score: number; min_exposure_mean: number; max_exposure_mean: number; max_clipping_ratio: number; }
export const DEFAULT_QUALITY_POLICY: QualityPolicy = { min_blur_score: 12, min_exposure_mean: 18, max_exposure_mean: 238, max_clipping_ratio: 0.72 };
export const evaluateQuality = (frame: FrameMetrics, policy = DEFAULT_QUALITY_POLICY): QualityDecision => {
  if (frame.blur_score < policy.min_blur_score) return { accepted: false, reason: 'BLUR' };
  if (frame.exposure_mean < policy.min_exposure_mean || frame.shadow_clipping_ratio > policy.max_clipping_ratio) return { accepted: false, reason: 'UNDEREXPOSED' };
  if (frame.exposure_mean > policy.max_exposure_mean || frame.highlight_clipping_ratio > policy.max_clipping_ratio) return { accepted: false, reason: 'OVEREXPOSED' };
  return { accepted: true };
};

export const metricsFromImageData = (image: ImageData, timestampMs: number, yawDeg: number): FrameMetrics => {
  const data = image.data; let sum = 0, highlights = 0, shadows = 0, edges = 0, edgeCount = 0;
  const width = image.width, height = image.height; const luma = new Float32Array(width * height); const histogram = new Array<number>(16).fill(0);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) { const y = 0.2126 * (data[i] ?? 0) + 0.7152 * (data[i + 1] ?? 0) + 0.0722 * (data[i + 2] ?? 0); luma[p] = y; sum += y; if (y >= 250) highlights++; if (y <= 5) shadows++; histogram[Math.min(15, Math.floor(y / 16))]!++; }
  for (let y = 1; y < height; y++) for (let x = 1; x < width; x++) { const p = y * width + x; edges += Math.abs((luma[p] ?? 0) - (luma[p - 1] ?? 0)) + Math.abs((luma[p] ?? 0) - (luma[p - width] ?? 0)); edgeCount += 2; }
  const pixels = Math.max(1, width * height);
  return { timestamp_ms: timestampMs, yaw_deg: yawDeg, width, height, blur_score: edges / Math.max(1, edgeCount), exposure_mean: sum / pixels, highlight_clipping_ratio: highlights / pixels, shadow_clipping_ratio: shadows / pixels, fingerprint: histogram.map((v) => v / pixels) };
};
