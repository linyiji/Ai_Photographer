import type { LandmarkSample } from '../perception/types.js';
import type { LandmarkGroupEvidence, LandmarkGroupEvidenceMap, SemanticGroupName, SensorPoint } from './types.js';

export const POSE_LANDMARK = Object.freeze({
  NOSE: 0, LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3, RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8, LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16, LEFT_HIP: 23, RIGHT_HIP: 24, LEFT_KNEE: 25, RIGHT_KNEE: 26, LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
} as const);

export const POSE_GROUPS: Readonly<Record<SemanticGroupName, readonly number[]>> = Object.freeze({
  HEAD_CORE: Object.freeze([0,1,2,3,4,5,6,7,8]), SHOULDERS: Object.freeze([11,12]), ELBOWS: Object.freeze([13,14]), WRISTS: Object.freeze([15,16]),
  HIPS: Object.freeze([23,24]), KNEES: Object.freeze([25,26]), ANKLES: Object.freeze([27,28]),
});

const confidence = (point: LandmarkSample): number => Math.min(point.visibility ?? 0, point.presence ?? point.visibility ?? 0);
const finite = (point: LandmarkSample | undefined): point is LandmarkSample => Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));

export function buildLandmarkGroups(landmarks: readonly LandmarkSample[], threshold: number): LandmarkGroupEvidenceMap {
  const build = (name: SemanticGroupName): LandmarkGroupEvidence => {
    const indexes = POSE_GROUPS[name];
    const visible = indexes.map((index) => landmarks[index]).filter((point): point is LandmarkSample => finite(point) && confidence(point) >= threshold);
    const bilateral = indexes.length === 2 && visible.length === 2;
    const pairCenter: SensorPoint | null = bilateral ? { x: (visible[0].x + visible[1].x) / 2, y: (visible[0].y + visible[1].y) / 2 } : null;
    const meanConfidence = visible.length ? visible.reduce((sum, point) => sum + confidence(point), 0) / visible.length : 0;
    const required = name === 'HEAD_CORE' ? 2 : indexes.length;
    return Object.freeze({ valid: visible.length >= required, bilateral_valid: bilateral, confidence: meanConfidence, visible_count: visible.length, pair_center: pairCenter, pair_width: bilateral ? Math.abs(visible[0].x - visible[1].x) : null });
  };
  return Object.freeze({ HEAD_CORE: build('HEAD_CORE'), SHOULDERS: build('SHOULDERS'), ELBOWS: build('ELBOWS'), WRISTS: build('WRISTS'), HIPS: build('HIPS'), KNEES: build('KNEES'), ANKLES: build('ANKLES') });
}

export function visibleGroupPoints(landmarks: readonly LandmarkSample[], name: SemanticGroupName, threshold: number): LandmarkSample[] {
  return POSE_GROUPS[name].map((index) => landmarks[index]).filter((point): point is LandmarkSample => finite(point) && confidence(point) >= threshold);
}
