import type { PixelFrame, PhotographyViewCandidateV01 } from '../p1/types.js';

export type ParallaxClassification = 'ROTATION_DOMINANT' | 'LOW_PARALLAX' | 'TRANSLATION_EVIDENCE_PRESENT' | 'UNCLASSIFIED';
export type SpatialEvidenceStatus = 'USABLE' | 'PARTIAL' | 'INSUFFICIENT';
export type CorrespondenceEngine = 'GFTT_PYRLK' | 'ORB_DESCRIPTOR_MATCHING' | 'LIGHTWEIGHT_BLOCK_FLOW';

export interface GeometryFrameObservation {
  frame_id: string; sequence: number; timestamp_ms: number; relative_yaw_deg: number;
  width: number; height: number; blur_score: number; exposure_mean: number;
  technical_quality: number; motion_diagnostic: number; parallax_diagnostic: 'PENDING_POST_SCAN';
  orientation_source: 'DEVICE_ORIENTATION' | 'CONTROLLED_FIXTURE';
  pixels: PixelFrame;
}
export interface SceneScanGeometryInputV01 {
  schema: 'xfx.scene-scan-geometry-input'; schema_version: '0.1'; source_sweep_id: string;
  frames: GeometryFrameObservation[]; selection_budget: number; estimated_memory_bytes: number;
  lifecycle: 'TRANSIENT_LOCAL_MEMORY'; raw_media_persisted: false; raw_media_uploaded: false;
}
export interface CorrespondenceDiagnostics {
  engine: CorrespondenceEngine; detected_feature_count: number; tracked_feature_count: number;
  match_retention: number; inlier_ratio: number; median_displacement_px: number;
  median_parallax_px: number; p75_parallax_px: number; latency_ms: number;
  pair_count: number; failure_reason: string | null;
}
export interface RelativeCameraMotion {
  rotation: 'ESTIMATED' | 'UNKNOWN'; translation_direction: 'LEFT' | 'RIGHT' | 'FORWARD' | 'BACKWARD' | 'UNKNOWN';
  evidence_class: 'FACT' | 'UNKNOWN'; metric_distance: 'UNKNOWN'; coordinate_convention: 'CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD';
}
export interface SpatialEvidenceV01 {
  schema: 'xfx.spatial-evidence'; schema_version: '0.1'; source_sweep_id: string;
  status: SpatialEvidenceStatus; geometry_type: 'SPARSE_RELATIVE' | 'UNKNOWN'; metric_scale_available: false;
  confidence: number; parallax_classification: ParallaxClassification;
  diagnostics: {
    correspondence_engine: CorrespondenceEngine; selected_frame_count: number; tracked_feature_count: number;
    inlier_ratio: number; median_parallax: number; pose_stability: number | null;
    triangulated_point_count: number; positive_depth_ratio: number | null; reprojection_error: number | null;
    geometry_coverage: number; selection_latency_ms: number; correspondence_latency_ms: number;
    pose_latency_ms: number; triangulation_latency_ms: number; total_latency_ms: number; estimated_memory_bytes: number;
  };
  relative_camera_motion: RelativeCameraMotion;
  relative_depth_summary: { source: 'SPARSE_GEOMETRY' | 'NONE'; categories: ('NEAR' | 'MID' | 'FAR')[]; status: 'AVAILABLE' | 'UNKNOWN'; };
  visibility_summary: { status: 'PARTIAL' | 'UNKNOWN'; note: string; };
  occlusion_summary: { status: 'PARTIAL' | 'UNKNOWN'; note: string; };
  evidence_refs: string[]; limitations: string[]; reasons: string[];
  privacy: { raw_frames_transient: true; raw_media_persisted: false; raw_media_uploaded: false; provider_calls: 0; backend_per_frame_calls: 0; luna_calls: 0; };
}
export interface SubjectPlacementCandidateV01 {
  candidate_id: string; action: 'STAND'; view_relation: string; relative_depth: 'NEAR' | 'MID' | 'FAR' | 'UNKNOWN';
  visibility: 'PARTIAL' | 'UNKNOWN'; occlusion_risk: 'PARTIAL' | 'UNKNOWN'; support_evidence: 'UNKNOWN';
  free_space_evidence: 'UNKNOWN'; confidence: number; evidence_class: 'CANDIDATE'; limitations: string[];
}
export interface CameraPlacementCandidateV01 {
  candidate_id: string; direction: 'CURRENT' | 'SLIGHTLY_LEFT' | 'SLIGHTLY_RIGHT' | 'SLIGHTLY_FORWARD' | 'SLIGHTLY_BACK';
  confidence: number; evidence_class: 'CANDIDATE'; metric_distance: 'UNKNOWN'; limitations: string[];
}
export interface CandidateShotV01 {
  candidate_id: string; view: PhotographyViewCandidateV01; subject: SubjectPlacementCandidateV01;
  camera: CameraPlacementCandidateV01; evidence_class: 'CANDIDATE'; final_selection: 'NOT_P2_RESPONSIBILITY';
}
