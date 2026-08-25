import type { ClosedLoopSnapshot, DirectionalAction } from '../closed-loop/types.js';
import type { PoseMeasurement, StructuredPerceptionState } from '../perception/types.js';
import { VISUAL_GUIDANCE_CONFIG } from './config.js';
import type { AcceptableZone, NormalizedBox, TrackingStatus, VisualAxisStatus, VisualGuidanceConfig, VisualGuidanceMetrics, VisualGuidanceState, VisualServoMode, VisualServoStatus } from './types.js';

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const finite = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value);
const ema = (previous: number, next: number, alpha: number): number => previous + alpha * (next - previous);
const mean = (values: number[]): number => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const percentile = (values:number[],q:number):number => { if(!values.length)return 0; const sorted=[...values].sort((a,b)=>a-b); return sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil(sorted.length*q)-1))]; };
const directional = (action: string | null): action is DirectionalAction => ['MOVE_LEFT', 'MOVE_RIGHT', 'MOVE_CLOSER', 'MOVE_FARTHER'].includes(action ?? '');

const boxFromValues = (centerX: number, centerY: number, width: number, height: number): NormalizedBox => {
  const safeWidth = clamp(width, 0.02, 1); const safeHeight = clamp(height, 0.02, 1);
  return { left: clamp(centerX - safeWidth / 2), top: clamp(centerY - safeHeight / 2), width: safeWidth, height: safeHeight, center_x: clamp(centerX), center_y: clamp(centerY) };
};

const boxFromState = (state: StructuredPerceptionState, raw?: PoseMeasurement | null): NormalizedBox | null => {
  if (raw) return boxFromValues(raw.center_x, raw.center_y, raw.width_ratio, raw.height_ratio);
  const subject = state.subject;
  if (!subject.present || !finite(subject.center_x) || !finite(subject.center_y) || !finite(subject.width_ratio) || !finite(subject.height_ratio)) return null;
  return boxFromValues(subject.center_x, subject.center_y, subject.width_ratio, subject.height_ratio);
};

const boxDistance = (a: NormalizedBox, b: NormalizedBox): number => Math.hypot(a.center_x - b.center_x, a.center_y - b.center_y, a.height - b.height);
const axisStatus = (normalizedError: number | null | undefined): VisualAxisStatus => !finite(normalizedError) ? 'MISSING' : normalizedError <= 1 ? 'INSIDE' : normalizedError <= 1.5 ? 'APPROACHING' : 'OUTSIDE';

export class VisualGuidanceProjector {
  private smoothed: NormalizedBox | null = null;
  private trackingStatus: TrackingStatus = 'UNLOCKED';
  private acquireSince: number | null = null;
  private lastFreshAt: number | null = null;
  private quietSince: number | null = null;
  private lastRaw: NormalizedBox | null = null;
  private lastSmoothed: NormalizedBox | null = null;
  private rawJitter: number[] = [];
  private stabilizedJitter: number[] = [];
  private lockLossCount = 0;
  private reacquisitionCount = 0;
  private wasInside = false;
  private rawInsideAt: number | null = null;
  private targetCrossingDelayMs: number | null = null;
  private insideSince: number | null = null;
  private insideBeforeReadyMs: number | null = null;
  private visualLatencyMs = 0;
  private entryCount = 0;
  private exitCount = 0;
  private lastProjectionAt: number | null = null;
  private visualLatencyHistory: number[] = [];

  constructor(private readonly config: VisualGuidanceConfig = VISUAL_GUIDANCE_CONFIG) {}

  reset(): void {
    this.smoothed = null; this.trackingStatus = 'UNLOCKED'; this.acquireSince = this.lastFreshAt = this.quietSince = null;
    this.lastRaw = this.lastSmoothed = null; this.rawJitter = []; this.stabilizedJitter = []; this.lockLossCount = this.reacquisitionCount = 0;
    this.wasInside = false; this.rawInsideAt = this.targetCrossingDelayMs = this.insideSince = this.insideBeforeReadyMs = null; this.visualLatencyMs = 0; this.entryCount = this.exitCount = 0; this.lastProjectionAt = null; this.visualLatencyHistory = [];
  }

