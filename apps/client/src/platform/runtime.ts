import Taro from '@tarojs/taro'
import {API_BASE,UploadedAsset} from '../api/client'
import {AdapterDescriptor,CapabilityName,CapabilitySelection,PlatformResult,RuntimePlatform,selectionFrom,normalizedFailure} from './model'
import {centeredAspectCrop,estimateCentralCropByLuma,projectObjectFit,rectToPixels,type NormalizedRect,type TransformEstimate} from '../diagnostics/cameraGeometry'
import {CameraGeometryTracker,H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02,cameraConstraintRequest,cameraStreamConstraints,captureViewportForVideo,hashCameraIdentity,normalizeCameraGeometry,normalizeCameraSettings,type CameraConstraintRequest,type CameraStreamProfile,type CaptureViewport,type CameraOrientation,type NormalizedCameraGeometry,type NormalizedCameraSettings} from './captureViewport'
import type {UploadAttemptTelemetry,UploadContext} from './captureUpload'
import {classifyPreviewStillAlignment,fullViewport,type PreviewStillAlignmentResultV01} from './previewStillAlignment'
import {classifyRegistrationStability,registerPreviewStillBlobs,type PreviewStillRegistrationV01,type RegistrationStabilitySummary} from './previewStillRegistration'

const ALL:CapabilityName[]=['CameraAdapter','FrameAdapter','SceneScanAdapter','AlbumAdapter','ShareAdapter','HapticAdapter','VoiceOutputAdapter','AuthAdapter','PaymentAdapter','DeviceMotionAdapter','StorageAdapter','NetworkAdapter']

function descriptor(capabilityName:CapabilityName,platform:RuntimePlatform):AdapterDescriptor{
 const h5:Partial<Record<CapabilityName,[string,AdapterDescriptor['supportLevel'],string]>>={
  NetworkAdapter:['h5-network-v1','SUPPORTED','Browser online state and authorized transport'],
  HapticAdapter:['h5-haptic-v1','PARTIAL','Vibration API when available'],
  ShareAdapter:['h5-share-v1','PARTIAL','Web Share API when available'],
  AlbumAdapter:['h5-download-v1','PARTIAL','Download only; not a system album save'],
  CameraAdapter:['h5-still-camera-v1','UNVERIFIED_REAL_DEVICE','Single-shot chooser/camera implementation'],
  SceneScanAdapter:['h5-scene-scan-v0.2','SUPPORTED','Development harness for portable Scene Scan evidence'],
  StorageAdapter:['development-local-storage-v1','SUPPORTED','Authorized multipart API'],
  VoiceOutputAdapter:['h5-voice-output-v1','PARTIAL','Optional speech synthesis only'],
  DeviceMotionAdapter:['h5-device-motion-shell-v1','PARTIAL','Permission and support vary']
 }
 const wechatNames=new Set<CapabilityName>(['NetworkAdapter','HapticAdapter','ShareAdapter','AlbumAdapter','CameraAdapter','SceneScanAdapter','StorageAdapter'])
 const spec=platform==='WECHAT'&&wechatNames.has(capabilityName)
  ? [`wechat-${capabilityName.replace('Adapter','').toLowerCase()}-v1`,'UNVERIFIED_REAL_DEVICE' as const,'Compile-safe Taro facade; real-device acceptance required'] as [string,AdapterDescriptor['supportLevel'],string]
  : h5[capabilityName]
 const [adapterId,supportLevel,reason]=spec||[`unavailable-${capabilityName.replace('Adapter','').toLowerCase()}`,'UNSUPPORTED' as const,'Not configured in M04']
 const sceneScan=capabilityName==='SceneScanAdapter'
 return {capabilityName,adapterId,adapterVersion:sceneScan?'0.2.0':'1.0.0',platform,available:supportLevel!=='UNSUPPORTED',supportLevel,reason,provenance:{implementationSource:sceneScan?'MAIN_SCENE_SPATIAL_V02':'MAIN_M04',runtimeSupport:supportLevel}}
}

export function detectPlatform():RuntimePlatform{return Taro.getEnv()===Taro.ENV_TYPE.WEAPP?'WECHAT':'H5'}

