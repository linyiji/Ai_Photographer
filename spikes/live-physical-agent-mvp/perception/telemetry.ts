import type { PerceptionExecutionMode, PerceptionTelemetrySnapshot, StructuredPerceptionState } from './types.js';

const percentile = (values: readonly number[], ratio: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))] ?? 0;
};

export class PerceptionTelemetry {
  private startedAt = 0;
  private inferenceMs: number[] = [];
  private processedFrames = 0;
  private stateOutputs = 0;
  private detectedOutputs = 0;
  private latestState: StructuredPerceptionState | null = null;

  constructor(private readonly targetHz: number, private readonly historyLimit: number) {}

  start(nowMs: number): void {
    this.startedAt = nowMs;
    this.inferenceMs = [];
    this.processedFrames = 0;
    this.stateOutputs = 0;
    this.detectedOutputs = 0;
    this.latestState = null;
  }

  record(inferenceMs: number, state: StructuredPerceptionState): void {
    this.processedFrames += 1;
    this.stateOutputs += 1;
    if (state.subject.present) this.detectedOutputs += 1;
    this.latestState = state;
    this.inferenceMs.push(inferenceMs);
    if (this.inferenceMs.length > this.historyLimit) this.inferenceMs.shift();
  }

  snapshot(
    nowMs: number,
    previewFps: number,
    scheduledFrames: number,
    skippedBusyFrames: number,
    mode: PerceptionExecutionMode,
    memoryMb: number | null,
  ): PerceptionTelemetrySnapshot {
    const durationMs = this.startedAt > 0 ? Math.max(0, nowMs - this.startedAt) : 0;
    const durationSeconds = Math.max(durationMs / 1000, 0.001);
    return {
      duration_ms: durationMs,
      preview_fps_avg: previewFps,
      vision_target_hz: this.targetHz,
      vision_hz_avg: this.processedFrames / durationSeconds,
      state_hz_avg: this.stateOutputs / durationSeconds,
      inference_ms_current: this.inferenceMs.at(-1) ?? 0,
      inference_ms_p50: percentile(this.inferenceMs, 0.5),
      inference_ms_p95: percentile(this.inferenceMs, 0.95),
      scheduled_frames: scheduledFrames,
      processed_frames: this.processedFrames,
      skipped_busy_frames: skippedBusyFrames,
      subject_detected_ratio: this.stateOutputs === 0 ? 0 : this.detectedOutputs / this.stateOutputs,
      subject_loss_count: this.latestState?.subject_loss_count ?? 0,
      reacquisition_count: this.latestState?.reacquisition_count ?? 0,
      measurement_age_ms: this.latestState?.measurement_age_ms ?? null,
      worker_mode: mode,
      memory_mb: memoryMb,
      cpu_observation: 'BROWSER_API_UNAVAILABLE',
      thermal_observation: 'BROWSER_API_UNAVAILABLE',
      raw_video_upload: 0,
      backend_per_frame_calls: 0,
      provider_calls: 0,
      luna_calls: 0,
    };
  }
}
