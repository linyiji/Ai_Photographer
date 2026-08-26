export type CaptureViewport={x:number;y:number;width:number;height:number;aspectRatio:number}

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

export function cameraVideoConstraints(facingMode:'environment'|'user',strict:boolean):MediaTrackConstraints{
 return {facingMode:strict?{exact:facingMode}:{ideal:facingMode},width:{ideal:1440},height:{ideal:1920},aspectRatio:{ideal:CAPTURE_FRAME_ASPECT},frameRate:{ideal:30}}
}