  update(state: StructuredPerceptionState, control: ClosedLoopSnapshot, rawMeasurement: PoseMeasurement | null = null, options: { mode?: VisualServoMode; grid?: boolean; now?: number } = {}): VisualGuidanceState {
    const now = options.now ?? state.timestamp_ms; const fresh = state.subject.present && (state.measurement_age_ms ?? 0) === 0;
    const rawBox = boxFromState(state, rawMeasurement); const authoritativeBox = boxFromState(state, null); this.updateTracking(rawBox, state, fresh, now);
    const rawInside = control.delta.x.status === 'SATISFIED' && control.delta.scale.status === 'SATISFIED' && (control.delta.y.status === 'SATISFIED' || control.delta.y.status === 'EXEMPT');
    if (rawBox && fresh) this.updateProjection(rawBox, state, now, control.ready && state.subject.stable ? authoritativeBox : null);
    const target = this.targetGeometry(control, this.smoothed ?? authoritativeBox ?? rawBox);
    const xStatus = axisStatus(control.delta.x.normalized_error); const scaleStatus = axisStatus(control.delta.scale.normalized_error);
    const exitMultiplier = this.wasInside ? this.config.presentation_exit_multiplier : 1;
    const visualInside = this.smoothed ? Math.abs(control.target.center_x - this.smoothed.center_x) <= control.target.tolerance_x * exitMultiplier && Math.abs(control.target.height_ratio - this.smoothed.height) <= control.target.tolerance_height * exitMultiplier : false;
    if (rawInside && this.rawInsideAt === null) this.rawInsideAt = now;
    if (!rawInside) this.rawInsideAt = null;
    if (visualInside && this.rawInsideAt !== null && this.targetCrossingDelayMs === null) this.targetCrossingDelayMs = Math.max(0, now - this.rawInsideAt);
    if (visualInside !== this.wasInside) { if (visualInside) { this.entryCount += 1; this.insideSince = now; } else { this.exitCount += 1; this.insideSince = null; } this.wasInside = visualInside; }
    if (control.ready && this.insideSince !== null && this.insideBeforeReadyMs === null) this.insideBeforeReadyMs = Math.max(0, now - this.insideSince);
    const near = xStatus !== 'MISSING' && scaleStatus !== 'MISSING' && [xStatus, scaleStatus].every((status) => status === 'INSIDE' || status === 'APPROACHING');
    const braking = control.active_action === 'STOP_HERE' || control.runtime_state === 'BRAKING';
    const directionHint = directional(control.active_action) ? control.active_action : null;
    const visualStatus = this.visualStatus(control, near, visualInside, braking);
    return {
      tracked_subject_box: this.trackingStatus === 'UNLOCKED' ? null : this.smoothed,
      raw_subject_box: rawBox,
      target_box: target.box,
      acceptable_zone: target.zone,
      tracking_status: this.trackingStatus,
      tracking_confidence: state.subject.present ? clamp(state.subject.confidence) : 0,
      x_status: xStatus, scale_status: scaleStatus, visual_status: visualStatus,
      near_target: near, inside_target: visualInside, measurement_stable: this.quietSince !== null && now - this.quietSince >= this.config.measurement_quiet_ms,
      direction_hint: directionHint, display_axis_sign: directionHint ? control.control_epoch?.display_axis_sign ?? 0 : 0, braking, ready: control.ready, ready_source: control.ready_source,
      source_timestamp: state.timestamp_ms, projection_age: Math.max(0, now - state.timestamp_ms), grid_enabled: options.grid ?? false,
      overlay_mode: options.mode ?? 'VISUAL_PLUS_TEXT', metrics: this.metrics(), display_observation: Object.freeze({ source_timestamp: state.timestamp_ms, projected_at: now, latency_ms: this.visualLatencyMs, subject_box: this.smoothed ? { ...this.smoothed } : null }),
    };
  }

  private updateTracking(rawBox: NormalizedBox | null, state: StructuredPerceptionState, fresh: boolean, now: number): void {
    if (rawBox && fresh) {
      const returning = this.trackingStatus === 'HELD' || this.trackingStatus === 'REACQUIRING';
      if (returning && this.smoothed) {
        const centerDistance = Math.hypot(rawBox.center_x - this.smoothed.center_x, rawBox.center_y - this.smoothed.center_y);
        const scaleDistance = Math.abs(rawBox.height - this.smoothed.height);
        if (centerDistance <= this.config.reacquire_center_distance && scaleDistance <= this.config.reacquire_scale_distance) { this.trackingStatus = 'REACQUIRING'; this.reacquisitionCount += 1; }
        else { this.smoothed = rawBox; this.trackingStatus = 'ACQUIRING'; this.acquireSince = now; }
      }
      this.lastFreshAt = now;
      const speed = Math.hypot(state.subject.velocity_x ?? 0, state.subject.velocity_y ?? 0, state.subject.velocity_scale ?? 0);
      const eligible = state.subject.confidence >= 0.5 && (state.subject.stable || speed <= this.config.moving_velocity_threshold);
      if (this.trackingStatus === 'UNLOCKED' || this.trackingStatus === 'HELD') { this.trackingStatus = 'ACQUIRING'; this.acquireSince = now; }
      if (this.trackingStatus === 'REACQUIRING') { this.trackingStatus = 'LOCKED'; this.acquireSince = null; }
      else if (eligible && this.trackingStatus === 'ACQUIRING') { this.acquireSince ??= now; if (now - this.acquireSince >= this.config.lock_acquire_ms) this.trackingStatus = 'LOCKED'; }
      else if (!eligible && this.trackingStatus === 'ACQUIRING') this.acquireSince = now;
      return;
    }
    const age = this.lastFreshAt === null ? Number.POSITIVE_INFINITY : now - this.lastFreshAt;
    if (this.smoothed && age <= this.config.lock_hold_ms) this.trackingStatus = 'HELD';
    else if (this.trackingStatus !== 'UNLOCKED') { this.trackingStatus = 'UNLOCKED'; this.lockLossCount += 1; this.acquireSince = null; this.smoothed = null; }
  }

