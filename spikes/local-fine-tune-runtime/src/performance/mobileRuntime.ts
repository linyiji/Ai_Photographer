export type BenchmarkPath = "ALL" | "SEMANTIC" | "LOCAL" | "COMBINED";

export interface LatencySample {
  inputToPresent: number;
  renderCompute: number;
  canvasWrite: number;
}

export interface MetricSummary {
  count: number;
  p50?: number;
  p95?: number;
  max?: number;
}

export const percentile = (values: readonly number[], fraction: number): number | undefined => {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const bounded = Math.max(0, Math.min(1, fraction));
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * bounded))];
};

export const summarize = (values: readonly number[]): MetricSummary => ({
  count: values.length,
  p50: percentile(values, 0.5),
  p95: percentile(values, 0.95),
  max: values.length ? Math.max(...values) : undefined,
});

export class MobileMetrics {
  private readonly samples: Record<BenchmarkPath, LatencySample[]> = { ALL: [], SEMANTIC: [], LOCAL: [], COMBINED: [] };
  record(path: BenchmarkPath, sample: LatencySample): void {
    if (Object.values(sample).some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Latency samples must be finite and non-negative");
    this.samples[path].push(sample);
    if (this.samples[path].length > 300) this.samples[path].shift();
  }
  summary(path: BenchmarkPath, field: keyof LatencySample = "inputToPresent"): MetricSummary {
    return summarize(this.samples[path].map((sample) => sample[field]));
  }
  reset(): void { for (const path of Object.keys(this.samples) as BenchmarkPath[]) this.samples[path] = []; }
}

export interface ScheduledRender {
  sourceToken: string;
  inputStarted: number;
  run: () => void;
}

export class LatestStateRenderScheduler {
  scheduled = 0;
  executed = 0;
  coalesced = 0;
  stale = 0;
  private pending = false;
  private currentSourceToken: string;
  private latest?: ScheduledRender;
  constructor(sourceToken: string, private readonly requestFrame: (callback: () => void) => void) { this.currentSourceToken = sourceToken; }
  schedule(render: ScheduledRender): void {
    this.scheduled += 1;
    if (this.pending) this.coalesced += 1;
    this.latest = render;
    if (this.pending) return;
    this.pending = true;
    this.requestFrame(() => this.flush());
  }
  switchSource(sourceToken: string): void { this.currentSourceToken = sourceToken; this.latest = undefined; }
  counters(): { scheduled: number; executed: number; coalesced: number; stale: number } {
    return { scheduled: this.scheduled, executed: this.executed, coalesced: this.coalesced, stale: this.stale };
  }
  private flush(): void {
    this.pending = false;
    const render = this.latest; this.latest = undefined;
    if (!render) return;
    if (render.sourceToken !== this.currentSourceToken) { this.stale += 1; return; }
    this.executed += 1; render.run();
  }
}

export interface PreviewEnvironment { viewportWidth: number; deviceMemory?: number; sourceLongEdge: number }
export const selectPreviewLongEdge = ({ viewportWidth, deviceMemory, sourceLongEdge }: PreviewEnvironment): number => {
  const target = viewportWidth <= 520 || (deviceMemory !== undefined && deviceMemory <= 4) ? 512
    : viewportWidth >= 1400 && (deviceMemory ?? 8) >= 8 ? 768 : 640;
  return Math.min(sourceLongEdge, target);
};

export class ExportGuard<T> {
  busy = false;
  async run(operation: () => Promise<T>): Promise<T | undefined> {
    if (this.busy) return undefined;
    this.busy = true;
    try { return await operation(); } finally { this.busy = false; }
  }
}

export const classifyBenchmarkPath = (scopes: readonly string[]): BenchmarkPath => {
  const unique = new Set(scopes);
  if (unique.size > 1) return "COMBINED";
  if (unique.has("PERSON") || unique.has("BACKGROUND")) return "SEMANTIC";
  if (unique.has("LOCAL_REGION")) return "LOCAL";
  return "ALL";
};

export const selectPreviewBackend = (): "CANVAS2D_IMAGE_DATA" => "CANVAS2D_IMAGE_DATA";

export const expectedUprightDimensions = (width: number, height: number, orientation: 1 | 6 | 8): readonly [number, number] =>
  orientation === 6 || orientation === 8 ? [height, width] : [width, height];
