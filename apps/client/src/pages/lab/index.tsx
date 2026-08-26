import {Button,ScrollView,Text,View} from '@tarojs/components'
import {useLoad} from '@tarojs/taro'
import {useState} from 'react'
import {api,LabScenario,ReplayResult} from '../../api/client'
import {RootCauseDiagnostic} from '../../diagnostics/RootCauseDiagnostic'
import './index.css'

const modes=['FROM_SCRATCH','FROM_CHECKPOINT','FAULT_INJECTED']
export default function ReplayLab(){
 const [scenarios,setScenarios]=useState<LabScenario[]>([]);const [profiles,setProfiles]=useState<Array<{profile:string}>>([]);const [scenario,setScenario]=useState('S01_HAPPY_PATH');const [mode,setMode]=useState('FROM_SCRATCH');const [profile,setProfile]=useState('H5_FULL');const [result,setResult]=useState<ReplayResult|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('')
 useLoad(()=>{if(__XFX_LAB_MODE__&&!__XFX_DIAGNOSTIC_MODE__)Promise.all([api.labScenarios(),api.labPlatformProfiles()]).then(([items,platforms])=>{setScenarios(items);setProfiles(platforms)}).catch(e=>setError(String(e)))})
 if(__XFX_DIAGNOSTIC_MODE__)return <RootCauseDiagnostic/>
 if(!__XFX_LAB_MODE__)return <View className='labUnavailable'><Text className='labCode'>LAB_DISABLED</Text><Text>Replay Lab is unavailable in this build.</Text></View>
 const run=async()=>{setBusy(true);setError('');try{setResult(await api.runReplay(scenario,mode,mode==='FROM_CHECKPOINT'?5:undefined,profile))}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 const selected=scenarios.find(x=>x.scenario_id===scenario)
 return <View className='lab'>
  <View className='labHeader'><View><Text className='labEyebrow'>M03 · DEVELOPMENT ONLY</Text><Text className='labTitle'>Replay E2E Lab</Text></View><Text className='labStatus'>{result?.evaluation_status||'READY'}</Text></View>
  <View className='panel'><Text className='panelTitle'>Scenario Selector</Text><ScrollView scrollX className='chips'>{scenarios.map(item=><Text key={item.scenario_id} className={scenario===item.scenario_id?'chip active':'chip'} onClick={()=>setScenario(item.scenario_id)}>{item.scenario_id}</Text>)}</ScrollView><Text className='summary'>{selected?.purpose}</Text></View>
  <View className='panel'><Text className='panelTitle'>Replay Mode</Text><View className='modeRow'>{modes.map(item=><Text key={item} className={mode===item?'mode active':'mode'} onClick={()=>setMode(item)}>{item}</Text>)}</View><Text className='panelTitle'>Platform Profile</Text><ScrollView scrollX className='chips'>{profiles.map(item=><Text key={item.profile} className={profile===item.profile?'chip active':'chip'} onClick={()=>setProfile(item.profile)}>{item.profile}</Text>)}</ScrollView><Text className='summary'>Fault Plan · {selected?.fault_plan?.[0]?.type||'NONE'} · Checkpoint {mode==='FROM_CHECKPOINT'?'AFTER_TARGET':'OFF'} · Platform {profile}</Text><Button className='run' disabled={busy} onClick={run}>{busy?'RUNNING…':'Run Replay'}</Button></View>
  {error&&<View className='error'>{error}</View>}
  {result&&<>
   <View className='metrics'><View><Text className='metric'>{result.final_stage}</Text><Text>Final Stage</Text></View><View><Text className='metric'>{result.duration_ms}ms</Text><Text>Duration</Text></View><View><Text className='metric'>{result.trace.length}</Text><Text>Trace Steps</Text></View><View><Text className='metric'>{result.diff[0]?.status}</Text><Text>Semantic Diff</Text></View></View>
   <View className='panel'><Text className='panelTitle'>Platform Runtime · {result.platform_profile}</Text>{result.platform_adapters?.filter(item=>['CameraAdapter','ShareAdapter','HapticAdapter','AlbumAdapter','StorageAdapter','NetworkAdapter'].includes(item.capability_name)).map(item=><Text className='line' key={item.capability_name}>{item.capability_name} · {item.adapter_id} · {item.support_level}</Text>)}</View>
   <View className='panel'><Text className='panelTitle'>Workflow / Action Timeline</Text>{result.trace.map((step,index)=><View className={step.error_contract?'trace fault':'trace'} key={`${index}-${step.action_name}`}><Text className='traceIndex'>{String(index).padStart(2,'0')}</Text><View><Text className='traceAction'>{step.action_name}</Text><Text className='traceMeta'>{step.pre_stage} r{step.pre_revision} → {step.post_stage} r{step.post_revision} · {step.duration_ms}ms</Text>{step.error_contract&&<Text className='traceError'>{step.error_contract.error_code}</Text>}</View></View>)}</View>
   <View className='grid'><View className='panel'><Text className='panelTitle'>Event Timeline</Text>{result.trace.flatMap(x=>x.events_appended).map((x,i)=><Text className='line' key={`${x}-${i}`}>{x}</Text>)}</View><View className='panel'><Text className='panelTitle'>Asset Lineage</Text>{result.trace.flatMap(x=>x.assets_appended).map((x,i)=><Text className='line' key={`${x}-${i}`}>{i?'↓ ':''}{x}</Text>)}</View></View>
   <View className='panel'><Text className='panelTitle'>Candidate / Accepted</Text>{result.trace.filter(x=>x.candidate_summary.count).slice(-3).map((x,i)=><Text className='line' key={i}>Candidates {x.candidate_summary.count} · Accepted {x.candidate_summary.accepted}</Text>)}</View>
   <View className='panel'><Text className='panelTitle'>State Diff & Evaluation</Text><Text className={result.diff[0]?.status==='MATCH'?'pass':'fail'}>{result.diff[0]?.status}</Text><View className='dimension'>{Object.entries(result.evaluation.dimensions).map(([key,value])=><Text key={key}>{key} · {value}</Text>)}</View></View>
  </>}
 </View>
}
