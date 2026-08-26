import type { SceneSweepManifest } from '../spatial/scene-sweep-manifest.js';
import type { YawMapData } from '../spatial/types.js';

export type FramingProfile = 'CLOSE' | 'MEDIUM' | 'ENVIRONMENTAL' | 'FULL_BODY';
export type PlacementAnchor = 'LEFT_THIRD' | 'CENTER' | 'RIGHT_THIRD';
export type PhotographyReasonCode =
  | 'BALANCED_EXPOSURE' | 'GOOD_SHARPNESS' | 'LOW_BACKGROUND_CLUTTER'
  | 'CLEAN_LEFT_PLACEMENT' | 'CLEAN_CENTER_PLACEMENT' | 'CLEAN_RIGHT_PLACEMENT'
  | 'GOOD_EDGE_CLEARANCE' | 'REGION_VISUALLY_STABLE'
  | 'PENALTY_OVEREXPOSED' | 'PENALTY_UNDEREXPOSED' | 'PENALTY_HIGH_CLUTTER'
  | 'PENALTY_EDGE_CONFLICT' | 'PENALTY_LOW_SHARPNESS';

export interface PixelFrame { width: number; height: number; data: Uint8ClampedArray; }
export interface TransientKeyframePixels { keyframe_id: string; pixels: PixelFrame; thumbnail_url?: string; }
export interface DescriptorGridCell {
  row: number; column: number; mean_luma: number; contrast: number; edge_density: number;
  shadow_clip_ratio: number; highlight_clip_ratio: number; clutter: number;
}
export interface PlacementClearanceScores { LEFT_THIRD: number; CENTER: number; RIGHT_THIRD: number; }
export interface KeyframeVisualDescriptor {
  descriptor_version: '0.1'; keyframe_id: string; relative_yaw_deg: number;
  sharpness_score: number;
  exposure: { mean_luma: number; shadow_clip_ratio: number; highlight_clip_ratio: number; balanced_score: number; };
  contrast_score: number; edge_density: number;
  local_edge_density_grid: number[][]; local_luma_grid: number[][]; local_contrast_grid: number[][];
  grid: DescriptorGridCell[]; visual_clutter_score: number; center_clutter_score: number;
  left_third_clutter_score: number; right_third_clutter_score: number;
  placement_clearance_scores: PlacementClearanceScores; photography_frame_quality_score: number;
  quality_confidence: number;
}
export interface NormalizedRect { x: number; y: number; width: number; height: number; }
export interface SubjectPlacementZone {
  zone_id: string; normalized_rect: NormalizedRect; anchor: PlacementAnchor; framing_profile: FramingProfile;
  clutter_score: number; exposure_score: number; clearance_score: number; edge_conflict_score: number;
  placement_score: number; confidence: number;
}
export interface SceneAngularRegion {
  region_id: string; yaw_start_deg: number; yaw_end_deg: number; yaw_center_deg: number; span_deg: number;
  keyframe_ids: string[]; representative_keyframe_id: string;
  descriptor_summary: { mean_luma: number; contrast: number; sharpness: number; clutter: number; };
  visual_quality_score: number; visual_clutter_score: number; placement_potential_score: number;
  coverage_confidence: number; boundary_penalty: number; keyframe_consistency_score: number;
  scene_region_score: number; confidence: number; boundary_reason: 'START' | 'DESCRIPTOR_DISCONTINUITY' | 'YAW_GAP' | 'END';
}
export interface PhotographyIntent {
  subject_type: 'SINGLE_PERSON' | 'SCENE_ONLY' | 'UNKNOWN';
  preferred_framing: FramingProfile; composition_preference: 'AUTO';
}
export interface PhotographyOpportunityV01 {
  schema_version: '0.1'; opportunity_id: string; relative_camera_yaw_deg: number;
  yaw_window: { start_deg: number; end_deg: number; }; scene_region_id: string;
  representative_keyframe_id: string; framing_profile: FramingProfile;
  subject_placement_zone: SubjectPlacementZone; score: number;
  score_breakdown: { frame_quality: number; region_quality: number; clutter: number; placement_clearance: number; edge_conflict: number; exposure: number; confidence: number; };
  reason_codes: PhotographyReasonCode[]; limitations: string[];
  physical_subject_position: 'NOT_SUPPORTED'; physical_camera_position: 'NOT_SUPPORTED';
  safety: 'UNKNOWN_REQUIRES_USER_CONFIRMATION'; confidence: number;
}
export interface SceneSpatialContextV01 {
  schema: 'xfx.scene-spatial-context'; schema_version: '0.1'; source_sweep_id: string; source_manifest_version: string;
  coverage: { start_relative_yaw_deg: number; end_relative_yaw_deg: number; span_deg: number; };
  sweep_mode: SceneSweepManifest['mode']; camera: { facing: 'environment'; frame_width: number; frame_height: number; };
  angular_regions: SceneAngularRegion[];
  representative_directions: { relative_yaw_deg: number; region_id: string; representative_keyframe_id: string; }[];
  global_quality_summary: { mean_frame_quality: number; mean_clutter: number; descriptor_count: number; };
  analysis_capabilities: ['LOCAL_VISUAL_DESCRIPTORS', 'ANGULAR_REGIONS', 'IMAGE_PLANE_PLACEMENT', 'DETERMINISTIC_RANKING'];
  limitations: string[];
  privacy: { raw_keyframes_transient: true; raw_media_persisted: false; raw_media_uploaded: false; provider_calls: 0; backend_per_frame_calls: 0; luna_calls: 0; };
}
export interface P1AnalysisTimings { descriptor_ms: number; region_ms: number; ranking_ms: number; total_ms: number; }
export interface SceneSweepAnalysisResult {
  context: SceneSpatialContextV01; opportunities: PhotographyOpportunityV01[];
  descriptors: KeyframeVisualDescriptor[]; timings: P1AnalysisTimings;
}
export interface P1ReplayInput { manifest: SceneSweepManifest; yaw_map: YawMapData; transient_keyframes: TransientKeyframePixels[]; intent: PhotographyIntent; }
