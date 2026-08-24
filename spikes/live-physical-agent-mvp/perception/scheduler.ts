export interface SchedulerDecision {
  due: boolean;
  accepted: boolean;
}

export class BoundedFrameScheduler {
  readonly targetHz: number;
  scheduledFrames = 0;
  skippedBusyFrames = 0;
  private lastDueAt = Number.NEGATIVE_INFINITY;

  constructor(targetHz: number) {
    if (!Number.isFinite(targetHz) || targetHz <= 0) throw new Error('targetHz must be positive');
    this.targetHz = targetHz;
  }

  decide(nowMs: number, busy: boolean): SchedulerDecision {
    const intervalMs = 1000 / this.targetHz;
    if (nowMs - this.lastDueAt < intervalMs) return { due: false, accepted: false };

    this.lastDueAt = nowMs;
    this.scheduledFrames += 1;
    if (busy) {
      this.skippedBusyFrames += 1;
      return { due: true, accepted: false };
    }
    return { due: true, accepted: true };
  }

  reset(): void {
    this.scheduledFrames = 0;
    this.skippedBusyFrames = 0;
    this.lastDueAt = Number.NEGATIVE_INFINITY;
  }
}
