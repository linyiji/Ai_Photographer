export const normalize360 = (degrees: number): number => ((degrees % 360) + 360) % 360;
export const shortestAngularDelta = (from: number, to: number): number => {
  const delta = normalize360(to) - normalize360(from);
  return delta > 180 ? delta - 360 : delta < -180 ? delta + 360 : delta;
};

export class YawUnwrapper {
  private previous: number | null = null;
  private unwrapped = 0;

  push(rawDegrees: number): number {
    const normalized = normalize360(rawDegrees);
    if (this.previous === null) {
      this.previous = normalized;
      this.unwrapped = normalized;
      return this.unwrapped;
    }
    this.unwrapped += shortestAngularDelta(this.previous, normalized);
    this.previous = normalized;
    return this.unwrapped;
  }

  reset(): void { this.previous = null; this.unwrapped = 0; }
}
