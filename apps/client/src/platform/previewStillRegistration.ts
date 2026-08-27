import type {CameraOrientation,CameraStreamProfile,CaptureViewport} from './captureViewport'

export type RegistrationResult='IDENTITY'|'STATIC_CROP'|'STATIC_SCALE_TRANSLATION'|'AFFINE'|'HOMOGRAPHY'|'LOW_CONFIDENCE'|'UNSUPPORTED'
export type RegistrationTransformModel='ORIENTATION_ONLY'|'CROP'|'SCALE_TRANSLATION'|'AFFINE'|'HOMOGRAPHY'|'NONE'
export type MappingStability='STATIC_STABLE'|'SESSION_STABLE'|'PER_CAPTURE_STABLE'|'UNSTABLE'|'UNSUPPORTED'
export type Point2={x:number;y:number}
export type PointPair={preview:Point2;still:Point2;distance?:number}
export type Matrix3=[number,number,number,number,number,number,number,number,number]

export type PreviewStillRegistrationV01={
 preview_reference_id:string;native_capture_source_id:string
 preview_dimensions:{width:number;height:number};still_dimensions:{width:number;height:number}
 preview_orientation:CameraOrientation;still_orientation:CameraOrientation;same_camera_device:boolean
 camera_device_identity:string|null;stream_profile:CameraStreamProfile;method:'FEATURE_RANSAC_V01'
 transform_model:RegistrationTransformModel;matrix:Matrix3;crop_rect_in_still:CaptureViewport
 scale_x:number;scale_y:number;translation_x:number;translation_y:number;rotation_deg:number;mirror_x:boolean;mirror_y:boolean
 match_count:number;inlier_count:number;inlier_ratio:number;reprojection_error:number;overlap_ratio:number;confidence:number
 stability_class:MappingStability;result:RegistrationResult;analysis_dimensions:{preview:{width:number;height:number};still:{width:number;height:number}}
 retained_pixel_percent:number;elapsed_ms:number
}

export type RegistrationFixtureResult={matrix:Matrix3;model:RegistrationTransformModel;result:RegistrationResult;matchCount:number;inlierCount:number;inlierRatio:number;reprojectionError:number;confidence:number;cropRect:CaptureViewport;overlapRatio:number}
export type RegistrationStabilitySummary={classification:MappingStability;sampleCount:number;supportedCount:number;modelFamilyConsistency:number;cropVariance:number;scaleVariance:number;translationVariance:number;rotationVariance:number;minimumConfidence:number}
export type GrayImage={width:number;height:number;data:Uint8Array}

const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value))
const identityMatrix=():Matrix3=>[1,0,0,0,1,0,0,0,1]
const apply=(matrix:Matrix3,point:Point2):Point2=>{const d=matrix[6]*point.x+matrix[7]*point.y+matrix[8];return {x:(matrix[0]*point.x+matrix[1]*point.y+matrix[2])/d,y:(matrix[3]*point.x+matrix[4]*point.y+matrix[5])/d}}
const error=(matrix:Matrix3,pair:PointPair)=>{const value=apply(matrix,pair.preview);return Math.hypot(value.x-pair.still.x,value.y-pair.still.y)}

function solveLinear(matrix:number[][],values:number[]):number[]|null{
 const n=values.length,a=matrix.map((row,index)=>[...row,values[index]])
 for(let column=0;column<n;column++){
  let pivot=column
  for(let row=column+1;row<n;row++)if(Math.abs(a[row][column])>Math.abs(a[pivot][column]))pivot=row
  if(Math.abs(a[pivot][column])<1e-9)return null
  ;[a[column],a[pivot]]=[a[pivot],a[column]]
  const divisor=a[column][column]
  for(let k=column;k<=n;k++)a[column][k]/=divisor
  for(let row=0;row<n;row++)if(row!==column){const factor=a[row][column];for(let k=column;k<=n;k++)a[row][k]-=factor*a[column][k]}
 }
 return a.map(row=>row[n])
}

function leastSquares(rows:number[][],values:number[]):number[]|null{
 if(!rows.length)return null
 const columns=rows[0].length,normal=Array.from({length:columns},()=>Array(columns).fill(0)),rhs=Array(columns).fill(0)
 for(let row=0;row<rows.length;row++)for(let i=0;i<columns;i++){rhs[i]+=rows[row][i]*values[row];for(let j=0;j<columns;j++)normal[i][j]+=rows[row][i]*rows[row][j]}
 return solveLinear(normal,rhs)
}

