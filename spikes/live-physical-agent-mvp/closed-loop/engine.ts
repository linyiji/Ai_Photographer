import { ACTION_COPY, CLOSED_LOOP_CONFIG, DEFAULT_TARGET, ISSUE_WEIGHTS } from './config.js';
import type { StructuredPerceptionState } from '../perception/types.js';
import type {
  ClosedLoopConfig, ClosedLoopMetrics, ClosedLoopSnapshot, DeltaState, DimensionDelta,
  InstructionEvent, IssueCandidate, IssueKind, LocalAction, RuntimeState, TargetState, VerificationResult,
} from './types.js';

const finite = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value);

const dimension = (target: number, current: number | null | undefined, tolerance: number, exempt = false): DimensionDelta => {
  if (exempt) return { delta: null, normalized_error: null, status: 'EXEMPT' };
  if (!finite(current)) return { delta: null, normalized_error: null, status: 'MISSING' };
  const delta = target - current;
  const normalizedError = Math.abs(delta) / tolerance;
  return { delta, normalized_error: normalizedError, status: normalizedError <= 1 ? 'SATISFIED' : 'UNSATISFIED' };
};

export function computeDelta(state: StructuredPerceptionState, target: TargetState): DeltaState {
  if (!state.subject.present) {
    const missing: DimensionDelta = { delta: null, normalized_error: null, status: 'MISSING' };
    return { x: missing, y: target.y_exempt ? { delta: null, normalized_error: null, status: 'EXEMPT' } : missing, scale: missing };
  }
  return {
    x: dimension(target.center_x, state.subject.center_x, target.tolerance_x),
    y: dimension(target.center_y, state.subject.center_y, target.tolerance_y, target.y_exempt),
    scale: dimension(target.height_ratio, state.subject.height_ratio, target.tolerance_height),
  };
}

// Sensor X grows toward image-right. For a person facing the fixed phone, image-right is
// the person's physical left. CSS front-preview mirroring never enters this mapping.
export function actionForIssue(kind: IssueKind, delta: DeltaState): LocalAction | null {
  if (kind === 'X_POSITION' && finite(delta.x.delta)) return delta.x.delta > 0 ? 'MOVE_LEFT' : 'MOVE_RIGHT';
  if (kind === 'SCALE' && finite(delta.scale.delta)) return delta.scale.delta > 0 ? 'MOVE_CLOSER' : 'MOVE_FARTHER';
  return null;
}

export function rankIssues(state: StructuredPerceptionState, delta: DeltaState): IssueCandidate[] {
  if (!state.subject.present) return [{ kind: 'SUBJECT_MISSING', score: ISSUE_WEIGHTS.SUBJECT_MISSING, normalized_error: 1, action: null, action_mapping: 'NONE' }];
  const candidates: IssueCandidate[] = [];
  const add = (kind: IssueKind, item: DimensionDelta, weight: number): void => {
    if (item.status !== 'UNSATISFIED' || !finite(item.normalized_error)) return;
    const action = actionForIssue(kind, delta);
    candidates.push({ kind, score: weight * item.normalized_error, normalized_error: item.normalized_error, action, action_mapping: action ? 'LOCAL_LIBRARY' : 'DEFERRED_ACTION_MAPPING' });
  };
  add('X_POSITION', delta.x, ISSUE_WEIGHTS.X_POSITION);
  add('SCALE', delta.scale, ISSUE_WEIGHTS.SCALE);
  add('Y_POSITION', delta.y, ISSUE_WEIGHTS.Y_POSITION);
  return candidates.sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind));
}

const initialMetrics = (): ClosedLoopMetrics => ({
  instruction_count: 0, successful_corrections: 0, improving_count: 0, no_effect_count: 0,
  wrong_direction_count: 0, oscillation_count: 0, local_decisions: 0, time_to_target_ms: null,
  luna_calls: 0, backend_per_frame_calls: 0, provider_calls: 0, raw_video_upload: 0,
});

export class LocalClosedLoopEngine {
  private target: TargetState;
  private runtimeState: RuntimeState = 'IDLE';
  private candidateKind: IssueKind | null = null;
  private candidateIssue: IssueCandidate | null = null;
  private candidateSince = 0;
  private activeIssue: IssueCandidate | null = null;
  private activeIssueSince = 0;
  private activeAction: LocalAction | null = null;
  private actionIssuedAt: number | null = null;
  private instructionSequence = 0;
  private waitingUntil = 0;
  private verification: VerificationResult = 'NONE';
  private verificationBaseline: number | null = null;
  private verificationBaselineDelta: number | null = null;
  private readyStableSince: number | null = null;
  private runStartedAt: number | null = null;
  private localFailureStreak = 0;
  private lastIssueSwitchAt = 0;
  private metrics = initialMetrics();

  constructor(target: TargetState = DEFAULT_TARGET, private readonly config: ClosedLoopConfig = CLOSED_LOOP_CONFIG) {
    this.target = target;
  }

  setTarget(target: TargetState): void { this.target = target; this.reset(); }

