export type AIStageState=
 |'IDLE'
 |'SUBJECT_ANALYZING'
 |'SCENE_LIGHT_ANALYZING'
 |'DIRECTOR_GENERATING'
 |'DIRECTOR_VALIDATING'
 |'PLANS_READY'
 |'CAPTURE_CHECKING'
 |'REALITY_PLUS_PLANNING'
 |'REALITY_PLUS_EDITING'
 |'REALITY_PLUS_VALIDATING'
 |'FAILED'

export type AIStageEvent={
 eventId:string
 jobId:string
 sessionId:string
 sessionRevision:number
 state:AIStageState
 occurredAt:string
 errorCode?:string
}

export type AIStageViewState={
 state:AIStageState
 activeJobId:string|null
 sessionRevision:number
 errorCode:string|null
}

export const initialAIStageState:AIStageViewState={state:'IDLE',activeJobId:null,sessionRevision:0,errorCode:null}

export function applyAIStageEvent(current:AIStageViewState,event:AIStageEvent):AIStageViewState{
 if(event.sessionRevision<current.sessionRevision)return current
 return {
  state:event.state,
  activeJobId:event.state==='IDLE'||event.state==='PLANS_READY'||event.state==='FAILED'?null:event.jobId,
  sessionRevision:event.sessionRevision,
  errorCode:event.errorCode??null,
 }
}

export const aiStageCopy:Record<Exclude<AIStageState,'IDLE'|'PLANS_READY'|'FAILED'>,string>={
 SUBJECT_ANALYZING:'正在理解人物',
 SCENE_LIGHT_ANALYZING:'正在分析场景和光线',
 DIRECTOR_GENERATING:'正在生成拍摄方案',
 DIRECTOR_VALIDATING:'正在验证拍摄方案',
 CAPTURE_CHECKING:'正在检查成片',
 REALITY_PLUS_PLANNING:'正在规划光线和色彩调整',
 REALITY_PLUS_EDITING:'正在调整光线和色彩',
 REALITY_PLUS_VALIDATING:'正在确认精修结果',
}

export function aiStagePresentation(state:AIStageState):{label:string|null;percentage:null}{
 if(state==='IDLE'||state==='PLANS_READY'||state==='FAILED')return {label:null,percentage:null}
 return {label:aiStageCopy[state],percentage:null}
}
