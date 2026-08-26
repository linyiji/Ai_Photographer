import Taro from '@tarojs/taro'
import {API_BASE,UploadedAsset} from '../api/client'
import {AdapterDescriptor,CapabilityName,CapabilitySelection,PlatformResult,RuntimePlatform,selectionFrom,normalizedFailure} from './model'

const ALL:CapabilityName[]=['CameraAdapter','FrameAdapter','AlbumAdapter','ShareAdapter','HapticAdapter','VoiceOutputAdapter','AuthAdapter','PaymentAdapter','DeviceMotionAdapter','StorageAdapter','NetworkAdapter']

function descriptor(capabilityName:CapabilityName,platform:RuntimePlatform):AdapterDescriptor{
 const h5:Partial<Record<CapabilityName,[string,AdapterDescriptor['supportLevel'],string]>>={
  NetworkAdapter:['h5-network-v1','SUPPORTED','Browser online state and authorized transport'],
  HapticAdapter:['h5-haptic-v1','PARTIAL','Vibration API when available'],
  ShareAdapter:['h5-share-v1','PARTIAL','Web Share API when available'],
  AlbumAdapter:['h5-download-v1','PARTIAL','Download only; not a system album save'],
  CameraAdapter:['h5-still-camera-v1','UNVERIFIED_REAL_DEVICE','Single-shot chooser/camera implementation'],
  StorageAdapter:['development-local-storage-v1','SUPPORTED','Authorized multipart API'],
  VoiceOutputAdapter:['h5-voice-output-v1','PARTIAL','Optional speech synthesis only'],
  DeviceMotionAdapter:['h5-device-motion-shell-v1','PARTIAL','Permission and support vary']
 }
 const wechatNames=new Set<CapabilityName>(['NetworkAdapter','HapticAdapter','ShareAdapter','AlbumAdapter','CameraAdapter','StorageAdapter'])
 const spec=platform==='WECHAT'&&wechatNames.has(capabilityName)
  ? [`wechat-${capabilityName.replace('Adapter','').toLowerCase()}-v1`,'UNVERIFIED_REAL_DEVICE' as const,'Compile-safe Taro facade; real-device acceptance required'] as [string,AdapterDescriptor['supportLevel'],string]
  : h5[capabilityName]
 const [adapterId,supportLevel,reason]=spec||[`unavailable-${capabilityName.replace('Adapter','').toLowerCase()}`,'UNSUPPORTED' as const,'Not configured in M04']
 return {capabilityName,adapterId,adapterVersion:'1.0.0',platform,available:supportLevel!=='UNSUPPORTED',supportLevel,reason,provenance:{implementationSource:'MAIN_M04',runtimeSupport:supportLevel}}
}

export function detectPlatform():RuntimePlatform{return Taro.getEnv()===Taro.ENV_TYPE.WEAPP?'WECHAT':'H5'}

export type CaptureSource='camera'|'album'
export type CameraOpenDiagnostics={track:{width:number|null;height:number|null;frameRate:number|null;facingMode:string|null};video:{width:number;height:number};previewFps:number|null}
export type CaptureDiagnostics={width:number;height:number;bytes:number;quality:string;backend:'IMAGE_CAPTURE'|'CANVAS_VIDEO_INTRINSIC';track:CameraOpenDiagnostics['track'];video:CameraOpenDiagnostics['video']}
export type LocalCaptureCandidate={id:string;source:CaptureSource;previewUrl:string;filePath:string;file?:File;filename:string;orientation:'PORTRAIT'|'LANDSCAPE'|'UNKNOWN';confirmed:false;captureDiagnostics?:CaptureDiagnostics}

function cameraFailure(error:unknown,supportLevel:'PARTIAL'|'UNVERIFIED_REAL_DEVICE'):PlatformResult<never>{
 const message=error instanceof Error?error.message:String(error);const lowered=message.toLowerCase()
 const code=lowered.includes('permission')||lowered.includes('notallowed')||lowered.includes('denied')?'PERMISSION_DENIED':lowered.includes('cancel')?'USER_CANCELLED':'CAMERA_FAILURE'
 return normalizedFailure(code,supportLevel,message)
}

