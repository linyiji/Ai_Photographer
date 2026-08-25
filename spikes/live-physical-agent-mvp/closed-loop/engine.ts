import { ACTION_COPY, CLOSED_LOOP_CONFIG, DEFAULT_TARGET, ISSUE_WEIGHTS } from './config.js';
import type { StructuredPerceptionState } from '../perception/types.js';
import type { ActionEpisode, ClosedLoopConfig, ClosedLoopMetrics, ClosedLoopSnapshot, DeltaState, DimensionDelta, InstructionEvent, IssueCandidate, IssueKind, LocalAction, RuntimeState, TargetState, TerminalOutcome, TrialState, VerificationResult } from './types.js';

const finite = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);
const median = (values: number[]): number => { const s = [...values].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const dimension = (target: number, current: number | null | undefined, tolerance: number, exempt = false): DimensionDelta => {
  if (exempt) return { delta: null, normalized_error: null, status: 'EXEMPT' };
  if (!finite(current)) return { delta: null, normalized_error: null, status: 'MISSING' };
  const delta = target - current; const normalized_error = Math.abs(delta) / tolerance;
  return { delta, normalized_error, status: normalized_error <= 1 ? 'SATISFIED' : 'UNSATISFIED' };
};

export function computeDelta(state: StructuredPerceptionState, target: TargetState): DeltaState {
  if (!state.subject.present) { const m: DimensionDelta = { delta: null, normalized_error: null, status: 'MISSING' }; return { x: m, y: target.y_exempt ? { delta: null, normalized_error: null, status: 'EXEMPT' } : m, scale: m }; }
  return { x: dimension(target.center_x, state.subject.center_x, target.tolerance_x), y: dimension(target.center_y, state.subject.center_y, target.tolerance_y, target.y_exempt), scale: dimension(target.height_ratio, state.subject.height_ratio, target.tolerance_height) };
}

// Sensor X grows image-right. Preview mirroring is CSS-only and never enters this mapping.
export function actionForIssue(kind: IssueKind, delta: DeltaState): LocalAction | null {
  if (kind === 'X_POSITION' && finite(delta.x.delta)) return delta.x.delta > 0 ? 'MOVE_LEFT' : 'MOVE_RIGHT';
  if (kind === 'SCALE' && finite(delta.scale.delta)) return delta.scale.delta > 0 ? 'MOVE_CLOSER' : 'MOVE_FARTHER';
  return null;
}

export function rankIssues(state: StructuredPerceptionState, delta: DeltaState): IssueCandidate[] {
  if (!state.subject.present) return [{ kind: 'SUBJECT_MISSING', score: ISSUE_WEIGHTS.SUBJECT_MISSING, normalized_error: 1, action: null, action_mapping: 'NONE' }];
  const result: IssueCandidate[] = [];
  const add = (kind: IssueKind, d: DimensionDelta, weight: number): void => { if (d.status !== 'UNSATISFIED' || !finite(d.normalized_error)) return; const action = actionForIssue(kind, delta); result.push({ kind, score: weight * d.normalized_error, normalized_error: d.normalized_error, action, action_mapping: action ? 'LOCAL_LIBRARY' : 'DEFERRED_ACTION_MAPPING' }); };
  add('X_POSITION', delta.x, ISSUE_WEIGHTS.X_POSITION); add('SCALE', delta.scale, ISSUE_WEIGHTS.SCALE); add('Y_POSITION', delta.y, ISSUE_WEIGHTS.Y_POSITION);
  return result.sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind));
}

const initialMetrics = (): ClosedLoopMetrics => ({ instruction_count: 0, ordinary_instruction_count: 0, hold_count: 0, episode_count: 0, terminal_episode_count: 0, successful_corrections: 0, improving_count: 0, no_effect_count: 0, wrong_direction_count: 0, oscillation_count: 0, local_decisions: 0, time_to_target_ms: null, correction_success_rate: null, recovery_count: 0, luna_calls: 0, backend_per_frame_calls: 0, provider_calls: 0, raw_video_upload: 0 });
interface Observation { timestamp: number; signed: number; error: number }

