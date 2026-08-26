import type { SceneSweepKeyframe } from '../sweep/types.js';
import type { CoverageGap, YawMapData } from './types.js';
export class YawMap {
  readonly keyframes: SceneSweepKeyframe[];
  constructor(keyframes: readonly SceneSweepKeyframe[]) { this.keyframes = [...keyframes].sort((a, b) => a.yaw_deg - b.yaw_deg); }
  nearest(yaw: number): SceneSweepKeyframe | null { return this.keyframes.reduce<SceneSweepKeyframe | null>((best, item) => !best || Math.abs(item.yaw_deg - yaw) < Math.abs(best.yaw_deg - yaw) ? item : best, null); }
  gaps(thresholdDeg = 20): CoverageGap[] { const gaps: CoverageGap[] = []; for (let i = 1; i < this.keyframes.length; i++) { const from = this.keyframes[i - 1]!.yaw_deg, to = this.keyframes[i]!.yaw_deg, size = to - from; if (size > thresholdDeg) gaps.push({ from_yaw_deg: from, to_yaw_deg: to, size_deg: size }); } return gaps; }
  serialize(): YawMapData { return { schema_version: '0.1', ordered_yaws_deg: this.keyframes.map((item) => item.yaw_deg), keyframes: this.keyframes }; }
}
