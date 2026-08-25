import type { StructuredPerceptionState } from '../perception/types.js';

export type IssueKind = 'SUBJECT_MISSING' | 'X_POSITION' | 'Y_POSITION' | 'SCALE';
export type LocalAction = 'MOVE_LEFT' | 'MOVE_RIGHT' | 'MOVE_CLOSER' | 'MOVE_FARTHER' | 'HOLD';
export type RuntimeState = 'IDLE' | 'SEARCHING' | 'ANALYZING' | 'INSTRUCTING' | 'WAITING' | 'VERIFYING' | 'READY' | 'LOCAL_RECOVERY_REQUIRED';
export type VerificationResult = 'NONE' | 'SUCCESS' | 'IMPROVING' | 'NO_EFFECT' | 'WRONG_DIRECTION';
export type DimensionStatus = 'SATISFIED' | 'UNSATISFIED' | 'MISSING' | 'EXEMPT';

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
  local_failure_limit: number;
  oscillation_window_ms: number;
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

export interface ClosedLoopMetrics {
  instruction_count: number;
  successful_corrections: number;
  improving_count: number;
  no_effect_count: number;
  wrong_direction_count: number;
  oscillation_count: number;
  local_decisions: number;
  time_to_target_ms: number | null;
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
  stable_duration_ms: number;
  ready: boolean;
  metrics: ClosedLoopMetrics;
}
