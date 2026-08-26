export type NormalizedRect={x0:number;y0:number;x1:number;y1:number}
export type Projection={
 source:{width:number;height:number;aspect:number}
 container:{width:number;height:number;aspect:number}
 fit:'cover'|'contain'
 rendered:{width:number;height:number;offsetX:number;offsetY:number;scale:number}
 crop:{left:number;right:number;top:number;bottom:number}
 visibleSourceRect:NormalizedRect
}

const bounded=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value))

export function projectObjectFit(sourceWidth:number,sourceHeight:number,containerWidth:number,containerHeight:number,fit:'cover'|'contain'='cover',positionX=.5,positionY=.5):Projection{
 if(sourceWidth<=0||sourceHeight<=0||containerWidth<=0||containerHeight<=0)throw new Error('INVALID_GEOMETRY')
 const scaleX=containerWidth/sourceWidth,scaleY=containerHeight/sourceHeight
 const scale=fit==='cover'?Math.max(scaleX,scaleY):Math.min(scaleX,scaleY)
 const width=sourceWidth*scale,height=sourceHeight*scale
 const offsetX=(containerWidth-width)*bounded(positionX),offsetY=(containerHeight-height)*bounded(positionY)
 const left=Math.max(0,-offsetX),right=Math.max(0,width-containerWidth+offsetX),top=Math.max(0,-offsetY),bottom=Math.max(0,height-containerHeight+offsetY)
 return {
  source:{width:sourceWidth,height:sourceHeight,aspect:sourceWidth/sourceHeight},
  container:{width:containerWidth,height:containerHeight,aspect:containerWidth/containerHeight},
  fit,rendered:{width,height,offsetX,offsetY,scale},crop:{left,right,top,bottom},
  visibleSourceRect:{x0:bounded(left/scale/sourceWidth),y0:bounded(top/scale/sourceHeight),x1:bounded(1-right/scale/sourceWidth),y1:bounded(1-bottom/scale/sourceHeight)}
 }
}

export function centeredAspectCrop(sourceWidth:number,sourceHeight:number,targetAspect:number):NormalizedRect{
 if(sourceWidth<=0||sourceHeight<=0||targetAspect<=0)throw new Error('INVALID_GEOMETRY')
 const sourceAspect=sourceWidth/sourceHeight
 if(Math.abs(sourceAspect-targetAspect)<1e-9)return {x0:0,y0:0,x1:1,y1:1}
 if(sourceAspect>targetAspect){const visibleWidth=targetAspect/sourceAspect;return {x0:(1-visibleWidth)/2,y0:0,x1:(1+visibleWidth)/2,y1:1}}
 const visibleHeight=sourceAspect/targetAspect
 return {x0:0,y0:(1-visibleHeight)/2,x1:1,y1:(1+visibleHeight)/2}
}

export function rectToPixels(rect:NormalizedRect,width:number,height:number){return {x:rect.x0*width,y:rect.y0*height,width:(rect.x1-rect.x0)*width,height:(rect.y1-rect.y0)*height}}

export type TransformEstimate={classification:'CENTER_CROP_ONLY'|'UNIFORM_SCALE_PLUS_CROP'|'OFFSET_CROP'|'NON_UNIFORM_OR_DIFFERENT_FOV'|'MANUAL_VISUAL_ONLY';scale:number|null;offsetX:number|null;offsetY:number|null;confidence:number}

export function estimateCentralCropByLuma(source:Uint8Array,sourceWidth:number,sourceHeight:number,target:Uint8Array,targetWidth:number,targetHeight:number):TransformEstimate{
 if(source.length!==sourceWidth*sourceHeight||target.length!==targetWidth*targetHeight||sourceWidth<8||sourceHeight<8||targetWidth<8||targetHeight<8)return {classification:'MANUAL_VISUAL_ONLY',scale:null,offsetX:null,offsetY:null,confidence:0}
 let best={score:-Infinity,scale:1,ox:0,oy:0},second=-Infinity
 const sample=(data:Uint8Array,w:number,h:number,x:number,y:number)=>data[Math.max(0,Math.min(h-1,Math.round(y)))*w+Math.max(0,Math.min(w-1,Math.round(x)))]
 for(const scale of [.65,.7,.75,.8,.85,.9,.95,1])for(const ox of [-.12,-.06,0,.06,.12])for(const oy of [-.12,-.06,0,.06,.12]){
  let sumA=0,sumB=0,sumAA=0,sumBB=0,sumAB=0,n=0
  for(let gy=0;gy<16;gy++)for(let gx=0;gx<16;gx++){
   const tx=(gx+.5)/16,ty=(gy+.5)/16
   const sx=(.5+(tx-.5)*scale+ox)*sourceWidth,sy=(.5+(ty-.5)*scale+oy)*sourceHeight
   if(sx<0||sy<0||sx>=sourceWidth||sy>=sourceHeight)continue
   const a=sample(source,sourceWidth,sourceHeight,sx,sy),b=sample(target,targetWidth,targetHeight,tx*targetWidth,ty*targetHeight)
   sumA+=a;sumB+=b;sumAA+=a*a;sumBB+=b*b;sumAB+=a*b;n++
  }
  const numerator=n*sumAB-sumA*sumB,denominator=Math.sqrt(Math.max(1e-9,(n*sumAA-sumA*sumA)*(n*sumBB-sumB*sumB))),score=n?numerator/denominator:-1
  if(score>best.score){second=best.score;best={score,scale,ox,oy}}else if(score>second)second=score
 }
 const confidence=bounded((best.score-.45)/.45)*bounded((best.score-second)/.08)
 if(best.score<.55||confidence<.25)return {classification:'MANUAL_VISUAL_ONLY',scale:best.scale,offsetX:best.ox,offsetY:best.oy,confidence}
 const offset=Math.abs(best.ox)+Math.abs(best.oy)
 return {classification:offset>.04?'OFFSET_CROP':best.scale<.97?'UNIFORM_SCALE_PLUS_CROP':'CENTER_CROP_ONLY',scale:best.scale,offsetX:best.ox,offsetY:best.oy,confidence}
}
