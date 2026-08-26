import type { SceneSweepManifest } from '../spatial/scene-sweep-manifest.js';
import type { YawMapData } from '../spatial/types.js';
import { segmentAngularRegions } from './angular-regions.js';
import { DEFAULT_PHOTOGRAPHY_INTENT } from './config.js';
import { rankPhotographyOpportunities } from './opportunity-ranker.js';
import { evaluatePlacementZones } from './placement.js';
import type { PhotographyIntent, SceneSpatialContextV01, SceneSweepAnalysisResult, TransientKeyframePixels } from './types.js';
import { describeKeyframe } from './visual-descriptor.js';

const round = (value: number): number => Number(value.toFixed(6));
const average = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
const clock = (): number => typeof performance === 'undefined' ? Date.now() : performance.now();

export const analyzeSceneSweep = (manifest: SceneSweepManifest, yawMap: YawMapData, transientKeyframes: readonly TransientKeyframePixels[], intent: PhotographyIntent = DEFAULT_PHOTOGRAPHY_INTENT): SceneSweepAnalysisResult => {
  const totalStarted = clock(), pixelsById = new Map(transientKeyframes.map((item) => [item.keyframe_id, item.pixels]));
  const descriptorStarted = clock();
  const descriptors = yawMap.keyframes.flatMap((keyframe) => {
    const pixels = pixelsById.get(keyframe.keyframe_id);
    return pixels ? [describeKeyframe(keyframe, pixels)] : [];
  });
  const descriptorMs = clock() - descriptorStarted;
  const placements = new Map(descriptors.map((descriptor) => [descriptor.keyframe_id, evaluatePlacementZones(descriptor, pixelsById.get(descriptor.keyframe_id)!, intent.preferred_framing)]));
  const regionStarted = clock(), regions = segmentAngularRegions(descriptors, placements), regionMs = clock() - regionStarted;
  const rankingStarted = clock(), opportunities = rankPhotographyOpportunities(regions, descriptors, placements, intent), rankingMs = clock() - rankingStarted;
  const orderedYaw = yawMap.ordered_yaws_deg;
  const context: SceneSpatialContextV01 = {
    schema: 'xfx.scene-spatial-context', schema_version: '0.1', source_sweep_id: manifest.sweep_id, source_manifest_version: manifest.version,
    coverage: { start_relative_yaw_deg: round(orderedYaw[0] ?? 0), end_relative_yaw_deg: round(orderedYaw.at(-1) ?? manifest.coverage_deg), span_deg: round(manifest.coverage_deg) },
    sweep_mode: manifest.mode, camera: { facing: 'environment', frame_width: manifest.camera.source_width, frame_height: manifest.camera.source_height }, angular_regions: regions,
    representative_directions: regions.map((region) => ({ relative_yaw_deg: region.yaw_center_deg, region_id: region.region_id, representative_keyframe_id: region.representative_keyframe_id })),
    global_quality_summary: { mean_frame_quality: round(average(descriptors.map((item) => item.photography_frame_quality_score))), mean_clutter: round(average(descriptors.map((item) => item.visual_clutter_score))), descriptor_count: descriptors.length },
    analysis_capabilities: ['LOCAL_VISUAL_DESCRIPTORS', 'ANGULAR_REGIONS', 'IMAGE_PLANE_PLACEMENT', 'DETERMINISTIC_RANKING'],
    limitations: ['RELATIVE_ANGULAR_ORGANIZATION_ONLY', 'NO_SEMANTIC_OBJECT_LABELS', 'NO_DEPTH_OR_METRIC_3D', 'NO_PHYSICAL_SUBJECT_OR_CAMERA_POSITION', 'SAFETY_REQUIRES_USER_CONFIRMATION'],
    privacy: { raw_keyframes_transient: true, raw_media_persisted: false, raw_media_uploaded: false, provider_calls: 0, backend_per_frame_calls: 0, luna_calls: 0 },
  };
  return { context, opportunities, descriptors, timings: { descriptor_ms: round(descriptorMs), region_ms: round(regionMs), ranking_ms: round(rankingMs), total_ms: round(clock() - totalStarted) } };
};
export const canonicalSceneSpatialContextJson = (context: SceneSpatialContextV01): string => JSON.stringify(context, null, 2) + '\n';
export const canonicalPhotographyOpportunitiesJson = (opportunities: readonly SceneSweepAnalysisResult['opportunities'][number][]): string => JSON.stringify(opportunities, null, 2) + '\n';
export const opportunityStabilityScore = (first: SceneSweepAnalysisResult, second: SceneSweepAnalysisResult, toleranceDeg = 18): number => {
  if (!first.opportunities.length && !second.opportunities.length) return 1;
  const matches = first.opportunities.filter((a) => second.opportunities.some((b) => Math.abs(a.relative_camera_yaw_deg - b.relative_camera_yaw_deg) <= toleranceDeg)).length;
  return round(matches / Math.max(first.opportunities.length, second.opportunities.length, 1));
};
