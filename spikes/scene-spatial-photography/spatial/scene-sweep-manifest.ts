import type { OrientationSource, ScreenPosture } from '../motion/orientation-provider.js';
import type { CoverageSnapshot } from '../sweep/coverage-tracker.js';
import type { RejectionReason, SceneSweepKeyframe, SweepMode, SweepStatus } from '../sweep/types.js';

export interface SceneSweepManifest {
  schema: 'xfx.scene-sweep-manifest'; version: '0.1'; sweep_id: string; mode: SweepMode; status: SweepStatus;
  started_at: number; ended_at: number | null; coverage_deg: number; direction: CoverageSnapshot['direction'];
  camera: { facing: 'environment'; source_width: number; source_height: number; };
  orientation: { source: OrientationSource; screen_posture: ScreenPosture; absolute_heading_globally_calibrated: false; };
  ordered_keyframes: SceneSweepKeyframe[]; rejection_stats: Record<RejectionReason, number>;
  privacy: { raw_video_uploaded: false; raw_frame_stream_uploaded: false; third_party_image_uploaded: false; committed_user_media: false; };
  network: { provider_calls: 0; luna_calls: 0; backend_per_frame_calls: 0; };
}

export const canonicalManifestJson = (manifest: SceneSweepManifest): string => JSON.stringify(manifest, null, 2) + '\n';