export class LocalClosedLoopEngine {
  private target: TargetState; private runtimeState: RuntimeState = 'IDLE'; private trialState: TrialState = 'DISARMED';
  private trialArmedAt: number | null = null; private firstInstructionAt: number | null = null; private readyAt: number | null = null;
  private candidateKind: IssueKind | null = null; private candidateIssue: IssueCandidate | null = null; private candidateSince = 0; private activeIssueSince = 0;
  private episode: ActionEpisode | null = null; private lastTerminalEpisode: ActionEpisode | null = null; private episodeSequence = 0; private instructionSequence = 0;
  private lastOrdinaryInstructionAt: number | null = null; private readyStableSince: number | null = null; private verification: VerificationResult = 'NONE';
  private settled: Observation[] = []; private localFailureStreak = 0; private lastIssueSwitchAt = 0; private lastIssuedAction: Exclude<LocalAction, 'HOLD'> | null = null; private sameActionRetries = 0;
  private metrics = initialMetrics();
  constructor(target: TargetState = DEFAULT_TARGET, private readonly config: ClosedLoopConfig = CLOSED_LOOP_CONFIG) { this.target = target; }
  setTarget(target: TargetState): void { this.target = target; this.reset(); }
  armTrial(now: number): void { this.reset(); this.trialState = 'ARMED'; this.trialArmedAt = now; }
  reset(): void { this.runtimeState = 'IDLE'; this.trialState = 'DISARMED'; this.trialArmedAt = this.firstInstructionAt = this.readyAt = null; this.candidateKind = null; this.candidateIssue = null; this.candidateSince = this.activeIssueSince = 0; this.episode = this.lastTerminalEpisode = null; this.episodeSequence = this.instructionSequence = 0; this.lastOrdinaryInstructionAt = this.readyStableSince = null; this.verification = 'NONE'; this.settled = []; this.localFailureStreak = this.lastIssueSwitchAt = this.sameActionRetries = 0; this.lastIssuedAction = null; this.metrics = initialMetrics(); }

