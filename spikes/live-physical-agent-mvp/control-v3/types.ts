import type { TargetState } from '../closed-loop/types.js';

export type V3SubjectState = 'PRESENT' | 'LOST';
export type V3MeasurementQuality = 'GOOD' | 'MARGINAL' | 'INVALID';
export type V3FramingRelation = 'TOO_CLOSE' | 'IN_RANGE' | 'TOO_FAR' | 'UNKNOWN';
export type V3XRelation = 'TOO_LEFT' | 'IN_RANGE' | 'TOO_RIGHT' | 'UNKNOWN';
export type V3FramingMotion = 'CLOSER' | 'FARTHER' | 'STILL' | 'UNKNOWN';
export type V3XMotion = 'LEFT' | 'RIGHT' | 'STILL' | 'UNKNOWN';
export type V3Stage = 'ACQUIRE' | 'FRAMING' | 'ALIGN_X' | 'VERIFY' | 'PAUSED' | 'READY_LATCHED';
export type V3Action = 'MOVE_LEFT_SMALL' | 'MOVE_RIGHT_SMALL' | 'MOVE_CLOSER_SMALL' | 'MOVE_FARTHER_SMALL';
export type V3EpisodeState = 'ISSUED' | 'WAIT_FOR_SETTLE' | 'EVALUATED';
export type V3Outcome = 'TARGET_REACHED' | 'IMPROVED' | 'NO_EFFECT' | 'WRONG_DIRECTION' | 'INVALIDATED';
export type V3ReadyEntryContext = 'ALREADY_SATISFIED' | 'AFTER_FRAMING_STEP' | 'AFTER_X_STEP' | null;

export interface V3MeasurementDiagnosticsRef {
  measurement_id: string;
  framing_error_normalized: number | null;
  x_error_normalized: number | null;
  framing_position: number | null;
  x_position: number | null;
  framing_comparison_key: string | null;
  x_comparison_key: string | null;
  internal_body_mode: string | null;
  internal_scale_metric_type: string | null;
  validity_reason: string;
}

export interface LiveMeasurementV3 {
  timestamp_ms: number;
  subject_state: V3SubjectState;
  measurement_quality: V3MeasurementQuality;
  fresh: boolean;
  stable: boolean;
  framing_relation: V3FramingRelation;
  x_relation: V3XRelation;
  framing_motion: V3FramingMotion;
  x_motion: V3XMotion;
  state_version: number;
  measurement_age_ms: number;
  diagnostics_ref: Readonly<V3MeasurementDiagnosticsRef>;
}

export interface ControlEpochV3 {
  trial_id: number;
  episode_id: number;
  stage: 'FRAMING' | 'ALIGN_X';
  action: V3Action;
  target_snapshot: Readonly<Pick<TargetState, 'id' | 'center_x' | 'tolerance_x' | 'ready_stable_ms'>>;
  measurement_snapshot: Readonly<LiveMeasurementV3>;
  sensor_action_mapping: 'SENSOR_NORMALIZED_NON_MIRRORED';
  measurement_age_ms: number;
  state_version: number;
  issued_timestamp_ms: number;
  diagnostics_ref: Readonly<V3MeasurementDiagnosticsRef>;
}

export interface V3Episode {
  trial_id: number;
  episode_id: number;
  state: V3EpisodeState;
  stage: 'FRAMING' | 'ALIGN_X';
  action: V3Action;
  issued_at: number;
  start_error: number | null;
  settled_error: number | null;
  outcome: V3Outcome | null;
  evaluated_at: number | null;
  control_epoch: Readonly<ControlEpochV3>;
}

export interface V3Metrics {
  ordinary_action_count: number;
  target_reached_count: number;
  improved_count: number;
  no_effect_count: number;
  wrong_direction_count: number;
  invalidated_count: number;
  post_ready_ordinary: number;
  corrections_to_ready: number | null;
  time_to_ready_ms: number | null;
  action_effectiveness: number | null;
  wrong_direction_rate: number | null;
  pause_count: number;
  luna_calls: 0;
  provider_calls: 0;
  backend_per_frame_calls: 0;
  raw_video_upload: 0;
}

export interface V3Snapshot {
  timestamp_ms: number;
  armed: boolean;
  trial_id: number | null;
  stage: V3Stage;
  measurement: Readonly<LiveMeasurementV3>;
  action: V3Action | null;
  instruction_copy_zh: string | null;
  episode: Readonly<V3Episode> | null;
  outcome: V3Outcome | null;
  ready: boolean;
  ready_entry_context: V3ReadyEntryContext;
  metrics: Readonly<V3Metrics>;
}

export interface V3ControllerConfig {
  stage_persistence_ms: number;
  response_grace_ms: number;
  settle_window_ms: number;
  episode_timeout_ms: number;
  ready_stable_ms: number;
  pause_failure_limit: number;
  pause_resume_stable_ms: number;
  material_improvement_normalized: number;
  material_improvement_ratio: number;
  motion_threshold_normalized: number;
}