export type CaptureSource='camera'|'album'
export type CameraOpenDiagnostics={profile:CameraStreamProfile;requested:CameraConstraintRequest;track:{width:number|null;height:number|null;aspectRatio:number|null;frameRate:number|null;facingMode:string|null;zoom:number|null};video:{width:number;height:number;aspectRatio:number|null};orientation:{device:CameraOrientation;presentation:CameraOrientation};geometry:NormalizedCameraGeometry;geometryGeneration:number;captureViewport:CaptureViewport;previewFps:number|null}
export type CaptureDiagnostics={profile:CameraStreamProfile;requested:CameraConstraintRequest;width:number;height:number;bytes:number;quality:string;backend:'IMAGE_CAPTURE'|'CANVAS_VIDEO_INTRINSIC';track:CameraOpenDiagnostics['track'];video:CameraOpenDiagnostics['video'];geometry:NormalizedCameraGeometry;captureViewportInVideo:CaptureViewport;nativeStillPreserved:true;userFacingDerivedDimensions:null}
export type CameraGeometryInventory={
 profile:CameraStreamProfile;requested:CameraConstraintRequest;actual:NormalizedCameraSettings;startupLatencyMs:number|null
 userAgent:string;screen:{width:number;height:number;devicePixelRatio:number;orientation:string|null}
 track:{label:string;kind:string;readyState:string;settings:Record<string,unknown>;constraints:Record<string,unknown>;capabilities:Record<string,unknown>}
 video:{videoWidth:number;videoHeight:number;clientWidth:number;clientHeight:number;rect:{x:number;y:number;width:number;height:number};objectFit:string;objectPosition:string}
 container:{width:number;height:number;aspectRatio:number}
 currentCover:ReturnType<typeof projectObjectFit>
 centeredThreeFour:NormalizedRect
 imageCapture:{available:boolean;photoCapabilities:Record<string,unknown>|null}
 devices:Array<{deviceIdHash:string|null;label:string;groupIdHash:string|null}>
}
export type CameraDiagnosticCapture={inventory:CameraGeometryInventory;intrinsicVideoUrl:string;visibleCoverUrl:string;centerThreeFourUrl:string;nativeStillUrl:string;nativeStill:{width:number;height:number;bytes:number;mimeType:string};estimatedPreviewToStillTransform:TransformEstimate}
export type PreviewReferenceFrame={id:string;capturedAt:string;width:number;height:number;orientation:CameraOrientation;viewport:CaptureViewport;displayViewport:CaptureViewport;compositionGuideRect:CaptureViewport;videoIntrinsic:{width:number;height:number};mirrorState:'MIRRORED'|'NOT_MIRRORED';cameraDeviceIdentity:string|null;streamProfile:CameraStreamProfile;blob:Blob;blobUrl:string;localOnly:true}
export type LocalCaptureCandidate={id:string;source:CaptureSource;previewUrl:string;filePath:string;file?:File;filename:string;orientation:'PORTRAIT'|'LANDSCAPE'|'UNKNOWN';confirmed:false;captureDiagnostics?:CaptureDiagnostics;previewReference?:PreviewReferenceFrame;previewStillAlignment?:PreviewStillAlignmentResultV01;previewStillRegistration?:PreviewStillRegistrationV01;registrationStability?:RegistrationStabilitySummary;registrationError?:string}

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
 private geometryTracker=new CameraGeometryTracker()
 private diagnosticPinnedDeviceId:string|null=null
 private activeProfile:CameraStreamProfile=H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02.previewProfile
 private lastConstraintRequest:CameraConstraintRequest=cameraConstraintRequest(H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02.previewProfile,'environment',false)
 private startupLatencyMs:number|null=null
 private registrationHistory:PreviewStillRegistrationV01[]=[]
 setFacingMode(value:'environment'|'user'){this.facingMode=value}
 private async waitForRelease(delayMs:number){await new Promise(resolve=>setTimeout(resolve,delayMs))}
 private orientation():{device:CameraOrientation;presentation:CameraOrientation}{const type=typeof screen!=='undefined'?screen.orientation?.type||'':'';const fromType:CameraOrientation=type.startsWith('portrait')?'PORTRAIT':type.startsWith('landscape')?'LANDSCAPE':'UNKNOWN';const presentation:CameraOrientation=typeof innerWidth==='number'&&typeof innerHeight==='number'?(innerHeight>=innerWidth?'PORTRAIT':'LANDSCAPE'):fromType;return {device:fromType,presentation}}
 private trackSettings():CameraOpenDiagnostics['track']{const track=this.stream?.getVideoTracks()[0],settings=track?.getSettings() as (MediaTrackSettings&{zoom?:number})|undefined;return {width:settings?.width||null,height:settings?.height||null,aspectRatio:settings?.aspectRatio||((settings?.width&&settings?.height)?settings.width/settings.height:null),frameRate:settings?.frameRate||null,facingMode:settings?.facingMode||null,zoom:typeof settings?.zoom==='number'?settings.zoom:null}}
 diagnostics(previewFps:number|null=null):CameraOpenDiagnostics{const width=this.video?.videoWidth||0,height=this.video?.videoHeight||0,orientation=this.orientation();let snapshot=this.geometryTracker.snapshot();if(!snapshot.geometry)snapshot=this.geometryTracker.recalculate({width,height,deviceOrientation:orientation.device,presentationOrientation:orientation.presentation});return {profile:this.activeProfile,requested:this.lastConstraintRequest,track:this.trackSettings(),video:{width,height,aspectRatio:width&&height?width/height:null},orientation,geometry:snapshot.geometry!,geometryGeneration:snapshot.generation,captureViewport:snapshot.geometry!.previewViewport,previewFps}}
 async measurePreviewFps(durationMs=1200):Promise<number|null>{
  const video=this.video as (HTMLVideoElement&{requestVideoFrameCallback?:(callback:(now:number)=>void)=>number})|null
  if(!video?.requestVideoFrameCallback)return this.trackSettings().frameRate
  return new Promise(resolve=>{let frames=0,finished=false;const started=performance.now();const finish=()=>{if(finished)return;finished=true;const elapsed=performance.now()-started;resolve(elapsed>0?frames*1000/elapsed:null)};const tick=()=>{if(finished)return;frames++;if(performance.now()-started>=durationMs){finish();return}video.requestVideoFrameCallback!(tick)};video.requestVideoFrameCallback(tick);setTimeout(finish,durationMs+250)})
 }
 async diagnosticInventory(containerId:string):Promise<CameraGeometryInventory>{
  if(typeof __XFX_DIAGNOSTIC_MODE__==='undefined'||!__XFX_DIAGNOSTIC_MODE__)throw new Error('DIAGNOSTIC_MODE_DISABLED')
  if(!this.video||!this.stream)throw new Error('DIAGNOSTIC_CAMERA_NOT_OPEN')
  const track=this.stream.getVideoTracks()[0],settings=track.getSettings() as MediaTrackSettings&{zoom?:number},constraints=track.getConstraints(),capabilities=typeof track.getCapabilities==='function'?track.getCapabilities():{}
  const videoRect=this.video.getBoundingClientRect(),host=document.getElementById(containerId),hostRect=host?.getBoundingClientRect();if(!hostRect)throw new Error('DIAGNOSTIC_CONTAINER_MISSING')
  const computed=getComputedStyle(this.video),orientation=screen.orientation?.type||null
  const ImageCaptureConstructor=(globalThis as any).ImageCapture;let photoCapabilities:Record<string,unknown>|null=null
  if(typeof ImageCaptureConstructor==='function'&&track)try{const capture=new ImageCaptureConstructor(track);if(typeof capture.getPhotoCapabilities==='function')photoCapabilities=await capture.getPhotoCapabilities()}catch{}
  let devices:Array<{deviceIdHash:string|null;label:string;groupIdHash:string|null}>=[]
  try{devices=(await navigator.mediaDevices.enumerateDevices()).filter(item=>item.kind==='videoinput').map(item=>({deviceIdHash:hashCameraIdentity(item.deviceId),label:item.label,groupIdHash:hashCameraIdentity(item.groupId)}))}catch{}
  const safeSettings={...settings,deviceId:undefined,groupId:undefined,deviceIdHash:hashCameraIdentity(settings.deviceId),groupIdHash:hashCameraIdentity(settings.groupId)},safeConstraints={...constraints,deviceId:constraints.deviceId?'PINNED_REDACTED':undefined}
  const capabilityRecord=capabilities as Record<string,unknown>,safeCapabilities=Object.fromEntries(['width','height','aspectRatio','frameRate','zoom','resizeMode'].filter(key=>key in capabilityRecord).map(key=>[key,capabilityRecord[key]]))
  return {profile:this.activeProfile,requested:this.lastConstraintRequest,actual:normalizeCameraSettings(settings),startupLatencyMs:this.startupLatencyMs,userAgent:navigator.userAgent,screen:{width:screen.width,height:screen.height,devicePixelRatio:globalThis.devicePixelRatio||1,orientation},track:{label:track.label,kind:track.kind,readyState:track.readyState,settings:safeSettings,constraints:safeConstraints,capabilities:safeCapabilities},video:{videoWidth:this.video.videoWidth,videoHeight:this.video.videoHeight,clientWidth:this.video.clientWidth,clientHeight:this.video.clientHeight,rect:{x:videoRect.x,y:videoRect.y,width:videoRect.width,height:videoRect.height},objectFit:computed.objectFit,objectPosition:computed.objectPosition},container:{width:hostRect.width,height:hostRect.height,aspectRatio:hostRect.width/hostRect.height},currentCover:projectObjectFit(this.video.videoWidth,this.video.videoHeight,hostRect.width,hostRect.height,'cover'),centeredThreeFour:centeredAspectCrop(this.video.videoWidth,this.video.videoHeight,3/4),imageCapture:{available:typeof ImageCaptureConstructor==='function',photoCapabilities},devices}
 }
 async diagnosticCapture(containerId:string):Promise<CameraDiagnosticCapture>{
  if(typeof __XFX_DIAGNOSTIC_MODE__==='undefined'||!__XFX_DIAGNOSTIC_MODE__)throw new Error('DIAGNOSTIC_MODE_DISABLED')
  if(!this.video||!this.stream)throw new Error('DIAGNOSTIC_CAMERA_NOT_OPEN')
  const inventory=await this.diagnosticInventory(containerId),width=this.video.videoWidth,height=this.video.videoHeight
  const source=document.createElement('canvas');source.width=width;source.height=height;const sourceContext=source.getContext('2d',{alpha:false});if(!sourceContext)throw new Error('DIAGNOSTIC_CANVAS_UNAVAILABLE');sourceContext.drawImage(this.video,0,0,width,height)
  const blobUrl=async(canvas:HTMLCanvasElement)=>{const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)throw new Error('DIAGNOSTIC_ENCODE_FAILED');return URL.createObjectURL(blob)}
  const cropCanvas=async(rect:NormalizedRect,targetWidth:number,targetHeight:number)=>{const pixels=rectToPixels(rect,width,height),canvas=document.createElement('canvas');canvas.width=targetWidth;canvas.height=targetHeight;const context=canvas.getContext('2d',{alpha:false});if(!context)throw new Error('DIAGNOSTIC_CANVAS_UNAVAILABLE');context.drawImage(source,pixels.x,pixels.y,pixels.width,pixels.height,0,0,targetWidth,targetHeight);return blobUrl(canvas)}
  const coverRect=inventory.currentCover.visibleSourceRect
  const intrinsicVideoUrl=await blobUrl(source),visibleCoverUrl=await cropCanvas(coverRect,Math.max(1,Math.round(inventory.container.width)),Math.max(1,Math.round(inventory.container.height))),centerThreeFourUrl=await cropCanvas(inventory.centeredThreeFour,720,960)
  const track=this.stream.getVideoTracks()[0],ImageCaptureConstructor=(globalThis as any).ImageCapture;if(typeof ImageCaptureConstructor!=='function')throw new Error('IMAGE_CAPTURE_UNAVAILABLE_FOR_DIAGNOSTIC')
  const still:Blob=await new ImageCaptureConstructor(track).takePhoto();let stillWidth=0,stillHeight=0,estimatedPreviewToStillTransform:TransformEstimate={classification:'MANUAL_VISUAL_ONLY',scale:null,offsetX:null,offsetY:null,confidence:0}
  if(typeof createImageBitmap==='function'){const bitmap=await createImageBitmap(still,{imageOrientation:'from-image'});stillWidth=bitmap.width;stillHeight=bitmap.height;try{const luma=(drawable:CanvasImageSource,sx:number,sy:number,sw:number,sh:number)=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(drawable,sx,sy,sw,sh,0,0,64,64);const rgba=context.getImageData(0,0,64,64).data,out=new Uint8Array(64*64);for(let i=0;i<out.length;i++)out[i]=Math.round(rgba[i*4]*.2126+rgba[i*4+1]*.7152+rgba[i*4+2]*.0722);return out},videoCrop=rectToPixels(inventory.centeredThreeFour,width,height);estimatedPreviewToStillTransform=estimateCentralCropByLuma(luma(source,videoCrop.x,videoCrop.y,videoCrop.width,videoCrop.height),64,64,luma(bitmap,0,0,bitmap.width,bitmap.height),64,64)}catch{}finally{bitmap.close()}}
  return {inventory,intrinsicVideoUrl,visibleCoverUrl,centerThreeFourUrl,nativeStillUrl:URL.createObjectURL(still),nativeStill:{width:stillWidth,height:stillHeight,bytes:still.size,mimeType:still.type},estimatedPreviewToStillTransform}
 }
 private async openWithConstraint(containerId:string,strict:boolean,profile:CameraStreamProfile=H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02.previewProfile,deviceId?:string):Promise<PlatformResult<{facingMode:string}>>{
  if(typeof navigator==='undefined'||!navigator.mediaDevices?.getUserMedia)return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','Camera preview is unavailable in this browser')
  try{
   this.close();this.activeProfile=profile;this.lastConstraintRequest=cameraConstraintRequest(profile,this.facingMode,strict,Boolean(deviceId));const started=performance.now();this.stream=await navigator.mediaDevices.getUserMedia({video:cameraStreamConstraints(profile,this.facingMode,strict,deviceId),audio:false})
   const host=document.getElementById(containerId);if(!host)throw new Error('Camera preview host is unavailable')
   const video=document.createElement('video');video.autoplay=true;video.muted=true;video.playsInline=true;video.setAttribute('aria-label','相机实时预览');video.srcObject=this.stream;host.replaceChildren(video);await video.play();this.video=video
   this.startupLatencyMs=performance.now()-started;const actual=this.stream.getVideoTracks()[0]?.getSettings().facingMode,orientation=this.orientation();this.geometryTracker.recalculate({width:video.videoWidth,height:video.videoHeight,deviceOrientation:orientation.device,presentationOrientation:orientation.presentation})
   return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE',value:{facingMode:actual||this.facingMode}}
  }catch(error){this.close();return cameraFailure(error,'PARTIAL')}
 }
 private async openProductStream(containerId:string,strict:boolean):Promise<PlatformResult<{facingMode:string}>>{
  const profile=H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02.previewProfile,initial=await this.openWithConstraint(containerId,strict,profile)
  if(!initial.ok)return initial
  const resolvedDeviceId=this.stream?.getVideoTracks()[0]?.getSettings().deviceId
  if(!resolvedDeviceId)return initial
  await this.waitForRelease(150)
  const pinned=await this.openWithConstraint(containerId,strict,profile,resolvedDeviceId)
  if(pinned.ok)return pinned
  await this.waitForRelease(250)
  return this.openWithConstraint(containerId,strict,profile)
 }
 async open(containerId:string):Promise<PlatformResult<{facingMode:string}>>{return this.openProductStream(containerId,false)}
 async openDiagnosticProfile(containerId:string,profile:CameraStreamProfile):Promise<PlatformResult<{facingMode:string}>>{
  if(typeof __XFX_DIAGNOSTIC_MODE__==='undefined'||!__XFX_DIAGNOSTIC_MODE__)return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','DIAGNOSTIC_MODE_DISABLED')
  const result=await this.openWithConstraint(containerId,false,profile,this.diagnosticPinnedDeviceId||undefined)
  if(result.ok&&!this.diagnosticPinnedDeviceId)this.diagnosticPinnedDeviceId=this.stream?.getVideoTracks()[0]?.getSettings().deviceId||null
  return result
 }
 resetDiagnosticCameraPin(){this.diagnosticPinnedDeviceId=null}
 async switch(containerId:string):Promise<PlatformResult<{facingMode:string}>>{
  if(this.switching)return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_IN_PROGRESS')
  const previous=this.facingMode;const next=previous==='environment'?'user':'environment';this.switching=true
  try{
   this.close();await this.waitForRelease(300);this.facingMode=next
   let result=await this.openProductStream(containerId,true)
   if(!result.ok){await this.waitForRelease(450);result=await this.openProductStream(containerId,false)}
   if(result.ok&&result.value){
    const actual=result.value.facingMode
    if(actual==='environment'||actual==='user')this.facingMode=actual
    if(actual!==previous)return result
    return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_FAILED_RESTORED')
   }
   this.facingMode=previous;await this.waitForRelease(450);const restored=await this.openProductStream(containerId,false)
   if(restored.ok){this.facingMode=previous;return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_FAILED_RESTORED')}
   return normalizedFailure('CAMERA_FAILURE','PARTIAL','CAMERA_SWITCH_FAILED_CLOSED')
  }finally{this.switching=false}
 }
 private async capturePreviewReference():Promise<PreviewReferenceFrame|null>{
  if(!this.video?.videoWidth||!this.video.videoHeight)return null
  const orientation=this.orientation(),geometry=normalizeCameraGeometry({width:this.video.videoWidth,height:this.video.videoHeight,deviceOrientation:orientation.device,presentationOrientation:orientation.presentation})
  const normalized=document.createElement('canvas');normalized.width=geometry.normalized.width;normalized.height=geometry.normalized.height;const normalizedContext=normalized.getContext('2d',{alpha:false});if(!normalizedContext)return null
  if(geometry.normalized.rotation==='LOGICAL_90'){normalizedContext.translate(normalized.width,0);normalizedContext.rotate(Math.PI/2);normalizedContext.drawImage(this.video,0,0,this.video.videoWidth,this.video.videoHeight)}else normalizedContext.drawImage(this.video,0,0,normalized.width,normalized.height)
  const viewport=geometry.previewViewport,sourceX=Math.round(viewport.x*normalized.width),sourceY=Math.round(viewport.y*normalized.height),sourceWidth=Math.max(1,Math.round(viewport.width*normalized.width)),sourceHeight=Math.max(1,Math.round(viewport.height*normalized.height))
  const canvas=document.createElement('canvas');canvas.width=sourceWidth;canvas.height=sourceHeight;const context=canvas.getContext('2d',{alpha:false});if(!context)return null
  context.drawImage(normalized,sourceX,sourceY,sourceWidth,sourceHeight,0,0,sourceWidth,sourceHeight)
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.86));if(!blob)return null
  const settings=this.stream?.getVideoTracks()[0]?.getSettings()
  return {id:`preview-reference-${Date.now()}`,capturedAt:new Date().toISOString(),width:canvas.width,height:canvas.height,orientation:orientation.presentation,viewport,displayViewport:viewport,compositionGuideRect:viewport,videoIntrinsic:{width:this.video.videoWidth,height:this.video.videoHeight},mirrorState:this.facingMode==='user'?'MIRRORED':'NOT_MIRRORED',cameraDeviceIdentity:hashCameraIdentity(settings?.deviceId),streamProfile:this.activeProfile,blob,blobUrl:URL.createObjectURL(blob),localOnly:true}
 }
 async capture():Promise<PlatformResult<LocalCaptureCandidate>>{
  if(!this.video||!this.video.videoWidth||!this.video.videoHeight)return normalizedFailure('CAMERA_FAILURE','PARTIAL','Camera preview is not ready')
  const previewReference=await this.capturePreviewReference()
  const track=this.stream?.getVideoTracks()[0];let blob:Blob|null=null;let backend:CaptureDiagnostics['backend']='CANVAS_VIDEO_INTRINSIC';let quality='JPEG_0.95'
  const ImageCaptureConstructor=(globalThis as any).ImageCapture
  if(track&&typeof ImageCaptureConstructor==='function')try{blob=await new ImageCaptureConstructor(track).takePhoto();backend='IMAGE_CAPTURE';quality='DEVICE_NATIVE'}catch{}
  if(!blob){const canvas=document.createElement('canvas');canvas.width=this.video.videoWidth;canvas.height=this.video.videoHeight;const context=canvas.getContext('2d',{alpha:false});if(!context)return normalizedFailure('CAMERA_FAILURE','PARTIAL','Canvas fallback is unavailable');context.drawImage(this.video,0,0,canvas.width,canvas.height);blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',0.95))}
  if(!blob)return normalizedFailure('CAMERA_FAILURE','PARTIAL','Still image could not be created')
  let width=this.video.videoWidth,height=this.video.videoHeight
  if(typeof createImageBitmap==='function')try{const bitmap=await createImageBitmap(blob,{imageOrientation:'from-image'});width=bitmap.width;height=bitmap.height;bitmap.close()}catch{}
  const candidateId=`local-${Date.now()}`,extension=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';const file=new File([blob],`capture-${Date.now()}.${extension}`,{type:blob.type||'image/jpeg'});const previewUrl=URL.createObjectURL(file)
  const orientation=this.orientation(),geometry=normalizeCameraGeometry({width:this.video.videoWidth,height:this.video.videoHeight,deviceOrientation:orientation.device,presentationOrientation:orientation.presentation,stillWidth:width,stillHeight:height,relation:'UNKNOWN'})
  const stillOrientation:CameraOrientation=height>=width?'PORTRAIT':'LANDSCAPE',previewStillAlignment=previewReference?classifyPreviewStillAlignment({previewReferenceId:previewReference.id,nativeStillId:candidateId,alignmentMode:'UNSUPPORTED',previewWidth:previewReference.width,previewHeight:previewReference.height,stillWidth:width,stillHeight:height,normalizedPreviewOrientation:previewReference.orientation,normalizedStillOrientation:stillOrientation,cropRectNormalized:fullViewport(width/height),scaleX:1,scaleY:1,translationX:0,translationY:0,mirrorX:false,mirrorY:false,confidence:0,residualError:1,generation:1,source:'CAPTURE_TIME_REFERENCE'}):undefined
  let previewStillRegistration:PreviewStillRegistrationV01|undefined,registrationStability:RegistrationStabilitySummary|undefined,registrationError:string|undefined
  if(previewReference)try{
   previewStillRegistration=await registerPreviewStillBlobs({previewBlob:previewReference.blob,stillBlob:blob,previewReferenceId:previewReference.id,nativeStillId:candidateId,previewWidth:previewReference.width,previewHeight:previewReference.height,previewOrientation:previewReference.orientation,stillOrientation,cameraDeviceIdentity:previewReference.cameraDeviceIdentity,streamProfile:previewReference.streamProfile,sameCameraDevice:true})
   this.registrationHistory.push(previewStillRegistration)
   const comparable=this.registrationHistory.filter(value=>value.camera_device_identity===previewStillRegistration!.camera_device_identity&&value.stream_profile===previewStillRegistration!.stream_profile).slice(-5)
   registrationStability=classifyRegistrationStability(comparable);previewStillRegistration.stability_class=registrationStability.classification
  }catch(error){registrationError=error instanceof Error?error.message:String(error)}
  return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE',value:{id:candidateId,source:'camera',previewUrl,filePath:previewUrl,file,filename:file.name,orientation:stillOrientation,confirmed:false,previewReference:previewReference||undefined,previewStillAlignment,previewStillRegistration,registrationStability,registrationError,captureDiagnostics:{profile:this.activeProfile,requested:this.lastConstraintRequest,width,height,bytes:blob.size,quality,backend,track:this.trackSettings(),video:{width:this.video.videoWidth,height:this.video.videoHeight,aspectRatio:this.video.videoWidth/this.video.videoHeight},geometry,captureViewportInVideo:geometry.previewViewport,nativeStillPreserved:true,userFacingDerivedDimensions:null}}}
 }
 close(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;this.geometryTracker.invalidate();if(this.video){this.video.srcObject=null;this.video.remove();this.video=null}}
}

