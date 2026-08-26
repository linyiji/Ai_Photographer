export class EmaFilter {
  private value: number | null = null;
  constructor(private readonly alpha = 0.35) {}
  filter(value: number): number { this.value = this.value === null ? value : this.value + this.alpha * (value - this.value); return this.value; }
  reset(value?: number): void { this.value = value ?? null; }
}

class LowPass {
  private value: number | null = null;
  filter(value: number, alpha: number): number { this.value = this.value === null ? value : alpha * value + (1 - alpha) * this.value; return this.value; }
  reset(value?: number): void { this.value = value ?? null; }
}

export class OneEuroFilter {
  private valueFilter = new LowPass(); private derivativeFilter = new LowPass(); private lastValue: number | null = null; private lastTimestamp: number | null = null;
  constructor(private readonly minCutoff = 0.35, private readonly beta = 2, private readonly derivativeCutoff = 1) {}
  filter(value: number, timestampMs: number): number {
    if (this.lastTimestamp === null || this.lastValue === null) { this.lastTimestamp = timestampMs; this.lastValue = value; return this.valueFilter.filter(value,1); }
    const dt = Math.max((timestampMs - this.lastTimestamp) / 1000, 0.001); const derivative = (value - this.lastValue) / dt;
    const filteredDerivative = this.derivativeFilter.filter(derivative, this.alpha(this.derivativeCutoff,dt)); const cutoff = this.minCutoff + this.beta * Math.abs(filteredDerivative);
    const result = this.valueFilter.filter(value,this.alpha(cutoff,dt)); this.lastTimestamp=timestampMs; this.lastValue=value; return result;
  }
  reset(value?: number, timestampMs?: number): void { this.valueFilter.reset(value); this.derivativeFilter.reset(0); this.lastValue=value??null; this.lastTimestamp=timestampMs??null; }
  private alpha(cutoff:number,dt:number):number { const tau=1/(2*Math.PI*cutoff); return 1/(1+tau/dt); }
}