function fitScaleTranslation(pairs:PointPair[]):Matrix3|null{
 if(pairs.length<2)return null
 const rows:number[][]=[],values:number[]=[]
 for(const pair of pairs){rows.push([pair.preview.x,1,0]);values.push(pair.still.x);rows.push([pair.preview.y,0,1]);values.push(pair.still.y)}
 const value=leastSquares(rows,values);return value?[value[0],0,value[1],0,value[0],value[2],0,0,1]:null
}

function fitAffine(pairs:PointPair[]):Matrix3|null{
 if(pairs.length<3)return null
 const rows:number[][]=[],values:number[]=[]
 for(const pair of pairs){const {x,y}=pair.preview;rows.push([x,y,1,0,0,0]);values.push(pair.still.x);rows.push([0,0,0,x,y,1]);values.push(pair.still.y)}
 const value=leastSquares(rows,values);return value?[value[0],value[1],value[2],value[3],value[4],value[5],0,0,1]:null
}

function fitHomography(pairs:PointPair[]):Matrix3|null{
 if(pairs.length<4)return null
 const rows:number[][]=[],values:number[]=[]
 for(const pair of pairs){const {x,y}=pair.preview,{x:u,y:v}=pair.still;rows.push([x,y,1,0,0,0,-u*x,-u*y]);values.push(u);rows.push([0,0,0,x,y,1,-v*x,-v*y]);values.push(v)}
 const value=leastSquares(rows,values);return value?[value[0],value[1],value[2],value[3],value[4],value[5],value[6],value[7],1]:null
}

type ModelSpec={name:RegistrationTransformModel;minimum:number;fit:(pairs:PointPair[])=>Matrix3|null}
const modelSpecs:ModelSpec[]=[{name:'SCALE_TRANSLATION',minimum:2,fit:fitScaleTranslation},{name:'AFFINE',minimum:3,fit:fitAffine},{name:'HOMOGRAPHY',minimum:4,fit:fitHomography}]

function deterministicSamples(length:number,size:number,iterations:number):number[][]{
 const values:number[][]=[];let state=0x9e3779b9
 for(let iteration=0;iteration<iterations;iteration++){
  const sample:number[]=[]
  while(sample.length<size){state=(Math.imul(state,1664525)+1013904223)>>>0;const index=state%length;if(!sample.includes(index))sample.push(index)}
  values.push(sample)
 }
 return values
}

function evaluateModel(matrix:Matrix3,pairs:PointPair[],threshold=.025){const errors=pairs.map(pair=>error(matrix,pair)),indices=errors.map((value,index)=>value<=threshold?index:-1).filter(index=>index>=0),mean=indices.length?indices.reduce((sum,index)=>sum+errors[index],0)/indices.length:Infinity;return {indices,mean}}

function ransac(spec:ModelSpec,pairs:PointPair[],threshold=.025):{matrix:Matrix3;indices:number[];mean:number}|null{
 if(pairs.length<spec.minimum)return null
 let best:{matrix:Matrix3;indices:number[];mean:number}|null=null
 const candidates=[Array.from({length:spec.minimum},(_,index)=>index),...deterministicSamples(pairs.length,spec.minimum,Math.min(420,Math.max(80,pairs.length*5)))]
 for(const sample of candidates){const matrix=spec.fit(sample.map(index=>pairs[index]));if(!matrix)continue;const score=evaluateModel(matrix,pairs,threshold);if(!best||score.indices.length>best.indices.length||(score.indices.length===best.indices.length&&score.mean<best.mean))best={matrix,indices:score.indices,mean:score.mean}}
 if(!best||best.indices.length<spec.minimum)return null
 const refined=spec.fit(best.indices.map(index=>pairs[index]));if(refined){const score=evaluateModel(refined,pairs,threshold);best={matrix:refined,indices:score.indices,mean:score.mean}}
 return best
}

function cropFromMatrix(matrix:Matrix3):{rect:CaptureViewport;overlap:number}{
 const corners=[apply(matrix,{x:0,y:0}),apply(matrix,{x:1,y:0}),apply(matrix,{x:1,y:1}),apply(matrix,{x:0,y:1})]
 const x0=Math.min(...corners.map(item=>item.x)),x1=Math.max(...corners.map(item=>item.x)),y0=Math.min(...corners.map(item=>item.y)),y1=Math.max(...corners.map(item=>item.y))
 const cx0=clamp(x0),cx1=clamp(x1),cy0=clamp(y0),cy1=clamp(y1),width=Math.max(0,cx1-cx0),height=Math.max(0,cy1-cy0)
 return {rect:{x:cx0,y:cy0,width,height,aspectRatio:height?width/height:0},overlap:width*height}
}

