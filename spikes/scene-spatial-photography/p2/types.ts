import type { PixelFrame } from '../p1/types.js';

export type ParallaxClassification = 'ROTATION_DOMINANT' | 'LOW_PARALLAX' | 'TRANSLATION_EVIDENCE_PRESENT' | 'UNCLASSIFIED';
export type CorrespondenceEngine = 'GFTT_PYRLK' | 'ORB_DESCRIPTOR_MATCHING' | 'LIGHTWEIGHT_BLOCK_FLOW';
export type SpatialPrecheckStatus = 'UNRELIABLE' | 'NO_SIGNAL' | 'POSSIBLE';

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
  pair_count: number; failure_reason: string | null; working_image_diagonal_px?: number;
}
export interface RelativeCameraMotion {
  rotation: 'ESTIMATED' | 'UNKNOWN'; translation_direction: 'LEFT' | 'RIGHT' | 'FORWARD' | 'BACKWARD' | 'UNKNOWN';
  evidence_class: 'FACT' | 'UNKNOWN'; metric_distance: 'UNKNOWN'; coordinate_convention: 'CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD';
}
export interface SpatialPrecheckV01 {
  schema: 'xfx.spatial-precheck'; schema_version: '0.1'; source_sweep_id: string;
  status: SpatialPrecheckStatus; authority: 'ROUTING_HINT_ONLY'; reason: string;
  diagnostics: { correspondence_engine: 'LIGHTWEIGHT_BLOCK_FLOW'; selected_frame_count: number; tracked_feature_count: number; overlap_ratio: number; motion_inlier_ratio: number; median_residual_px: number; p75_residual_px: number; normalized_median_residual: number; normalized_p75_residual: number; image_diagonal_px: number; selection_latency_ms: number; precheck_latency_ms: number; total_latency_ms: number; estimated_memory_bytes: number; legacy_calibration_classification: ParallaxClassification; };
  routing: { backend_solve_recommended: boolean; evaluation_override_allowed: true; };
  privacy: { raw_frames_transient: true; raw_video_uploaded: false; frame_stream_uploaded: false; selected_geometry_frame_upload: 'FIRST_PARTY_BACKEND_ONLY'; provider_calls: 0; luna_calls: 0; };
}

export interface CameraModelEvidenceV01 { status: 'KNOWN' | 'ESTIMATED_VALIDATED' | 'UNKNOWN'; focal_source: string; principal_point_assumption: string; distortion_assumption: string; platform_device_profile: string; confidence: number; }
export interface SelectedGeometryFrameV01 { frame_id: string; timestamp_ms: number; relative_yaw_deg: number; orientation_source: GeometryFrameObservation['orientation_source']; width: number; height: number; quality: number; file_field: string; }
export interface SceneGeometryRequestV01 {
  schema: 'xfx.scene-geometry-request'; schema_version: '0.1'; scan_id: string; frame_set_hash: string; geometry_version: 'p2-backend-v0.2'; platform: 'h5' | 'wechat' | 'douyin' | 'fixture'; camera_model_evidence: CameraModelEvidenceV01; client_precheck: SpatialPrecheckV01; selected_geometry_frames: SelectedGeometryFrameV01[];
  privacy: { raw_video_upload: 0; frame_stream_upload: 0; provider_upload: 0; luna_upload: 0; selected_geometry_frame_upload: 'FIRST_PARTY_BACKEND_ONLY'; };
}
export interface SpatialEvidenceV02 {
  schema: 'xfx.spatial-evidence'; schema_version: '0.2'; source_scan_id: string; status: 'INSUFFICIENT' | 'PARTIAL' | 'USABLE'; status_authority: 'FIRST_PARTY_BACKEND_GEOMETRY_SOLVER'; confidence: number; geometry_type: 'SPARSE_RELATIVE' | 'UNKNOWN'; metric_scale_available: false;
  relative_camera_motion: RelativeCameraMotion; relative_depth_summary: { source: 'SPARSE_MULTI_VIEW_GEOMETRY' | 'NONE'; categories: ('NEAR' | 'MID' | 'FAR')[]; status: 'AVAILABLE' | 'UNKNOWN'; };
  geometry_coverage: number; visibility_evidence: { status: 'PARTIAL' | 'UNKNOWN'; note: string; }; occlusion_evidence: { status: 'PARTIAL' | 'UNKNOWN'; note: string; }; limitations: string[]; evidence_refs: string[]; reason_codes: string[]; diagnostics: Record<string, unknown>;
}
