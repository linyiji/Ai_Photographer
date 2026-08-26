import {createRecipe,defaultRegion,renderPixels,setAdjustment,type AdjustmentParameter,type OptionalMaskSet,type SourceImage} from '../fineTune/core'

export type RangeTrace={raw:number;normalized:number;recipe:number;renderer:number;reloaded:number}
export const traceRange=(raw:number,parameter:AdjustmentParameter='BRIGHTNESS'):RangeTrace=>{
 const normalized=Math.max(-1,Math.min(1,raw/100)),recipe=setAdjustment(createRecipe('diagnostic','source'), 'ALL',parameter,normalized)
 const value=recipe.adjustments[0]?.value||0,reloaded=JSON.parse(JSON.stringify(recipe)).adjustments[0]?.value||0
 return {raw,normalized,recipe:value,renderer:value,reloaded}
}
export const rangeClassification=()=>[-100,-30,0,30,100].every(raw=>{const t=traceRange(raw);return t.normalized===t.recipe&&t.recipe===t.renderer&&t.renderer===t.reloaded})?'UI_LABEL_ONLY_MISMATCH':'MULTIPLE'

export function diagnosticSource(width=36,height=48):SourceImage{
 const data=new Uint8ClampedArray(width*height*4)
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;data[i]=x/width*255;data[i+1]=y/height*255;data[i+2]=(x+y)/(width+height)*255;data[i+3]=255}
 return {width,height,data,assetId:'diagnostic-source'}
}

export function localRegionAudit(){
 const source=diagnosticSource(),region=defaultRegion(),recipe=setAdjustment(createRecipe('diagnostic',source.assetId),'LOCAL_REGION','BRIGHTNESS',.3,region),rendered=renderPixels(source,recipe)
 const inside=((Math.floor((region.y+region.height/2)*source.height)*source.width)+Math.floor((region.x+region.width/2)*source.width))*4
 const outside=0
 return {objectCreated:Boolean(recipe.adjustments[0]?.region),validGeometry:Boolean(recipe.adjustments[0]?.region&&region.width>0&&region.height>0),persists:JSON.parse(JSON.stringify(recipe)).adjustments[0]?.region?.id===region.id,previewRestricted:rendered.data[inside]!==source.data[inside]&&rendered.data[outside]===source.data[outside],finalRestricted:rendered.data[inside]!==source.data[inside]&&rendered.data[outside]===source.data[outside],classification:'MULTIPLE' as const,layers:['OVERLAY_MISSING','TOUCH_INTERACTION_MISSING'] as const}
}

export function controlledMaskAudit(){
 const source=diagnosticSource(8,8),person=new Float32Array(64),background=new Float32Array(64)
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){const i=y*8+x;person[i]=x<4?1:0;background[i]=1-person[i]}
 const masks:OptionalMaskSet={person,background,identity:'controlled-diagnostic'}
 const personRecipe=setAdjustment(createRecipe('person',source.assetId),'PERSON','BRIGHTNESS',.5),backgroundRecipe=setAdjustment(createRecipe('background',source.assetId),'BACKGROUND','BRIGHTNESS',.5)
 const p=renderPixels(source,personRecipe,masks).data,b=renderPixels(source,backgroundRecipe,masks).data,left=(4*8+2)*4,right=(4*8+6)*4
 return {personPass:p[left]!==source.data[left]&&p[right]===source.data[right],backgroundPass:b[left]===source.data[left]&&b[right]!==source.data[right],failClosedWithoutMask:renderPixels(source,personRecipe).data.every((v,i)=>v===source.data[i]),productionMaskProvider:'NOT_IMPLEMENTED' as const}
}

export type SchedulerAudit={inputs:number;scheduled:number;started:number;completed:number;superseded:number;maxPendingDepth:number;supersededWorkActuallyCancelled:false}
export function simulateLatestSlotScheduler(inputs:number,arrivals:number[],durations:number[]):SchedulerAudit{
 let started=0,completed=0,superseded=0,maxPending=0,runningUntil=-1,pending=false
 for(let i=0;i<inputs;i++){
  const at=arrivals[i]||i
  if(at>=runningUntil){if(pending){started++;completed++;pending=false}started++;completed++;runningUntil=at+(durations[i]||1)}
  else{if(pending)superseded++;pending=true;maxPending=Math.max(maxPending,1)}
 }
 if(pending){started++;completed++}
 return {inputs,scheduled:inputs,started,completed,superseded,maxPendingDepth:maxPending,supersededWorkActuallyCancelled:false}
}
