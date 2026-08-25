import type { ClosedLoopConfig, LocalAction, TargetState } from './types.js';

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
});

export const ISSUE_WEIGHTS = Object.freeze({
  SUBJECT_MISSING: 100,
  X_POSITION: 10,
  SCALE: 8,
  Y_POSITION: 6,
});

export const ACTION_COPY: Readonly<Record<LocalAction, string>> = Object.freeze({
  MOVE_LEFT: '往左一点',
  MOVE_RIGHT: '往右一点',
  MOVE_CLOSER: '再靠近一点',
  MOVE_FARTHER: '稍微退后一点',
  STOP_HERE: '好，停一下',
  HOLD: '好，就这里',
});

export const TARGET_PRESETS: readonly TargetState[] = Object.freeze([
  Object.freeze({ id: 'center-medium', label: '居中 · 自然中景', center_x: 0.50, center_y: 0.50, height_ratio: 0.35, tolerance_x: 0.05, tolerance_y: 0.06, tolerance_height: 0.07, ready_stable_ms: 600, y_exempt: true }),
  Object.freeze({ id: 'center-close', label: '居中 · 近景', center_x: 0.50, center_y: 0.48, height_ratio: 0.50, tolerance_x: 0.05, tolerance_y: 0.06, tolerance_height: 0.07, ready_stable_ms: 600, y_exempt: true }),
  Object.freeze({ id: 'left-composition', label: '左侧构图 · 自然中景', center_x: 0.36, center_y: 0.50, height_ratio: 0.35, tolerance_x: 0.05, tolerance_y: 0.06, tolerance_height: 0.07, ready_stable_ms: 600, y_exempt: true }),
]);

export const DEFAULT_TARGET = TARGET_PRESETS[0];
