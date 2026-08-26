import type { PerceptionConfig, PoseMeasurement, StructuredPerceptionState } from './types.js';

const ema = (previous: number, next: number, alpha: number): number => previous + alpha * (next - previous);
const finiteOrZero = (value: number): number => Number.isFinite(value) ? value : 0;

export class PerceptionStateTracker {
  private sequence = 0;
  private filtered: PoseMeasurement | null = null;
  private lastValidTimestamp: number | null = null;
  private lastMovementAt: number | null = null;
  private wasLost = false;
  private hasDetected = false;
  private lossCount = 0;
  private reacquisitionCount = 0;

  constructor(private readonly config: PerceptionConfig) {}

  update(measurement: PoseMeasurement | null, timestampMs: number): StructuredPerceptionState {
    this.sequence += 1;
    if (!measurement) return this.handleMissing(timestampMs);

    const reacquired = this.wasLost && this.hasDetected;
    if (!this.filtered || reacquired) {
      if (reacquired) this.reacquisitionCount += 1;
      this.filtered = { ...measurement };
      this.lastValidTimestamp = timestampMs;
      this.lastMovementAt = timestampMs;
      this.wasLost = false;
      this.hasDetected = true;
      return this.presentState(timestampMs, 0, 0, 0, false, measurement);
    }

    const previous = this.filtered;
    const dtSeconds = Math.max((timestampMs - (this.lastValidTimestamp ?? timestampMs)) / 1000, 0.001);
    const next: PoseMeasurement = {
      ...measurement,
      confidence: ema(previous.confidence, measurement.confidence, this.config.emaAlpha),
      pose_presence: ema(previous.pose_presence, measurement.pose_presence, this.config.emaAlpha),
      center_x: ema(previous.center_x, measurement.center_x, this.config.emaAlpha),
      center_y: ema(previous.center_y, measurement.center_y, this.config.emaAlpha),
      width_ratio: ema(previous.width_ratio, measurement.width_ratio, this.config.emaAlpha),
      height_ratio: ema(previous.height_ratio, measurement.height_ratio, this.config.emaAlpha),
    };
    this.filtered = next;
    this.lastValidTimestamp = timestampMs;
    this.wasLost = false;
    this.hasDetected = true;

    const velocityX = finiteOrZero((next.center_x - previous.center_x) / dtSeconds);
    const velocityY = finiteOrZero((next.center_y - previous.center_y) / dtSeconds);
    const velocityScale = finiteOrZero((next.height_ratio - previous.height_ratio) / dtSeconds);
    const moving = Math.hypot(velocityX, velocityY) > this.config.stableVelocityThreshold
      || Math.abs(velocityScale) > this.config.stableScaleVelocityThreshold;
    if (moving || this.lastMovementAt === null) this.lastMovementAt = timestampMs;
    const stable = !moving && timestampMs - this.lastMovementAt >= this.config.stableWindowMs;

    return this.presentState(timestampMs, velocityX, velocityY, velocityScale, stable, measurement);
  }

  reset(): void {
    this.sequence = 0;
    this.filtered = null;
    this.lastValidTimestamp = null;
    this.lastMovementAt = null;
    this.wasLost = false;
    this.hasDetected = false;
    this.lossCount = 0;
    this.reacquisitionCount = 0;
  }

  private handleMissing(timestampMs: number): StructuredPerceptionState {
    const age = this.lastValidTimestamp === null ? null : Math.max(0, timestampMs - this.lastValidTimestamp);
    if (this.filtered && age !== null && age <= this.config.subjectLossPersistenceMs && !this.wasLost) {
      return this.presentState(timestampMs, 0, 0, 0, false, this.filtered, age);
    }

    if (this.filtered && !this.wasLost) {
      this.lossCount += 1;
      this.wasLost = true;
    }

    return {
      timestamp_ms: timestampMs,
      sequence: this.sequence,
      coordinate_basis: 'SENSOR_NORMALIZED_NON_MIRRORED',
      subject: {
        present: false,
        confidence: 0,
        center_x: null,
        center_y: null,
        width_ratio: null,
        height_ratio: null,
        velocity_x: null,
        velocity_y: null,
        velocity_scale: null,
        stable: false,
      },
      measurement_age_ms: age,
      subject_loss_count: this.lossCount,
      reacquisition_count: this.reacquisitionCount,
      framing: null,
    };
  }

  private presentState(
    timestampMs: number,
    velocityX: number,
    velocityY: number,
    velocityScale: number,
    stable: boolean,
    rawMeasurement: PoseMeasurement,
    measurementAgeMs = 0,
  ): StructuredPerceptionState {
    const current = this.filtered ?? rawMeasurement;
    return {
      timestamp_ms: timestampMs,
      sequence: this.sequence,
      coordinate_basis: 'SENSOR_NORMALIZED_NON_MIRRORED',
      subject: {
        present: true,
        confidence: current.confidence,
        center_x: current.center_x,
        center_y: current.center_y,
        width_ratio: current.width_ratio,
        height_ratio: current.height_ratio,
        velocity_x: velocityX,
        velocity_y: velocityY,
        velocity_scale: velocityScale,
        stable,
        valid_landmark_count: rawMeasurement.valid_landmark_count,
        pose_presence: rawMeasurement.pose_presence,
      },
      measurement_age_ms: measurementAgeMs,
      subject_loss_count: this.lossCount,
      reacquisition_count: this.reacquisitionCount,
      framing: null,
    };
  }
}
