import type {GeometryResult,SceneGeometryRequestV01,SceneSpatialMode,SelectedGeometryFrameV01,SpatialEvidenceV02} from './contracts'

export interface PreparedGeometryFrame{metadata:SelectedGeometryFrameV01;bytes?:ArrayBuffer;filePath?:string}
export interface SceneSpatialPort{readonly mode:SceneSpatialMode;analyze(sessionId:string,request:SceneGeometryRequestV01,frames:readonly PreparedGeometryFrame[],signal:AbortSignal):Promise<GeometryResult>}
export interface SceneSpatialTransport{analyze(sessionId:string,request:SceneGeometryRequestV01,frames:readonly PreparedGeometryFrame[],signal:AbortSignal):Promise<GeometryResult>}

export class RealSceneSpatialAdapter implements SceneSpatialPort{
 readonly mode='REAL' as const
 constructor(private readonly transport:SceneSpatialTransport){}
 analyze(sessionId:string,request:SceneGeometryRequestV01,frames:readonly PreparedGeometryFrame[],signal:AbortSignal){return this.transport.analyze(sessionId,request,frames,signal)}
}
const bounded=(request:SceneGeometryRequestV01,status:'PARTIAL'|'INSUFFICIENT',reason:string):SpatialEvidenceV02=>({schema:'xfx.spatial-evidence',schema_version:'0.2.0',source_scan_id:request.scan_id,status,status_authority:'FIRST_PARTY_BACKEND_GEOMETRY_SOLVER',confidence:status==='PARTIAL'?.5:0,geometry_type:status==='PARTIAL'?'SPARSE_RELATIVE':'UNKNOWN',metric_scale_available:false,limitations:['NON_METRIC','NO_PHYSICAL_SAFETY_AUTHORITY','P3_AFFORDANCE_NOT_STARTED'],evidence_refs:request.selected_geometry_frames.map(frame=>frame.frame_id),reason_codes:[reason],diagnostics:{geometry_request_id:request.geometry_request_id}})
export class FakeSceneSpatialAdapter implements SceneSpatialPort{readonly mode='FAKE' as const;async analyze(_sessionId:string,request:SceneGeometryRequestV01){return {geometryRequestId:request.geometry_request_id,spatialEvidence:bounded(request,'PARTIAL','FAKE_DETERMINISTIC_EVIDENCE'),cacheStatus:'CACHE_MISS' as const,providerMode:this.mode}}}
export class ReplaySceneSpatialAdapter implements SceneSpatialPort{readonly mode='REPLAY' as const;constructor(private readonly fixtures:Record<string,SpatialEvidenceV02>={}){}async analyze(_sessionId:string,request:SceneGeometryRequestV01){return {geometryRequestId:request.geometry_request_id,spatialEvidence:this.fixtures[request.scan_id]||bounded(request,'INSUFFICIENT','REPLAY_FIXTURE_NOT_FOUND'),cacheStatus:'CACHE_HIT' as const,providerMode:this.mode}}}