function decompose(matrix:Matrix3){
 const scaleX=Math.hypot(matrix[0],matrix[3]),scaleY=Math.hypot(matrix[1],matrix[4]),rotation=Math.atan2(matrix[3],matrix[0])*180/Math.PI
 return {scaleX,scaleY,translationX:matrix[2],translationY:matrix[5],rotation}
}

export function registerPointPairs(pairs:PointPair[],options:{ambiguous?:boolean;threshold?:number}={}):RegistrationFixtureResult{
 if(options.ambiguous||pairs.length<6)return {matrix:identityMatrix(),model:'NONE',result:pairs.length<4?'UNSUPPORTED':'LOW_CONFIDENCE',matchCount:pairs.length,inlierCount:0,inlierRatio:0,reprojectionError:1,confidence:0,cropRect:{x:0,y:0,width:1,height:1,aspectRatio:1},overlapRatio:0}
 let selected:{spec:ModelSpec;matrix:Matrix3;indices:number[];mean:number}|null=null
 for(const spec of modelSpecs){
  const value=ransac(spec,pairs,options.threshold||.025);if(!value)continue
  const ratio=value.indices.length/pairs.length,selectedRatio=selected?selected.indices.length/pairs.length:0
  const materiallyMoreSupport=!selected||ratio>selectedRatio+.08
  const materiallyBetterGeometry=!!selected&&ratio>=selectedRatio-.02&&selected.mean>.004&&value.mean<selected.mean*.5
  if(!selected||materiallyMoreSupport||materiallyBetterGeometry)selected={spec,...value}
 }
 if(!selected)return {matrix:identityMatrix(),model:'NONE',result:'UNSUPPORTED',matchCount:pairs.length,inlierCount:0,inlierRatio:0,reprojectionError:1,confidence:0,cropRect:{x:0,y:0,width:1,height:1,aspectRatio:1},overlapRatio:0}
 const ratio=selected.indices.length/pairs.length,{rect,overlap}=cropFromMatrix(selected.matrix),support=Math.min(1,selected.indices.length/16),confidence=clamp(ratio*support*Math.exp(-selected.mean/.025))
 const parts=decompose(selected.matrix),identity=Math.abs(parts.scaleX-1)<.01&&Math.abs(parts.scaleY-1)<.01&&Math.abs(parts.translationX)<.01&&Math.abs(parts.translationY)<.01&&Math.abs(parts.rotation)<.5
 let result:RegistrationResult=selected.spec.name==='HOMOGRAPHY'?'HOMOGRAPHY':selected.spec.name==='AFFINE'?'AFFINE':'STATIC_SCALE_TRANSLATION'
 if(identity)result='IDENTITY';else if(selected.spec.name==='SCALE_TRANSLATION'&&Math.abs(parts.scaleX-1)<.015)result='STATIC_CROP'
 if(confidence<.72||ratio<.55)result='LOW_CONFIDENCE'
 return {matrix:selected.matrix,model:selected.spec.name,result,matchCount:pairs.length,inlierCount:selected.indices.length,inlierRatio:ratio,reprojectionError:selected.mean,confidence,cropRect:rect,overlapRatio:overlap}
}

type Feature={point:Point2;descriptors:Float32Array[];score:number}
const pixel=(image:GrayImage,x:number,y:number)=>image.data[Math.max(0,Math.min(image.height-1,Math.round(y)))*image.width+Math.max(0,Math.min(image.width-1,Math.round(x)))]

function descriptor(image:GrayImage,x:number,y:number,radius:number):Float32Array{
 const output=new Float32Array(25);let mean=0,index=0
 for(let gy=-2;gy<=2;gy++)for(let gx=-2;gx<=2;gx++){const value=pixel(image,x+gx*radius/2,y+gy*radius/2);output[index++]=value;mean+=value}
 mean/=output.length;let variance=0
 for(let i=0;i<output.length;i++){output[i]-=mean;variance+=output[i]*output[i]}
 const scale=Math.sqrt(variance/output.length)||1
 for(let i=0;i<output.length;i++)output[i]/=scale
 return output
}

