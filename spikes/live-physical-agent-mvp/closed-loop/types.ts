import type { StructuredPerceptionState } from '../perception/types.js';

export type IssueKind = 'SUBJECT_MISSING' | 'X_POSITION' | 'Y_POSITION' | 'SCALE';
export type DirectionalAction = 'MOVE_LEFT' | 'MOVE_RIGHT' | 'MOVE_CLOSER' | 'MOVE_FARTHER';
export type LocalAction = DirectionalAction | 'STOP_HERE' | 'HOLD';
export type RuntimeState = 'IDLE' | 'SEARCHING' | 'ANALYZING' | 'MEASUREMENT_UNCERTAIN' | 'FRAMING_COMPATIBILITY' | 'INSTRUCTING' | 'WAITING_FOR_MOTION' | 'TRACKING_MOTION' | 'BRAKING' | 'VERIFYING' | 'SATISFIED_PENDING_CONFIRMATION' | 'READY' | 'LOCAL_RECOVERY_REQUIRED';
export type VerificationResult = 'NONE' | 'SUCCESS' | 'IMPROVING' | 'NO_EFFECT' | 'WRONG_DIRECTION';
export type TerminalOutcome = 'SUCCESS' | 'NO_EFFECT' | 'WRONG_DIRECTION';
export type EpisodeState = 'WAITING_FOR_MOTION' | 'TRACKING_MOTION' | 'VERIFYING' | 'TERMINAL';
export type TrialState = 'DISARMED' | 'ARMED' | 'RUNNING' | 'READY_LATCHED';
export type ReadySource = 'EPISODE_SUCCESS' | 'PASSIVE_CONFIRMATION' | null;
export type NoEffectSubtype = 'NO_MOTION' | 'INSUFFICIENT_PROGRESS' | 'OVERSHOOT' | 'JITTER_OR_UNCERTAIN' | 'AXIS_COUPLED' | 'PREMATURE_SETTLE' | 'LATE_RESPONSE' | 'UNCLASSIFIED' | null;
export type DimensionStatus = 'SATISFIED' | 'UNSATISFIED' | 'MISSING' | 'EXEMPT';
export type CameraFacing = 'FRONT' | 'REAR' | 'UNKNOWN';
export type PreviewMirrorState = 'MIRRORED' | 'NON_MIRRORED' | 'UNKNOWN';
export type CanonicalAxisSign = -1 | 0 | 1;

export interface ControlUpdateContext {
  decision_timestamp_ms?: number;
  camera_facing?: CameraFacing;
  preview_mirror_state?: PreviewMirrorState;
}

export interface ControlObservation {
  state_version: number;
  measurement_timestamp: number;
  measurement_age_ms: number;
  guidance_decision_age_ms: number;
  fresh: boolean;
  suppression_reason: 'NONE' | 'SUBJECT_MISSING' | 'COORDINATE_BASIS' | 'MEASUREMENT_STALE' | 'DECISION_STALE' | 'REACQUISITION_BARRIER' | 'MEASUREMENT_UNCERTAIN' | 'FRAMING_INCOMPATIBLE';
}

export interface ControlEpoch {
  epoch_id: number;
  trial_id: number;
  episode_id: number;
  issued_at: number;
  action: DirectionalAction;
  axis: 'X' | 'SCALE';
  target_snapshot: Readonly<Pick<TargetState, 'id' | 'center_x' | 'height_ratio' | 'tolerance_x' | 'tolerance_height'>>;
  measurement_snapshot: Readonly<{ center_x: number | null; height_ratio: number | null; velocity_x: number | null; velocity_scale: number | null }>;
  measurement_timestamp: number;
  measurement_age_ms: number;
  guidance_decision_age_ms: number;
  camera_facing: CameraFacing;
  preview_mirror_state: PreviewMirrorState;
  canonical_axis_sign: CanonicalAxisSign;
  display_axis_sign: CanonicalAxisSign;
  state_version: number;
  body_mode: string;
  scale_metric_type: string | null;
  scale_baseline: number | null;
}

export interface TargetState {
  id: string;
  label: string;
  center_x: number;
  center_y: number;
  height_ratio: number;
  tolerance_x: number;
  tolerance_y: number;
  tolerance_height: number;
  ready_stable_ms: number;
  y_exempt: boolean;
}

