import { P1_RANKING_CONFIG } from './config.js';
import type {
  KeyframeVisualDescriptor, PhotographyReasonCode, PhotographyViewCandidateV01,
  CompositionAnchorCandidateV01, CompositionAnchorZoneV01, SceneAngularRegion, SceneDirectionMapV01, SceneFrameSetV01,
  TransientKeyframePixels,
} from './types.js';
import type { SceneSweepManifest } from '../spatial/scene-sweep-manifest.js';

const round = (value: number): number => Number(value.toFixed(6));
const severe = (descriptor: KeyframeVisualDescriptor): boolean => descriptor.sharpness_score < P1_RANKING_CONFIG.severe_sharpness_threshold || descriptor.exposure.balanced_score < P1_RANKING_CONFIG.severe_exposure_threshold;
const technicalReasons = (descriptor: KeyframeVisualDescriptor): PhotographyReasonCode[] => {
  const reasons: PhotographyReasonCode[] = [];
  if (descriptor.exposure.balanced_score >= 0.65) reasons.push('BALANCED_EXPOSURE');
  if (descriptor.sharpness_score >= 0.45) reasons.push('GOOD_SHARPNESS');
  if (descriptor.sharpness_score < P1_RANKING_CONFIG.severe_sharpness_threshold) reasons.push('PENALTY_LOW_SHARPNESS');
  if (descriptor.exposure.highlight_clip_ratio >= 0.35 || descriptor.exposure.mean_luma >= 225) reasons.push('PENALTY_OVEREXPOSED');
  if (descriptor.exposure.shadow_clip_ratio >= 0.35 || descriptor.exposure.mean_luma <= 30) reasons.push('PENALTY_UNDEREXPOSED');
  return reasons;
};
const regionFor = (yaw: number, regions: readonly SceneAngularRegion[]): string | null => regions.find((region) => yaw >= region.yaw_start_deg && yaw <= region.yaw_end_deg)?.region_id ?? null;

export const createSceneFrameSet = (manifest: SceneSweepManifest, descriptors: readonly KeyframeVisualDescriptor[], transient: readonly TransientKeyframePixels[]): SceneFrameSetV01 => {
  const transientById = new Map(transient.map((item) => [item.keyframe_id, item]));
  const keyframeById = new Map(manifest.ordered_keyframes.map((item) => [item.keyframe_id, item]));
  return {
    schema: 'xfx.scene-frame-set', schema_version: '0.1', source_sweep_id: manifest.sweep_id,
    frames: descriptors.map((descriptor) => {
      const source = keyframeById.get(descriptor.keyframe_id), pixels = transientById.get(descriptor.keyframe_id);
      return { frame_id: `frame-${descriptor.keyframe_id}`, keyframe_id: descriptor.keyframe_id, relative_yaw_deg: descriptor.relative_yaw_deg, width: source?.width ?? pixels?.pixels.width ?? 0, height: source?.height ?? pixels?.pixels.height ?? 0, quality_status: severe(descriptor) ? 'TECHNICALLY_LIMITED' : 'PREPARED', technical_usability: descriptor.photography_frame_quality_score, transient_pixels_available: Boolean(pixels), transient_thumbnail_available: Boolean(pixels?.thumbnail_url), descriptor_id: `${descriptor.keyframe_id}:descriptor:0.1`, evidence_class: 'FACT' as const };
    }),
    raw_media_persisted: false, raw_media_uploaded: false, image_bytes_in_export: false, lifecycle: 'TRANSIENT_BROWSER_MEMORY',
  };
};

export const createSceneDirectionMap = (manifest: SceneSweepManifest, frameSet: SceneFrameSetV01, regions: readonly SceneAngularRegion[]): SceneDirectionMapV01 => {
  const ordered = [...frameSet.frames].sort((a, b) => a.relative_yaw_deg - b.relative_yaw_deg);
  const start = ordered[0]?.relative_yaw_deg ?? 0, end = ordered.at(-1)?.relative_yaw_deg ?? manifest.coverage_deg;
  const span = Math.max(0, end - start);
  return {
    schema: 'xfx.scene-direction-map', schema_version: '0.1', source_sweep_id: manifest.sweep_id, basis: 'RELATIVE_YAW',
    coverage: { start_relative_yaw_deg: round(start), end_relative_yaw_deg: round(end), span_deg: round(manifest.coverage_deg) },
    nodes: ordered.map((frame) => ({ frame_id: frame.frame_id, keyframe_id: frame.keyframe_id, relative_yaw_deg: frame.relative_yaw_deg, arc_position: round(span > 0 ? (frame.relative_yaw_deg - start) / span : 0.5), region_id: regionFor(frame.relative_yaw_deg, regions), evidence_class: 'FACT' })),
    depth: 'UNKNOWN', metric_geometry: 'NOT_SUPPORTED', spatial_evidence_status: 'NOT_EVALUATED_P1',
    limitations: ['RELATIVE_YAW_ARC_NOT_3D_RECONSTRUCTION', 'NO_DEPTH', 'NO_METRIC_CAMERA_POSE'],
  };
};

