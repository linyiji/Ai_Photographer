export type CaptureViewport={x:number;y:number;width:number;height:number;aspectRatio:number}
export type CameraOrientation='PORTRAIT'|'LANDSCAPE'|'UNKNOWN'
export type PreviewStillRelation='VALIDATED_IDENTICAL'|'KNOWN_DIFFERENT'|'UNKNOWN'
export type NormalizedCameraGeometry={
 raw:{width:number;height:number;aspectRatio:number|null};deviceOrientation:CameraOrientation;presentationOrientation:CameraOrientation
 normalized:{width:number;height:number;aspectRatio:number|null;rotation:'NONE'|'LOGICAL_90'};previewViewport:CaptureViewport
 still:{width:number|null;height:number|null};mappingMode:'IDENTITY_VALIDATED'|'PROJECTION_REQUIRED'|'FOV_UNVALIDATED'|'SAFE_FALLBACK'
 mappingConfidence:'HIGH'|'MEDIUM'|'LOW';source:'ORIENTATION_NORMALIZED'|'INTRINSIC'|'UNKNOWN_FALLBACK'
}

export const CAPTURE_FRAME_ASPECT=3/4

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

export function cameraVideoConstraints(facingMode:'environment'|'user',strict:boolean):MediaTrackConstraints{
 return {facingMode:strict?{exact:facingMode}:{ideal:facingMode},width:{ideal:1440},height:{ideal:1920},aspectRatio:{ideal:CAPTURE_FRAME_ASPECT},frameRate:{ideal:30}}
}
