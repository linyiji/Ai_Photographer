import type { LandmarkSample } from '../../perception/types.js';

export interface SyntheticPoseFrame {
  name: string;
  timestamp_ms: number;
  landmarks: LandmarkSample[] | null;
}

export function poseBox(centerX: number, centerY: number, width: number, height: number, visibility = 0.95): LandmarkSample[] {
  const points: LandmarkSample[] = [];
  const columns = 4;
  const rows = 3;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      points.push({
        x: centerX - width / 2 + width * (column / (columns - 1)),
        y: centerY - height / 2 + height * (row / (rows - 1)),
        z: 0,
        visibility,
        presence: visibility,
      });
    }
  }
  return points;
}

export const PERCEPTION_FIXTURES: Record<string, SyntheticPoseFrame[]> = {
  'centered-static': [0, 125, 250, 375, 500].map((timestamp_ms) => ({ name: 'centered-static', timestamp_ms, landmarks: poseBox(0.5, 0.5, 0.3, 0.6) })),
  'left-static': [{ name: 'left-static', timestamp_ms: 0, landmarks: poseBox(0.25, 0.5, 0.3, 0.6) }],
  'right-static': [{ name: 'right-static', timestamp_ms: 0, landmarks: poseBox(0.75, 0.5, 0.3, 0.6) }],
  'move-left-to-right': [0.25, 0.4, 0.55, 0.7].map((centerX, index) => ({ name: 'move-left-to-right', timestamp_ms: index * 125, landmarks: poseBox(centerX, 0.5, 0.3, 0.6) })),
  'move-right-to-left': [0.75, 0.6, 0.45, 0.3].map((centerX, index) => ({ name: 'move-right-to-left', timestamp_ms: index * 125, landmarks: poseBox(centerX, 0.5, 0.3, 0.6) })),
  closer: [0.35, 0.45, 0.55, 0.65].map((height, index) => ({ name: 'closer', timestamp_ms: index * 125, landmarks: poseBox(0.5, 0.5, height / 2, height) })),
  farther: [0.65, 0.55, 0.45, 0.35].map((height, index) => ({ name: 'farther', timestamp_ms: index * 125, landmarks: poseBox(0.5, 0.5, height / 2, height) })),
  'temporary-loss': [
    { name: 'temporary-loss', timestamp_ms: 0, landmarks: poseBox(0.5, 0.5, 0.3, 0.6) },
    { name: 'temporary-loss', timestamp_ms: 125, landmarks: null },
  ],
  reacquisition: [
    { name: 'reacquisition', timestamp_ms: 0, landmarks: poseBox(0.5, 0.5, 0.3, 0.6) },
    { name: 'reacquisition', timestamp_ms: 375, landmarks: null },
    { name: 'reacquisition', timestamp_ms: 500, landmarks: poseBox(0.55, 0.5, 0.3, 0.6) },
  ],
  'jitter-near-threshold': [0.5, 0.501, 0.499, 0.502, 0.5].map((centerX, index) => ({ name: 'jitter-near-threshold', timestamp_ms: index * 125, landmarks: poseBox(centerX, 0.5, 0.3, 0.6) })),
};
