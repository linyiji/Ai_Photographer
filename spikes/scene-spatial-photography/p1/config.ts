import type { FramingProfile, NormalizedRect, PlacementAnchor } from './types.js';

export const P1_RANKING_CONFIG = {
  version: '0.1', grid_size: 3, edge_threshold: 18,
  descriptor_boundary_threshold: 0.24, max_yaw_gap_deg: 34, min_region_span_deg: 12,
  max_region_count: 8, minimum_top_opportunity_separation_deg: 24,
  severe_sharpness_threshold: 0.12, severe_exposure_threshold: 0.28,
  frame_quality_weights: { sharpness: 0.38, exposure: 0.37, contrast: 0.25 },
  region_weights: { quality: 0.32, uncluttered: 0.22, placement: 0.24, coverage: 0.12, consistency: 0.10 },
  opportunity_weights: { frame: 0.26, region: 0.26, uncluttered: 0.15, placement: 0.18, edge: 0.08, exposure: 0.07 },
} as const;

const profileSize: Record<FramingProfile, Omit<NormalizedRect, 'x'>> = {
  CLOSE: { y: 0.16, width: 0.42, height: 0.74 },
  MEDIUM: { y: 0.25, width: 0.30, height: 0.65 },
  ENVIRONMENTAL: { y: 0.35, width: 0.23, height: 0.58 },
  FULL_BODY: { y: 0.18, width: 0.20, height: 0.76 },
};
const anchorCenter: Record<PlacementAnchor, number> = { LEFT_THIRD: 0.27, CENTER: 0.5, RIGHT_THIRD: 0.73 };
export const framingRect = (profile: FramingProfile, anchor: PlacementAnchor): NormalizedRect => {
  const size = profileSize[profile];
  return { x: anchorCenter[anchor] - size.width / 2, ...size };
};
export const DEFAULT_PHOTOGRAPHY_INTENT = { subject_type: 'SINGLE_PERSON', preferred_framing: 'ENVIRONMENTAL', composition_preference: 'AUTO' } as const;