const targetCandidateCount = (frameCount: number, span: number): number => frameCount >= 3 && span >= 72 ? 3 : frameCount >= 2 && span >= 24 ? 2 : frameCount ? 1 : 0;
const chooseDiverseDescriptors = (descriptors: readonly KeyframeVisualDescriptor[], count: number): KeyframeVisualDescriptor[] => {
  if (!count) return [];
  const ordered = [...descriptors].sort((a, b) => a.relative_yaw_deg - b.relative_yaw_deg);
  const usable = ordered.filter((item) => !severe(item));
  const pool = usable.length >= count ? usable : ordered;
  const start = ordered[0]!.relative_yaw_deg, end = ordered.at(-1)!.relative_yaw_deg;
  const targets = count === 1 ? [(start + end) / 2] : Array.from({ length: count }, (_, index) => start + (end - start) * index / (count - 1));
  const selected: KeyframeVisualDescriptor[] = [];
  for (const target of targets) {
    const available = pool.filter((item) => !selected.includes(item));
    const best = available.sort((a, b) => {
      const angularA = 1 - Math.abs(a.relative_yaw_deg - target) / Math.max(1, end - start);
      const angularB = 1 - Math.abs(b.relative_yaw_deg - target) / Math.max(1, end - start);
      const scoreA = 0.72 * angularA + 0.28 * a.photography_frame_quality_score - (severe(a) ? 0.5 : 0);
      const scoreB = 0.72 * angularB + 0.28 * b.photography_frame_quality_score - (severe(b) ? 0.5 : 0);
      return scoreB - scoreA || a.relative_yaw_deg - b.relative_yaw_deg;
    })[0];
    if (best) selected.push(best);
  }
  return selected.sort((a, b) => a.relative_yaw_deg - b.relative_yaw_deg);
};
const anchorReason = (anchor: CompositionAnchorZoneV01['anchor']): PhotographyReasonCode => ({ LEFT_THIRD: 'CLEAN_LEFT_PLACEMENT', CENTER: 'CLEAN_CENTER_PLACEMENT', RIGHT_THIRD: 'CLEAN_RIGHT_PLACEMENT' } as const)[anchor];
const compositionAnchorCandidates = (viewId: string, zones: readonly CompositionAnchorZoneV01[]): CompositionAnchorCandidateV01[] => zones.map((zone) => ({ schema: 'xfx.composition-anchor-candidate', schema_version: '0.1', candidate_id: `${viewId}-${zone.anchor.toLowerCase()}`, view_id: viewId, image_anchor: zone.anchor, framing_profile: zone.framing_profile, evidence_class: 'CANDIDATE', technical_usability: zone.placement_score, reason_codes: [anchorReason(zone.anchor)], confidence: zone.confidence, authority: 'IMAGE_PLANE_COMPOSITION_ANCHOR_ONLY', physical_position: 'NOT_APPLICABLE_P1' }));

export const generatePhotographyViewCandidates = (descriptors: readonly KeyframeVisualDescriptor[], directionMap: SceneDirectionMapV01, regions: readonly SceneAngularRegion[], placements: ReadonlyMap<string, readonly CompositionAnchorZoneV01[]>): PhotographyViewCandidateV01[] => {
  const count = targetCandidateCount(descriptors.length, directionMap.coverage.span_deg);
  return chooseDiverseDescriptors(descriptors, count).map((descriptor, index) => {
    const viewId = `view-${String(index + 1).padStart(2, '0')}`;
    const anchors = compositionAnchorCandidates(viewId, placements.get(descriptor.keyframe_id) ?? []);
    return { schema_version: '0.1', view_id: viewId, representative_keyframe_id: descriptor.keyframe_id, relative_camera_yaw_deg: descriptor.relative_yaw_deg, direction_node_id: `frame-${descriptor.keyframe_id}`, region_id: regionFor(descriptor.relative_yaw_deg, regions), evidence_class: 'CANDIDATE', selection_basis: ['ANGULAR_DIVERSITY', 'TECHNICAL_USABILITY'], technical_usability: descriptor.photography_frame_quality_score, technical_reason_codes: technicalReasons(descriptor), composition_anchor_candidates: anchors, placement_candidates: anchors, final_photography_decision: 'NOT_P1_RESPONSIBILITY', limitations: ['NOT_AN_AESTHETIC_RANKING', 'IMAGE_PLANE_ANCHORS_ONLY', 'NO_PHYSICAL_POSITION', 'NO_SEMANTIC_SCENE_UNDERSTANDING'] };
  });
};
