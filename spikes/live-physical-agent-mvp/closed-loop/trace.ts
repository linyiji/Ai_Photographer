import type { StructuredPerceptionState } from '../perception/types.js';
import type { ClosedLoopSnapshot } from './types.js';
import { LocalClosedLoopEngine } from './engine.js';
import type { VisualGuidanceState } from '../visual-guidance/types.js';

export interface ScalarTraceRow {
  timestamp: number; sequence: number; subject_present: boolean; center_x: number | null; height_ratio: number | null;
  velocity_x: number | null; velocity_scale: number | null; stable: boolean; target_x: number; target_height: number;
  delta_x: number | null; delta_scale: number | null; active_issue: string | null; active_action: string | null;
  runtime_state: string; episode_id: number | null; episode_state: string | null; verification: string;
  trial_id: number | null; trial_state: string; ready: boolean; ready_source: string | null; measurement_age_ms: number; guidance_decision_age_ms: number; control_fresh: boolean; suppression_reason: string;
  control_epoch: { epoch_id: number; trial_id: number; episode_id: number; axis: string; action: string; state_version: number; measurement_timestamp: number; camera_facing: string; preview_mirror_state: string; canonical_axis_sign: number; display_axis_sign: number } | null;
  instruction_event: { sequence: number; action: string; timestamp_ms: number } | null;
  visual_guidance?: {
    visual_status: string; tracking_status: string; overlay_mode: string; raw_box_jitter: number;
    stabilized_box_jitter: number; projection_age_ms: number; visual_latency_ms: number;
    target_crossing_delay_ms: number | null; time_inside_before_ready_ms: number | null;
    target_entry_count: number; target_exit_count: number;
    subject_lock_loss_count: number; reacquisition_count: number; theme_id?: string;
    visual_latency_p50_ms: number; visual_latency_p95_ms: number; visual_latency_max_ms: number;
  };
}

export const scalarTraceRow = (state: StructuredPerceptionState, snapshot: ClosedLoopSnapshot, visual?: VisualGuidanceState | null, themeId?: string): ScalarTraceRow => ({
  timestamp: state.timestamp_ms, sequence: state.sequence, subject_present: state.subject.present,
  center_x: state.subject.center_x, height_ratio: state.subject.height_ratio, velocity_x: state.subject.velocity_x,
  velocity_scale: state.subject.velocity_scale, stable: state.subject.stable, target_x: snapshot.target.center_x,
  target_height: snapshot.target.height_ratio, delta_x: snapshot.delta.x.delta, delta_scale: snapshot.delta.scale.delta,
  active_issue: snapshot.issue?.kind ?? null, active_action: snapshot.active_action, runtime_state: snapshot.runtime_state,
  episode_id: snapshot.episode?.episode_id ?? null, episode_state: snapshot.episode?.state ?? null,
  verification: snapshot.verification, trial_id: snapshot.trial_id, trial_state: snapshot.trial_state, ready: snapshot.ready, ready_source: snapshot.ready_source, measurement_age_ms: snapshot.control_observation.measurement_age_ms, guidance_decision_age_ms: snapshot.control_observation.guidance_decision_age_ms, control_fresh: snapshot.control_observation.fresh, suppression_reason: snapshot.control_observation.suppression_reason,
  control_epoch: snapshot.control_epoch ? { epoch_id: snapshot.control_epoch.epoch_id, trial_id: snapshot.control_epoch.trial_id, episode_id: snapshot.control_epoch.episode_id, axis: snapshot.control_epoch.axis, action: snapshot.control_epoch.action, state_version: snapshot.control_epoch.state_version, measurement_timestamp: snapshot.control_epoch.measurement_timestamp, camera_facing: snapshot.control_epoch.camera_facing, preview_mirror_state: snapshot.control_epoch.preview_mirror_state, canonical_axis_sign: snapshot.control_epoch.canonical_axis_sign, display_axis_sign: snapshot.control_epoch.display_axis_sign } : null,
  instruction_event: snapshot.instruction ? { sequence: snapshot.instruction.sequence, action: snapshot.instruction.action, timestamp_ms: snapshot.instruction.timestamp_ms } : null,
  ...(visual ? { visual_guidance: { visual_status: visual.visual_status, tracking_status: visual.tracking_status, overlay_mode: visual.overlay_mode, raw_box_jitter: visual.metrics.raw_box_jitter, stabilized_box_jitter: visual.metrics.stabilized_box_jitter, projection_age_ms: visual.projection_age, visual_latency_ms: visual.metrics.visual_projection_latency_ms, visual_latency_p50_ms: visual.metrics.visual_projection_latency_ms_p50, visual_latency_p95_ms: visual.metrics.visual_projection_latency_ms_p95, visual_latency_max_ms: visual.metrics.visual_projection_latency_ms_max, target_crossing_delay_ms: visual.metrics.target_crossing_delay_ms, time_inside_before_ready_ms: visual.metrics.time_inside_target_before_ready_ms, target_entry_count: visual.metrics.target_box_entry_count, target_exit_count: visual.metrics.target_box_exit_count, subject_lock_loss_count: visual.metrics.subject_lock_loss_count, reacquisition_count: visual.metrics.reacquisition_count, ...(themeId ? { theme_id: themeId } : {}) } } : {}),
});

export class ScalarTraceRecorder {
  readonly rows: ScalarTraceRow[] = [];
  clear(): void { this.rows.length = 0; }
  append(state: StructuredPerceptionState, snapshot: ClosedLoopSnapshot, visual?: VisualGuidanceState | null, themeId?: string): void { this.rows.push(scalarTraceRow(state, snapshot, visual, themeId)); }
  json(): string { return JSON.stringify({ format: 'xfx-live-p2-scalar-trace-v2', raw_media: false, rows: this.rows }, null, 2); }
}

export function replayScalarStates(states: readonly StructuredPerceptionState[], armed = true): ClosedLoopSnapshot[] {
  const engine = new LocalClosedLoopEngine(); if (armed) engine.armTrial(states[0]?.timestamp_ms ?? 0);
  return states.map((state) => engine.update(state));
}