  reset(): void {
    this.runtimeState = 'IDLE'; this.candidateKind = null; this.candidateIssue = null; this.candidateSince = 0; this.activeIssue = null;
    this.activeIssueSince = 0; this.activeAction = null; this.actionIssuedAt = null; this.waitingUntil = 0;
    this.verification = 'NONE'; this.verificationBaseline = null; this.verificationBaselineDelta = null; this.readyStableSince = null;
    this.runStartedAt = null; this.localFailureStreak = 0; this.lastIssueSwitchAt = 0;
    this.metrics = initialMetrics();
  }

  update(state: StructuredPerceptionState): ClosedLoopSnapshot {
    const now = state.timestamp_ms;
    if (this.runStartedAt === null) this.runStartedAt = now;
    const delta = computeDelta(state, this.target);
    const candidates = rankIssues(state, delta);
    const best = candidates[0] ?? null;
    let instruction: InstructionEvent | null = null;
    this.metrics.local_decisions += 1;

    if (!state.subject.present) {
      this.runtimeState = 'SEARCHING'; this.readyStableSince = null; this.activeAction = null;
      this.trackCandidate(best, now);
      return this.snapshot(now, state, delta, best, instruction);
    }

    const allSatisfied = delta.x.status === 'SATISFIED' && delta.scale.status === 'SATISFIED'
      && (delta.y.status === 'SATISFIED' || delta.y.status === 'EXEMPT');
    if (allSatisfied && this.runtimeState === 'INSTRUCTING') this.runtimeState = 'WAITING';
    if (allSatisfied && this.runtimeState === 'WAITING' && now >= this.waitingUntil && state.subject.stable) {
      this.verification = 'SUCCESS';
      this.metrics.successful_corrections += 1;
      this.localFailureStreak = 0;
      this.clearAction();
    }
    if (allSatisfied && this.runtimeState === 'WAITING') {
      this.readyStableSince = null;
      return this.snapshot(now, state, delta, this.activeIssue, instruction);
    }
    if (allSatisfied) {
      this.activeIssue = null; this.candidateKind = null; this.candidateIssue = null;
      if (state.subject.stable) this.readyStableSince ??= now;
      else this.readyStableSince = null;
      const stableDuration = this.readyStableSince === null ? 0 : now - this.readyStableSince;
      if (stableDuration >= this.target.ready_stable_ms) {
        if (this.runtimeState !== 'READY') {
          this.runtimeState = 'READY';
          this.activeAction = 'HOLD'; this.actionIssuedAt = now; this.instructionSequence += 1;
          this.metrics.instruction_count += 1;
          this.metrics.time_to_target_ms ??= now - (this.runStartedAt ?? now);
          instruction = this.event(now, 'HOLD', null);
        }
      } else {
        this.runtimeState = 'ANALYZING'; this.activeAction = null;
      }
      return this.snapshot(now, state, delta, null, instruction);
    }
    this.readyStableSince = null;
    if (this.runtimeState === 'READY') { this.runtimeState = 'ANALYZING'; this.activeAction = null; }

    if (this.runtimeState === 'INSTRUCTING') this.runtimeState = 'WAITING';
    if (this.runtimeState === 'WAITING') {
      const currentError = this.errorFor(this.activeIssue?.kind ?? null, delta);
      const currentDelta = this.deltaFor(this.activeIssue?.kind ?? null, delta);
      if (now < this.waitingUntil || !state.subject.stable) return this.snapshot(now, state, delta, this.activeIssue ?? best, instruction);
      this.runtimeState = 'VERIFYING';
      this.verification = this.verify(this.verificationBaseline, currentError, this.verificationBaselineDelta, currentDelta);
      if (this.verification === 'SUCCESS') { this.metrics.successful_corrections += 1; this.localFailureStreak = 0; this.clearAction(); }
      else if (this.verification === 'IMPROVING') {
        this.metrics.improving_count += 1; this.verificationBaseline = currentError; this.verificationBaselineDelta = currentDelta;
        this.waitingUntil = now + this.config.instruction_gap_ms;
        this.runtimeState = 'WAITING';
        return this.snapshot(now, state, delta, this.activeIssue ?? best, instruction);
      } else {
        if (this.verification === 'NO_EFFECT') this.metrics.no_effect_count += 1;
        if (this.verification === 'WRONG_DIRECTION') this.metrics.wrong_direction_count += 1;
        this.localFailureStreak += 1; this.clearAction();
        if (this.localFailureStreak >= this.config.local_failure_limit) this.runtimeState = 'LOCAL_RECOVERY_REQUIRED';
      }
    }

    if (this.runtimeState === 'LOCAL_RECOVERY_REQUIRED') return this.snapshot(now, state, delta, best, instruction);
    const selected = this.selectWithHysteresis(best, candidates, now);
    this.trackCandidate(selected, now);
    if (!selected) { this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, null, instruction); }
    if (this.candidateKind !== selected.kind || now - this.candidateSince < this.config.issue_persistence_ms) {
      this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, selected, instruction);
    }
    this.activeIssue = selected;
    if (!selected.action) { this.runtimeState = selected.kind === 'SUBJECT_MISSING' ? 'SEARCHING' : 'ANALYZING'; return this.snapshot(now, state, delta, selected, instruction); }
    if (this.actionIssuedAt !== null && now - this.actionIssuedAt < this.config.instruction_gap_ms) {
      this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, selected, instruction);
    }

    this.activeAction = selected.action; this.actionIssuedAt = now; this.waitingUntil = now + this.config.instruction_gap_ms;
    this.verificationBaseline = selected.normalized_error; this.verificationBaselineDelta = this.deltaFor(selected.kind, delta);
    this.verification = 'NONE'; this.instructionSequence += 1;
    this.metrics.instruction_count += 1; this.runtimeState = 'INSTRUCTING';
    instruction = this.event(now, selected.action, selected.kind);
    return this.snapshot(now, state, delta, selected, instruction);
  }

  private selectWithHysteresis(best: IssueCandidate | null, candidates: IssueCandidate[], now: number): IssueCandidate | null {
    const latched = this.activeIssue ?? this.candidateIssue;
    if (!best || !latched) return best;
    const current = candidates.find((candidate) => candidate.kind === latched.kind);
    if (!current) return best;
    if (best.kind === current.kind || best.score <= current.score * this.config.dominance_ratio) return current;
    if ((current.kind === 'X_POSITION' && best.kind === 'SCALE') || (current.kind === 'SCALE' && best.kind === 'X_POSITION')) {
      if (this.lastIssueSwitchAt > 0 && now - this.lastIssueSwitchAt <= this.config.oscillation_window_ms) this.metrics.oscillation_count += 1;
      this.lastIssueSwitchAt = now;
    }
    return best;
  }

  private trackCandidate(issue: IssueCandidate | null, now: number): void {
    if (issue?.kind !== this.candidateKind) {
      this.candidateKind = issue?.kind ?? null; this.candidateSince = now;
      if (issue) this.activeIssueSince = now;
    }
    this.candidateIssue = issue;
  }

  private verify(previous: number | null, current: number | null, previousDelta: number | null, currentDelta: number | null): VerificationResult {
    if (!finite(previous) || !finite(current)) return 'NO_EFFECT';
    if (current <= 1) return 'SUCCESS';
    const reduction = (previous - current) / Math.max(previous, 0.0001);
    if (reduction >= this.config.improvement_ratio) return 'IMPROVING';
    if (finite(previousDelta) && finite(currentDelta) && previousDelta * currentDelta < 0) return 'NO_EFFECT';
    const increase = (current - previous) / Math.max(previous, 0.0001);
    if (increase >= this.config.wrong_direction_increase_ratio && current - previous > this.config.verification_jitter_normalized) return 'WRONG_DIRECTION';
    return 'NO_EFFECT';
  }

  private errorFor(kind: IssueKind | null, delta: DeltaState): number | null {
    if (kind === 'X_POSITION') return delta.x.normalized_error;
    if (kind === 'Y_POSITION') return delta.y.normalized_error;
    if (kind === 'SCALE') return delta.scale.normalized_error;
    return null;
  }

  private deltaFor(kind: IssueKind | null, delta: DeltaState): number | null {
    if (kind === 'X_POSITION') return delta.x.delta;
    if (kind === 'Y_POSITION') return delta.y.delta;
    if (kind === 'SCALE') return delta.scale.delta;
    return null;
  }

  private clearAction(): void {
    this.activeAction = null; this.activeIssue = null; this.candidateKind = null; this.candidateIssue = null; this.candidateSince = 0;
    this.verificationBaseline = null; this.verificationBaselineDelta = null; this.runtimeState = 'ANALYZING';
  }

  private event(timestamp: number, action: LocalAction, issue: IssueKind | null): InstructionEvent {
    return { sequence: this.instructionSequence, timestamp_ms: timestamp, action, copy_zh: ACTION_COPY[action], issue };
  }

  private snapshot(now: number, state: StructuredPerceptionState, delta: DeltaState, issue: IssueCandidate | null, instruction: InstructionEvent | null): ClosedLoopSnapshot {
    return {
      timestamp_ms: now, target: this.target, current: state.subject, delta, issue,
      issue_age_ms: issue ? Math.max(0, now - this.activeIssueSince) : 0,
      active_action: this.activeAction,
      action_age_ms: this.actionIssuedAt === null ? null : Math.max(0, now - this.actionIssuedAt),
      instruction, runtime_state: this.runtimeState,
      waiting_remaining_ms: this.runtimeState === 'WAITING' || this.runtimeState === 'INSTRUCTING' ? Math.max(0, this.waitingUntil - now) : 0,
      verification: this.verification,
      stable_duration_ms: this.readyStableSince === null ? 0 : Math.max(0, now - this.readyStableSince),
      ready: this.runtimeState === 'READY', metrics: { ...this.metrics },
    };
  }
}
