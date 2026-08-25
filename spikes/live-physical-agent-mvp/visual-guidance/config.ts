import type { VisualGuidanceConfig } from './types.js';

export const VISUAL_GUIDANCE_CONFIG: Readonly<VisualGuidanceConfig> = Object.freeze({
  base_ema_alpha: 0.22,
  moving_ema_alpha: 0.48,
  moving_velocity_threshold: 0.12,
  lock_acquire_ms: 250,
  lock_hold_ms: 650,
  reacquire_center_distance: 0.18,
  reacquire_scale_distance: 0.28,
  measurement_quiet_ms: 350,
  measurement_jitter_threshold: 0.018,
  history_limit: 120,
});
