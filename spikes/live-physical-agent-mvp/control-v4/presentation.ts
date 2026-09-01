import { V4_ACTION_COPY } from './controller.js';
import type { BodyRegionV01, V4Action, V4Snapshot } from './types.js';
import type { VoicePresentationCueV01, VoiceSemanticIdV01 } from './voice-types.js';
export type V4PresentationName='DISARMED'|'ACQUIRING'|'ACTION_REQUIRED'|'WAITING_FOR_RESPONSE'|'WAITING_FOR_SETTLE'|'VERIFYING_READY'|'READY';
export interface V4Presentation {presentation_version:'LivePresentationModelV03';state:V4PresentationName;primary_copy_zh:string;overlay_copy_zh:string;voice_copy_zh:string|null;voice:Readonly<VoicePresentationCueV01>|null;action:V4Action|null;display_axis_sign:-1|0|1;current_framing_ready:boolean;trial_success_latched:boolean}
const actionVoice:Readonly<Partial<Record<V4Action,Readonly<{semantic:VoiceSemanticIdV01;phrase:string}>>>>=Object.freeze({
  MOVE_LEFT_SMALL:Object.freeze({semantic:'SUBJECT_LEFT_SMALL',phrase:'往你自己的左边一点'}),
  MOVE_RIGHT_SMALL:Object.freeze({semantic:'SUBJECT_RIGHT_SMALL',phrase:'往你自己的右边一点'}),
  MOVE_CLOSER_SMALL:Object.freeze({semantic:'MOVE_CLOSER_SMALL',phrase:'靠近一点'}),
  MOVE_FARTHER_SMALL:Object.freeze({semantic:'MOVE_FARTHER_SMALL',phrase:'退后一点'}),
});
function voiceCue(snapshot:V4Snapshot|null,state:V4PresentationName,action:V4Action|null):Readonly<VoicePresentationCueV01>|null{
  if(!snapshot?.armed)return null;
  const epoch=snapshot.active_episode?.control_epoch,controlEpochId=epoch?`${epoch.trial_id}:${epoch.episode_id}`:null;
  let semantic:VoiceSemanticIdV01|null=null,phrase='',priority:1|2|3|4=3,repeat:'ONCE_PER_CONTROL_EPOCH'|'ONCE_PER_SEMANTIC_ENTRY'='ONCE_PER_SEMANTIC_ENTRY';
  if(state==='ACTION_REQUIRED'&&action){const mapped=actionVoice[action];if(!mapped)return null;semantic=mapped.semantic;phrase=mapped.phrase;priority=2;repeat='ONCE_PER_CONTROL_EPOCH';}
  else if(state==='ACQUIRING'&&snapshot.stage==='ACQUIRE_SUBJECT'&&!snapshot.observation.subject_recognition.detected){semantic='ACQUIRE_SUBJECT';phrase='站到画面里';priority=3;}
  else if(state==='WAITING_FOR_SETTLE'){semantic='HOLD_STILL';phrase='好，站定';priority=1;}
  else if(state==='VERIFYING_READY'){semantic='VERIFY';phrase='很好，保持一下';priority=3;}
  else if(state==='READY'&&snapshot.current_framing_ready){semantic='CURRENT_READY_ENTER';phrase='好，就这里，可以拍了';priority=1;}
  if(!semantic)return null;
  return Object.freeze({enabled:true,cue_id:`voice:${semantic}:${controlEpochId??snapshot.trial_id??'status'}`,semantic_id:semantic,phrase_key:semantic,phrase_text:phrase,priority,interrupt_policy:priority===1?'INTERRUPT_LOWER':state==='ACTION_REQUIRED'?'REPLACE_STALE':'QUEUE_IF_IDLE',repeat_policy:repeat,control_epoch_id:controlEpochId,expires_at:snapshot.timestamp_ms+1800});
}
const result=(snapshot:V4Snapshot|null,state:V4PresentationName,text:string,action:V4Action|null=null,overlay=text,displayAxisSign:-1|0|1=0):Readonly<V4Presentation>=>{const voice=voiceCue(snapshot,state,action);return Object.freeze({presentation_version:'LivePresentationModelV03',state,primary_copy_zh:text,overlay_copy_zh:overlay,voice_copy_zh:voice?.phrase_text??null,voice,action,display_axis_sign:displayAxisSign,current_framing_ready:snapshot?.current_framing_ready??false,trial_success_latched:snapshot?.trial_success_latched??false});};
const regionName:Readonly<Partial<Record<BodyRegionV01,string>>>=Object.freeze({HEAD:'头部',SHOULDERS:'双肩',HIPS:'双髋',KNEES:'双膝',ANKLES:'脚踝'});
const list=(values:readonly string[])=>values.length<=1?(values[0]??''):values.length===2?values.join('和'):`${values.slice(0,-1).join('、')}和${values.at(-1)}`;
function recognitionFirstCopy(snapshot:V4Snapshot):string{
  const recognition=snapshot.observation.subject_recognition,observed=snapshot.observation.observed_body;
  if(!recognition.detected)return '暂未识别到人物，请进入画面并保持片刻';
  if(recognition.lock_state!=='LOCKED'&&recognition.lock_state!=='REACQUIRING')return '已识别到人物，正在稳定跟踪，请保持片刻';
  const visible=(['HEAD','SHOULDERS','HIPS','KNEES','ANKLES'] as const).filter(region=>observed.regions[region].state==='VALID').map(region=>regionName[region]??region);const prefix=`已识别到人物。${visible.length?`当前看到${list(visible)}。`:''}`;
  if(snapshot.target_gap.actionability==='SYSTEM_MEASUREMENT_DEFECT')return `${prefix}当前测量状态异常，已暂停移动提示。`;
  if(snapshot.target_gap.actionability==='WAIT_FOR_STABLE_EVIDENCE')return `${prefix}测量刚出现波动，正在短暂确认。`;
  const missing=[...new Set(snapshot.target_gap.blocking_reasons.map(item=>item.region).filter((region):region is BodyRegionV01=>Boolean(region)).map(region=>regionName[region]).filter((name):name is string=>Boolean(name)))];
  const farther=snapshot.target_gap.blocking_reasons.some(item=>item.actionability==='USER_FIXABLE'&&item.reason==='REGION_EDGE_CROPPED'&&(item.region==='HIPS'||item.region==='KNEES'||item.region==='ANKLES'));
  const persistentLow=snapshot.target_gap.blocking_reasons.some(item=>item.actionability==='USER_FIXABLE'&&(item.reason==='LOW_CONFIDENCE'||item.reason==='INSUFFICIENT_BILATERAL_EVIDENCE'));
  return `${prefix}${missing.length?`${list(missing)}还没有形成有效测量。`:'目标所需的身体测量尚未建立。'}${farther?'请稍微退后，让对应部位完整进入画面。':persistentLow?'请保持身体部位清晰可见；若持续不变，可小幅调整站位或光线。':''}`;
}
export function deriveV4Presentation(snapshot:V4Snapshot|null):Readonly<V4Presentation>{
  if(!snapshot?.armed)return result(snapshot,'DISARMED','准备完成，点击开始 V4 引导');if(snapshot.ready)return result(snapshot,'READY','好，就这里');if(snapshot.action)return result(snapshot,'ACTION_REQUIRED',V4_ACTION_COPY[snapshot.action],snapshot.action,V4_ACTION_COPY[snapshot.action],snapshot.direction_decision?.display_axis_sign??0);if(snapshot.active_episode){if(snapshot.active_episode.response_observed)return result(snapshot,'WAITING_FOR_SETTLE','已检测到移动，请自然停下');return result(snapshot,'WAITING_FOR_RESPONSE',snapshot.reminder_due?'还没有检测到移动，请按刚才提示移动一小步':'按刚才提示移动一小步，然后自然停下',snapshot.active_episode.action,V4_ACTION_COPY[snapshot.active_episode.action],snapshot.direction_decision?.display_axis_sign??0);}if(snapshot.acquisition_copy_zh)return result(snapshot,'ACQUIRING',snapshot.acquisition_copy_zh);
  if(snapshot.stage==='ACQUIRE_SUBJECT'||snapshot.stage==='ACQUIRE_REQUIRED_BODY')return result(snapshot,'ACQUIRING',recognitionFirstCopy(snapshot));
  if(snapshot.target_gap.ready&&(snapshot.stage==='ADJUST_SCALE'||snapshot.stage==='ALIGN_PRIMARY_ANCHOR'))return result(snapshot,'ACQUIRING',`已识别到人物。${snapshot.target.label}所需测量有效，正在判断人物大小和位置。`);
  const required=snapshot.target.ready_stable_ms;return snapshot.observation.stable&&snapshot.observation.quality==='GOOD'?result(snapshot,'VERIFYING_READY',`位置合适，稳定确认 ${Math.min(snapshot.ready_hold_elapsed_ms,required).toFixed(0)} / ${required} ms`):result(snapshot,'VERIFYING_READY','位置已满足，检测到轻微移动，请停稳');
}
