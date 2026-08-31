import type {SceneDirectionMapV01,SceneFrameObservation,SceneFrameSetV01,SceneScanEvidenceV01,SceneSpatialBundle,SpatialPrecheckV01,ViewEvidenceV01} from './contracts'

const clamp01=(value:number)=>Math.max(0,Math.min(1,value))
const byYaw=(a:SceneFrameObservation,b:SceneFrameObservation)=>a.relativeYawDeg-b.relativeYawDeg

export function analyzeSceneScan(scanId:string,observations:readonly SceneFrameObservation[]):SceneSpatialBundle{
 if(!observations.length)throw new Error('SCENE_SCAN_EMPTY')
 const ordered=[...observations].sort(byYaw),first=ordered[0]!,last=ordered[ordered.length-1]!
 const sceneScan:SceneScanEvidenceV01={schema_version:'0.1.0',scan_id:scanId,captured_at:new Date().toISOString(),coverage:{start_yaw_deg:first.relativeYawDeg,end_yaw_deg:last.relativeYawDeg,span_deg:Math.max(0,last.relativeYawDeg-first.relativeYawDeg)},frames:ordered.map(frame=>({frame_id:frame.frameId,relative_yaw_deg:frame.relativeYawDeg,width:frame.width,height:frame.height,technical_usability:clamp01(frame.technicalUsability),evidence_class:'FACT'})),privacy:{raw_video_uploaded:0,frame_stream_uploaded:0,provider_calls:0,luna_calls:0}}
 const frameSet:SceneFrameSetV01={schema_version:'0.1.0',source_scan_id:scanId,frame_refs:ordered.map(frame=>frame.frameId),raw_media_persisted:false,raw_media_uploaded:false}
 const directionMap:SceneDirectionMapV01={schema_version:'0.1.0',source_scan_id:scanId,basis:'RELATIVE_YAW',nodes:ordered.map(frame=>({frame_id:frame.frameId,relative_yaw_deg:frame.relativeYawDeg,evidence_class:'FACT'})),depth:'UNKNOWN',metric_geometry:'NOT_SUPPORTED'}
 const ranked=[...ordered].sort((a,b)=>(b.technicalUsability-b.clutterScore*.25+b.sharpnessScore*.1)-(a.technicalUsability-a.clutterScore*.25+a.sharpnessScore*.1)),selected:SceneFrameObservation[]=[]
 for(const frame of ranked){if(selected.every(item=>Math.abs(item.relativeYawDeg-frame.relativeYawDeg)>=12)||!selected.length)selected.push(frame);if(selected.length===3)break}
 const viewCandidates=selected.map((frame,index)=>({view_id:`${scanId}-view-${index+1}`,frame_id:frame.frameId,relative_yaw_deg:frame.relativeYawDeg,technical_usability:clamp01(frame.technicalUsability),evidence_class:'CANDIDATE' as const}))
 const compositionAnchors=viewCandidates.flatMap(view=>['LEFT_THIRD','CENTER','RIGHT_THIRD'].map((anchor,index)=>({anchor_id:`${view.view_id}-anchor-${index+1}`,view_id:view.view_id,image_anchor:anchor as 'LEFT_THIRD'|'CENTER'|'RIGHT_THIRD',confidence:clamp01(view.technical_usability-(index===1?0:.05)),authority:'IMAGE_PLANE_COMPOSITION_ANCHOR_ONLY' as const})))
 const viewEvidence:ViewEvidenceV01={schema_version:'0.1.0',source_scan_id:scanId,view_candidates:viewCandidates,composition_anchors:compositionAnchors,authority:'P1_VIEW_CANDIDATE_EVIDENCE'}
 const usable=ordered.filter(frame=>frame.technicalUsability>=.4),status=usable.length<3?'UNRELIABLE':sceneScan.coverage.span_deg<4?'NO_SIGNAL':'POSSIBLE'
 const precheck:SpatialPrecheckV01={schema_version:'0.1.0',source_scan_id:scanId,status,authority:'ROUTING_HINT_ONLY',reason:status==='UNRELIABLE'?'TOO_FEW_TECHNICALLY_USABLE_FRAMES':status==='NO_SIGNAL'?'ANGULAR_SIGNAL_LIMITED':'MULTI_VIEW_SIGNAL_POSSIBLE',routing:{backend_solve_recommended:status==='POSSIBLE'}}
 return {sceneScan,frameSet,directionMap,viewEvidence,precheck}
}

export interface SceneScanAdapter{readonly platform:'H5'|'WECHAT'|'FIXTURE';prepare(scanId:string,frames:readonly SceneFrameObservation[]):SceneSpatialBundle}
export class WeChatSceneScanAdapter implements SceneScanAdapter{readonly platform='WECHAT' as const;prepare(scanId:string,frames:readonly SceneFrameObservation[]){return analyzeSceneScan(scanId,frames)}}
export class H5SceneScanAdapter implements SceneScanAdapter{readonly platform='H5' as const;prepare(scanId:string,frames:readonly SceneFrameObservation[]){return analyzeSceneScan(scanId,frames)}}