  update(state: StructuredPerceptionState): ClosedLoopSnapshot {
    const now = state.timestamp_ms; const delta = computeDelta(state, this.target); const candidates = rankIssues(state, delta); const best = candidates[0] ?? null; let instruction: InstructionEvent | null = null; this.metrics.local_decisions += 1;
    if (!state.subject.present) { this.runtimeState = 'SEARCHING'; this.readyStableSince = null; this.settled = []; this.trackCandidate(best, now); return this.snapshot(now, state, delta, best, instruction); }
    // READY closes the armed trial. Further movement is observation-only until an explicit re-ARM,
    // so post-ready user motion cannot contaminate the accepted episode denominator.
    if (this.trialState === 'READY') { this.runtimeState = 'READY'; return this.snapshot(now, state, delta, null, instruction); }
    if (this.episode) { this.observeEpisode(now, state, delta); if (this.episode?.terminal_outcome) this.finishEpisode(this.episode.terminal_outcome, now); if (this.episode) return this.snapshot(now, state, delta, this.issueForEpisode(candidates), instruction); }
    const allSatisfied = delta.x.status === 'SATISFIED' && delta.scale.status === 'SATISFIED' && (delta.y.status === 'SATISFIED' || delta.y.status === 'EXEMPT');
    if (allSatisfied) {
      this.candidateKind = null; this.candidateIssue = null; if (state.subject.stable) this.readyStableSince ??= now; else this.readyStableSince = null;
      const duration = this.readyStableSince === null ? 0 : now - this.readyStableSince; const causal = !this.firstInstructionAt || Boolean(this.lastTerminalEpisode?.terminal_outcome);
      if (duration >= this.target.ready_stable_ms && causal) { if (this.runtimeState !== 'READY') { this.runtimeState = 'READY'; this.readyAt = now; if (this.trialState === 'RUNNING') { this.trialState = 'READY'; this.metrics.time_to_target_ms = this.firstInstructionAt === null ? null : now - this.firstInstructionAt; } this.instructionSequence += 1; this.metrics.hold_count += 1; instruction = this.event(now, 'HOLD', null); } }
      else this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, null, instruction);
    }
    this.readyStableSince = null; if (this.runtimeState === 'READY') this.runtimeState = 'ANALYZING'; if (this.runtimeState === 'LOCAL_RECOVERY_REQUIRED') return this.snapshot(now, state, delta, best, instruction);
    const selected = this.selectWithHysteresis(best, candidates, now); this.trackCandidate(selected, now);
    if (!selected || !selected.action) { this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, selected, instruction); }
    if (this.candidateKind !== selected.kind || now - this.candidateSince < this.config.issue_persistence_ms) { this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, selected, instruction); }
    if (this.lastOrdinaryInstructionAt !== null && now - this.lastOrdinaryInstructionAt < this.config.instruction_gap_ms) { this.runtimeState = 'ANALYZING'; return this.snapshot(now, state, delta, selected, instruction); }
    const signed = this.deltaFor(selected.kind, delta); if (!finite(signed)) return this.snapshot(now, state, delta, selected, instruction);
    const action = selected.action as Exclude<LocalAction, 'HOLD'>; this.sameActionRetries = action === this.lastIssuedAction ? this.sameActionRetries + 1 : 0; this.lastIssuedAction = action; this.episodeSequence += 1; this.instructionSequence += 1;
    this.episode = { episode_id: this.episodeSequence, issue: selected.kind, action, issued_at: now, baseline_signed_delta: signed, baseline_abs_error: Math.abs(signed), baseline_normalized_error: selected.normalized_error, motion_detected_at: null, best_signed_delta: signed, best_abs_error: Math.abs(signed), best_normalized_error: selected.normalized_error, current_signed_delta: signed, current_normalized_error: selected.normalized_error, target_crossed: false, entered_deadband: false, settled_at: null, final_settled_error: null, terminal_outcome: null, terminal_at: null, reissue_count: this.sameActionRetries, warning_flags: [], state: 'WAITING_FOR_MOTION' };
    this.settled = []; this.verification = 'NONE'; this.runtimeState = 'INSTRUCTING'; this.lastOrdinaryInstructionAt = now; this.metrics.ordinary_instruction_count += 1; this.metrics.instruction_count = this.metrics.ordinary_instruction_count; this.metrics.episode_count += 1;
    if (this.trialState === 'ARMED') { this.trialState = 'RUNNING'; this.firstInstructionAt = now; }
    instruction = this.event(now, action, selected.kind); return this.snapshot(now, state, delta, selected, instruction);
  }

  private observeEpisode(now: number, state: StructuredPerceptionState, delta: DeltaState): void {
    const e = this.episode; if (!e) return; const signed = this.deltaFor(e.issue, delta); const error = this.errorFor(e.issue, delta); if (!finite(signed) || !finite(error)) return;
    e.current_signed_delta = signed; e.current_normalized_error = error; if (error < e.best_normalized_error) { e.best_normalized_error = error; e.best_abs_error = Math.abs(signed); e.best_signed_delta = signed; }
    if (e.baseline_signed_delta * signed < 0) e.target_crossed = true; if (error <= 1) e.entered_deadband = true;
    const progress = e.baseline_normalized_error - error; const meaningful = Math.abs(progress) >= this.config.minimum_meaningful_movement_normalized; if (!e.motion_detected_at && meaningful) e.motion_detected_at = now;
    if (!e.motion_detected_at) { e.state = 'WAITING_FOR_MOTION'; this.runtimeState = 'WAITING_FOR_MOTION'; this.verification = 'NONE'; if (now - e.issued_at < this.config.action_response_grace_ms) return; }
    else if (!state.subject.stable) { e.state = 'TRACKING_MOTION'; this.runtimeState = 'TRACKING_MOTION'; this.verification = progress > this.config.verification_jitter_normalized ? 'IMPROVING' : 'NONE'; this.settled = []; return; }
    e.state = 'VERIFYING'; this.runtimeState = 'VERIFYING'; this.settled.push({ timestamp: now, signed, error });
    const span = this.settled.length < 2 ? 0 : this.settled.at(-1)!.timestamp - this.settled[0].timestamp; const timedOut = now - e.issued_at >= this.config.episode_timeout_ms;
    if (span < this.config.settled_window_ms && !timedOut) { this.verification = meaningful ? 'IMPROVING' : 'NONE'; return; }
    const settledError = median(this.settled.map((o) => o.error)); const settledSigned = median(this.settled.map((o) => o.signed)); e.settled_at = now; e.final_settled_error = settledError; const outcome = this.classifyEpisode(e, settledSigned, settledError); e.terminal_outcome = outcome; e.terminal_at = now; e.state = 'TERMINAL'; this.verification = outcome;
  }
  private classifyEpisode(e: ActionEpisode, signed: number, error: number): TerminalOutcome { if (error <= 1 || (e.entered_deadband && error <= 1.25)) return 'SUCCESS'; if (e.target_crossed || e.baseline_signed_delta * signed < 0) { e.warning_flags.push('OVERSHOOT_OUTSIDE_DEADBAND'); return 'NO_EFFECT'; } const increase = error - e.baseline_normalized_error; if (increase >= Math.max(this.config.verification_jitter_normalized, e.baseline_normalized_error * this.config.wrong_direction_increase_ratio)) return 'WRONG_DIRECTION'; return 'NO_EFFECT'; }
  private finishEpisode(outcome: TerminalOutcome, now: number): void { if (!this.episode) return; this.lastTerminalEpisode = { ...this.episode, warning_flags: [...this.episode.warning_flags] }; this.metrics.terminal_episode_count += 1; if (outcome === 'SUCCESS') { this.metrics.successful_corrections += 1; this.localFailureStreak = 0; } if (outcome === 'NO_EFFECT') { this.metrics.no_effect_count += 1; this.localFailureStreak += 1; } if (outcome === 'WRONG_DIRECTION') { this.metrics.wrong_direction_count += 1; this.localFailureStreak += 1; } const d = this.metrics.successful_corrections + this.metrics.no_effect_count + this.metrics.wrong_direction_count; this.metrics.correction_success_rate = d ? this.metrics.successful_corrections / d : null; this.episode = null; this.settled = []; this.candidateKind = null; this.candidateIssue = null; this.candidateSince = now; this.runtimeState = 'ANALYZING'; if (this.localFailureStreak >= this.config.local_failure_limit) { this.runtimeState = 'LOCAL_RECOVERY_REQUIRED'; this.metrics.recovery_count += 1; } }
  private selectWithHysteresis(best: IssueCandidate | null, candidates: IssueCandidate[], now: number): IssueCandidate | null { const latched = this.candidateIssue; if (!best || !latched) return best; const current = candidates.find((c) => c.kind === latched.kind); if (!current) return best; if (best.kind === current.kind || best.score <= current.score * this.config.dominance_ratio) return current; if ((current.kind === 'X_POSITION' && best.kind === 'SCALE') || (current.kind === 'SCALE' && best.kind === 'X_POSITION')) { if (this.lastIssueSwitchAt > 0 && now - this.lastIssueSwitchAt <= this.config.oscillation_window_ms) this.metrics.oscillation_count += 1; this.lastIssueSwitchAt = now; } return best; }
  private trackCandidate(issue: IssueCandidate | null, now: number): void { if (issue?.kind !== this.candidateKind) { this.candidateKind = issue?.kind ?? null; this.candidateSince = now; if (issue) this.activeIssueSince = now; } this.candidateIssue = issue; }
  private issueForEpisode(c: IssueCandidate[]): IssueCandidate | null { return c.find((i) => i.kind === this.episode?.issue) ?? this.candidateIssue; }
  private errorFor(k: IssueKind | null, d: DeltaState): number | null { return k === 'X_POSITION' ? d.x.normalized_error : k === 'Y_POSITION' ? d.y.normalized_error : k === 'SCALE' ? d.scale.normalized_error : null; }
  private deltaFor(k: IssueKind | null, d: DeltaState): number | null { return k === 'X_POSITION' ? d.x.delta : k === 'Y_POSITION' ? d.y.delta : k === 'SCALE' ? d.scale.delta : null; }
  private event(t: number, action: LocalAction, issue: IssueKind | null): InstructionEvent { return { sequence: this.instructionSequence, timestamp_ms: t, action, copy_zh: ACTION_COPY[action], issue }; }
  private snapshot(now: number, state: StructuredPerceptionState, delta: DeltaState, issue: IssueCandidate | null, instruction: InstructionEvent | null): ClosedLoopSnapshot { const ep = this.episode ?? this.lastTerminalEpisode; return { timestamp_ms: now, target: this.target, current: state.subject, delta, issue, issue_age_ms: issue ? Math.max(0, now - this.activeIssueSince) : 0, active_action: this.episode?.action ?? (this.runtimeState === 'READY' ? 'HOLD' : null), action_age_ms: this.episode ? Math.max(0, now - this.episode.issued_at) : null, instruction, runtime_state: this.runtimeState, waiting_remaining_ms: this.episode ? Math.max(0, this.config.action_response_grace_ms - (now - this.episode.issued_at)) : 0, verification: this.verification, episode: ep ? { ...ep, warning_flags: [...ep.warning_flags] } : null, trial_state: this.trialState, trial_armed_at: this.trialArmedAt, first_instruction_at: this.firstInstructionAt, ready_at: this.readyAt, trial_elapsed_ms: this.firstInstructionAt === null ? null : (this.readyAt ?? now) - this.firstInstructionAt, stable_duration_ms: this.readyStableSince === null ? 0 : Math.max(0, now - this.readyStableSince), ready: this.runtimeState === 'READY', metrics: { ...this.metrics } }; }
}
