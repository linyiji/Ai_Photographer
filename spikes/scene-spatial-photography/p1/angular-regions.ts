import { P1_RANKING_CONFIG } from './config.js';
import type { CompositionAnchorZoneV01, KeyframeVisualDescriptor, SceneAngularRegion } from './types.js';
import { descriptorDistance } from './visual-descriptor.js';

const round = (value: number): number => Number(value.toFixed(6));
const average = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
type Group = { descriptors: KeyframeVisualDescriptor[]; boundary: SceneAngularRegion['boundary_reason']; };

const mergeSingletons = (groups: Group[]): Group[] => {
  if (groups.length <= 1) return groups;
  const merged = groups.map((group) => ({ ...group, descriptors: [...group.descriptors] }));
  for (let index = merged.length - 1; index >= 0; index--) {
    const group = merged[index]!;
    const span = Math.abs((group.descriptors.at(-1)?.relative_yaw_deg ?? 0) - (group.descriptors[0]?.relative_yaw_deg ?? 0));
    if (group.descriptors.length > 1 || span >= P1_RANKING_CONFIG.min_region_span_deg || merged.length === 1) continue;
    const left = index > 0 ? merged[index - 1] : undefined, right = index < merged.length - 1 ? merged[index + 1] : undefined;
    const target = !left ? right : !right ? left : descriptorDistance(group.descriptors[0]!, left.descriptors.at(-1)!) <= descriptorDistance(group.descriptors[0]!, right.descriptors[0]!) ? left : right;
    if (!target) continue;
    target.descriptors.push(...group.descriptors); target.descriptors.sort((a, b) => a.relative_yaw_deg - b.relative_yaw_deg); merged.splice(index, 1);
  }
  return merged;
};
export const segmentAngularRegions = (descriptors: readonly KeyframeVisualDescriptor[], placements: ReadonlyMap<string, readonly CompositionAnchorZoneV01[]>): SceneAngularRegion[] => {
  const sorted = [...descriptors].sort((a, b) => a.relative_yaw_deg - b.relative_yaw_deg);
  if (!sorted.length) return [];
  const groups: Group[] = [{ descriptors: [sorted[0]!], boundary: 'START' }];
  for (let index = 1; index < sorted.length; index++) {
    const current = sorted[index]!, previous = sorted[index - 1]!, group = groups.at(-1)!;
    const yawGap = current.relative_yaw_deg - previous.relative_yaw_deg, distance = descriptorDistance(current, previous);
    const groupSpan = previous.relative_yaw_deg - group.descriptors[0]!.relative_yaw_deg;
    const canSplit = groupSpan >= P1_RANKING_CONFIG.min_region_span_deg || group.descriptors.length >= 2;
    const boundary = yawGap > P1_RANKING_CONFIG.max_yaw_gap_deg ? 'YAW_GAP' : distance > P1_RANKING_CONFIG.descriptor_boundary_threshold ? 'DESCRIPTOR_DISCONTINUITY' : null;
    if (boundary && canSplit && groups.length < P1_RANKING_CONFIG.max_region_count) groups.push({ descriptors: [current], boundary }); else group.descriptors.push(current);
  }
  const bounded = mergeSingletons(groups);
  return bounded.map((group, index) => {
    const first = group.descriptors[0]!, last = group.descriptors.at(-1)!;
    const representative = [...group.descriptors].sort((a, b) => b.photography_frame_quality_score - a.photography_frame_quality_score || a.relative_yaw_deg - b.relative_yaw_deg)[0]!;
    const quality = average(group.descriptors.map((item) => item.photography_frame_quality_score));
    const clutter = average(group.descriptors.map((item) => item.visual_clutter_score));
    const placement = Math.max(...group.descriptors.flatMap((item) => placements.get(item.keyframe_id)?.map((zone) => zone.placement_score) ?? [0]));
    const variation = average(group.descriptors.map((item) => Math.abs(item.photography_frame_quality_score - quality) + Math.abs(item.visual_clutter_score - clutter))) / 2;
    const consistency = Math.max(0, 1 - variation * 2), span = last.relative_yaw_deg - first.relative_yaw_deg;
    const coverageConfidence = Math.min(1, 0.55 + group.descriptors.length * 0.12 + Math.min(0.2, span / 120));
    const boundaryPenalty = group.boundary === 'YAW_GAP' ? 0.12 : 0;
    const weights = P1_RANKING_CONFIG.region_weights;
    const sceneScore = weights.quality * quality + weights.uncluttered * (1 - clutter) + weights.placement * placement + weights.coverage * coverageConfidence + weights.consistency * consistency - boundaryPenalty;
    return {
      region_id: `region-${String(index + 1).padStart(2, '0')}`, yaw_start_deg: round(first.relative_yaw_deg), yaw_end_deg: round(last.relative_yaw_deg), yaw_center_deg: round((first.relative_yaw_deg + last.relative_yaw_deg) / 2), span_deg: round(span),
      keyframe_ids: group.descriptors.map((item) => item.keyframe_id), representative_keyframe_id: representative.keyframe_id,
      descriptor_summary: { mean_luma: round(average(group.descriptors.map((item) => item.exposure.mean_luma))), contrast: round(average(group.descriptors.map((item) => item.contrast_score))), sharpness: round(average(group.descriptors.map((item) => item.sharpness_score))), clutter: round(clutter) },
      visual_quality_score: round(quality), visual_clutter_score: round(clutter), placement_potential_score: round(placement), coverage_confidence: round(coverageConfidence), boundary_penalty: round(boundaryPenalty), keyframe_consistency_score: round(consistency), scene_region_score: round(Math.max(0, Math.min(1, sceneScore))), confidence: round(Math.max(0, Math.min(1, (coverageConfidence + consistency) / 2))), boundary_reason: index === bounded.length - 1 ? 'END' : group.boundary,
    };
  });
};
