import type { SceneSweepManifest } from '../spatial/scene-sweep-manifest.js';
import { YawMap } from '../spatial/yaw-map.js';
import type { SceneSweepKeyframe, SweepMode } from '../sweep/types.js';
import { DEFAULT_PHOTOGRAPHY_INTENT } from './config.js';
import { clonePixelFrame, syntheticVisualFixtures, type SyntheticFixtureName } from './synthetic-fixtures.js';
import type { P1ReplayInput } from './types.js';

export interface P1FixtureSpec { yaw: number; visual: SyntheticFixtureName; blur_score?: number; }
const keyframe = (spec: P1FixtureSpec, index: number): SceneSweepKeyframe => ({ keyframe_id: `p1-kf-${String(index + 1).padStart(3, '0')}`, sequence: index + 1, timestamp_ms: index * 100, yaw_deg: spec.yaw, width: 96, height: 72, blur_score: spec.blur_score ?? (spec.visual === 'blurred' ? 1 : 30), exposure_mean: spec.visual === 'overexposed' ? 250 : spec.visual === 'underexposed' ? 5 : 128, highlight_clipping_ratio: spec.visual === 'overexposed' ? 0.9 : 0, shadow_clipping_ratio: spec.visual === 'underexposed' ? 0.9 : 0, fingerprint: [index / 10, 1 - index / 10], quality_status: 'ACCEPTED', selection_reason: index === 0 ? 'INITIAL' : 'ANGULAR_NOVELTY' });
export const makeP1ReplayInput = (specs: readonly P1FixtureSpec[], mode: SweepMode = 'WIDE_SWEEP', sweepId = 'p1-fixture'): P1ReplayInput => {
  const keyframes = specs.map(keyframe), coverage = Math.max(...specs.map((item) => item.yaw)) - Math.min(...specs.map((item) => item.yaw));
  const manifest: SceneSweepManifest = { schema: 'xfx.scene-sweep-manifest', version: '0.1', sweep_id: sweepId, mode, status: 'COMPLETE', started_at: 0, ended_at: specs.length * 100, coverage_deg: coverage, direction: 'LEFT_TO_RIGHT', camera: { facing: 'environment', source_width: 1080, source_height: 1920 }, orientation: { source: 'CONTROLLED_FIXTURE', screen_posture: 'PORTRAIT_PRIMARY', absolute_heading_globally_calibrated: false }, ordered_keyframes: keyframes, rejection_stats: { BLUR: 0, UNDEREXPOSED: 0, OVEREXPOSED: 0, ANGULAR_NOVELTY: 0, DUPLICATE: 0, BUSY: 0, CAP: 0 }, privacy: { raw_video_uploaded: false, raw_frame_stream_uploaded: false, third_party_image_uploaded: false, committed_user_media: false }, network: { provider_calls: 0, luna_calls: 0, backend_per_frame_calls: 0 } };
  return { manifest, yaw_map: new YawMap(keyframes).serialize(), transient_keyframes: specs.map((spec, index) => ({ keyframe_id: keyframes[index]!.keyframe_id, pixels: clonePixelFrame(syntheticVisualFixtures[spec.visual]) })), intent: { ...DEFAULT_PHOTOGRAPHY_INTENT } };
};

export const p1ReplayFixtures = {
  mixedWide: makeP1ReplayInput([
    { yaw: -90, visual: 'clean-left' }, { yaw: -70, visual: 'clean-left' },
    { yaw: -45, visual: 'high-clutter' }, { yaw: -25, visual: 'high-clutter' },
    { yaw: 5, visual: 'moderate-balanced' }, { yaw: 25, visual: 'moderate-balanced' },
    { yaw: 60, visual: 'clean-right' }, { yaw: 90, visual: 'clean-right' },
  ], 'WIDE_SWEEP', 'mixed-wide'),
  severeQuality: makeP1ReplayInput([{ yaw: 0, visual: 'blurred' }, { yaw: 35, visual: 'overexposed' }, { yaw: 70, visual: 'moderate-balanced' }, { yaw: 105, visual: 'clean-balanced' }], 'QUICK_SWEEP', 'severe-quality'),
  placement: makeP1ReplayInput([{ yaw: 0, visual: 'center-edge' }, { yaw: 35, visual: 'clean-left' }, { yaw: 70, visual: 'clean-right' }, { yaw: 110, visual: 'moderate-balanced' }], 'QUICK_SWEEP', 'placement'),
  uniform: makeP1ReplayInput([{ yaw: 0, visual: 'uniform-low-detail' }, { yaw: 25, visual: 'uniform-low-detail' }, { yaw: 50, visual: 'uniform-low-detail' }, { yaw: 75, visual: 'uniform-low-detail' }, { yaw: 110, visual: 'uniform-low-detail' }], 'QUICK_SWEEP', 'uniform'),
  duplicateNeighborhood: makeP1ReplayInput([{ yaw: 0, visual: 'clean-balanced' }, { yaw: 8, visual: 'clean-balanced' }, { yaw: 16, visual: 'clean-balanced' }, { yaw: 45, visual: 'moderate-balanced' }, { yaw: 80, visual: 'clean-right' }, { yaw: 110, visual: 'clean-left' }], 'QUICK_SWEEP', 'duplicate-neighborhood'),
} as const;