function detectFeatures(image:GrayImage,limit=220):Feature[]{
 const candidates:Array<{x:number;y:number;score:number}>=[]
 for(let y=10;y<image.height-10;y+=2)for(let x=10;x<image.width-10;x+=2){const gx=pixel(image,x+1,y)-pixel(image,x-1,y),gy=pixel(image,x,y+1)-pixel(image,x,y-1),d1=pixel(image,x+1,y+1)-pixel(image,x-1,y-1),d2=pixel(image,x+1,y-1)-pixel(image,x-1,y+1),score=gx*gx+gy*gy+.5*(d1*d1+d2*d2);if(score>500)candidates.push({x,y,score})}
 candidates.sort((a,b)=>b.score-a.score);const selected:Feature[]=[]
 for(const candidate of candidates){if(selected.some(item=>Math.hypot(item.point.x*image.width-candidate.x,item.point.y*image.height-candidate.y)<8))continue;selected.push({point:{x:candidate.x/image.width,y:candidate.y/image.height},descriptors:[3,5,8,12].map(radius=>descriptor(image,candidate.x,candidate.y,radius)),score:candidate.score});if(selected.length>=limit)break}
 return selected
}

function descriptorDistance(a:Float32Array,b:Float32Array){let sum=0;for(let index=0;index<a.length;index++){const delta=a[index]-b[index];sum+=delta*delta}return Math.sqrt(sum/a.length)}
function featureDistance(a:Feature,b:Feature){let best=Infinity;for(const left of a.descriptors)for(const right of b.descriptors)best=Math.min(best,descriptorDistance(left,right));return best}

export function matchGrayImages(preview:GrayImage,still:GrayImage):{pairs:PointPair[];ambiguous:boolean;previewFeatures:number;stillFeatures:number}{
 const source=detectFeatures(preview),target=detectFeatures(still),forward:Array<{source:number;target:number;distance:number;second:number}>=[]
 for(let i=0;i<source.length;i++){let best=Infinity,second=Infinity,targetIndex=-1;for(let j=0;j<target.length;j++){const value=featureDistance(source[i],target[j]);if(value<best){second=best;best=value;targetIndex=j}else if(value<second)second=value}if(targetIndex>=0&&best<.95&&best/(second||1)<.86)forward.push({source:i,target:targetIndex,distance:best,second})}
 const unique=new Map<number,typeof forward[number]>()
 for(const item of forward){const current=unique.get(item.target);if(!current||item.distance<current.distance)unique.set(item.target,item)}
 const accepted=[...unique.values()],pairs=accepted.map(item=>({preview:source[item.source].point,still:target[item.target].point,distance:item.distance}))
 const ambiguity=accepted.length<8||accepted.filter(item=>item.distance/(item.second||1)>.72).length>accepted.length*.6
 return {pairs,ambiguous:ambiguity,previewFeatures:source.length,stillFeatures:target.length}
}

export function registerGrayImages(preview:GrayImage,still:GrayImage){const matches=matchGrayImages(preview,still),registration=registerPointPairs(matches.pairs,{ambiguous:matches.ambiguous});return {...registration,...matches}}

