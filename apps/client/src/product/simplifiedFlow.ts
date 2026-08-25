import type {UserPreferences} from './userPreferences'

export type UserVisibleStage='START'|'SHOOT'|'REVIEW'|'FINAL'
export type FlowSession={session_id:string;workflow_stage:string;candidates?:Array<any>}
export type FlowAction=(action:string,payload?:Record<string,any>)=>Promise<FlowSession>
export type AutoAdvanceResult={session:FlowSession;status:'READY'|'STOPPED';actions:string[];error?:unknown}

export function userVisibleStage(workflowStage:string):UserVisibleStage{
 if(workflowStage==='FINAL')return 'FINAL'
 if(workflowStage==='QA'||workflowStage==='REALITY_PLUS'||workflowStage==='FINE_TUNE')return 'REVIEW'
 if(['SHOOTING_RELATION_DEVICE_MODE','REALITY','TARGET','SHOT','LIVE','CAPTURE'].includes(workflowStage))return 'SHOOT'
 return 'START'
}

async function guardedAdvance(initial:FlowSession,run:FlowAction,next:(session:FlowSession)=>{action:string;payload?:Record<string,any>}|null,max=12):Promise<AutoAdvanceResult>{
 let current=initial;const actions:string[]=[]
 try{
  for(let index=0;index<max;index+=1){const step=next(current);if(!step)return {session:current,status:'READY',actions};current=await run(step.action,step.payload||{});actions.push(step.action)}
  return {session:current,status:'STOPPED',actions,error:new Error('AUTO_ADVANCE_LIMIT')}
 }catch(error){return {session:current,status:'STOPPED',actions,error}}
}

export function advanceNewSessionToShoot(initial:FlowSession,preferences:UserPreferences,run:FlowAction):Promise<AutoAdvanceResult>{
 return guardedAdvance(initial,run,session=>{
  const stage=session.workflow_stage
  if(stage==='ENTRY')return {action:'SELECT_SHOOTING_RELATION',payload:{shooting_relation:preferences.shooting_relation_default}}
  if(stage==='SHOOTING_RELATION_DEVICE_MODE')return {action:'CONFIRM_DEVICE_MODE',payload:{device_mode:preferences.device_mode_default}}
  if(stage==='REALITY')return {action:'ACCEPT_REALITY'}
  if(stage==='TARGET'){
   const target=session.candidates?.find(item=>item.kind==='TARGET')
   return target?{action:'SELECT_TARGET',payload:{candidate_id:target.candidate_id}}:{action:'GENERATE_TARGETS'}
  }
  if(stage==='SHOT')return {action:'ACCEPT_SHOT_DIRECTION'}
  if(stage==='LIVE')return {action:'ENTER_CAPTURE_WINDOW'}
  return null
 })
}

export function advanceConfirmedCaptureToFinal(initial:FlowSession,preferences:UserPreferences,run:FlowAction):Promise<AutoAdvanceResult>{
 if(!preferences.auto_processing_enabled)return Promise.resolve({session:initial,status:'READY',actions:[]})
 return guardedAdvance(initial,run,session=>{
  if(session.workflow_stage==='QA')return {action:'ACCEPT'}
  if(session.workflow_stage==='REALITY_PLUS')return {action:preferences.open_fine_tune_after_processing?'ACCEPT_REALITY_PLUS':'SKIP_FINE_TUNE'}
  return null
 })
}

export function fallbackVisible(cameraFailure:boolean,userRequested:boolean):boolean{return cameraFailure||userRequested}
export function interactionDecisionCount(activeSession:boolean):number{return activeSession?2:2}
