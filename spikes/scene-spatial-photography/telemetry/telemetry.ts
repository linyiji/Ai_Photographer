const percentile = (values: readonly number[], ratio: number): number | null => { if (!values.length) return null; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor((sorted.length - 1) * ratio)] ?? null; };
export class SweepTelemetry {
  private orientationEvents = 0; private candidates = 0; private selected = 0; private qualityMs: number[] = []; private startedAt = 0;
  start(now: number): void { this.orientationEvents = 0; this.candidates = 0; this.selected = 0; this.qualityMs = []; this.startedAt = now; }
  orientation(): void { this.orientationEvents++; }
  candidate(durationMs: number, selected: boolean): void { this.candidates++; if (selected) this.selected++; this.qualityMs.push(durationMs); if (this.qualityMs.length > 300) this.qualityMs.shift(); }
  snapshot(now: number, previewFps: number, dimensions: [number, number], queueLength: number) { const seconds = Math.max(0.001, (now - this.startedAt) / 1000); return { preview_fps: previewFps, source_width: dimensions[0], source_height: dimensions[1], orientation_hz: this.orientationEvents / seconds, frame_candidate_hz: this.candidates / seconds, keyframes_selected: this.selected, quality_eval_ms_p50: percentile(this.qualityMs, 0.5), quality_eval_ms_p95: percentile(this.qualityMs, 0.95), queue_length: Math.min(1, queueLength), memory_mb: null, raw_video_upload: 0, provider_calls: 0, backend_per_frame_calls: 0 }; }
}
