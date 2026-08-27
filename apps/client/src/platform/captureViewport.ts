export type CaptureViewport={x:number;y:number;width:number;height:number;aspectRatio:number}
export type CameraOrientation='PORTRAIT'|'LANDSCAPE'|'UNKNOWN'
export type PreviewStillRelation='VALIDATED_IDENTICAL'|'KNOWN_DIFFERENT'|'UNKNOWN'
export type CameraStreamProfile='MAIN_CURRENT'|'LIVE_LIKE'|'RELAXED'
export type CameraConstraintRequest={profile:CameraStreamProfile;facingMode:'environment'|'user';strictFacing:boolean;pinnedDevice:boolean;width:number|null;height:number|null;aspectRatio:number|null;frameRate:number}
export type NormalizedCameraSettings={width:number|null;height:number|null;aspectRatio:number|null;frameRate:number|null;facingMode:string|null;resizeMode:string|null;zoom:number|null;deviceIdHash:string|null;groupIdHash:string|null}
export type NormalizedCameraGeometry={
 raw:{width:number;height:number;aspectRatio:number|null};deviceOrientation:CameraOrientation;presentationOrientation:CameraOrientation
 normalized:{width:number;height:number;aspectRatio:number|null;rotation:'NONE'|'LOGICAL_90'};previewViewport:CaptureViewport
 still:{width:number|null;height:number|null};mappingMode:'IDENTITY_VALIDATED'|'PROJECTION_REQUIRED'|'FOV_UNVALIDATED'|'SAFE_FALLBACK'
 mappingConfidence:'HIGH'|'MEDIUM'|'LOW';source:'ORIENTATION_NORMALIZED'|'INTRINSIC'|'UNKNOWN_FALLBACK'
}

export const CAPTURE_FRAME_ASPECT=3/4
export const H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02={strategy:'DECOUPLED_PREVIEW_STREAM',previewProfile:'LIVE_LIKE' as CameraStreamProfile,finalCompositionAspect:CAPTURE_FRAME_ASPECT,streamAspectCoupledToComposition:false} as const

export function captureViewportForVideo(width:number,height:number,aspectRatio=CAPTURE_FRAME_ASPECT):CaptureViewport{
 if(width<=0||height<=0||aspectRatio<=0)return {x:0,y:0,width:1,height:1,aspectRatio}
 const videoAspect=width/height
 if(Math.abs(videoAspect-aspectRatio)<.001)return {x:0,y:0,width:1,height:1,aspectRatio}
 if(videoAspect<aspectRatio){const normalizedHeight=videoAspect/aspectRatio;return {x:0,y:(1-normalizedHeight)/2,width:1,height:normalizedHeight,aspectRatio}}
 const normalizedWidth=aspectRatio/videoAspect
 return {x:(1-normalizedWidth)/2,y:0,width:normalizedWidth,height:1,aspectRatio}
}

export function captureFrameStyle(width:number,height:number){
 const frame=captureViewportForVideo(width,height)
 return {left:`${frame.x*100}%`,top:`${frame.y*100}%`,width:`${frame.width*100}%`,height:`${frame.height*100}%`}
}

export function normalizeCameraGeometry(input:{width:number;height:number;deviceOrientation?:CameraOrientation;presentationOrientation?:CameraOrientation;stillWidth?:number|null;stillHeight?:number|null;relation?:PreviewStillRelation}):NormalizedCameraGeometry{
 const {width,height}=input,deviceOrientation=input.deviceOrientation||'UNKNOWN',presentationOrientation=input.presentationOrientation||deviceOrientation
 const valid=width>0&&height>0
 const desired=presentationOrientation!=='UNKNOWN'?presentationOrientation:deviceOrientation
 const rawOrientation:CameraOrientation=!valid?'UNKNOWN':height>=width?'PORTRAIT':'LANDSCAPE'
 const rotate=valid&&desired!=='UNKNOWN'&&rawOrientation!==desired
 const normalizedWidth=rotate?height:width,normalizedHeight=rotate?width:height
 const relation=input.relation||'UNKNOWN'
 let mappingMode:NormalizedCameraGeometry['mappingMode']='FOV_UNVALIDATED',mappingConfidence:NormalizedCameraGeometry['mappingConfidence']='LOW'
 if(!valid||desired==='UNKNOWN')mappingMode='SAFE_FALLBACK'
 else if(relation==='VALIDATED_IDENTICAL'){mappingMode='IDENTITY_VALIDATED';mappingConfidence='HIGH'}
 else if(relation==='KNOWN_DIFFERENT'){mappingMode='PROJECTION_REQUIRED';mappingConfidence='HIGH'}
 return {raw:{width,height,aspectRatio:valid?width/height:null},deviceOrientation,presentationOrientation,normalized:{width:normalizedWidth,height:normalizedHeight,aspectRatio:valid?normalizedWidth/normalizedHeight:null,rotation:rotate?'LOGICAL_90':'NONE'},previewViewport:captureViewportForVideo(normalizedWidth,normalizedHeight),still:{width:input.stillWidth??null,height:input.stillHeight??null},mappingMode,mappingConfidence,source:!valid?'UNKNOWN_FALLBACK':rotate?'ORIENTATION_NORMALIZED':'INTRINSIC'}
}

