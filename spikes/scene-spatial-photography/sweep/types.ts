export type SweepMode = 'QUICK_SWEEP' | 'WIDE_SWEEP' | 'FULL_SWEEP';
export type SweepStatus = 'IDLE' | 'ACQUIRING' | 'SWEEPING' | 'COMPLETE' | 'CANCELLED' | 'ERROR';
export type SweepDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'MIXED' | 'UNDETERMINED';
export interface FrameMetrics {
  timestamp_ms: number; yaw_deg: number; width: number; height: number;
  blur_score: number; exposure_mean: number; highlight_clipping_ratio: number; shadow_clipping_ratio: number;
  fingerprint?: readonly number[];
}
export type RejectionReason = 'BLUR' | 'UNDEREXPOSED' | 'OVEREXPOSED' | 'ANGULAR_NOVELTY' | 'DUPLICATE' | 'BUSY' | 'CAP';
export interface SceneSweepKeyframe extends FrameMetrics {
  keyframe_id: string; sequence: number; quality_status: 'ACCEPTED'; selection_reason: 'INITIAL' | 'ANGULAR_NOVELTY' | 'FALLBACK_IMPERFECT'; transient_frame_ref?: string;
}
export interface SweepConfig { target_deg: number; angular_step_deg: number; max_keyframes: number; max_sensor_step_deg: number; }
export const configForMode = (mode: SweepMode): SweepConfig => ({
  QUICK_SWEEP: { target_deg: 110, angular_step_deg: 12, max_keyframes: 12, max_sensor_step_deg: 45 },
  WIDE_SWEEP: { target_deg: 180, angular_step_deg: 12, max_keyframes: 18, max_sensor_step_deg: 45 },
  FULL_SWEEP: { target_deg: 360, angular_step_deg: 12, max_keyframes: 32, max_sensor_step_deg: 45 },
}[mode]);
