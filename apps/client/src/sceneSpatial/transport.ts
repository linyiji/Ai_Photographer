import {API_BASE} from '../api/client'
import type {GeometryResult,SceneGeometryRequestV01} from './contracts'
import type {PreparedGeometryFrame,SceneSpatialTransport} from './port'
import Taro from '@tarojs/taro'

export class FetchSceneSpatialTransport implements SceneSpatialTransport{
 async analyze(sessionId:string,request:SceneGeometryRequestV01,frames:readonly PreparedGeometryFrame[],signal:AbortSignal):Promise<GeometryResult>{
  const form=new FormData();form.append('metadata',JSON.stringify(request))
  for(const frame of frames){if(!frame.bytes)throw new Error('GEOMETRY_FRAME_BYTES_REQUIRED');form.append(frame.metadata.file_field,new Blob([frame.bytes],{type:'image/jpeg'}),`${frame.metadata.frame_id}.jpg`)}
  const response=await fetch(`${API_BASE}/sessions/${sessionId}/scene-spatial/geometry`,{method:'POST',body:form,signal});const body=await response.text()
  if(!response.ok)throw new Error(`GEOMETRY_HTTP_${response.status}:${body}`)
  const parsed=JSON.parse(body) as {geometry_request_id:string;spatial_evidence:GeometryResult['spatialEvidence'];cache_status:GeometryResult['cacheStatus'];provider_mode:GeometryResult['providerMode']}
  return {geometryRequestId:parsed.geometry_request_id,spatialEvidence:parsed.spatial_evidence,cacheStatus:parsed.cache_status,providerMode:parsed.provider_mode}
 }
}

const encodeUtf8=(value:string):Uint8Array=>{
 const bytes:number[]=[]
 for(let index=0;index<value.length;index++){
  let point=value.charCodeAt(index)
  if(point>=0xd800&&point<=0xdbff&&index+1<value.length){const low=value.charCodeAt(index+1);if(low>=0xdc00&&low<=0xdfff){point=0x10000+((point-0xd800)<<10)+(low-0xdc00);index++}}
  if(point<=0x7f)bytes.push(point)
  else if(point<=0x7ff)bytes.push(0xc0|(point>>6),0x80|(point&0x3f))
  else if(point<=0xffff)bytes.push(0xe0|(point>>12),0x80|((point>>6)&0x3f),0x80|(point&0x3f))
  else bytes.push(0xf0|(point>>18),0x80|((point>>12)&0x3f),0x80|((point>>6)&0x3f),0x80|(point&0x3f))
 }
 return new Uint8Array(bytes)
}
const join=(parts:Uint8Array[])=>{const total=parts.reduce((sum,item)=>sum+item.byteLength,0),joined=new Uint8Array(total);let offset=0;for(const part of parts){joined.set(part,offset);offset+=part.byteLength}return joined}
export class WeChatSceneSpatialTransport implements SceneSpatialTransport{
 async analyze(sessionId:string,request:SceneGeometryRequestV01,frames:readonly PreparedGeometryFrame[],signal:AbortSignal):Promise<GeometryResult>{
  const boundary=`xfx-scene-spatial-${request.geometry_request_id.replace(/[^a-zA-Z0-9]/g,'')}`,parts:Uint8Array[]=[]
  parts.push(encodeUtf8(`--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\n\r\n${JSON.stringify(request)}\r\n`))
  for(const frame of frames){if(!frame.bytes)throw new Error('GEOMETRY_FRAME_BYTES_REQUIRED');parts.push(encodeUtf8(`--${boundary}\r\nContent-Disposition: form-data; name="${frame.metadata.file_field}"; filename="${frame.metadata.frame_id}.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),new Uint8Array(frame.bytes),encodeUtf8('\r\n'))}
  parts.push(encodeUtf8(`--${boundary}--\r\n`));const data=join(parts)
  const task=Taro.request({url:`${API_BASE}/sessions/${sessionId}/scene-spatial/geometry`,method:'POST',data:data.buffer,header:{'Content-Type':`multipart/form-data; boundary=${boundary}`}}) as any
  const abort=()=>task.abort?.();signal.addEventListener('abort',abort,{once:true})
  try{const response=await task;if(response.statusCode!==200)throw new Error(`GEOMETRY_HTTP_${response.statusCode}:${response.data}`);const parsed=typeof response.data==='string'?JSON.parse(response.data):response.data;return {geometryRequestId:parsed.geometry_request_id,spatialEvidence:parsed.spatial_evidence,cacheStatus:parsed.cache_status,providerMode:parsed.provider_mode}}
  finally{signal.removeEventListener('abort',abort)}
 }
}
