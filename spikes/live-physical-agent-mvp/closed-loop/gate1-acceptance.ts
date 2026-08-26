import type { StructuredPerceptionState } from '../perception/types.js';
import { precisionScaleCalibrationFor } from '../semantic-framing/profiles.js';
import type { BodyMode } from '../semantic-framing/types.js';
import type { TargetState } from './types.js';

export type Gate1Scenario = 'GATE1_X' | 'GATE1_SCALE' | 'GATE1_COMBINED';
export type Gate1ExpectedCoverage = 'X_ONLY' | 'SCALE_ONLY' | 'COMBINED';
export type Gate1ActualCoverage = Gate1ExpectedCoverage | 'NONE';
export type Gate1XRelation = 'TOO_LEFT' | 'IN_TARGET' | 'TOO_RIGHT' | 'UNKNOWN';
export type Gate1ScaleRelation = 'TOO_SMALL' | 'IN_TARGET' | 'TOO_LARGE' | 'UNKNOWN';

export interface Gate1PreArmTelemetry {
  scenario_label: Gate1Scenario;
  captured_at_ms: number;
  pre_arm_body_mode: BodyMode | 'UNKNOWN';
  pre_arm_body_mode_stable: boolean;
  pre_arm_anchor_x: number | null;
  pre_arm_x_valid: boolean;
  pre_arm_x_relation: Gate1XRelation;
  pre_arm_scale: number | null;
  pre_arm_scale_valid: boolean;
  pre_arm_scale_relation: Gate1ScaleRelation;
  expected_trial_coverage: Gate1ExpectedCoverage;
  precondition_valid: boolean;
  precondition_failure_reason: string[];
}

const BODY_MODE_STABLE_FOR_MS = 600;
const finite = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value);

export const isGate1Scenario = (value: string): value is Gate1Scenario =>
  value === 'GATE1_X' || value === 'GATE1_SCALE' || value === 'GATE1_COMBINED';

export const expectedCoverageFor = (scenario: Gate1Scenario): Gate1ExpectedCoverage =>
  scenario === 'GATE1_X' ? 'X_ONLY' : scenario === 'GATE1_SCALE' ? 'SCALE_ONLY' : 'COMBINED';

const xRelation = (anchorX: number | null, target: TargetState): Gate1XRelation => {
  if (!finite(anchorX)) return 'UNKNOWN';
  if (anchorX < target.center_x - target.tolerance_x) return 'TOO_LEFT';
  if (anchorX > target.center_x + target.tolerance_x) return 'TOO_RIGHT';
  return 'IN_TARGET';
};

const scaleRelation = (scale: number | null, targetValue: number | null, tolerance: number | null): Gate1ScaleRelation => {
  if (!finite(scale) || !finite(targetValue) || !finite(tolerance)) return 'UNKNOWN';
  if (scale < targetValue - tolerance) return 'TOO_SMALL';
  if (scale > targetValue + tolerance) return 'TOO_LARGE';
  return 'IN_TARGET';
};

export function evaluateGate1PreArm(scenario: Gate1Scenario, state: StructuredPerceptionState | null, target: TargetState): Gate1PreArmTelemetry {
  const framing = state?.framing ?? null;
  const bodyMode = framing?.body_mode ?? 'UNKNOWN';
  const calibration = framing ? precisionScaleCalibrationFor(target, framing.body_mode, framing.scale_metric_type) : null;
  const bodyModeStable = Boolean(
    state && framing &&
    framing.body_visibility.candidate_mode === framing.body_mode &&
    state.timestamp_ms - framing.body_visibility.stable_mode_since_ms >= BODY_MODE_STABLE_FOR_MS,
  );
  const xValid = Boolean(state?.subject.present && framing?.valid_for_precision_x && finite(framing.anchor_x));
  const scaleValid = Boolean(state?.subject.present && framing?.valid_for_precision_scale && calibration && finite(framing.scale));
  const relationX = xValid ? xRelation(framing?.anchor_x ?? null, target) : 'UNKNOWN';
  const relationScale = scaleValid
    ? scaleRelation(framing?.scale ?? null, calibration?.target_scale_value ?? null, calibration?.target_scale_tolerance ?? null)
    : 'UNKNOWN';
  const reasons: string[] = [];

  if (!state?.subject.present) reasons.push('SUBJECT_NOT_PRESENT');
  if (!bodyModeStable) reasons.push('BODY_MODE_NOT_STABLE');
  if (scenario !== 'GATE1_X' && bodyMode !== 'UPPER_BODY') reasons.push('BODY_MODE_MUST_BE_UPPER_BODY');
  if (scenario === 'GATE1_X' && bodyMode !== 'UPPER_BODY' && bodyMode !== 'THREE_QUARTER') reasons.push('BODY_MODE_NOT_PRECISION_COMPATIBLE');
  if (!xValid) reasons.push('X_MEASUREMENT_INVALID');
  if (!scaleValid) reasons.push('SCALE_MEASUREMENT_INVALID');
  if (scenario === 'GATE1_X' && relationX === 'IN_TARGET') reasons.push('X_MUST_START_OUTSIDE_TARGET');
  if (scenario === 'GATE1_X' && relationScale !== 'IN_TARGET') reasons.push('SCALE_MUST_START_IN_TARGET');
  if (scenario === 'GATE1_SCALE' && relationX !== 'IN_TARGET') reasons.push('X_MUST_START_IN_TARGET');
  if (scenario === 'GATE1_SCALE' && relationScale === 'IN_TARGET') reasons.push('SCALE_MUST_START_OUTSIDE_TARGET');
  if (scenario === 'GATE1_COMBINED' && relationX === 'IN_TARGET') reasons.push('X_MUST_START_OUTSIDE_TARGET');
  if (scenario === 'GATE1_COMBINED' && relationScale === 'IN_TARGET') reasons.push('SCALE_MUST_START_OUTSIDE_TARGET');
  if (relationX === 'UNKNOWN' && !reasons.includes('X_MEASUREMENT_INVALID')) reasons.push('X_RELATION_UNKNOWN');
  if (relationScale === 'UNKNOWN' && !reasons.includes('SCALE_MEASUREMENT_INVALID')) reasons.push('SCALE_RELATION_UNKNOWN');

  return {
    scenario_label: scenario,
    captured_at_ms: state?.timestamp_ms ?? performance.now(),
    pre_arm_body_mode: bodyMode,
    pre_arm_body_mode_stable: bodyModeStable,
    pre_arm_anchor_x: framing?.anchor_x ?? null,
    pre_arm_x_valid: xValid,
    pre_arm_x_relation: relationX,
    pre_arm_scale: framing?.scale ?? null,
    pre_arm_scale_valid: scaleValid,
    pre_arm_scale_relation: relationScale,
    expected_trial_coverage: expectedCoverageFor(scenario),
    precondition_valid: reasons.length === 0,
    precondition_failure_reason: reasons,
  };
}

