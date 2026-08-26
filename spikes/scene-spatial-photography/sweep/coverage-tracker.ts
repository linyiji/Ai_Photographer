import type { SweepDirection } from './types.js';

export interface CoverageSnapshot { min_observed_yaw: number; max_observed_yaw: number; span_deg: number; direction: SweepDirection; rejected_spikes: number; }
export class CoverageTracker {
  private min = Infinity;
  private max = -Infinity;
  private previous: number | null = null;
  private positive = 0;
  private negative = 0;
  private spikes = 0;
  constructor(private readonly maxStepDeg = 45, private readonly jitterDeg = 0.5) {}

  observe(yaw: number): boolean {
    if (this.previous !== null) {
      const delta = yaw - this.previous;
      if (Math.abs(delta) > this.maxStepDeg) { this.spikes++; return false; }
      if (delta > this.jitterDeg) this.positive += delta;
      if (delta < -this.jitterDeg) this.negative += -delta;
    }
    this.previous = yaw; this.min = Math.min(this.min, yaw); this.max = Math.max(this.max, yaw); return true;
  }
  snapshot(): CoverageSnapshot {
    const empty = !Number.isFinite(this.min);
    const direction: SweepDirection = this.positive && this.negative
      ? (Math.min(this.positive, this.negative) / Math.max(this.positive, this.negative) > 0.2 ? 'MIXED' : this.positive > this.negative ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT')
      : this.positive ? 'LEFT_TO_RIGHT' : this.negative ? 'RIGHT_TO_LEFT' : 'UNDETERMINED';
    return { min_observed_yaw: empty ? 0 : this.min, max_observed_yaw: empty ? 0 : this.max, span_deg: empty ? 0 : this.max - this.min, direction, rejected_spikes: this.spikes };
  }
  reset(): void { this.min = Infinity; this.max = -Infinity; this.previous = null; this.positive = 0; this.negative = 0; this.spikes = 0; }
}