export class H5StillCamera{
 private stream:MediaStream|null=null
 private video:HTMLVideoElement|null=null
 private facingMode:'environment'|'user'='environment'
 private switching=false
 setFacingMode(value:'environment'|'user'){this.facingMode=value}
 private async waitForRelease(delayMs:number){await new Promise(resolve=>setTimeout(resolve,delayMs))}
 private trackSettings():CameraOpenDiagnostics['track']{const settings=this.stream?.getVideoTracks()[0]?.getSettings();return {width:settings?.width||null,height:settings?.height||null,frameRate:settings?.frameRate||null,facingMode:settings?.facingMode||null}}
 diagnostics(previewFps:number|null=null):CameraOpenDiagnostics{return {track:this.trackSettings(),video:{width:this.video?.videoWidth||0,height:this.video?.videoHeight||0},previewFps}}
 async measurePreviewFps(durationMs=1200):Promise<number|null>{
  const video=this.video as (HTMLVideoElement&{requestVideoFrameCallback?:(callback:(now:number)=>void)=>number})|null
  if(!video?.requestVideoFrameCallback)return this.trackSettings().frameRate
  return new Promise(resolve=>{let frames=0,finished=false;const started=performance.now();const finish=()=>{if(finished)return;finished=true;const elapsed=performance.now()-started;resolve(elapsed>0?frames*1000/elapsed:null)};const tick=()=>{if(finished)return;frames++;if(performance.now()-started>=durationMs){finish();return}video.requestVideoFrameCallback!(tick)};video.requestVideoFrameCallback(tick);setTimeout(finish,durationMs+250)})
 }
 private async openWithConstraint(containerId:string,strict:boolean):Promise<PlatformResult<{facingMode:string}>>{
  if(typeof navigator==='undefined'||!navigator.mediaDevices?.getUserMedia)return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','Camera preview is unavailable in this browser')
  try{
   this.close();this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:strict?{exact:this.facingMode}:{ideal:this.facingMode},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30}},audio:false})
   const host=document.getElementById(containerId);if(!host)throw new Error('Camera preview host is unavailable')
   const video=document.createElement('video');video.autoplay=true;video.muted=true;video.playsInline=true;video.setAttribute('aria-label','相机实时预览');video.srcObject=this.stream;host.replaceChildren(video);await video.play();this.video=video
   const actual=this.stream.getVideoTracks()[0]?.getSettings().facingMode
   return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE',value:{facingMode:actual||this.facingMode}}
  }catch(error){this.close();return cameraFailure(error,'PARTIAL')}
 }
 async open(containerId:string):Promise<PlatformResult<{facingMode:string}>>{return this.openWithConstraint(containerId,false)}
 async switch(containerId:string):Promise<PlatformResult<{facingMode:string}>>{
  if(this.switching)return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_IN_PROGRESS')
  const previous=this.facingMode;const next=previous==='environment'?'user':'environment';this.switching=true
  try{
   this.close();await this.waitForRelease(300);this.facingMode=next
   let result=await this.openWithConstraint(containerId,true)
   if(!result.ok){await this.waitForRelease(450);result=await this.openWithConstraint(containerId,false)}
   if(result.ok&&result.value){
    const actual=result.value.facingMode
    if(actual==='environment'||actual==='user')this.facingMode=actual
    if(actual!==previous)return result
    return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_FAILED_RESTORED')
   }
   this.facingMode=previous;await this.waitForRelease(450);const restored=await this.openWithConstraint(containerId,false)
   if(restored.ok){this.facingMode=previous;return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_FAILED_RESTORED')}
   return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_FAILED_CLOSED')
  }finally{this.switching=false}
 }
 async capture():Promise<PlatformResult<LocalCaptureCandidate>>{
  if(!this.video||!this.video.videoWidth||!this.video.videoHeight)return normalizedFailure('CAMERA_FAILURE','PARTIAL','Camera preview is not ready')
  const track=this.stream?.getVideoTracks()[0];let blob:Blob|null=null;let backend:CaptureDiagnostics['backend']='CANVAS_VIDEO_INTRINSIC';let quality='JPEG_0.95'
  const ImageCaptureConstructor=(globalThis as any).ImageCapture
  if(track&&typeof ImageCaptureConstructor==='function')try{blob=await new ImageCaptureConstructor(track).takePhoto();backend='IMAGE_CAPTURE';quality='DEVICE_NATIVE'}catch{}
  if(!blob){const canvas=document.createElement('canvas');canvas.width=this.video.videoWidth;canvas.height=this.video.videoHeight;const context=canvas.getContext('2d',{alpha:false});if(!context)return normalizedFailure('CAMERA_FAILURE','PARTIAL','Canvas fallback is unavailable');context.drawImage(this.video,0,0,canvas.width,canvas.height);blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',0.95))}
  if(!blob)return normalizedFailure('CAMERA_FAILURE','PARTIAL','Still image could not be created')
  let width=this.video.videoWidth,height=this.video.videoHeight
  if(typeof createImageBitmap==='function')try{const bitmap=await createImageBitmap(blob,{imageOrientation:'from-image'});width=bitmap.width;height=bitmap.height;bitmap.close()}catch{}
  const extension=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';const file=new File([blob],`capture-${Date.now()}.${extension}`,{type:blob.type||'image/jpeg'});const previewUrl=URL.createObjectURL(file)
  return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE',value:{id:`local-${Date.now()}`,source:'camera',previewUrl,filePath:previewUrl,file,filename:file.name,orientation:height>=width?'PORTRAIT':'LANDSCAPE',confirmed:false,captureDiagnostics:{width,height,bytes:blob.size,quality,backend,track:this.trackSettings(),video:{width:this.video.videoWidth,height:this.video.videoHeight}}}}
 }
 close(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;if(this.video){this.video.srcObject=null;this.video.remove();this.video=null}}
}

export class PlatformAdapterRegistry{
 readonly platform:RuntimePlatform
 readonly descriptors:AdapterDescriptor[]
 constructor(platform:RuntimePlatform=detectPlatform()){this.platform=platform;this.descriptors=ALL.map(name=>descriptor(name,platform))}
 availability(name:CapabilityName){return this.descriptors.find(item=>item.capabilityName===name)!}
 selections():CapabilitySelection[]{return [...this.descriptors.map(selectionFrom),{capabilityName:'LiveGuidanceCapability',selectedAdapter:'fake-live-guidance-m02',implementationType:'FAKE',supportLevel:'SUPPORTED',sourceTrack:'MAIN_M02',acceptanceLevel:'DETERMINISTIC_REGRESSION',platform:this.platform,version:'1.0.0'}]}

 async networkStatus():Promise<PlatformResult<{online:boolean}>>{
  try{const result=await Taro.getNetworkType();const online=result.networkType!=='none';return online?{ok:true,code:'OK',supportLevel:'SUPPORTED',value:{online}}:normalizedFailure('NETWORK_UNAVAILABLE','SUPPORTED','Device reports offline')}
  catch{return normalizedFailure('NETWORK_UNAVAILABLE','PARTIAL','Network status unavailable')}
 }

 async haptic(cue:'SUCCESS'|'WARNING'|'CAPTURE'|'READY'):Promise<PlatformResult>{
  try{await Taro.vibrateShort({type:cue==='WARNING'?'heavy':cue==='CAPTURE'?'medium':'light'});return {ok:true,code:'OK',supportLevel:this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL'}}
  catch{return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','Haptic API unavailable')}
 }

 async voice(text:string):Promise<PlatformResult>{
  if(this.platform!=='H5'||typeof window==='undefined'||!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined')return normalizedFailure('PLATFORM_UNSUPPORTED',this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'UNSUPPORTED','Voice output is unavailable in this runtime')
  try{window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='zh-CN';window.speechSynthesis.speak(utterance);return {ok:true,code:'OK',supportLevel:'PARTIAL'}}
  catch{return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','Voice output failed')}
 }

 async chooseCandidate(source:CaptureSource):Promise<PlatformResult<LocalCaptureCandidate>>{
  try{
   const chosen=await Taro.chooseImage({count:1,sizeType:['original'],sourceType:[source]})
   const filePath=chosen.tempFilePaths[0]
   if(!filePath)return normalizedFailure('USER_CANCELLED','UNVERIFIED_REAL_DEVICE','No image selected')
   const original=this.platform==='H5'?chosen.tempFiles[0]?.originalFileObj:undefined
   const file=original instanceof File?original:undefined
   return {ok:true,code:'OK',supportLevel:this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL',value:{id:`local-${Date.now()}`,source,previewUrl:filePath,filePath,file,filename:file?.name||`capture-${Date.now()}.jpg`,orientation:'UNKNOWN',confirmed:false}}
  }catch(error){return cameraFailure(error,this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL')}
 }

 async uploadCandidate(candidate:LocalCaptureCandidate):Promise<PlatformResult<UploadedAsset>>{
  try{
   if(this.platform==='H5'&&candidate.file){
    const body=new FormData();body.append('file',candidate.file,candidate.filename)
    const response=await fetch(`${API_BASE}/assets/uploads`,{method:'POST',body});const data=await response.text()
    if(response.status!==201)return normalizedFailure(response.status===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',data)
    return {ok:true,code:'OK',supportLevel:'SUPPORTED',value:JSON.parse(data) as UploadedAsset}
   }
   const response=await Taro.uploadFile({url:`${API_BASE}/assets/uploads`,filePath:candidate.filePath,name:'file'})
   if(response.statusCode!==201){return normalizedFailure(response.statusCode===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',response.data)}
   return {ok:true,code:'OK',supportLevel:this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'SUPPORTED',value:JSON.parse(response.data) as UploadedAsset}
  }catch(error){const message=error instanceof Error?error.message:String(error);return normalizedFailure(message.toLowerCase().includes('network')?'NETWORK_UNAVAILABLE':'STORAGE_FAILURE',this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL',message)}
 }

 async uploadDerived(sessionId:string,blob:Blob,idempotencyKey:string):Promise<PlatformResult<UploadedAsset>>{
  if(this.platform!=='H5')return normalizedFailure('PLATFORM_UNSUPPORTED','UNVERIFIED_REAL_DEVICE','Fine Tune binary persistence is not yet device-verified on WeChat')
  try{
   const body=new FormData();body.append('file',new File([blob],`fine-tune-${sessionId}.jpg`,{type:'image/jpeg'}))
   const response=await fetch(`${API_BASE}/sessions/${sessionId}/fine-tune/derived`,{method:'POST',body,headers:{'Idempotency-Key':idempotencyKey}});const data=await response.text()
   if(response.status!==201)return normalizedFailure(response.status===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',data)
   return {ok:true,code:'OK',supportLevel:'SUPPORTED',value:JSON.parse(data) as UploadedAsset}
  }catch(error){return normalizedFailure('STORAGE_FAILURE','PARTIAL',error instanceof Error?error.message:String(error))}
 }

 async download(url:string,filename='xiangfengxing-final.jpg'):Promise<PlatformResult>{
  if(this.platform==='WECHAT'){
   try{await Taro.downloadFile({url});return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE'}}catch{return normalizedFailure('STORAGE_FAILURE','UNVERIFIED_REAL_DEVICE','WeChat download requires device acceptance')}
  }
  try{const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.rel='noopener';document.body.appendChild(anchor);anchor.click();anchor.remove();return {ok:true,code:'OK',supportLevel:'SUPPORTED'}}catch{return normalizedFailure('STORAGE_FAILURE','PARTIAL','Browser download failed')}
 }

 async share(url:string):Promise<PlatformResult>{
  if(this.platform==='H5'&&typeof navigator!=='undefined'&&typeof navigator.share==='function'){
   try{await navigator.share({title:'向风行 · My Final Photo',url});return {ok:true,code:'OK',supportLevel:'PARTIAL'}}catch(error){return normalizedFailure(error instanceof DOMException&&error.name==='AbortError'?'USER_CANCELLED':'SHARE_FAILURE','PARTIAL',String(error))}
  }
  return normalizedFailure('PLATFORM_UNSUPPORTED',this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'UNSUPPORTED','Share capability is unavailable in this runtime')
 }
}

export const platformRegistry=new PlatformAdapterRegistry()
