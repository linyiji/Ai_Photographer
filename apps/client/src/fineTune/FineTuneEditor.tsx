import {Button,Canvas,Text,View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {useEffect,useRef,useState} from 'react'
import {api,type Session} from '../api/client'
import {platformRegistry} from '../platform/runtime'
import {MAX_LOCAL_REGIONS,PARAMETERS,RUNTIME_VERSION,clampRegion,cloneRecipe,createRecipe,defaultRegion,setAdjustment,type AdjustmentParameter,type AdjustmentRecipe,type AdjustmentScope,type LocalRegion} from './core'
import {LatestOnlyQueue,V1_ADJUSTMENT_LIMIT,clampV1,deleteRegion,pointerRatioToUiRaw,recipeValueToUi,regionsFromRecipe,uiRawToRecipe,updateRegionGeometry} from './interactive'
import {createFineTuneRuntime} from './runtimeProvider'
import type {FineTuneSession,PreviewProjection} from './runtime'
import './FineTuneEditor.css'

const labels:Record<AdjustmentParameter,string>={BRIGHTNESS:'亮度',WARMTH:'色温',SATURATION:'饱和度',SOFTNESS:'柔和',BLUR:'背景虚化'}
type PreviewRequest={recipe:AdjustmentRecipe;inputAt:number;sequence:number}
type Telemetry={uiRafFps:number;longTaskCount:number;longTaskMaxMs:number;sliderNumberLatencyMs:number;previewLatencies:number[];previewRenderTimes:number[];rawSliderValue:number;normalizedValue:number;recipeValue:number;rendererValue:number;previewWidth:number;previewHeight:number;jpegEncodeCount:number;objectUrlCreateCount:number;objectUrlRevokeCount:number;inputCount:number;renderStartedCount:number;renderCompletedCount:number;supersededBeforeComputeCount:number;supersededAfterComputeCount:number}
const initialTelemetry:Telemetry={uiRafFps:0,longTaskCount:0,longTaskMaxMs:0,sliderNumberLatencyMs:0,previewLatencies:[],previewRenderTimes:[],rawSliderValue:0,normalizedValue:0,recipeValue:0,rendererValue:0,previewWidth:0,previewHeight:0,jpegEncodeCount:0,objectUrlCreateCount:0,objectUrlRevokeCount:0,inputCount:0,renderStartedCount:0,renderCompletedCount:0,supersededBeforeComputeCount:0,supersededAfterComputeCount:0}
const percentile=(values:number[],fraction:number)=>{if(!values.length)return 0;const ordered=[...values].sort((a,b)=>a-b);return ordered[Math.min(ordered.length-1,Math.floor((ordered.length-1)*fraction))]}
type RegionGesture={id:string;mode:'DRAG'|'RESIZE';startX:number;startY:number;origin:LocalRegion}

export function FineTuneEditor({session,onComplete,onError}:{session:Session;onComplete:(value:Session)=>void;onError:(message:string)=>void}){
 const [recipe,setRecipe]=useState<AdjustmentRecipe|null>(null)
 const [scope,setScope]=useState<AdjustmentScope>('ALL')
 const [busy,setBusy]=useState(false)
 const [status,setStatus]=useState('正在读取原始成片…')
 const [telemetry,setTelemetry]=useState<Telemetry>(initialTelemetry)
 const [regions,setRegions]=useState<LocalRegion[]>([])
 const [selectedRegionId,setSelectedRegionId]=useState<string|null>(null)
 const runtime=useRef<FineTuneSession|null>(null)
 const history=useRef<AdjustmentRecipe[]>([])
 const cursor=useRef(0)
 const latestRecipe=useRef<AdjustmentRecipe|null>(null)
 const queue=useRef(new LatestOnlyQueue<PreviewRequest>())
 const projecting=useRef(false)
 const scheduled=useRef(false)
 const sequence=useRef(0)
 const lastRenderStarted=useRef(0)
 const telemetryRef=useRef<Telemetry>({...initialTelemetry})
 const regionGesture=useRef<RegionGesture|null>(null)
 const canvasHostId=`fine-tune-preview-${session.session_id}`
 const stageId=`${canvasHostId}-stage`

 const drawProjection=async(projection:PreviewProjection)=>{
  if(platformRegistry.platform==='WECHAT')return new Promise<void>((resolve,reject)=>Taro.nextTick(()=>Taro.createSelectorQuery().select(`#${canvasHostId}-canvas`).fields({node:true,size:true}).exec((result:any[])=>{try{const canvas=result?.[0]?.node;if(!canvas)throw new Error('WECHAT_PREVIEW_CANVAS_UNAVAILABLE');canvas.width=projection.width;canvas.height=projection.height;const context=canvas.getContext('2d',{alpha:false}),image=context.createImageData(projection.width,projection.height);image.data.set(projection.data);context.putImageData(image,0,0);resolve()}catch(error){reject(error)}})))
  if(typeof document==='undefined')return
  const stage=document.getElementById(stageId);if(!stage)return
  const canvas=stage.querySelector('canvas');if(!canvas)return
  canvas.width=projection.width;canvas.height=projection.height
  const context=canvas.getContext('2d',{alpha:false});if(!context)throw new Error('PREVIEW_CANVAS_UNAVAILABLE')
  context.putImageData(new ImageData(new Uint8ClampedArray(projection.data),projection.width,projection.height),0,0)
 }

 const scheduleFlush=()=>{
  if(scheduled.current)return
  scheduled.current=true
  const delay=Math.max(0,33-(performance.now()-lastRenderStarted.current))
  const ready=()=>{if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>void flushProjection());else void flushProjection()}
  if(delay>1)setTimeout(ready,delay);else ready()
 }

 const flushProjection=async()=>{
  scheduled.current=false
  if(projecting.current||!runtime.current)return
  const request=queue.current.take();if(!request)return
  projecting.current=true;lastRenderStarted.current=performance.now()
  try{
   const projection=await runtime.current.project(request.recipe)
   queue.current.complete(request.sequence)
   if(request.sequence===sequence.current)await drawProjection(projection)
   const latency=performance.now()-request.inputAt,current=telemetryRef.current,stats=queue.current.snapshot()
   telemetryRef.current={...current,...stats,previewLatencies:[...current.previewLatencies.slice(-39),latency],previewRenderTimes:[...current.previewRenderTimes.slice(-39),projection.render_ms],previewWidth:projection.width,previewHeight:projection.height}
  }catch(error){onError(error instanceof Error?error.message:String(error))}
  finally{projecting.current=false;if(queue.current.hasPending())scheduleFlush()}
 }

 const scheduleProjection=(next:AdjustmentRecipe,inputAt=performance.now())=>{
  const request={recipe:cloneRecipe(next),inputAt,sequence:++sequence.current}
  queue.current.enqueue(request,request.sequence);scheduleFlush()
 }

 const adoptRecipe=(next:AdjustmentRecipe,refreshRegions=false)=>{
  latestRecipe.current=next;setRecipe(next);scheduleProjection(next)
  if(refreshRegions){const restored=regionsFromRecipe(next);setRegions(restored);setSelectedRegionId(restored[0]?.id||null)}
 }

 useEffect(()=>{let cancelled=false;(async()=>{
  const source=await api.fineTuneSource(session.session_id)
  const saved=await api.fineTuneRecipe<AdjustmentRecipe>(session.session_id)
  const initial=saved?.recipe||createRecipe(session.session_id,source.asset_id)
  const opened=await createFineTuneRuntime().open({source:{asset_id:source.asset_id,checksum:source.checksum,content_url:api.fineTuneSourceContentUrl(session.session_id)},recipe:initial,options:{preview_long_edge:480,jpeg_quality:.92}})
  if(cancelled){opened.close();return}
  runtime.current=opened;history.current=[cloneRecipe(initial)];cursor.current=0;latestRecipe.current=initial
  const restored=regionsFromRecipe(initial);setRegions(restored);setSelectedRegionId(restored[0]?.id||null)
  setRecipe(initial);scheduleProjection(initial);setStatus('整体和手动局部可用；人物与背景需要后续遮罩能力。')
 })().catch(error=>onError(error instanceof Error?error.message:String(error)))
 return()=>{cancelled=true;sequence.current++;runtime.current?.close()}},[])

 useEffect(()=>{
  let frameCount=0,started=performance.now(),handle=0
  const frame=(now:number)=>{frameCount++;if(now-started>=1000){telemetryRef.current.uiRafFps=frameCount*1000/(now-started);frameCount=0;started=now}handle=requestAnimationFrame(frame)}
  if(typeof requestAnimationFrame==='function')handle=requestAnimationFrame(frame)
  let observer:PerformanceObserver|undefined
  try{observer=new PerformanceObserver(list=>{for(const entry of list.getEntries()){telemetryRef.current.longTaskCount++;telemetryRef.current.longTaskMaxMs=Math.max(telemetryRef.current.longTaskMaxMs,entry.duration)}});observer.observe({entryTypes:['longtask']})}catch{}
  const publish=setInterval(()=>setTelemetry({...telemetryRef.current,...queue.current.snapshot(),previewLatencies:[...telemetryRef.current.previewLatencies],previewRenderTimes:[...telemetryRef.current.previewRenderTimes]}),500)
  return()=>{if(handle)cancelAnimationFrame(handle);observer?.disconnect();clearInterval(publish)}
 },[])

 const activeRegion=regions.find(item=>item.id===selectedRegionId)||null
 const valueIn=(source:AdjustmentRecipe|null,parameter:AdjustmentParameter)=>source?.adjustments.find(item=>item.scope===scope&&item.parameter===parameter&&(scope!=='LOCAL_REGION'||item.region?.id===activeRegion?.id))?.value||0
 const valueFor=(parameter:AdjustmentParameter)=>valueIn(recipe,parameter)
 const nextRecipe=(parameter:AdjustmentParameter,value:number)=>{const source=latestRecipe.current;if(!source||scope==='LOCAL_REGION'&&!activeRegion)return null;return setAdjustment(source,scope,parameter,value,scope==='LOCAL_REGION'?activeRegion||undefined:undefined)}
 const applyInteractive=(parameter:AdjustmentParameter,raw:number)=>{
  const inputAt=performance.now(),normalized=uiRawToRecipe(raw),next=nextRecipe(parameter,normalized);if(!next)return
  latestRecipe.current=next;setRecipe(next);scheduleProjection(next,inputAt)
  const renderer=valueIn(next,parameter);telemetryRef.current={...telemetryRef.current,sliderNumberLatencyMs:performance.now()-inputAt,rawSliderValue:raw,normalizedValue:normalized,recipeValue:renderer,rendererValue:renderer}
 }
 const commitCurrent=()=>{const current=latestRecipe.current;if(!current)return;history.current=history.current.slice(0,cursor.current+1);history.current.push(cloneRecipe(current));cursor.current=history.current.length-1;setRecipe(current)}
 const applyCommitted=(parameter:AdjustmentParameter,value:number)=>{const bounded=clampV1(value);applyInteractive(parameter,Math.round(bounded*100));commitCurrent()}
 const rawFromPointer=(event:any)=>{const touch=event.touches?.[0]||event.changedTouches?.[0]||event,rect=event.currentTarget?.getBoundingClientRect?.();if(!rect?.width||typeof touch?.clientX!=='number')return null;return pointerRatioToUiRaw((touch.clientX-rect.left)/rect.width)}
 const pointerUpdate=(parameter:AdjustmentParameter,event:any)=>{const raw=rawFromPointer(event);if(raw===null)return;event.preventDefault?.();applyInteractive(parameter,raw)}

 const undo=()=>{if(cursor.current>0){cursor.current--;adoptRecipe(cloneRecipe(history.current[cursor.current]),true)}}
 const redo=()=>{if(cursor.current<history.current.length-1){cursor.current++;adoptRecipe(cloneRecipe(history.current[cursor.current]),true)}}
 const reset=()=>{const source=latestRecipe.current;if(!source)return;const next={...source,adjustments:[]};latestRecipe.current=next;history.current=history.current.slice(0,cursor.current+1);history.current.push(cloneRecipe(next));cursor.current=history.current.length-1;setRecipe(next);scheduleProjection(next)}
 const addLocal=()=>{if(regions.length>=MAX_LOCAL_REGIONS){setStatus('最多创建 3 个局部区域。');return}const region=defaultRegion(regions.length);setRegions(current=>[...current,region]);setSelectedRegionId(region.id);setScope('LOCAL_REGION');setStatus(`已创建局部区域 ${regions.length+1}，可拖动或使用右下角手柄缩放。`)}
 const removeLocal=(regionId:string)=>{const nextRegions=regions.filter(item=>item.id!==regionId),source=latestRecipe.current;if(!source)return;const next=deleteRegion(source,regionId);setRegions(nextRegions);setSelectedRegionId(nextRegions[0]?.id||null);latestRecipe.current=next;setRecipe(next);scheduleProjection(next);commitCurrent()}
 const updateRegion=(region:LocalRegion)=>{const bounded=clampRegion(region);setRegions(current=>current.map(item=>item.id===bounded.id?bounded:item));const source=latestRecipe.current;if(!source)return;const next=updateRegionGeometry(source,bounded);latestRecipe.current=next;setRecipe(next);scheduleProjection(next)}
 const gesturePoint=(event:any)=>event.touches?.[0]||event.changedTouches?.[0]||event
 const beginRegionGesture=(mode:RegionGesture['mode'],region:LocalRegion,event:any)=>{const point=gesturePoint(event);if(typeof point?.clientX!=='number')return;event.stopPropagation?.();event.preventDefault?.();setSelectedRegionId(region.id);regionGesture.current={id:region.id,mode,startX:point.clientX,startY:point.clientY,origin:{...region}}}
 const moveRegionGesture=async(event:any)=>{const gesture=regionGesture.current,point=gesturePoint(event);if(!gesture||typeof point?.clientX!=='number')return;event.stopPropagation?.();event.preventDefault?.();let rect:any=typeof document!=='undefined'?document.getElementById(stageId)?.getBoundingClientRect():null;if(!rect)rect=await new Promise(resolve=>Taro.createSelectorQuery().select(`#${stageId}`).boundingClientRect(value=>resolve(value)).exec());if(!rect?.width||!rect?.height)return;const dx=(point.clientX-gesture.startX)/rect.width,dy=(point.clientY-gesture.startY)/rect.height;updateRegion(gesture.mode==='DRAG'?{...gesture.origin,x:gesture.origin.x+dx,y:gesture.origin.y+dy}:{...gesture.origin,width:gesture.origin.width+dx,height:gesture.origin.height+dy})}
 const endRegionGesture=(event:any)=>{if(!regionGesture.current)return;event.stopPropagation?.();event.preventDefault?.();regionGesture.current=null;commitCurrent()}
 const compare=(original:boolean)=>{const current=latestRecipe.current;if(!current)return;scheduleProjection(original?{...current,adjustments:[]}:current)}

 const finalize=async()=>{const current=latestRecipe.current;if(!current||!runtime.current||busy)return;setBusy(true);setStatus('正在保存配方并生成全质量成片…');try{
  const key=`recipe-${current.recipe_id}-${JSON.stringify(current.adjustments)}`,saved=await api.saveFineTuneRecipe(session.session_id,current,key),finalKey=`${session.session_id}:${saved.recipe_hash}:${RUNTIME_VERSION}`
  if(current.adjustments.length===0){const value=await api.action(session.session_id,'SAVE_ADJUSTMENT_RECIPE',{adjustment_recipe_id:current.recipe_id,runtime_version:RUNTIME_VERSION,neutral:true},`finalize-${finalKey}`);onComplete(value);return}
  let frameCount=0,maxFrameGap=0,lastFrame=performance.now(),frameHandle=0
  const heartbeat=(now:number)=>{frameCount++;maxFrameGap=Math.max(maxFrameGap,now-lastFrame);lastFrame=now;frameHandle=requestAnimationFrame(heartbeat)}
  if(typeof requestAnimationFrame==='function')frameHandle=requestAnimationFrame(heartbeat)
  const artifact=await runtime.current.renderFinal(current,finalKey);telemetryRef.current.jpegEncodeCount++
  if(frameHandle)cancelAnimationFrame(frameHandle)
  const upload=await platformRegistry.uploadDerived(session.session_id,{blob:artifact.blob,filePath:artifact.filePath,bytes:artifact.bytes},finalKey);if(!upload.ok||!upload.value)throw new Error(upload.code)
  const value=await api.action(session.session_id,'SAVE_ADJUSTMENT_RECIPE',{adjustment_recipe_id:current.recipe_id,derived_upload_asset_id:upload.value.asset_id,runtime_version:RUNTIME_VERSION,render_backend:artifact.backend,render_metrics:{decode_ms:artifact.decode_ms,render_ms:artifact.render_ms,encode_ms:artifact.encode_ms,total_ms:artifact.total_ms,width:artifact.width,height:artifact.height,ui_frame_count_during_render:frameCount,ui_max_frame_gap_ms:maxFrameGap,ui_responsive:artifact.backend==='WORKER_OFFSCREENCANVAS'&&frameCount>0},mask_identity:null},`finalize-${finalKey}`)
  onComplete(value)
 }catch(error){onError(error instanceof Error?error.message:String(error));setStatus('生成未完成，已保存的配方可在刷新后继续。')}finally{setBusy(false)}}

 if(!recipe)return <View className='fineTunePanel'><Text>{status}</Text></View>
 const compatibilityWarning=recipe.adjustments.some(item=>Math.abs(item.value)>V1_ADJUSTMENT_LIMIT+.0001)
 const previewP50=percentile(telemetry.previewLatencies,.5),previewP95=percentile(telemetry.previewLatencies,.95),renderP50=percentile(telemetry.previewRenderTimes,.5),renderP95=percentile(telemetry.previewRenderTimes,.95)
 const previewAspect=telemetry.previewWidth&&telemetry.previewHeight?telemetry.previewWidth/telemetry.previewHeight:3/4

 return <View className='fineTunePanel'>
  <Text className='sectionTitle'>微调</Text><Text className='fineTuneStatus'>{status}</Text>
  {compatibilityWarning&&<Text className='compatibilityWarning'>检测到历史配方超出 V1 ±30% 范围；原值保持不变，只有你明确编辑后才写入新范围。</Text>}
  <View id={canvasHostId} className='fineTunePreviewCanvas'><View id={stageId} className='fineTuneCanvasStage' style={{aspectRatio:previewAspect}}><Canvas id={`${canvasHostId}-canvas`} type='2d' canvasId={`${canvasHostId}-canvas`} className='fineTuneCanvasElement'/>{scope==='LOCAL_REGION'&&<View className='localRegionLayer'>{regions.map((region,index)=><View key={region.id} className={selectedRegionId===region.id?'localRegion selectedRegion':'localRegion'} style={{left:`${region.x*100}%`,top:`${region.y*100}%`,width:`${region.width*100}%`,height:`${region.height*100}%`}} onClick={()=>setSelectedRegionId(region.id)} onTouchStart={(event:any)=>beginRegionGesture('DRAG',region,event)} onTouchMove={moveRegionGesture} onTouchEnd={endRegionGesture}><Text className='regionLabel'>区域 {index+1}</Text><Button className='regionDelete' onClick={(event:any)=>{event.stopPropagation?.();removeLocal(region.id)}}>×</Button><View className='regionResize' onTouchStart={(event:any)=>beginRegionGesture('RESIZE',region,event)} onTouchMove={moveRegionGesture} onTouchEnd={endRegionGesture}/></View>)}</View>}</View></View>
  <View className='scopeTabs'>{(['ALL','PERSON','BACKGROUND','LOCAL_REGION'] as AdjustmentScope[]).map(item=><Button key={item} className={scope===item?'chip activeChip':'chip'} disabled={item==='PERSON'||item==='BACKGROUND'} onClick={()=>setScope(item)}>{{ALL:'整体',PERSON:'人物',BACKGROUND:'背景',LOCAL_REGION:'局部'}[item]}</Button>)}</View>
  <Text className='maskNotice'>人物 / 背景：当前照片没有生产遮罩，按设计暂不可用；整体与手动局部可用。</Text>
  {scope==='LOCAL_REGION'&&<View className='localToolbar'><Button className='secondary compact' disabled={regions.length>=MAX_LOCAL_REGIONS} onClick={addLocal}>新增局部区域（{regions.length}/3）</Button>{regions.length===0&&<Text className='localEmpty'>暂无局部区域，点击上方按钮创建区域 1。</Text>}</View>}
  {PARAMETERS.map(parameter=>{const recipeValue=valueFor(parameter),ui=recipeValueToUi(recipeValue),value=ui.value,raw=Math.round(value*100),disabled=scope==='LOCAL_REGION'&&!activeRegion,position=(value+V1_ADJUSTMENT_LIMIT)/(V1_ADJUSTMENT_LIMIT*2)*100;return <View className='sliderRow' key={parameter}><View className='sliderLabel'><Text>{labels[parameter]}</Text><Text className={value===0?'adjustmentValue':'adjustmentValue activeValue'}>{raw>0?'+':''}{raw}%</Text></View><View className='sliderControl'><Button className='stepButton' disabled={disabled} aria-label={`${labels[parameter]}减少`} onClick={()=>applyCommitted(parameter,value-.05)}>−</Button><View className={disabled?'rangeTrack disabledTrack':'rangeTrack'} onTouchStart={(event:any)=>pointerUpdate(parameter,event)} onTouchMove={(event:any)=>pointerUpdate(parameter,event)} onTouchEnd={commitCurrent} onClick={(event:any)=>{pointerUpdate(parameter,event);commitCurrent()}}><View className='rangeZero'/><View className='rangeFill' style={value>=0?{left:'50%',width:`${value/(V1_ADJUSTMENT_LIMIT*2)*100}%`}:{left:`${position}%`,width:`${-value/(V1_ADJUSTMENT_LIMIT*2)*100}%`}}/><View className='rangeThumb' style={{left:`${position}%`}}/></View><Button className='stepButton' disabled={disabled} aria-label={`${labels[parameter]}增加`} onClick={()=>applyCommitted(parameter,value+.05)}>＋</Button></View><View className='calibrationRow'><Button disabled={disabled} onClick={()=>applyCommitted(parameter,-.3)}>−30%</Button><Button disabled={disabled} onClick={()=>applyCommitted(parameter,0)}>0%</Button><Button disabled={disabled} onClick={()=>applyCommitted(parameter,.3)}>＋30%</Button></View></View>})}
  <View className='inlineActions'><Button className='secondary compact' onClick={undo}>撤销</Button><Button className='secondary compact' onClick={redo}>重做</Button><Button className='secondary compact' onClick={reset}>重置</Button></View>
  <Button className='secondary compact' onTouchStart={()=>compare(true)} onTouchEnd={()=>compare(false)}>按住对比原图</Button>
  {__XFX_PRODUCT_MODE__==='INTERNAL_DEMO'&&<View className='telemetryPanel'><Text>DEV TELEMETRY · OPTIMIZED_CANVAS2D</Text><Text>UI rAF FPS: {telemetry.uiRafFps.toFixed(1)}</Text><Text>Long Tasks: {telemetry.longTaskCount} / max {telemetry.longTaskMaxMs.toFixed(1)}ms</Text><Text>Slider raw / normalized / recipe / renderer: {telemetry.rawSliderValue} / {telemetry.normalizedValue.toFixed(2)} / {telemetry.recipeValue.toFixed(2)} / {telemetry.rendererValue.toFixed(2)}</Text><Text>Input→number: {telemetry.sliderNumberLatencyMs.toFixed(1)}ms</Text><Text>Input→preview p50/p95: {previewP50.toFixed(1)} / {previewP95.toFixed(1)}ms</Text><Text>Preview render p50/p95: {renderP50.toFixed(1)} / {renderP95.toFixed(1)}ms</Text><Text>Input / started / completed: {telemetry.inputCount} / {telemetry.renderStartedCount} / {telemetry.renderCompletedCount}</Text><Text>Superseded before / after compute: {telemetry.supersededBeforeComputeCount} / {telemetry.supersededAfterComputeCount}</Text><Text>Preview source cache: DECODE_ONCE / {telemetry.previewWidth}×{telemetry.previewHeight}</Text><Text>JPEG encodes: {telemetry.jpegEncodeCount} (preview=0)</Text><Text>ObjectURL create/revoke: {telemetry.objectUrlCreateCount}/{telemetry.objectUrlRevokeCount}</Text></View>}
  <Button className='primary' disabled={busy} onClick={finalize}>{busy?'正在生成成片…':'完成微调'}</Button>
 </View>
}
