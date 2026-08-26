import { isDuplicate } from './duplicate-gate.js';
import { evaluateQuality } from './quality-gate.js';
import type { FrameMetrics, RejectionReason, SceneSweepKeyframe } from './types.js';

export class KeyframeSampler {
  readonly keyframes: SceneSweepKeyframe[] = [];
  readonly rejections: Record<RejectionReason, number> = { BLUR: 0, UNDEREXPOSED: 0, OVEREXPOSED: 0, ANGULAR_NOVELTY: 0, DUPLICATE: 0, BUSY: 0, CAP: 0 };
  private busy = false;
  constructor(readonly angularStepDeg = 12, readonly maxKeyframes = 12) {}

  evaluate(frame: FrameMetrics): SceneSweepKeyframe | null {
    if (this.busy) { this.rejections.BUSY++; return null; }
    this.busy = true;
    try {
      if (this.keyframes.length >= this.maxKeyframes) { this.rejections.CAP++; return null; }
      const quality = evaluateQuality(frame); if (!quality.accepted) { this.rejections[quality.reason!]++; return null; }
      const nearest = this.keyframes.reduce<SceneSweepKeyframe | null>((best, item) => !best || Math.abs(item.yaw_deg - frame.yaw_deg) < Math.abs(best.yaw_deg - frame.yaw_deg) ? item : best, null);
      if (nearest && isDuplicate(frame, nearest)) { this.rejections.DUPLICATE++; return null; }
      if (nearest && Math.abs(nearest.yaw_deg - frame.yaw_deg) < this.angularStepDeg) { this.rejections.ANGULAR_NOVELTY++; return null; }
      const keyframe: SceneSweepKeyframe = { ...frame, keyframe_id: `kf-${String(this.keyframes.length + 1).padStart(3, '0')}`, sequence: this.keyframes.length + 1, quality_status: 'ACCEPTED', selection_reason: nearest ? 'ANGULAR_NOVELTY' : 'INITIAL' };
      this.keyframes.push(keyframe); return keyframe;
    } finally { this.busy = false; }
  }
  reset(): void { this.keyframes.length = 0; for (const reason of Object.keys(this.rejections) as RejectionReason[]) this.rejections[reason] = 0; this.busy = false; }
}
