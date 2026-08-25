import {Button,Text,View} from '@tarojs/components'
import Taro,{useLoad} from '@tarojs/taro'
import {useMemo,useState} from 'react'
import {api,Session} from '../../api/client'
import {sessionStorage} from '../../platform/sessionStorage'
import './index.css'

const labels:Record<string,{id:string;eyebrow:string;title:string;copy:string}>={
 ENTRY:{id:'P01',eyebrow:'从一张真正想要的照片开始',title:'风暴来临之前',copy:'AI 摄影师会把现实、目标和现场动作连接成一条可恢复的拍摄流程。'},
 SHOOTING_RELATION_DEVICE_MODE:{id:'P03–P04',eyebrow:'拍摄关系与设备',title:'今天由谁按下快门？',copy:'这个选择只决定协作方式，不改变你的视觉目标。'},
 REALITY:{id:'P05',eyebrow:'Reality Fact Lock',title:'先看清此刻真实存在的条件',copy:'人物、光线、天气与场地将被接受为本次会话事实。'},
 TARGET:{id:'P06',eyebrow:'Visual Target',title:'你要的是哪一种画面？',copy:'候选只是提案，只有明确选择后才成为目标。'},
 SHOT:{id:'P07',eyebrow:'Shot Blueprint',title:'把目标翻译成一次可执行拍摄',copy:'构图、机位、人物位置与主要姿态由后端计划。'},
 LIVE:{id:'P08',eyebrow:'Live Director',title:'一次只做一个动作',copy:'实时提示是短暂运行态，不会逐帧写入后端。'},
 CAPTURE:{id:'P09',eyebrow:'Capture Window',title:'保持不动，准备拍摄',copy:'同一请求重复发送不会创建重复资产。'},
 QA:{id:'P10',eyebrow:'Quality Gate',title:'保留、修复，还是局部重拍？',copy:'重拍严格保留 M01 Workflow 定义的已接受事实。'},
 REALITY_PLUS:{id:'P11',eyebrow:'Reality+',title:'只增强，不篡改现实',copy:'原始拍摄资产始终保留，增强结果拥有明确 lineage。'},
 FINE_TUNE:{id:'P12',eyebrow:'Deterministic Fine Tune',title:'保存可复现的细调配方',copy:'参数会作为 Adjustment Recipe 保存，而不是只留在页面内。'},
 FINAL:{id:'P13',eyebrow:'My Final Photo',title:'这张照片完整地回来了',copy:'刷新后仍可从 SQLite 读回结果、事件与资产链路。'}
}

export default function Index(){
 const [session,setSession]=useState<Session|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [targetFirst,setTargetFirst]=useState(false)
 const restore=async()=>{const id=await sessionStorage.read();if(id)setSession(await api.get(id))}
 useLoad(()=>{restore().catch(()=>sessionStorage.clear())})
 const run=async(action:string,payload:Record<string,any>={})=>{if(!session)return;setBusy(true);setError('');try{setSession(await api.action(session.session_id,action,payload))}catch(e){setError(e instanceof Error?e.message:'请求失败')}finally{setBusy(false)}}
 const start=async()=>{setBusy(true);setError('');try{const value=await api.create();await sessionStorage.write(value.session_id);setSession(value)}catch(e){setError(e instanceof Error?e.message:'无法开始')}finally{setBusy(false)}}
 const stage=session?.workflow_stage||'ENTRY';const meta=labels[stage];const targetCandidates=session?.candidates?.filter(x=>x.kind==='TARGET')||[]
 const actions=useMemo(()=>{
  if(!session)return [{label:'Reality First · 开始',fn:start},{label:'Target First · 先描述想要的画面',fn:()=>setTargetFirst(true)}]
  if(stage==='ENTRY')return [{label:'朋友帮我拍',fn:()=>run('SELECT_SHOOTING_RELATION',{shooting_relation:'FRIEND'})}]
  if(stage==='SHOOTING_RELATION_DEVICE_MODE')return [{label:'单设备继续',fn:()=>run('CONFIRM_DEVICE_MODE',{device_mode:'SINGLE'})}]
  if(stage==='REALITY')return [{label:'接受 Reality',fn:()=>run('ACCEPT_REALITY')}]
  if(stage==='TARGET'&&targetCandidates.length===0)return [{label:'生成 3 个确定性候选',fn:()=>run('GENERATE_TARGETS')}]
  if(stage==='TARGET')return targetCandidates.map(x=>({label:`选择 · ${x.payload.title}`,fn:()=>run('SELECT_TARGET',{candidate_id:x.candidate_id})}))
  if(stage==='SHOT')return [{label:'接受 Shot Blueprint',fn:()=>run('ACCEPT_SHOT_DIRECTION')}]
  if(stage==='LIVE')return [{label:'我已就位 · 进入拍摄窗口',fn:()=>run('ENTER_CAPTURE_WINDOW')}]
  if(stage==='CAPTURE')return [{label:'拍摄',fn:()=>run('CREATE_CAPTURE')}]
  if(stage==='QA')return [{label:'接受照片',fn:()=>run('ACCEPT')},{label:'局部重拍',fn:()=>run('RETAKE_MICRO')}]
  if(stage==='REALITY_PLUS')return [{label:'接受轻度风暴纵深',fn:()=>run('ACCEPT_REALITY_PLUS')},{label:'跳过细调并完成',fn:()=>run('SKIP_FINE_TUNE')}]
  if(stage==='FINE_TUNE')return [{label:'保存配方并完成',fn:()=>run('SAVE_ADJUSTMENT_RECIPE',{contrast:14})}]
  if(stage==='FINAL')return [{label:'开始新的拍摄',fn:start}]
  return []
 },[session,stage,targetCandidates.length])
 if(targetFirst&&!session)return <View className='shell'><Text className='marker'>P02 · TARGET FIRST</Text><Text className='hero'>先说出你想要的画面</Text><Text className='copy'>“风暴到来前，一个人坚定地站在河岸。” 此意图将在会话建立后进入候选生成，不越过 Reality Fact Lock。</Text><Button className='primary' onClick={()=>{setTargetFirst(false);start()}}>保存意图并建立会话</Button><Button className='secondary' onClick={()=>setTargetFirst(false)}>返回</Button></View>
 return <View className='shell'>
  <View className='top'><Text className='brand'>向风行</Text><Text className='status'>{session?`${session.session_id} · r${session.revision}`:'S01'}</Text></View>
  <View className='visual'><Text className='marker'>{meta.id} · {meta.eyebrow}</Text><Text className='hero'>{meta.title}</Text><Text className='copy'>{meta.copy}</Text></View>
  {session&&<View className='evidence'><Text className='evidenceTitle'>BACKEND AUTHORITY</Text><Text>Stage · {stage}</Text><Text>Assets · {session.assets?.length||0}</Text><Text>Events · {session.events?.length||0}</Text></View>}
  {error&&<View className='error'><Text>{error}</Text><Text className='retry' onClick={()=>session&&api.get(session.session_id).then(setSession)}>重新读取会话</Text></View>}
  <View className='actions'>{actions.map((item,index)=><Button key={`${item.label}-${index}`} disabled={busy} className={index===0?'primary':'secondary'} onClick={item.fn}>{busy&&index===0?'处理中…':item.label}</Button>)}</View>
  {stage==='FINAL'&&<View className='final'><Text>FINAL · repo-asset://scenario-fixtures/s01/final-001.jpg</Text><Text>原始 Capture、Reality+ 与 Adjustment Recipe lineage 可回读。</Text></View>}
 </View>
}