export interface ClosedLoopConfig {
  issue_persistence_ms: number;
  dominance_ratio: number;
  instruction_gap_ms: number;
  improvement_ratio: number;
  wrong_direction_increase_ratio: number;
  verification_jitter_normalized: number;
  action_response_grace_ms: number;
  settled_window_ms: number;
  episode_timeout_ms: number;
  minimum_meaningful_movement_normalized: number;
  local_failure_limit: number;
  oscillation_window_ms: number;
  braking_corridor_normalized: number;
  braking_prediction_horizon_ms: number;
  passive_confirmation_ms: number;
  local_recovery_auto_resume_ms: number;
  maximum_measurement_age_ms: number;
  maximum_guidance_decision_age_ms: number;
}

export interface DimensionDelta {
  delta: number | null;
  normalized_error: number | null;
  status: DimensionStatus;
}

export interface DeltaState {
  x: DimensionDelta;
  y: DimensionDelta;
  scale: DimensionDelta;
}

export interface IssueCandidate {
  kind: IssueKind;
  score: number;
  normalized_error: number;
  action: LocalAction | null;
  action_mapping: 'LOCAL_LIBRARY' | 'DEFERRED_ACTION_MAPPING' | 'NONE';
}

export interface InstructionEvent {
  sequence: number;
  timestamp_ms: number;
  action: LocalAction;
  copy_zh: string;
  issue: IssueKind | null;
}

export interface ActionEpisode {
  trial_id: number;
  episode_id: number;
  issue: IssueKind;
  action: DirectionalAction;
  issued_at: number;
  baseline_signed_delta: number;
  baseline_abs_error: number;
  baseline_normalized_error: number;
  motion_detected_at: number | null;
  best_signed_delta: number;
  best_abs_error: number;
  best_normalized_error: number;
  current_signed_delta: number;
  current_normalized_error: number;
  target_crossed: boolean;
  entered_deadband: boolean;
  settled_at: number | null;
  final_settled_error: number | null;
  terminal_outcome: TerminalOutcome | null;
  terminal_at: number | null;
  reissue_count: number;
  no_effect_subtype: NoEffectSubtype;
  action_compliant: boolean;
  axis_completed: boolean;
  stop_cue_issued_at: number | null;
  predicted_normalized_error_at_stop: number | null;
  warning_flags: string[];
  state: EpisodeState;
  control_epoch: Readonly<ControlEpoch>;
}

export interface ClosedLoopMetrics {
  instruction_count: number;
  ordinary_instruction_count: number;
  hold_count: number;
  stop_cue_count: number;
  episode_count: number;
  terminal_episode_count: number;
  successful_corrections: number;
  improving_count: number;
  no_effect_count: number;
  wrong_direction_count: number;
  oscillation_count: number;
  local_decisions: number;
  time_to_target_ms: number | null;
  correction_success_rate: number | null;
  action_compliance_count: number;
  action_compliance_rate: number | null;
  axis_completion_count: number;
  axis_completion_rate: number | null;
  recovery_count: number;
  stale_suppressed_count: number;
  post_terminal_suppressed_count: number;
  uncertainty_suppressed_x: number;
  uncertainty_suppressed_scale: number;
  framing_compatibility_instruction_count: number;
  control_observation_age_ms_p50: number;
  control_observation_age_ms_p95: number;
  control_observation_age_ms_max: number;
  luna_calls: 0;
  backend_per_frame_calls: 0;
  provider_calls: 0;
  raw_video_upload: 0;
}

export interface ClosedLoopSnapshot {
  timestamp_ms: number;
  target: TargetState;
  current: StructuredPerceptionState['subject'];
  delta: DeltaState;
  issue: IssueCandidate | null;
  issue_age_ms: number;
  active_action: LocalAction | null;
  action_age_ms: number | null;
  instruction: InstructionEvent | null;
  runtime_state: RuntimeState;
  waiting_remaining_ms: number;
  verification: VerificationResult;
  episode: ActionEpisode | null;
  trial_id: number | null;
  trial_state: TrialState;
  trial_armed_at: number | null;
  first_instruction_at: number | null;
  ready_at: number | null;
  trial_elapsed_ms: number | null;
  stable_duration_ms: number;
  ready: boolean;
  geometry_satisfied: boolean;
  ready_source: ReadySource;
  passive_confirmation_remaining_ms: number;
  local_recovery_remaining_ms: number;
  near_target_corridor: boolean;
  predicted_delta: number | null;
  control_observation: ControlObservation;
  control_epoch: Readonly<ControlEpoch> | null;
  metrics: ClosedLoopMetrics;
}
