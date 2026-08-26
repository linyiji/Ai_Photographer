import type { SceneSweepKeyframe } from '../sweep/types.js';
export interface CoverageGap { from_yaw_deg: number; to_yaw_deg: number; size_deg: number; }
export interface YawMapData { schema_version: '0.1'; ordered_yaws_deg: number[]; keyframes: SceneSweepKeyframe[]; }
