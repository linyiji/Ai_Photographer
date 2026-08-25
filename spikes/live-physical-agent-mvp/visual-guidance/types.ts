import type { CanonicalAxisSign, DirectionalAction, ReadySource } from '../closed-loop/types.js';

export type VisualServoMode = 'TEXT_DOMINANT' | 'VISUAL_SERVO' | 'VISUAL_PLUS_TEXT';
export type TrackingStatus = 'UNLOCKED' | 'ACQUIRING' | 'LOCKED' | 'HELD' | 'REACQUIRING';
export type VisualAxisStatus = 'MISSING' | 'OUTSIDE' | 'APPROACHING' | 'INSIDE';
export type VisualServoStatus = 'LOST' | 'TRACKING' | 'CORRECTING' | 'NEAR_TARGET' | 'BRAKING' | 'INSIDE_TARGET' | 'READY';

export interface NormalizedBox {
  left: number;
  top: number;
  width: number;
  height: number;
  center_x: number;
  center_y: number;
}

export interface AcceptableZone {
  left: number;
  right: number;
  top: number;
  bottom: number;
  center_x_min: number;
  center_x_max: number;
  height_min: number;
  height_max: number;
}

export interface VisualGuidanceMetrics {
  raw_box_jitter: number;
  stabilized_box_jitter: number;
  jitter_reduction_ratio: number | null;
  visual_projection_latency_ms: number;
  visual_projection_latency_ms_p50: number;
  visual_projection_latency_ms_p95: number;
  visual_projection_latency_ms_max: number;
  target_crossing_delay_ms: number | null;
  time_inside_target_before_ready_ms: number | null;
  target_box_entry_count: number;
  target_box_exit_count: number;
  subject_lock_loss_count: number;
  reacquisition_count: number;
}

export interface VisualGuidanceState {
  tracked_subject_box: NormalizedBox | null;
  raw_subject_box: NormalizedBox | null;
  target_box: NormalizedBox;
  acceptable_zone: AcceptableZone;
  tracking_status: TrackingStatus;
  tracking_confidence: number;
  x_status: VisualAxisStatus;
  scale_status: VisualAxisStatus;
  visual_status: VisualServoStatus;
  near_target: boolean;
  inside_target: boolean;
  measurement_stable: boolean;
  direction_hint: DirectionalAction | null;
  display_axis_sign: CanonicalAxisSign;
  braking: boolean;
  ready: boolean;
  ready_source: ReadySource;
  source_timestamp: number;
  projection_age: number;
  grid_enabled: boolean;
  overlay_mode: VisualServoMode;
  metrics: VisualGuidanceMetrics;
  display_observation: Readonly<{ source_timestamp: number; projected_at: number; latency_ms: number; subject_box: NormalizedBox | null }>;
}

export interface VisualGuidanceConfig {
  base_ema_alpha: number;
  moving_ema_alpha: number;
  moving_velocity_threshold: number;
  lock_acquire_ms: number;
  lock_hold_ms: number;
  reacquire_center_distance: number;
  reacquire_scale_distance: number;
  measurement_quiet_ms: number;
  measurement_jitter_threshold: number;
  history_limit: number;
  moving_time_constant_ms: number;
  quiet_time_constant_ms: number;
  prediction_horizon_ms: number;
  presentation_exit_multiplier: number;
}
