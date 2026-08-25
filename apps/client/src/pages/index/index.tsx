import {Button,Image,Text,View} from '@tarojs/components'
import {useLoad,useUnload} from '@tarojs/taro'
import {useEffect,useMemo,useRef,useState} from 'react'
import {api,RuntimeReadiness,Session,SessionSummary,UploadedAsset} from '../../api/client'
import {H5StillCamera,LocalCaptureCandidate,platformRegistry} from '../../platform/runtime'
import {confirmationKey,publicRuntimeMayStart} from '../../product/capturePolicy'
import {sessionStorage} from '../../platform/sessionStorage'
import './index.css'

type Surface='HOME'|'FLOW'|'WORKS'
const stageOrder=['ENTRY','SHOOTING_RELATION_DEVICE_MODE','REALITY','TARGET','SHOT','LIVE','CAPTURE','QA','REALITY_PLUS','FINE_TUNE','FINAL']
const labels:Record<string,{id:string;eyebrow:string;title:string;copy:string}>={
 ENTRY:{id:'P01',eyebrow:'从一次真实拍摄开始',title:'拍一张真正属于你的照片',copy:'我们会把现场条件、画面目标和拍摄动作连接成一条可恢复的流程。'},
 SHOOTING_RELATION_DEVICE_MODE:{id:'P03–P04',eyebrow:'拍摄方式',title:'今天由谁按下快门？',copy:'选择你最自然的协作方式，之后仍可继续调整。'},
 REALITY:{id:'P05',eyebrow:'看清现场',title:'先接受此刻真实存在的条件',copy:'人物、光线、天气与场地，是这次拍摄的起点。'},
 TARGET:{id:'P06',eyebrow:'选择画面',title:'你更想要哪一种感觉？',copy:'这些都是提案，只有你的明确选择才会成为本次目标。'},
 SHOT:{id:'P07',eyebrow:'准备拍摄',title:'把目标变成可执行的一次拍摄',copy:'确认构图和位置后，我们再进入现场引导。'},
 LIVE:{id:'P08',eyebrow:'现场引导',title:'一次只做一个动作',copy:'跟随当前提示，准备好后进入拍摄窗口。'},
 CAPTURE:{id:'P09',eyebrow:'拍摄窗口',title:'拍摄或选择一张真实照片',copy:'照片会先留在本机预览；只有点“使用这张”后才会上传。'},
 QA:{id:'P10',eyebrow:'挑选结果',title:'保留，还是局部重拍？',copy:'局部重拍会保留已经确认的现场和画面目标。'},
 REALITY_PLUS:{id:'P11',eyebrow:'轻度增强',title:'只增强，不改写现实',copy:'当前演示使用确定性效果，不代表真实 AI 能力已经接入。'},
 FINE_TUNE:{id:'P12',eyebrow:'最后调整',title:'保存这次调整',copy:'调整会随作品保存，刷新后仍能恢复。'},
 FINAL:{id:'P13',eyebrow:'我的作品',title:'照片已经准备好',copy:'你可以打开、下载、分享，或开始下一次拍摄。'}
}

const friendlyError=(error:unknown)=>{
 const raw=error instanceof Error?error.message:String(error)
 if(raw.includes('PERMISSION_DENIED'))return '未获得相机权限。你仍可以从设备选择照片。'
 if(raw.includes('NETWORK_UNAVAILABLE'))return '当前网络不可用。照片仍保留在本机，请联网后重试。'
 if(raw.includes('INVALID_ASSET'))return '这张图片无法使用，请选择 JPG、PNG 或 WebP 图片。'
 if(raw.includes('USER_CANCELLED'))return '已取消选择，尚未上传任何照片。'
 if(raw.includes('PLATFORM_UNSUPPORTED')||raw.includes('CAMERA_FAILURE'))return '当前设备无法打开相机，请改用“从设备选择”。'
 if(raw.includes('STORAGE_FAILURE'))return '照片暂时无法保存，请稍后重试。'
 return '暂时无法完成操作，请重试。'
}

