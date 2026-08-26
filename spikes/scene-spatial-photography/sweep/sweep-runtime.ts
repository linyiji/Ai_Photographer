import type { OrientationSample } from '../motion/orientation-provider.js';
import type { SceneSweepManifest } from '../spatial/scene-sweep-manifest.js';
import { CoverageTracker } from './coverage-tracker.js';
import { KeyframeSampler } from './keyframe-sampler.js';
import { configForMode, type FrameMetrics, type SweepMode, type SweepStatus } from './types.js';

export interface SceneSweepSession { sweep_id: string; mode: SweepMode; started_at: number; ended_at: number | null; camera_facing: 'environment'; source_width: number; source_height: number; orientation_source: OrientationSample['source']; screen_posture: OrientationSample['screen_orientation']; start_heading: number | null; status: SweepStatus; }
export const SWEEP_COMPLETION_TOLERANCE_DEG = 0.5;
export class SceneSweepRuntime {
  readonly coverage: CoverageTracker;
  readonly sampler: KeyframeSampler;
  readonly session: SceneSweepSession;
  private latestYaw: number | null = null;

  constructor(mode: SweepMode, sweepId: string, startedAt: number) {
    const config = configForMode(mode); this.coverage = new CoverageTracker(config.max_sensor_step_deg); this.sampler = new KeyframeSampler(config.angular_step_deg, config.max_keyframes);
    this.session = { sweep_id: sweepId, mode, started_at: startedAt, ended_at: null, camera_facing: 'environment', source_width: 0, source_height: 0, orientation_source: 'CONTROLLED_FIXTURE', screen_posture: 'PORTRAIT_PRIMARY', start_heading: null, status: 'ACQUIRING' };
  }
  observeOrientation(sample: OrientationSample): boolean {
    if (this.session.status === 'CANCELLED' || this.session.status === 'COMPLETE') return false;
    this.session.orientation_source = sample.source; this.session.screen_posture = sample.screen_orientation;
    if (this.session.start_heading === null) this.session.start_heading = sample.raw_heading_deg;
    const accepted = this.coverage.observe(sample.relative_yaw_deg); if (!accepted) return false;
    this.latestYaw = this.coverage.currentYaw() ?? sample.relative_yaw_deg; this.session.status = 'SWEEPING';
    if (this.coverage.snapshot().span_deg >= configForMode(this.session.mode).target_deg - SWEEP_COMPLETION_TOLERANCE_DEG) this.finish(sample.timestamp_ms);
    return true;
  }
  currentYawDeg(): number | null { return this.latestYaw; }
  observeFrame(frame: Omit<FrameMetrics, 'yaw_deg'> & { yaw_deg?: number }): boolean {
    if (this.session.status !== 'SWEEPING' || (frame.yaw_deg === undefined && this.latestYaw === null)) return false;
    if (this.session.source_width === 0 || this.session.source_height === 0) { this.session.source_width = frame.width; this.session.source_height = frame.height; }
    return this.sampler.evaluate({ ...frame, yaw_deg: frame.yaw_deg ?? this.latestYaw! }) !== null;
  }
  setCameraSourceDimensions(width: number, height: number): void {
    if (width > 0 && height > 0) { this.session.source_width = width; this.session.source_height = height; }
  }
  finish(timestampMs: number): void { if (this.session.status !== 'CANCELLED') { this.session.status = 'COMPLETE'; this.session.ended_at = timestampMs; } }
  cancel(timestampMs: number): void { this.session.status = 'CANCELLED'; this.session.ended_at = timestampMs; }
  manifest(): SceneSweepManifest {
    const coverage = this.coverage.snapshot();
    return { schema: 'xfx.scene-sweep-manifest', version: '0.1', sweep_id: this.session.sweep_id, mode: this.session.mode, status: this.session.status, started_at: this.session.started_at, ended_at: this.session.ended_at,
      coverage_deg: coverage.span_deg, direction: coverage.direction, camera: { facing: 'environment', source_width: this.session.source_width, source_height: this.session.source_height },
      orientation: { source: this.session.orientation_source, screen_posture: this.session.screen_posture, absolute_heading_globally_calibrated: false }, ordered_keyframes: this.sampler.keyframes.map(({ transient_frame_ref: _omit, ...item }) => item), rejection_stats: { ...this.sampler.rejections },
      privacy: { raw_video_uploaded: false, raw_frame_stream_uploaded: false, third_party_image_uploaded: false, committed_user_media: false }, network: { provider_calls: 0, luna_calls: 0, backend_per_frame_calls: 0 } };
  }
}
