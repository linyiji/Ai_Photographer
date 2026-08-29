import type { PixelFrame } from '../p1/types.js';
import type { FrameMetrics } from '../sweep/types.js';
import type { GeometryFrameObservation, SceneScanGeometryInputV01 } from './types.js';

export interface GeometryFrameSelectorConfig { max_frames: number; min_interval_ms: number; max_yaw_step_deg: number; min_blur_score: number; min_exposure: number; max_exposure: number; }
export const DEFAULT_GEOMETRY_FRAME_SELECTOR_CONFIG: GeometryFrameSelectorConfig = { max_frames: 8, min_interval_ms: 250, max_yaw_step_deg: 18, min_blur_score: 4, min_exposure: 22, max_exposure: 235 };
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fingerprintDistance = (a?: readonly number[], b?: readonly number[]): number => !a || !b || !a.length || a.length !== b.length ? 0 : Math.sqrt(a.reduce((sum, value, index) => sum + (value - (b[index] ?? value)) ** 2, 0) / a.length);

export class GeometryFrameSelector {
  readonly frames: GeometryFrameObservation[] = [];
  selection_latency_ms = 0;
  private lastMetrics: FrameMetrics | null = null;
  constructor(readonly config = DEFAULT_GEOMETRY_FRAME_SELECTOR_CONFIG) {}
  accepts(metrics: FrameMetrics): boolean {
    if (this.frames.length >= this.config.max_frames || metrics.blur_score < this.config.min_blur_score || metrics.exposure_mean < this.config.min_exposure || metrics.exposure_mean > this.config.max_exposure) return false;
    if (this.lastMetrics && metrics.timestamp_ms - this.lastMetrics.timestamp_ms < this.config.min_interval_ms) return false;
    if (this.lastMetrics && Math.abs(metrics.yaw_deg - this.lastMetrics.yaw_deg) > this.config.max_yaw_step_deg) return false;
    return true;
  }
  observe(metrics: FrameMetrics, pixels: PixelFrame, orientationSource: GeometryFrameObservation['orientation_source'], sourceSize: { width: number; height: number } = pixels, resizeMs = 0, resizeTrace: { start: number; end: number } | null = null): boolean {
    const started = performance.now();
    try {
      if (!this.accepts(metrics)) return false;
      const last = this.lastMetrics;
      const technicalQuality = clamp01((metrics.blur_score / 30) * (1 - Math.abs(metrics.exposure_mean - 128) / 128));
      const copy = { width: pixels.width, height: pixels.height, data: new Uint8ClampedArray(pixels.data) };
      this.frames.push({ frame_id: `geo-${this.frames.length + 1}`, sequence: this.frames.length, timestamp_ms: metrics.timestamp_ms, relative_yaw_deg: metrics.yaw_deg, width: pixels.width, height: pixels.height, source_width: sourceSize.width, source_height: sourceSize.height, resize_ms: resizeMs, resize_started_at: resizeTrace?.start ?? null, resize_ended_at: resizeTrace?.end ?? null, blur_score: metrics.blur_score, exposure_mean: metrics.exposure_mean, technical_quality: technicalQuality, motion_diagnostic: fingerprintDistance(last?.fingerprint, metrics.fingerprint), parallax_diagnostic: 'PENDING_POST_SCAN', orientation_source: orientationSource, pixels: copy });
      this.lastMetrics = metrics; return true;
    } finally { this.selection_latency_ms += performance.now() - started; }
  }
  reset(): void { this.frames.length = 0; this.lastMetrics = null; this.selection_latency_ms = 0; }
  input(sourceSweepId: string): SceneScanGeometryInputV01 {
    return { schema: 'xfx.scene-scan-geometry-input', schema_version: '0.1', source_sweep_id: sourceSweepId, frames: [...this.frames], selection_budget: this.config.max_frames, estimated_memory_bytes: this.frames.reduce((sum, frame) => sum + frame.pixels.data.byteLength, 0), lifecycle: 'TRANSIENT_LOCAL_MEMORY', raw_media_persisted: false, raw_media_uploaded: false };
  }
}
