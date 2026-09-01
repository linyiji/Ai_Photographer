import { V4_ACTION_COPY } from './controller.js';
import type { BodyRegionV01, V4Action, V4Snapshot } from './types.js';
export type V4PresentationName='DISARMED'|'ACQUIRING'|'ACTION_REQUIRED'|'WAITING_FOR_RESPONSE'|'WAITING_FOR_SETTLE'|'VERIFYING_READY'|'READY';
export interface V4Presentation {state:V4PresentationName;primary_copy_zh:string;overlay_copy_zh:string;voice_copy_zh:string;action:V4Action|null;display_axis_sign:-1|0|1}
const result=(state:V4PresentationName,text:string,action:V4Action|null=null,overlay=text,displayAxisSign:-1|0|1=0):Readonly<V4Presentation>=>Object.freeze({state,primary_copy_zh:text,overlay_copy_zh:overlay,voice_copy_zh:text,action,display_axis_sign:displayAxisSign});
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
  if(!snapshot?.armed)return result('DISARMED','准备完成，点击开始 V4 引导');if(snapshot.ready)return result('READY','好，就这里');if(snapshot.action)return result('ACTION_REQUIRED',V4_ACTION_COPY[snapshot.action],snapshot.action,V4_ACTION_COPY[snapshot.action],snapshot.direction_decision?.display_axis_sign??0);if(snapshot.active_episode){if(snapshot.active_episode.response_observed)return result('WAITING_FOR_SETTLE','已检测到移动，请自然停下');return result('WAITING_FOR_RESPONSE',snapshot.reminder_due?'还没有检测到移动，请按刚才提示移动一小步':'按刚才提示移动一小步，然后自然停下',snapshot.active_episode.action,V4_ACTION_COPY[snapshot.active_episode.action],snapshot.direction_decision?.display_axis_sign??0);}if(snapshot.acquisition_copy_zh)return result('ACQUIRING',snapshot.acquisition_copy_zh);
  if(snapshot.stage==='ACQUIRE_SUBJECT'||snapshot.stage==='ACQUIRE_REQUIRED_BODY')return result('ACQUIRING',recognitionFirstCopy(snapshot));
  if(snapshot.target_gap.ready&&(snapshot.stage==='ADJUST_SCALE'||snapshot.stage==='ALIGN_PRIMARY_ANCHOR'))return result('ACQUIRING',`已识别到人物。${snapshot.target.label}所需测量有效，正在判断人物大小和位置。`);
  const required=snapshot.target.ready_stable_ms;return snapshot.observation.stable&&snapshot.observation.quality==='GOOD'?result('VERIFYING_READY',`位置合适，稳定确认 ${Math.min(snapshot.ready_hold_elapsed_ms,required).toFixed(0)} / ${required} ms`):result('VERIFYING_READY','位置已满足，检测到轻微移动，请停稳');
}
