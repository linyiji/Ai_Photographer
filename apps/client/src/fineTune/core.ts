export type AdjustmentScope='ALL'|'PERSON'|'BACKGROUND'|'LOCAL_REGION'
export type AdjustmentParameter='BRIGHTNESS'|'WARMTH'|'SATURATION'|'SOFTNESS'|'BLUR'
export type LocalRegion={id:string;x:number;y:number;width:number;height:number;feather:number}
export type Adjustment={scope:AdjustmentScope;parameter:AdjustmentParameter;value:number;region?:LocalRegion|null}
export type AdjustmentRecipe={schema_version:'1.0.0';recipe_id:string;session_id:string;source_asset_id:string;created_at:string;semantic_edit_allowed:false;adjustments:Adjustment[]}
export type SourceImage={width:number;height:number;data:Uint8ClampedArray;assetId:string}
export type OptionalMaskSet={person?:Float32Array;background?:Float32Array;identity?:string}
export const RUNTIME_VERSION='main-fine-tune-1.0.0'
export const MAX_LOCAL_REGIONS=3
export const PARAMETERS:AdjustmentParameter[]=['BRIGHTNESS','WARMTH','SATURATION','SOFTNESS']
export const clamp=(value:number)=>Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0
export const clampRegion=(region:LocalRegion):LocalRegion=>{const width=Math.max(.04,Math.min(1,region.width));const height=Math.max(.04,Math.min(1,region.height));return {...region,width,height,x:Math.max(0,Math.min(1-width,region.x)),y:Math.max(0,Math.min(1-height,region.y)),feather:Math.max(.04,Math.min(.45,region.feather))}}
export const defaultRegion=(index=0):LocalRegion=>clampRegion({id:`local-${index+1}`,x:.24+index*.08,y:.22+index*.06,width:.42,height:.44,feather:.22})
export const createRecipe=(sessionId:string,sourceAssetId:string):AdjustmentRecipe=>({schema_version:'1.0.0',recipe_id:`recipe-${sessionId}`,session_id:sessionId,source_asset_id:sourceAssetId,created_at:new Date().toISOString(),semantic_edit_allowed:false,adjustments:[]})
export const cloneRecipe=(recipe:AdjustmentRecipe):AdjustmentRecipe=>JSON.parse(JSON.stringify(recipe))
export function setAdjustment(recipe:AdjustmentRecipe,scope:AdjustmentScope,parameter:AdjustmentParameter,value:number,region?:LocalRegion):AdjustmentRecipe{
 if(parameter==='BLUR'&&scope!=='BACKGROUND')throw new Error('BLUR_REQUIRES_BACKGROUND')
 if(scope==='LOCAL_REGION'&&!region)throw new Error('LOCAL_REGION_REQUIRES_GEOMETRY')
 const next=cloneRecipe(recipe);next.semantic_edit_allowed=false;next.adjustments=next.adjustments.filter(item=>!(item.scope===scope&&item.parameter===parameter&&(scope!=='LOCAL_REGION'||item.region?.id===region?.id)))
 const normalized=clamp(value);if(Math.abs(normalized)>.0001)next.adjustments.push({scope,parameter,value:normalized,...(scope==='LOCAL_REGION'?{region:clampRegion(region!)}:{})});return next
}
export function validateRecipe(recipe:AdjustmentRecipe):void{
 if(recipe.schema_version!=='1.0.0'||recipe.semantic_edit_allowed!==false)throw new Error('INVALID_RECIPE_POLICY')
 const regions=new Map<string,string>();for(const item of recipe.adjustments){if(!PARAMETERS.includes(item.parameter)&&item.parameter!=='BLUR')throw new Error('DEFERRED_PARAMETER');if(item.parameter==='BLUR'&&item.scope!=='BACKGROUND')throw new Error('BLUR_REQUIRES_BACKGROUND');if(item.scope==='LOCAL_REGION'){if(!item.region)throw new Error('LOCAL_REGION_REQUIRES_GEOMETRY');const bounded=clampRegion(item.region);if(JSON.stringify(bounded)!==JSON.stringify(item.region))throw new Error('INVALID_REGION');const shape=JSON.stringify(item.region);if(regions.has(item.region.id)&&regions.get(item.region.id)!==shape)throw new Error('REGION_CONFLICT');regions.set(item.region.id,shape)}}if(regions.size>MAX_LOCAL_REGIONS)throw new Error('TOO_MANY_REGIONS')
}
const byte=(value:number)=>Number.isFinite(value)?Math.max(0,Math.min(255,Math.round(value))):0
const brightness=(channel:number,stops:number)=>(1-Math.pow(1-Math.max(0,Math.min(1,channel/255)),Math.pow(2,stops)))*255
const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t)}
export const regionWeight=(x:number,y:number,region:LocalRegion)=>{const r=clampRegion(region);if(x<r.x||x>r.x+r.width||y<r.y||y>r.y+r.height)return 0;const lx=(x-r.x)/r.width,ly=(y-r.y)/r.height;return smooth(Math.min(lx,1-lx,ly,1-ly)/r.feather)}
function boxBlur(input:Uint8ClampedArray,width:number,height:number,radius=1){const output=new Uint8ClampedArray(input.length);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const index=(y*width+x)*4;let count=0,r=0,g=0,b=0;for(let yy=Math.max(0,y-radius);yy<=Math.min(height-1,y+radius);yy++)for(let xx=Math.max(0,x-radius);xx<=Math.min(width-1,x+radius);xx++){const at=(yy*width+xx)*4;r+=input[at];g+=input[at+1];b+=input[at+2];count++}output[index]=r/count;output[index+1]=g/count;output[index+2]=b/count;output[index+3]=input[index+3]}return output}
type Values=[number,number,number,number,number]
const empty=():Values=>[0,0,0,0,0]
const parameterIndex=(p:AdjustmentParameter)=>p==='BRIGHTNESS'?0:p==='WARMTH'?1:p==='SATURATION'?2:p==='SOFTNESS'?3:4
export function renderPixels(source:SourceImage,recipe:AdjustmentRecipe,masks?:OptionalMaskSet):{data:Uint8ClampedArray;renderMs:number}{
 validateRecipe(recipe);const started=performance.now();const all=empty(),person=empty(),background=empty();const local=new Map<string,{region:LocalRegion;values:Values}>()
 for(const item of recipe.adjustments){const i=parameterIndex(item.parameter);if(item.scope==='ALL')all[i]+=item.value;else if(item.scope==='PERSON')person[i]+=item.value;else if(item.scope==='BACKGROUND')background[i]+=item.value;else if(item.region){const entry=local.get(item.region.id)||{region:item.region,values:empty()};entry.values[i]+=item.value;local.set(item.region.id,entry)}}
 const output=new Uint8ClampedArray(source.data.length);const softened=recipe.adjustments.some(x=>x.parameter==='SOFTNESS'&&x.value!==0)?boxBlur(source.data,source.width,source.height):source.data
 for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++){const pixel=y*source.width+x,index=pixel*4,pw=masks?.person?.[pixel]||0,bw=masks?.background?.[pixel]||0;let v0=all[0]+person[0]*pw+background[0]*bw,v1=all[1]+person[1]*pw+background[1]*bw,v2=all[2]+person[2]*pw+background[2]*bw,v3=all[3]+person[3]*pw+background[3]*bw;for(const entry of local.values()){const weight=regionWeight((x+.5)/source.width,(y+.5)/source.height,entry.region);v0+=entry.values[0]*weight;v1+=entry.values[1]*weight;v2+=entry.values[2]*weight;v3+=entry.values[3]*weight}let r=source.data[index],g=source.data[index+1],b=source.data[index+2];const stops=clamp(v0)*.32;r=brightness(r,stops);g=brightness(g,stops);b=brightness(b,stops);const warm=clamp(v1);r+=warm*14;g+=warm*2;b-=warm*16;const saturation=1+clamp(v2)*.28,luma=r*.2126+g*.7152+b*.0722;r=luma+(r-luma)*saturation;g=luma+(g-luma)*saturation;b=luma+(b-luma)*saturation;const softness=clamp(v3);if(softness){const factor=softness>=0?softness*.28:-softness*.12;if(softness>0){r+=(softened[index]-r)*factor;g+=(softened[index+1]-g)*factor;b+=(softened[index+2]-b)*factor}else{r+=(r-softened[index])*factor;g+=(g-softened[index+1])*factor;b+=(b-softened[index+2])*factor}}output[index]=byte(r);output[index+1]=byte(g);output[index+2]=byte(b);output[index+3]=source.data[index+3]}
 const blurMix=Math.max(0,clamp(background[4]))*.84;if(blurMix&&masks?.background?.length===source.width*source.height){const blurred=boxBlur(output,source.width,source.height,Math.max(2,Math.min(16,Math.round(Math.min(source.width,source.height)*.008))));for(let p=0;p<source.width*source.height;p++){const factor=blurMix*Math.max(0,Math.min(1,masks.background[p]||0)),i=p*4;output[i]=byte(output[i]+(blurred[i]-output[i])*factor);output[i+1]=byte(output[i+1]+(blurred[i+1]-output[i+1])*factor);output[i+2]=byte(output[i+2]+(blurred[i+2]-output[i+2])*factor)}}return {data:output,renderMs:performance.now()-started}
}