export default function Index(){
 const [surface,setSurface]=useState<Surface>('HOME');const [session,setSession]=useState<Session|null>(null)
 const [active,setActive]=useState<SessionSummary[]>([]);const [completed,setCompleted]=useState<SessionSummary[]>([]);const [readiness,setReadiness]=useState<RuntimeReadiness|null>(null)
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [candidate,setCandidate]=useState<LocalCaptureCandidate|null>(null);const [uploaded,setUploaded]=useState<UploadedAsset|null>(null);const [cameraOpen,setCameraOpen]=useState(false)
 const camera=useRef(new H5StillCamera())
 const refreshHome=async()=>{const [runtime,sessions]=await Promise.all([api.readiness(__XFX_PRODUCT_MODE__),api.list()]);setReadiness(runtime);setActive(sessions.filter(item=>item.status==='ACTIVE'));setCompleted(sessions.filter(item=>item.status==='COMPLETED'))}
 useLoad(()=>{refreshHome().catch(e=>setError(friendlyError(e)))})
 useUnload(()=>camera.current.close())
 useEffect(()=>()=>camera.current.close(),[])
 const disposeCandidate=()=>{if(candidate?.previewUrl.startsWith('blob:'))URL.revokeObjectURL(candidate.previewUrl);setCandidate(null);setUploaded(null)}
 const openSession=async(item:SessionSummary)=>{setBusy(true);setError('');try{const value=await api.get(item.session_id);await sessionStorage.write(value.session_id);setSession(value);setSurface('FLOW')}catch(e){setError(friendlyError(e))}finally{setBusy(false)}}
 const start=async()=>{if(!publicRuntimeMayStart(__XFX_PRODUCT_MODE__,Boolean(readiness?.ready))){setError('当前版本尚未达到公开生产就绪标准，已停止创建拍摄会话。');return}setBusy(true);setError('');try{const value=await api.create();await sessionStorage.write(value.session_id);setSession(value);setSurface('FLOW')}catch(e){setError(friendlyError(e))}finally{setBusy(false)}}
 const run=async(action:string,payload:Record<string,any>={})=>{if(!session)return;setBusy(true);setError('');try{setSession(await api.action(session.session_id,action,payload))}catch(e){setError(friendlyError(e))}finally{setBusy(false)}}
 const openCamera=async()=>{setError('');setNotice('');if(platformRegistry.platform==='WECHAT'){const result=await platformRegistry.chooseCandidate('camera');if(result.ok&&result.value)setCandidate(result.value);else setError(friendlyError(new Error(result.code)));return}setCameraOpen(true);await new Promise(resolve=>setTimeout(resolve,0));const result=await camera.current.open('camera-preview');if(!result.ok){setCameraOpen(false);setError(friendlyError(new Error(result.code)))}}
 const switchCamera=async()=>{const result=await camera.current.switch('camera-preview');if(!result.ok)setError(friendlyError(new Error(result.code)))}
 const takeStill=async()=>{const result=await camera.current.capture();if(result.ok&&result.value){camera.current.close();setCameraOpen(false);setCandidate(result.value);await platformRegistry.haptic('CAPTURE')}else setError(friendlyError(new Error(result.code)))}
 const closeCamera=()=>{camera.current.close();setCameraOpen(false);setNotice('相机已关闭，未上传照片。')}
 const importPhoto=async()=>{setError('');const result=await platformRegistry.chooseCandidate('album');if(result.ok&&result.value){disposeCandidate();setCandidate(result.value);setNotice('照片仅在本机等待确认。')}else if(result.code!=='USER_CANCELLED')setError(friendlyError(new Error(result.code)))}
 const retake=()=>{disposeCandidate();setNotice('已丢弃本机预览，服务器上传数未改变。')}
 const confirmCapture=async()=>{if(!session||!candidate)return;setBusy(true);setError('');setNotice('正在保存你确认的照片…');try{const network=await platformRegistry.networkStatus();if(!network.ok)throw new Error(network.code);let accepted=uploaded;if(!accepted){const result=await platformRegistry.uploadCandidate(candidate);if(!result.ok||!result.value)throw new Error(result.code);accepted=result.value;setUploaded(accepted)}const value=await api.action(session.session_id,'CREATE_CAPTURE',{uploaded_asset_id:accepted.asset_id},confirmationKey(candidate.id));setSession(value);disposeCandidate();setNotice('照片已确认并保存。')}catch(e){setError(friendlyError(e));setNotice('照片仍保留在本机，可直接重试。')}finally{setBusy(false)}}
 const finalDownload=async()=>{if(!session)return;const result=await platformRegistry.download(api.finalDownloadUrl(session.session_id));setNotice(result.ok?'下载已开始。':'当前无法下载，请稍后重试。')}
 const finalShare=async()=>{if(!session)return;const result=await platformRegistry.share(api.finalDownloadUrl(session.session_id));setNotice(result.ok?'已打开系统分享。':'当前环境不支持直接分享，你仍可以先下载照片。')}
 const backHome=async()=>{camera.current.close();setCameraOpen(false);disposeCandidate();setSession(null);setSurface('HOME');await refreshHome().catch(e=>setError(friendlyError(e)))}
 const goWorks=async()=>{camera.current.close();setCameraOpen(false);disposeCandidate();setSession(null);await refreshHome().catch(e=>setError(friendlyError(e)));setSurface('WORKS')}
 const stage=session?.workflow_stage||'ENTRY';const meta=labels[stage];const targets=session?.candidates?.filter(item=>item.kind==='TARGET')||[]
 const actions=useMemo(()=>{if(!session)return [];if(stage==='ENTRY')return [{label:'朋友帮我拍',fn:()=>run('SELECT_SHOOTING_RELATION',{shooting_relation:'FRIEND'})}];if(stage==='SHOOTING_RELATION_DEVICE_MODE')return [{label:'单设备继续',fn:()=>run('CONFIRM_DEVICE_MODE',{device_mode:'SINGLE'})}];if(stage==='REALITY')return [{label:'接受现场条件',fn:()=>run('ACCEPT_REALITY')}];if(stage==='TARGET'&&targets.length===0)return [{label:'查看画面提案',fn:()=>run('GENERATE_TARGETS')}];if(stage==='TARGET')return targets.map(item=>({label:item.payload.title,fn:()=>run('SELECT_TARGET',{candidate_id:item.candidate_id})}));if(stage==='SHOT')return [{label:'确认拍摄方案',fn:()=>run('ACCEPT_SHOT_DIRECTION')}];if(stage==='LIVE')return [{label:'我已就位',fn:()=>run('ENTER_CAPTURE_WINDOW')}];if(stage==='QA')return [{label:'保留这张照片',fn:()=>run('ACCEPT')},{label:'局部重拍',fn:()=>run('RETAKE_MICRO')}];if(stage==='REALITY_PLUS')return [{label:'接受轻度增强',fn:()=>run('ACCEPT_REALITY_PLUS')},{label:'跳过调整并完成',fn:()=>run('SKIP_FINE_TUNE')}];if(stage==='FINE_TUNE')return [{label:'保存调整并完成',fn:()=>run('SAVE_ADJUSTMENT_RECIPE',{contrast:14})}];return []},[session,stage,targets.length])

 if(surface==='HOME')return <View className='shell home'><View className='top'><Text className='brand'>向风行</Text>{__XFX_PRODUCT_MODE__==='INTERNAL_DEMO'&&<Text className='demoBadge'>内部演示</Text>}</View><View className='visual'><Text className='marker'>REALITY FIRST AI PHOTOGRAPHER</Text><Text className='hero'>把眼前真实，拍成你想要的画面</Text><Text className='copy'>真实照片由你确认后才会上传。未完成的拍摄可以稍后继续。</Text></View>{__XFX_PRODUCT_MODE__==='PRODUCTION'&&!readiness?.ready&&<View className='error'>当前版本尚未达到公开生产就绪标准，虚拟 AI 能力不会以真实能力对外提供。</View>}{active.length>0&&<View className='section'><Text className='sectionTitle'>继续上次拍摄</Text>{active.map(item=><Button className='sessionCard' key={item.session_id} disabled={busy} onClick={()=>openSession(item)}>继续 · {labels[item.workflow_stage]?.eyebrow||'拍摄中'}</Button>)}</View>}<Button className='primary' disabled={busy} onClick={start}>开始新的拍摄</Button><Button className='secondary' onClick={()=>setSurface('WORKS')}>我的作品（{completed.length}）</Button>{error&&<View className='error'>{error}</View>}</View>
 if(surface==='WORKS')return <View className='shell'><View className='top'><Text className='brand'>我的作品</Text><Text className='link' onClick={()=>setSurface('HOME')}>返回</Text></View>{completed.length===0?<Text className='copy'>完成一次拍摄后，作品会出现在这里。</Text>:completed.map(item=><View className='workCard' key={item.session_id}>{item.thumbnail_asset_id&&<Image className='workThumb' mode='aspectFill' src={api.assetContentUrl(item.thumbnail_asset_id)}/>}<Text>完成于 {new Date(item.updated_at).toLocaleString()}</Text><Button className='secondary compact' onClick={()=>openSession(item)}>打开作品</Button></View>)}</View>
 return <View className='shell'><View className='top'><Text className='brand'>向风行</Text><Text className='link' onClick={backHome}>稍后继续</Text></View>{__XFX_PRODUCT_MODE__==='INTERNAL_DEMO'&&<Text className='demoBadge'>内部演示 · 部分智能能力为确定性替身</Text>}<View className='progress'><View className='progressFill' style={{width:`${Math.round((stageOrder.indexOf(stage)+1)/stageOrder.length*100)}%`}}/></View><View className='visual flowVisual'><Text className='marker'>{meta.id} · {meta.eyebrow}</Text><Text className='hero'>{meta.title}</Text><Text className='copy'>{meta.copy}</Text></View>{error&&<View className='error'>{error}<Text className='retry' onClick={()=>session&&api.get(session.session_id).then(setSession).catch(e=>setError(friendlyError(e)))}>重新读取拍摄进度</Text></View>}{notice&&<View className='notice'>{notice}</View>}
  {stage==='CAPTURE'&&<View className='capturePanel'>{cameraOpen&&<><View id='camera-preview' className='cameraPreview'/><View className='inlineActions'><Button className='secondary compact' onClick={switchCamera}>切换前后摄像头</Button><Button className='secondary compact' onClick={closeCamera}>关闭相机</Button></View><Button className='primary' onClick={takeStill}>按下快门</Button></>}{!cameraOpen&&!candidate&&<><Button className='primary' onClick={openCamera}>打开相机</Button><Button className='secondary' onClick={importPhoto}>从设备选择照片</Button></>}{candidate&&<><Image className='candidatePreview' mode='aspectFit' src={candidate.previewUrl}/><Text className='privacyNote'>这张照片尚未上传。确认前可安全重拍或返回。</Text><View className='inlineActions'><Button className='secondary compact' disabled={busy} onClick={retake}>重拍</Button><Button className='primary compact' disabled={busy} onClick={confirmCapture}>{busy?'保存中…':'使用这张'}</Button></View></>}</View>}
  {stage!=='CAPTURE'&&stage!=='FINAL'&&<View className='actions'>{actions.map((item,index)=><Button key={item.label} disabled={busy} className={index===0?'primary':'secondary'} onClick={item.fn}>{busy&&index===0?'处理中…':item.label}</Button>)}</View>}{stage==='FINAL'&&<View className='final'>{session?.state?.final?.source_upload_asset_id&&<Image className='finalImage' mode='aspectFit' src={api.finalDownloadUrl(session.session_id)}/>}<Button className='primary' onClick={finalDownload}>下载照片</Button><Button className='secondary' onClick={finalShare}>分享照片</Button><Button className='secondary' onClick={start}>开始新的拍摄</Button><Button className='secondary' onClick={goWorks}>返回我的作品</Button></View>}</View>
}