export class PlatformAdapterRegistry{
 readonly platform:RuntimePlatform
 readonly descriptors:AdapterDescriptor[]
 lastUploadAttempt:UploadAttemptTelemetry|null=null
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

 async uploadCandidate(candidate:LocalCaptureCandidate,context?:UploadContext):Promise<PlatformResult<UploadedAsset>>{
  const started=Date.now(),startedAt=new Date(started).toISOString();let httpStatus:number|null=null,originReached=false
  const record=(result:UploadAttemptTelemetry['result'])=>{const ended=Date.now();this.lastUploadAttempt={candidateId:candidate.id,attemptId:context?.attemptId||`attempt-${started}`,sessionId:context?.sessionId||'unknown',bytes:candidate.file?.size||0,mime:candidate.file?.type||'unknown',startedAt,endedAt:new Date(ended).toISOString(),durationMs:ended-started,result,httpStatus,originReached,retryCount:context?.retryCount||0}}
  try{
   if(this.platform==='H5'&&candidate.file){
    const body=new FormData();body.append('file',candidate.file,candidate.filename)
    const headers:Record<string,string>={};if(context){headers['Idempotency-Key']=context.idempotencyKey;headers['X-XFX-Upload-Attempt-ID']=context.attemptId;headers['X-XFX-Session-ID']=context.sessionId}
    const response=await fetch(`${API_BASE}/assets/uploads`,{method:'POST',body,headers});httpStatus=response.status;originReached=true;const data=await response.text()
    if(response.status!==201){record(response.status>=500?'RETRYABLE_FAILED':'FAILED');return normalizedFailure(response.status===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',data)}
    record('SUCCEEDED')
    return {ok:true,code:'OK',supportLevel:'SUPPORTED',value:JSON.parse(data) as UploadedAsset}
   }
   const response=await Taro.uploadFile({url:`${API_BASE}/assets/uploads`,filePath:candidate.filePath,name:'file',header:context?{'Idempotency-Key':context.idempotencyKey,'X-XFX-Upload-Attempt-ID':context.attemptId,'X-XFX-Session-ID':context.sessionId}:undefined})
   httpStatus=response.statusCode;originReached=true;if(response.statusCode!==201){record(response.statusCode>=500?'RETRYABLE_FAILED':'FAILED');return normalizedFailure(response.statusCode===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',response.data)}
   record('SUCCEEDED')
   return {ok:true,code:'OK',supportLevel:this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'SUPPORTED',value:JSON.parse(response.data) as UploadedAsset}
  }catch(error){record('RETRYABLE_FAILED');const message=error instanceof Error?error.message:String(error);return normalizedFailure(message.toLowerCase().includes('network')||!originReached?'NETWORK_UNAVAILABLE':'STORAGE_FAILURE',this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL',message)}
 }

 async uploadDerived(sessionId:string,artifact:{blob?:Blob;filePath?:string;bytes?:number},idempotencyKey:string):Promise<PlatformResult<UploadedAsset>>{
  if(this.platform==='WECHAT'){
   if(!artifact.filePath)return normalizedFailure('INVALID_ASSET','UNVERIFIED_REAL_DEVICE','WECHAT_DERIVED_FILE_PATH_MISSING')
   try{const response=await Taro.uploadFile({url:`${API_BASE}/sessions/${sessionId}/fine-tune/derived`,filePath:artifact.filePath,name:'file',header:{'Idempotency-Key':idempotencyKey}});if(response.statusCode!==201)return normalizedFailure(response.statusCode===422?'INVALID_ASSET':'STORAGE_FAILURE','UNVERIFIED_REAL_DEVICE',response.data);return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE',value:JSON.parse(response.data) as UploadedAsset}}catch(error){return normalizedFailure('STORAGE_FAILURE','UNVERIFIED_REAL_DEVICE',error instanceof Error?error.message:String(error))}
  }
  if(!artifact.blob)return normalizedFailure('INVALID_ASSET','SUPPORTED','DERIVED_BLOB_MISSING')
  try{
   const body=new FormData();body.append('file',new File([artifact.blob],`fine-tune-${sessionId}.jpg`,{type:'image/jpeg'}))
   const response=await fetch(`${API_BASE}/sessions/${sessionId}/fine-tune/derived`,{method:'POST',body,headers:{'Idempotency-Key':idempotencyKey}});const data=await response.text()
   if(response.status!==201)return normalizedFailure(response.status===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',data)
   return {ok:true,code:'OK',supportLevel:'SUPPORTED',value:JSON.parse(data) as UploadedAsset}
  }catch(error){return normalizedFailure('STORAGE_FAILURE','PARTIAL',error instanceof Error?error.message:String(error))}
 }

 async download(url:string,filename='xiangfengxing-final.jpg'):Promise<PlatformResult>{
  if(this.platform==='WECHAT'){
   try{
    const downloaded=await Taro.downloadFile({url})
    if(downloaded.statusCode!==200)return normalizedFailure('STORAGE_FAILURE','UNVERIFIED_REAL_DEVICE',`WECHAT_DOWNLOAD_HTTP_${downloaded.statusCode}`)
    await Taro.saveImageToPhotosAlbum({filePath:downloaded.tempFilePath})
    return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE'}
   }catch(error){const message=error instanceof Error?error.message:String(error);return normalizedFailure(message.toLowerCase().includes('auth deny')?'SAVE_TO_ALBUM_DENIED':'STORAGE_FAILURE','UNVERIFIED_REAL_DEVICE',message)}
  }
  try{const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.rel='noopener';document.body.appendChild(anchor);anchor.click();anchor.remove();return {ok:true,code:'OK',supportLevel:'SUPPORTED'}}catch{return normalizedFailure('STORAGE_FAILURE','PARTIAL','Browser download failed')}
 }

 async share(url:string):Promise<PlatformResult>{
  if(this.platform==='WECHAT'){
   try{const downloaded=await Taro.downloadFile({url});if(downloaded.statusCode!==200)return normalizedFailure('SHARE_FAILURE','UNVERIFIED_REAL_DEVICE',`WECHAT_DOWNLOAD_HTTP_${downloaded.statusCode}`);await Taro.showShareImageMenu({path:downloaded.tempFilePath});return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE'}}
   catch(error){return normalizedFailure('SHARE_FAILURE','UNVERIFIED_REAL_DEVICE',error instanceof Error?error.message:String(error))}
  }
  if(this.platform==='H5'&&typeof navigator!=='undefined'&&typeof navigator.share==='function'){
   try{await navigator.share({title:'向风行 · My Final Photo',url});return {ok:true,code:'OK',supportLevel:'PARTIAL'}}catch(error){return normalizedFailure(error instanceof DOMException&&error.name==='AbortError'?'USER_CANCELLED':'SHARE_FAILURE','PARTIAL',String(error))}
  }
  return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','Share capability is unavailable in this runtime')
 }
}

export const platformRegistry=new PlatformAdapterRegistry()
