import type { StructuredPerceptionState } from '../perception/types.js';
import type { ClosedLoopSnapshot } from './types.js';
import { LocalClosedLoopEngine } from './engine.js';

export interface ScalarTraceRow {
  timestamp: number; sequence: number; subject_present: boolean; center_x: number | null; height_ratio: number | null;
  velocity_x: number | null; velocity_scale: number | null; stable: boolean; target_x: number; target_height: number;
  delta_x: number | null; delta_scale: number | null; active_issue: string | null; active_action: string | null;
  runtime_state: string; episode_id: number | null; episode_state: string | null; verification: string;
  instruction_event: { sequence: number; action: string; timestamp_ms: number } | null;
}

export const scalarTraceRow = (state: StructuredPerceptionState, snapshot: ClosedLoopSnapshot): ScalarTraceRow => ({
  timestamp: state.timestamp_ms, sequence: state.sequence, subject_present: state.subject.present,
  center_x: state.subject.center_x, height_ratio: state.subject.height_ratio, velocity_x: state.subject.velocity_x,
  velocity_scale: state.subject.velocity_scale, stable: state.subject.stable, target_x: snapshot.target.center_x,
  target_height: snapshot.target.height_ratio, delta_x: snapshot.delta.x.delta, delta_scale: snapshot.delta.scale.delta,
  active_issue: snapshot.issue?.kind ?? null, active_action: snapshot.active_action, runtime_state: snapshot.runtime_state,
  episode_id: snapshot.episode?.episode_id ?? null, episode_state: snapshot.episode?.state ?? null,
  verification: snapshot.verification,
  instruction_event: snapshot.instruction ? { sequence: snapshot.instruction.sequence, action: snapshot.instruction.action, timestamp_ms: snapshot.instruction.timestamp_ms } : null,
});

export class ScalarTraceRecorder {
  readonly rows: ScalarTraceRow[] = [];
  clear(): void { this.rows.length = 0; }
  append(state: StructuredPerceptionState, snapshot: ClosedLoopSnapshot): void { this.rows.push(scalarTraceRow(state, snapshot)); }
  json(): string { return JSON.stringify({ format: 'xfx-live-p2-scalar-trace-v1', raw_media: false, rows: this.rows }, null, 2); }
}

export function replayScalarStates(states: readonly StructuredPerceptionState[], armed = true): ClosedLoopSnapshot[] {
  const engine = new LocalClosedLoopEngine(); if (armed) engine.armTrial(states[0]?.timestamp_ms ?? 0);
  return states.map((state) => engine.update(state));
}
