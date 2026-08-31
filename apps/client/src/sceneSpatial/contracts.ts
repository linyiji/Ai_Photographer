export type SceneSpatialMode='REAL'|'FAKE'|'REPLAY'
export type SpatialStatus='INSUFFICIENT'|'PARTIAL'|'USABLE'
export type SpatialPrecheckStatus='UNRELIABLE'|'NO_SIGNAL'|'POSSIBLE'
export type GeometryJobEvent='GEOMETRY_REQUESTED'|'SPATIAL_EVIDENCE_AVAILABLE'|'SPATIAL_EVIDENCE_INSUFFICIENT'|'GEOMETRY_FAILED'|'GEOMETRY_SUPERSEDED'

export interface SceneFrameObservation{
 frameId:string;relativeYawDeg:number;width:number;height:number;technicalUsability:number
 clutterScore:number;sharpnessScore:number;encodedBytes?:ArrayBuffer;filePath?:string;timestampMs:number
}
export interface SceneScanEvidenceV01{
 schema_version:'0.1.0';scan_id:string;captured_at:string
 coverage:{start_yaw_deg:number;end_yaw_deg:number;span_deg:number}
 frames:{frame_id:string;relative_yaw_deg:number;width:number;height:number;technical_usability:number;evidence_class:'FACT'}[]
 privacy:{raw_video_uploaded:0;frame_stream_uploaded:0;provider_calls:0;luna_calls:0}
}
export interface SceneFrameSetV01{schema_version:'0.1.0';source_scan_id:string;frame_refs:string[];raw_media_persisted:false;raw_media_uploaded:false}
export interface SceneDirectionMapV01{schema_version:'0.1.0';source_scan_id:string;basis:'RELATIVE_YAW';nodes:{frame_id:string;relative_yaw_deg:number;evidence_class:'FACT'}[];depth:'UNKNOWN';metric_geometry:'NOT_SUPPORTED'}
export interface CompositionAnchorCandidateV01{anchor_id:string;view_id:string;image_anchor:'LEFT_THIRD'|'CENTER'|'RIGHT_THIRD';confidence:number;authority:'IMAGE_PLANE_COMPOSITION_ANCHOR_ONLY'}
export interface ViewEvidenceV01{
 schema_version:'0.1.0';source_scan_id:string
 view_candidates:{view_id:string;frame_id:string;relative_yaw_deg:number;technical_usability:number;evidence_class:'CANDIDATE'}[]
 composition_anchors:CompositionAnchorCandidateV01[];authority:'P1_VIEW_CANDIDATE_EVIDENCE'
}
export interface SpatialPrecheckV01{schema_version:'0.1.0';source_scan_id:string;status:SpatialPrecheckStatus;authority:'ROUTING_HINT_ONLY';reason:string;routing:{backend_solve_recommended:boolean}}
export interface CameraModelEvidenceV01{status:'KNOWN'|'ESTIMATED_VALIDATED'|'UNKNOWN';focal_source:string;principal_point_assumption:string;distortion_assumption:string;platform_device_profile:string;confidence:number}
export interface SelectedGeometryFrameV01{frame_id:string;timestamp_ms:number;relative_yaw_deg:number;orientation_source:'DEVICE_ORIENTATION'|'CONTROLLED_FIXTURE';width:number;height:number;source_width:number;source_height:number;working_width:number;working_height:number;encoded_bytes:number;frame_sha256:string;quality:number;file_field:string}
export interface SceneGeometryRequestV01{
 schema_version:'0.1.0';geometry_request_id:string;scan_id:string;frame_set_hash:string;geometry_version:'p2-backend-v0.2';platform:'h5'|'wechat'|'fixture';camera_model_evidence:CameraModelEvidenceV01;client_precheck:SpatialPrecheckV01;selected_geometry_frames:SelectedGeometryFrameV01[]
 privacy:{raw_video_upload:0;frame_stream_upload:0;provider_upload:0;luna_upload:0;selected_geometry_frame_upload:'FIRST_PARTY_BACKEND_ONLY'}
}
export interface SpatialEvidenceV02{
 schema:'xfx.spatial-evidence';schema_version:'0.2.0';source_scan_id:string;status:SpatialStatus;status_authority:'FIRST_PARTY_BACKEND_GEOMETRY_SOLVER';confidence:number;geometry_type:'SPARSE_RELATIVE'|'UNKNOWN';metric_scale_available:false;limitations:string[];evidence_refs:string[];reason_codes:string[];diagnostics?:Record<string,unknown>
}
export interface SceneSpatialBundle{sceneScan:SceneScanEvidenceV01;frameSet:SceneFrameSetV01;directionMap:SceneDirectionMapV01;viewEvidence:ViewEvidenceV01;precheck:SpatialPrecheckV01}
export interface GeometryResult{geometryRequestId:string;spatialEvidence:SpatialEvidenceV02;cacheStatus:'CACHE_HIT'|'CACHE_MISS';providerMode:SceneSpatialMode}
export interface SceneSpatialCompletion{event:GeometryJobEvent;spatialEvidence:SpatialEvidenceV02|null;viewPathUsable:true;errorCode?:string}
