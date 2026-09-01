import { V4_ACTION_COPY } from './controller.js';
import type { BodyRegionV01, CanonicalCommandActionV01, V4Action, V4Snapshot } from './types.js';
import type { VoicePresentationCueV01 } from './voice-types.js';

export type V4PresentationName='DISARMED'|'ACQUIRING'|'ACTION_REQUIRED'|'WAITING_FOR_RESPONSE'|'WAITING_FOR_SETTLE'|'VERIFYING_READY'|'READY';
export interface V4Presentation {presentation_version:'LivePresentationModelV04';state:V4PresentationName;primary_copy_zh:string;secondary_copy_zh:string;overlay_copy_zh:string;voice_copy_zh:string|null;voice:Readonly<VoicePresentationCueV01>|null;action:V4Action|null;command_id:string|null;display_axis_sign:-1|0|1;current_framing_ready:boolean;trial_success_latched:boolean}

const actionPhrase=(action:CanonicalCommandActionV01):string=>action==='HOLD_POSITION'?'位置合适，保持一下':V4_ACTION_COPY[action];
function voiceCue(snapshot:V4Snapshot|null):Readonly<VoicePresentationCueV01>|null{
  const event=snapshot?.canonical_guidance.voice_event,command=snapshot?.canonical_guidance.command;
  if(!snapshot?.armed||!event||!command)return null;
  let phrase=actionPhrase(command.action),priority:1|2|3|4=2;
  if(event==='COMMAND_INVALIDATED'){phrase='测量中断，请保持片刻';priority=1;}
  else if(event==='DIRECTION_REVERSED'){phrase='方向不对，请停一下';priority=1;}
  else if(event==='TARGET_REACHED'){phrase='位置合适，保持一下';priority=1;}
  else if(event==='SAFETY_EVENT'){phrase='请先停下';priority=1;}
  return Object.freeze({enabled:true,cue_id:`voice:${event}:${command.command_id}`,semantic_id:event,phrase_key:event,phrase_text:phrase,priority,interrupt_policy:priority===1?'INTERRUPT_LOWER':'REPLACE_STALE',repeat_policy:'ONCE_PER_COMMAND_EVENT',control_epoch_id:command.control_epoch_id,command_id:command.command_id,target_id:command.target_id,expires_at:snapshot.timestamp_ms+2200});
}
const result=(snapshot:V4Snapshot|null,state:V4PresentationName,primary:string,secondary:string,action:V4Action|null=null,overlay=primary,displayAxisSign:-1|0|1=0):Readonly<V4Presentation>=>{const voice=voiceCue(snapshot);return Object.freeze({presentation_version:'LivePresentationModelV04',state,primary_copy_zh:primary,secondary_copy_zh:secondary,overlay_copy_zh:overlay,voice_copy_zh:voice?.phrase_text??null,voice,action,command_id:snapshot?.canonical_guidance.command?.command_id??null,display_axis_sign:displayAxisSign,current_framing_ready:snapshot?.current_framing_ready??false,trial_success_latched:snapshot?.trial_success_latched??false});};
const regionName:Readonly<Partial<Record<BodyRegionV01,string>>>=Object.freeze({HEAD:'头部',SHOULDERS:'双肩',HIPS:'双髋',KNEES:'双膝',ANKLES:'脚踝'});
const list=(values:readonly string[])=>values.length<=1?(values[0]??''):values.length===2?values.join('和'):`${values.slice(0,-1).join('、')}和${values.at(-1)}`;
function recognitionFirstCopy(snapshot:V4Snapshot):string{
  const recognition=snapshot.observation.subject_recognition,observed=snapshot.observation.observed_body;
  if(!recognition.detected)return '暂未识别到人物，请进入画面';
  if(recognition.lock_state!=='LOCKED'&&recognition.lock_state!=='REACQUIRING')return '已识别到人物，正在稳定跟踪';
  const visible=(['HEAD','SHOULDERS','HIPS','KNEES','ANKLES'] as const).filter(region=>observed.regions[region].state==='VALID').map(region=>regionName[region]??region);const prefix=`已识别到人物。${visible.length?`当前看到${list(visible)}。`:''}`;
  if(snapshot.target_gap.actionability==='SYSTEM_MEASUREMENT_DEFECT')return `${prefix}当前测量状态异常，已暂停移动提示。`;
  if(snapshot.target_gap.actionability==='WAIT_FOR_STABLE_EVIDENCE')return `${prefix}测量刚出现波动，正在短暂确认。`;
  const missing=[...new Set(snapshot.target_gap.blocking_reasons.map(item=>item.region).filter((region):region is BodyRegionV01=>Boolean(region)).map(region=>regionName[region]).filter((name):name is string=>Boolean(name)))];
  const farther=snapshot.target_gap.blocking_reasons.some(item=>item.actionability==='USER_FIXABLE'&&item.reason==='REGION_EDGE_CROPPED'&&(item.region==='HIPS'||item.region==='KNEES'||item.region==='ANKLES'));
  return `${prefix}${missing.length?`${list(missing)}还没有形成有效测量。`:'目标所需的身体测量尚未建立。'}${farther?'请稍微退后，让对应部位完整进入画面。':''}`;
}
export function deriveV4Presentation(snapshot:V4Snapshot|null):Readonly<V4Presentation>{
  if(!snapshot?.armed)return result(snapshot,'DISARMED','准备完成，点击开始 V4 引导','目标尚未锁定');
  if(snapshot.ready)return result(snapshot,'READY','好，就这里，可以拍了','构图稳定性已通过');
  if(snapshot.action)return result(snapshot,'ACTION_REQUIRED',V4_ACTION_COPY[snapshot.action],'请只做这一小步调整',snapshot.action,V4_ACTION_COPY[snapshot.action],snapshot.direction_decision?.display_axis_sign??0);
  if(snapshot.active_episode){const command=snapshot.canonical_guidance.command,commandAction=command?.action,activeAction=commandAction&&commandAction!=='HOLD_POSITION'?commandAction:snapshot.active_episode.action,primary=actionPhrase(activeAction);if(snapshot.active_episode.response_observed)return result(snapshot,'WAITING_FOR_SETTLE',primary,'正在接近目标；系统持续测量，不需要刻意站定',snapshot.active_episode.action,primary,snapshot.direction_decision?.display_axis_sign??0);return result(snapshot,'WAITING_FOR_RESPONSE',primary,snapshot.reminder_due?'仍未检测到目标方向上的变化':'等待目标方向上的有效响应',snapshot.active_episode.action,primary,snapshot.direction_decision?.display_axis_sign??0);}
  if(snapshot.acquisition_copy_zh)return result(snapshot,'ACQUIRING',snapshot.acquisition_copy_zh,'尚未生成移动命令');
  if(snapshot.stage==='ACQUIRE_SUBJECT'||snapshot.stage==='ACQUIRE_REQUIRED_BODY')return result(snapshot,'ACQUIRING',recognitionFirstCopy(snapshot),'正在建立目标所需观察');
  if(snapshot.target_gap.ready&&(snapshot.stage==='ADJUST_SCALE'||snapshot.stage==='ALIGN_PRIMARY_ANCHOR'||snapshot.stage==='ALIGN_SECONDARY_CONSTRAINT'))return result(snapshot,'ACQUIRING',`已锁定 ${snapshot.target.label} 目标；测量有效，正在判断人物大小和位置`,'正在计算与目标的单维误差');
  const verification=snapshot.canonical_guidance.verification;return result(snapshot,'VERIFYING_READY','位置合适，保持一下',`正在确认稳定性 · ${Math.round(verification.in_target_ratio*100)}% 在目标内 · ${verification.window_ms.toFixed(0)} / 600 ms`);
}