  private updateProjection(raw: NormalizedBox, state: StructuredPerceptionState, now: number, settledAuthority: NormalizedBox | null): void {
    const vx = state.subject.velocity_x ?? 0; const vy = state.subject.velocity_y ?? 0; const vs = state.subject.velocity_scale ?? 0;
    const speed = Math.hypot(vx, vy, vs); const moving = speed > this.config.moving_velocity_threshold;
    const elapsed = this.lastProjectionAt === null ? 0 : Math.max(0, now - this.lastProjectionAt); const tau = moving ? this.config.moving_time_constant_ms : this.config.quiet_time_constant_ms;
    const alpha = this.lastProjectionAt === null ? 1 : clamp(1 - Math.exp(-elapsed / tau), moving ? this.config.moving_ema_alpha : this.config.base_ema_alpha, 0.92);
    const horizon = moving ? this.config.prediction_horizon_ms / 1000 : 0;
    const projectedRaw = boxFromValues(raw.center_x + vx * horizon, raw.center_y + vy * horizon, raw.width, raw.height + vs * horizon);
    if (settledAuthority) this.smoothed = { ...settledAuthority };
    else if (!this.smoothed) this.smoothed = { ...raw };
    else this.smoothed = boxFromValues(ema(this.smoothed.center_x, projectedRaw.center_x, alpha), ema(this.smoothed.center_y, projectedRaw.center_y, alpha), ema(this.smoothed.width, projectedRaw.width, alpha), ema(this.smoothed.height, projectedRaw.height, alpha));
    this.visualLatencyMs = speed > 0.01 ? boxDistance(raw, this.smoothed) / speed * 1000 : 0; this.pushBounded(this.visualLatencyHistory,this.visualLatencyMs); this.lastProjectionAt = now;
    if (this.lastRaw) this.pushBounded(this.rawJitter, boxDistance(raw, this.lastRaw));
    if (this.lastSmoothed) {
      const movement = boxDistance(this.smoothed, this.lastSmoothed); this.pushBounded(this.stabilizedJitter, movement);
      if (movement <= this.config.measurement_jitter_threshold) this.quietSince ??= now; else this.quietSince = now;
    } else this.quietSince = now;
    this.lastRaw = raw; this.lastSmoothed = { ...this.smoothed };
  }

  private targetGeometry(control: ClosedLoopSnapshot, subject: NormalizedBox | null): { box: NormalizedBox; zone: AcceptableZone } {
    const aspect = subject && subject.height > 0 ? clamp(subject.width / subject.height, 0.3, 1.2) : 0.58;
    const centerY = control.target.y_exempt && subject ? subject.center_y : control.target.center_y;
    const targetWidth = clamp(control.target.height_ratio * aspect, 0.08, 0.9);
    const box = boxFromValues(control.target.center_x, centerY, targetWidth, control.target.height_ratio);
    const outerHeight = clamp(control.target.height_ratio + control.target.tolerance_height * 2, 0.02, 1);
    const outerWidth = clamp(targetWidth + control.target.tolerance_x * 2, 0.02, 1);
    const outer = boxFromValues(control.target.center_x, centerY, outerWidth, outerHeight);
    return { box, zone: { left: outer.left, right: clamp(outer.left + outer.width), top: outer.top, bottom: clamp(outer.top + outer.height), center_x_min: clamp(control.target.center_x - control.target.tolerance_x), center_x_max: clamp(control.target.center_x + control.target.tolerance_x), height_min: clamp(control.target.height_ratio - control.target.tolerance_height), height_max: clamp(control.target.height_ratio + control.target.tolerance_height) } };
  }

  private visualStatus(control: ClosedLoopSnapshot, near: boolean, inside: boolean, braking: boolean): VisualServoStatus {
    if (this.trackingStatus === 'UNLOCKED') return 'LOST'; if (control.ready) return 'READY'; if (braking) return 'BRAKING'; if (inside) return 'INSIDE_TARGET'; if (near) return 'NEAR_TARGET'; if (control.active_action) return 'CORRECTING'; return 'TRACKING';
  }

  private metrics(): VisualGuidanceMetrics {
    const raw = mean(this.rawJitter); const stabilized = mean(this.stabilizedJitter);
    return { raw_box_jitter: raw, stabilized_box_jitter: stabilized, jitter_reduction_ratio: raw > 0 ? 1 - stabilized / raw : null, visual_projection_latency_ms: this.visualLatencyMs, visual_projection_latency_ms_p50: percentile(this.visualLatencyHistory,.5), visual_projection_latency_ms_p95: percentile(this.visualLatencyHistory,.95), visual_projection_latency_ms_max: this.visualLatencyHistory.length?Math.max(...this.visualLatencyHistory):0, target_crossing_delay_ms: this.targetCrossingDelayMs, time_inside_target_before_ready_ms: this.insideBeforeReadyMs, target_box_entry_count: this.entryCount, target_box_exit_count: this.exitCount, subject_lock_loss_count: this.lockLossCount, reacquisition_count: this.reacquisitionCount };
  }

  private pushBounded(values: number[], value: number): void { values.push(value); if (values.length > this.config.history_limit) values.shift(); }
}
