import type { ClosedLoopConfig, LocalAction, TargetState } from './types.js';
import type { FramingCompatibilityState } from '../semantic-framing/types.js';

export const CLOSED_LOOP_CONFIG: Readonly<ClosedLoopConfig> = Object.freeze({
  issue_persistence_ms: 250,
  dominance_ratio: 1.25,
  instruction_gap_ms: 1200,
  improvement_ratio: 0.35,
  wrong_direction_increase_ratio: 0.15,
  verification_jitter_normalized: 0.12,
  action_response_grace_ms: 900,
  settled_window_ms: 375,
  episode_timeout_ms: 4500,
  minimum_meaningful_movement_normalized: 0.18,
  local_failure_limit: 4,
  oscillation_window_ms: 3000,
  braking_corridor_normalized: 1.5,
  braking_prediction_horizon_ms: 350,
  passive_confirmation_ms: 1200,
  local_recovery_auto_resume_ms: 1200,
  maximum_measurement_age_ms: 180,
  maximum_guidance_decision_age_ms: 160,
});

export const ISSUE_WEIGHTS = Object.freeze({
  SUBJECT_MISSING: 100,
  X_POSITION: 10,
  SCALE: 8,
  Y_POSITION: 6,
});

export const ACTION_COPY: Readonly<Record<LocalAction, string>> = Object.freeze({
  MOVE_LEFT: '持续往左，看到“停一下”再停',
  MOVE_RIGHT: '持续往右，看到“停一下”再停',
  MOVE_CLOSER: '持续靠近，看到“停一下”再停',
  MOVE_FARTHER: '持续退后，看到“停一下”再停',
  STOP_HERE: '好，停一下',
  HOLD: '好，就这里',
});

export const FRAMING_COMPATIBILITY_COPY: Readonly<Record<FramingCompatibilityState, string>> = Object.freeze({
  TOO_TIGHT: '请继续退后 · 让上半身进入画面，随后调整左右',
  TOO_WIDE: '请继续靠近 · 让人物回到自然中景，随后调整左右',
  UNCERTAIN: '请正对镜头并保持片刻 · 正在确认可见身体范围',
  COMPATIBLE: '身体范围已确认 · 正在准备精细调整',
});

export const TARGET_PRESETS: readonly TargetState[] = Object.freeze([
  Object.freeze({ id: 'center-medium', label: '居中 · 自然中景', center_x: 0.50, center_y: 0.50, height_ratio: 0.35, tolerance_x: 0.05, tolerance_y: 0.06, tolerance_height: 0.07, ready_stable_ms: 600, y_exempt: true }),
  Object.freeze({ id: 'center-close', label: '居中 · 近景', center_x: 0.50, center_y: 0.48, height_ratio: 0.50, tolerance_x: 0.05, tolerance_y: 0.06, tolerance_height: 0.07, ready_stable_ms: 600, y_exempt: true }),
  Object.freeze({ id: 'left-composition', label: '左侧构图 · 自然中景', center_x: 0.36, center_y: 0.50, height_ratio: 0.35, tolerance_x: 0.05, tolerance_y: 0.06, tolerance_height: 0.07, ready_stable_ms: 600, y_exempt: true }),
]);

export const DEFAULT_TARGET = TARGET_PRESETS[0];
