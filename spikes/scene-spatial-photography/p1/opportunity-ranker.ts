import { P1_RANKING_CONFIG } from './config.js';
import type { KeyframeVisualDescriptor, PhotographyIntent, PhotographyOpportunityV01, PhotographyReasonCode, SceneAngularRegion, SubjectPlacementZone } from './types.js';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const round = (value: number): number => Number(value.toFixed(6));
const placementReason = (anchor: SubjectPlacementZone['anchor']): PhotographyReasonCode => ({ LEFT_THIRD: 'CLEAN_LEFT_PLACEMENT', CENTER: 'CLEAN_CENTER_PLACEMENT', RIGHT_THIRD: 'CLEAN_RIGHT_PLACEMENT' } satisfies Record<SubjectPlacementZone['anchor'], PhotographyReasonCode>)[anchor];
const reasonCodes = (descriptor: KeyframeVisualDescriptor, region: SceneAngularRegion, zone: SubjectPlacementZone): PhotographyReasonCode[] => {
  const reasons: PhotographyReasonCode[] = [];
  if (descriptor.exposure.balanced_score >= 0.65) reasons.push('BALANCED_EXPOSURE');
  if (descriptor.sharpness_score >= 0.45) reasons.push('GOOD_SHARPNESS'); else if (descriptor.sharpness_score < P1_RANKING_CONFIG.severe_sharpness_threshold) reasons.push('PENALTY_LOW_SHARPNESS');
  if (descriptor.visual_clutter_score <= 0.38) reasons.push('LOW_BACKGROUND_CLUTTER'); else if (descriptor.visual_clutter_score >= 0.65) reasons.push('PENALTY_HIGH_CLUTTER');
  if (zone.placement_score >= 0.55) reasons.push(placementReason(zone.anchor));
  if (zone.clearance_score >= 0.65) reasons.push('GOOD_EDGE_CLEARANCE');
  if (zone.edge_conflict_score >= 0.5) reasons.push('PENALTY_EDGE_CONFLICT');
  if (descriptor.exposure.highlight_clip_ratio >= 0.35 || descriptor.exposure.mean_luma >= 225) reasons.push('PENALTY_OVEREXPOSED');
  if (descriptor.exposure.shadow_clip_ratio >= 0.35 || descriptor.exposure.mean_luma <= 30) reasons.push('PENALTY_UNDEREXPOSED');
  if (region.keyframe_consistency_score >= 0.72) reasons.push('REGION_VISUALLY_STABLE');
  return reasons;
};

export const rankPhotographyOpportunities = (regions: readonly SceneAngularRegion[], descriptors: readonly KeyframeVisualDescriptor[], placements: ReadonlyMap<string, readonly SubjectPlacementZone[]>, intent: PhotographyIntent): PhotographyOpportunityV01[] => {
  const descriptorById = new Map(descriptors.map((item) => [item.keyframe_id, item]));
  const candidates = regions.flatMap((region, index): PhotographyOpportunityV01[] => {
    const descriptor = descriptorById.get(region.representative_keyframe_id), zones = placements.get(region.representative_keyframe_id);
    if (!descriptor || !zones?.length) return [];
    const zone = [...zones].sort((a, b) => b.placement_score - a.placement_score || a.zone_id.localeCompare(b.zone_id))[0]!;
    const weights = P1_RANKING_CONFIG.opportunity_weights;
    const breakdown = { frame_quality: descriptor.photography_frame_quality_score, region_quality: region.scene_region_score, clutter: round(1 - descriptor.visual_clutter_score), placement_clearance: zone.placement_score, edge_conflict: round(1 - zone.edge_conflict_score), exposure: descriptor.exposure.balanced_score, confidence: round((descriptor.quality_confidence + region.confidence + zone.confidence) / 3) };
    let score = weights.frame * breakdown.frame_quality + weights.region * breakdown.region_quality + weights.uncluttered * breakdown.clutter + weights.placement * breakdown.placement_clearance + weights.edge * breakdown.edge_conflict + weights.exposure * breakdown.exposure;
    if (descriptor.sharpness_score < P1_RANKING_CONFIG.severe_sharpness_threshold) score *= 0.35;
    if (descriptor.exposure.balanced_score < P1_RANKING_CONFIG.severe_exposure_threshold) score *= 0.42;
    return [{ schema_version: '0.1', opportunity_id: `opportunity-${String(index + 1).padStart(2, '0')}`, relative_camera_yaw_deg: descriptor.relative_yaw_deg, yaw_window: { start_deg: region.yaw_start_deg, end_deg: region.yaw_end_deg }, scene_region_id: region.region_id, representative_keyframe_id: descriptor.keyframe_id, framing_profile: intent.preferred_framing, subject_placement_zone: zone, score: round(clamp01(score)), score_breakdown: breakdown, reason_codes: reasonCodes(descriptor, region, zone), limitations: ['RELATIVE_YAW_ONLY', 'IMAGE_PLANE_COMPOSITION_PROXY', 'NO_SEMANTIC_SCENE_UNDERSTANDING', 'NO_PHYSICAL_POSITION_OR_DEPTH'], physical_subject_position: 'NOT_SUPPORTED', physical_camera_position: 'NOT_SUPPORTED', safety: 'UNKNOWN_REQUIRES_USER_CONFIRMATION', confidence: breakdown.confidence }];
  }).sort((a, b) => b.score - a.score || a.relative_camera_yaw_deg - b.relative_camera_yaw_deg);
  const selected: PhotographyOpportunityV01[] = [];
  for (const candidate of candidates) {
    if (selected.some((item) => Math.abs(item.relative_camera_yaw_deg - candidate.relative_camera_yaw_deg) < P1_RANKING_CONFIG.minimum_top_opportunity_separation_deg)) continue;
    selected.push(candidate); if (selected.length === 3) break;
  }
  return selected;
};
