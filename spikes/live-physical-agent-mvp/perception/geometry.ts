import type { LandmarkSample, PerceptionConfig, PoseMeasurement } from './types.js';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function extractPoseMeasurement(
  landmarks: readonly LandmarkSample[],
  timestampMs: number,
  config: Pick<PerceptionConfig, 'visibilityThreshold' | 'presenceThreshold' | 'minimumValidLandmarks'>,
): PoseMeasurement | null {
  const valid = landmarks.filter((landmark) => {
    const visibility = landmark.visibility ?? 0;
    const presence = landmark.presence ?? visibility;
    return Number.isFinite(landmark.x)
      && Number.isFinite(landmark.y)
      && visibility >= config.visibilityThreshold
      && presence >= config.presenceThreshold;
  });

  if (valid.length < config.minimumValidLandmarks) return null;

  const xs = valid.map((landmark) => clamp01(landmark.x));
  const ys = valid.map((landmark) => clamp01(landmark.y));
  const confidences = valid.map((landmark) => {
    const visibility = clamp01(landmark.visibility ?? 0);
    const presence = clamp01(landmark.presence ?? visibility);
    return Math.min(visibility, presence);
  });
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const confidence = confidences.reduce((sum, value) => sum + value, 0) / confidences.length;

  const measurement: PoseMeasurement = {
    timestamp_ms: timestampMs,
    confidence: clamp01(confidence),
    pose_presence: clamp01(confidence),
    valid_landmark_count: valid.length,
    min_x: minX,
    max_x: maxX,
    min_y: minY,
    max_y: maxY,
    center_x: clamp01((minX + maxX) / 2),
    center_y: clamp01((minY + maxY) / 2),
    width_ratio: clamp01(maxX - minX),
    height_ratio: clamp01(maxY - minY),
  };

  return Object.values(measurement).every(Number.isFinite) ? measurement : null;
}