export class CameraGeometryTracker{
 private generation=0;private current:NormalizedCameraGeometry|null=null
 recalculate(input:Parameters<typeof normalizeCameraGeometry>[0]){this.generation++;this.current=normalizeCameraGeometry(input);return {generation:this.generation,geometry:this.current}}
 invalidate(){this.current=null}
 snapshot(){return {generation:this.generation,geometry:this.current}}
}

export function cameraConstraintRequest(profile:CameraStreamProfile,facingMode:'environment'|'user',strictFacing:boolean,pinnedDevice=false):CameraConstraintRequest{
 if(profile==='MAIN_CURRENT')return {profile,facingMode,strictFacing,pinnedDevice,width:1440,height:1920,aspectRatio:CAPTURE_FRAME_ASPECT,frameRate:30}
 if(profile==='LIVE_LIKE')return {profile,facingMode,strictFacing,pinnedDevice,width:1280,height:720,aspectRatio:null,frameRate:30}
 return {profile,facingMode,strictFacing,pinnedDevice,width:null,height:null,aspectRatio:null,frameRate:30}
}

export function cameraStreamConstraints(profile:CameraStreamProfile,facingMode:'environment'|'user',strict:boolean,deviceId?:string):MediaTrackConstraints{
 const request=cameraConstraintRequest(profile,facingMode,strict,Boolean(deviceId)),constraints:MediaTrackConstraints={facingMode:strict?{exact:facingMode}:{ideal:facingMode},frameRate:{ideal:request.frameRate}}
 if(request.width)constraints.width={ideal:request.width}
 if(request.height)constraints.height={ideal:request.height}
 if(request.aspectRatio)constraints.aspectRatio={ideal:request.aspectRatio}
 if(deviceId)constraints.deviceId={exact:deviceId}
 return constraints
}

export function cameraVideoConstraints(facingMode:'environment'|'user',strict:boolean):MediaTrackConstraints{
 return cameraStreamConstraints('MAIN_CURRENT',facingMode,strict)
}

export function productCameraVideoConstraints(facingMode:'environment'|'user',strict:boolean,resolvedDeviceId?:string):MediaTrackConstraints{
 return cameraStreamConstraints(H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02.previewProfile,facingMode,strict,resolvedDeviceId)
}

export function hashCameraIdentity(value:string|undefined|null):string|null{
 if(!value)return null
 let hash=2166136261
 for(let index=0;index<value.length;index++){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619)}
 return `fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`
}

export function normalizeCameraSettings(settings:MediaTrackSettings&{zoom?:number;resizeMode?:string}):NormalizedCameraSettings{
 const width=typeof settings.width==='number'?settings.width:null,height=typeof settings.height==='number'?settings.height:null
 return {width,height,aspectRatio:typeof settings.aspectRatio==='number'?settings.aspectRatio:(width&&height?width/height:null),frameRate:typeof settings.frameRate==='number'?settings.frameRate:null,facingMode:typeof settings.facingMode==='string'?settings.facingMode:null,resizeMode:typeof settings.resizeMode==='string'?settings.resizeMode:null,zoom:typeof settings.zoom==='number'?settings.zoom:null,deviceIdHash:hashCameraIdentity(settings.deviceId),groupIdHash:hashCameraIdentity(settings.groupId)}
}
