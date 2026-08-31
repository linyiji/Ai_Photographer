import type {CameraModelEvidenceV01,SceneGeometryRequestV01,SpatialPrecheckV01} from './contracts'
import type {PreparedGeometryFrame} from './port'
import {sha256Hex} from './hash'

const textBytes=(value:string)=>new TextEncoder().encode(value)
export async function prepareGeometryRequest(input:{scanId:string;requestId:string;platform:'h5'|'wechat'|'fixture';precheck:SpatialPrecheckV01;cameraModel:CameraModelEvidenceV01;frames:readonly {frameId:string;timestampMs:number;relativeYawDeg:number;width:number;height:number;sourceWidth:number;sourceHeight:number;quality:number;bytes:ArrayBuffer;orientationSource:'DEVICE_ORIENTATION'|'CONTROLLED_FIXTURE'}[]}):Promise<{request:SceneGeometryRequestV01;frames:PreparedGeometryFrame[]}>{
 if(input.frames.length<3||input.frames.length>8)throw new Error('GEOMETRY_FRAME_COUNT_OUT_OF_BOUNDS')
 if(input.frames.some(frame=>Math.max(frame.width,frame.height)>640||Math.min(frame.width,frame.height)<=0))throw new Error('GEOMETRY_CLIENT_WORKING_EDGE_OUT_OF_BOUNDS')
 const frames:PreparedGeometryFrame[]=input.frames.map((frame,index)=>({bytes:frame.bytes,metadata:{frame_id:frame.frameId,timestamp_ms:frame.timestampMs,relative_yaw_deg:frame.relativeYawDeg,orientation_source:frame.orientationSource,width:frame.width,height:frame.height,source_width:frame.sourceWidth,source_height:frame.sourceHeight,working_width:frame.width,working_height:frame.height,encoded_bytes:frame.bytes.byteLength,frame_sha256:sha256Hex(frame.bytes),quality:frame.quality,file_field:`frame_${index}`}}))
 const canonical=JSON.stringify(frames.map(frame=>[frame.metadata.frame_id,frame.metadata.frame_sha256]))
 const request:SceneGeometryRequestV01={schema_version:'0.1.0',geometry_request_id:input.requestId,scan_id:input.scanId,frame_set_hash:sha256Hex(textBytes(canonical)),geometry_version:'p2-backend-v0.2',platform:input.platform,camera_model_evidence:input.cameraModel,client_precheck:input.precheck,selected_geometry_frames:frames.map(frame=>frame.metadata),privacy:{raw_video_upload:0,frame_stream_upload:0,provider_upload:0,luna_upload:0,selected_geometry_frame_upload:'FIRST_PARTY_BACKEND_ONLY'}}
 return {request,frames}
}