function variance(values:number[]){if(values.length<2)return 0;const mean=values.reduce((sum,value)=>sum+value,0)/values.length;return values.reduce((sum,value)=>sum+(value-mean)**2,0)/values.length}
function propertyVariance(groups:number[][]){return groups.length?groups.reduce((sum,values)=>sum+variance(values),0)/groups.length:1}
export function classifyRegistrationStability(values:PreviewStillRegistrationV01[]):RegistrationStabilitySummary{
 const supported=values.filter(value=>!['LOW_CONFIDENCE','UNSUPPORTED'].includes(value.result)&&value.confidence>=.72),sampleCount=values.length,supportedCount=supported.length
 if(sampleCount<5)return {classification:'UNSUPPORTED',sampleCount,supportedCount,modelFamilyConsistency:0,cropVariance:1,scaleVariance:1,translationVariance:1,rotationVariance:1,minimumConfidence:supported.length?Math.min(...supported.map(value=>value.confidence)):0}
 const families=new Map<string,number>();for(const value of supported)families.set(value.transform_model,(families.get(value.transform_model)||0)+1)
 const consistency=supported.length?Math.max(...families.values())/supported.length:0
 const cropVariance=propertyVariance([
  supported.map(value=>value.crop_rect_in_still.x),supported.map(value=>value.crop_rect_in_still.y),supported.map(value=>value.crop_rect_in_still.width),supported.map(value=>value.crop_rect_in_still.height),
 ])
 const scaleVariance=propertyVariance([supported.map(value=>value.scale_x),supported.map(value=>value.scale_y)])
 const translationVariance=propertyVariance([supported.map(value=>value.translation_x),supported.map(value=>value.translation_y)])
 const rotationVariance=variance(supported.map(value=>value.rotation_deg)),minimumConfidence=supported.length?Math.min(...supported.map(value=>value.confidence)):0
 let classification:MappingStability='UNSUPPORTED'
 if(supportedCount===sampleCount&&consistency>=.8&&cropVariance<.00025&&scaleVariance<.00025&&translationVariance<.00025&&rotationVariance<.25)classification='STATIC_STABLE'
 else if(supportedCount===sampleCount&&consistency>=.8&&cropVariance<.0016&&scaleVariance<.0016&&translationVariance<.0016&&rotationVariance<4)classification='SESSION_STABLE'
 else if(supportedCount===sampleCount&&minimumConfidence>=.72)classification='PER_CAPTURE_STABLE'
 else if(supportedCount>=3)classification='UNSTABLE'
 return {classification,sampleCount,supportedCount,modelFamilyConsistency:consistency,cropVariance,scaleVariance,translationVariance,rotationVariance,minimumConfidence}
}

async function blobToGray(blob:Blob,maxDimension=480):Promise<{image:GrayImage;source:{width:number;height:number}}>{
 const bitmap=await createImageBitmap(blob,{imageOrientation:'from-image'}),scale=Math.min(1,maxDimension/Math.max(bitmap.width,bitmap.height)),width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale)),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height
 const context=canvas.getContext('2d',{alpha:false,willReadFrequently:true});if(!context){bitmap.close();throw new Error('REGISTRATION_CANVAS_UNAVAILABLE')}
 context.drawImage(bitmap,0,0,width,height);const rgba=context.getImageData(0,0,width,height).data,data=new Uint8Array(width*height)
 for(let index=0;index<data.length;index++)data[index]=Math.round(rgba[index*4]*.2126+rgba[index*4+1]*.7152+rgba[index*4+2]*.0722)
 const source={width:bitmap.width,height:bitmap.height};bitmap.close();return {image:{width,height,data},source}
}

export async function registerPreviewStillBlobs(input:{previewBlob:Blob;stillBlob:Blob;previewReferenceId:string;nativeStillId:string;previewWidth:number;previewHeight:number;previewOrientation:CameraOrientation;stillOrientation:CameraOrientation;cameraDeviceIdentity:string|null;streamProfile:CameraStreamProfile;sameCameraDevice:boolean}):Promise<PreviewStillRegistrationV01>{
 const started=performance.now(),[preview,still]=await Promise.all([blobToGray(input.previewBlob),blobToGray(input.stillBlob)]),value=registerGrayImages(preview.image,still.image),parts=decompose(value.matrix),result=value.result,retained=value.cropRect.width*value.cropRect.height*100
 return {preview_reference_id:input.previewReferenceId,native_capture_source_id:input.nativeStillId,preview_dimensions:{width:input.previewWidth,height:input.previewHeight},still_dimensions:still.source,preview_orientation:input.previewOrientation,still_orientation:input.stillOrientation,same_camera_device:input.sameCameraDevice,camera_device_identity:input.cameraDeviceIdentity,stream_profile:input.streamProfile,method:'FEATURE_RANSAC_V01',transform_model:value.model,matrix:value.matrix,crop_rect_in_still:value.cropRect,scale_x:parts.scaleX,scale_y:parts.scaleY,translation_x:parts.translationX,translation_y:parts.translationY,rotation_deg:parts.rotation,mirror_x:false,mirror_y:false,match_count:value.matchCount,inlier_count:value.inlierCount,inlier_ratio:value.inlierRatio,reprojection_error:value.reprojectionError,overlap_ratio:value.overlapRatio,confidence:value.confidence,stability_class:'UNSUPPORTED',result,analysis_dimensions:{preview:{width:preview.image.width,height:preview.image.height},still:{width:still.image.width,height:still.image.height}},retained_pixel_percent:retained,elapsed_ms:performance.now()-started}
}
