import { V3_ACTION_COPY } from './controller.js';
import type { V3Action, V3Snapshot } from './types.js';

export type LivePresentationStateNameV01 =
  | 'DISARMED'
  | 'ACQUIRING'
  | 'ACTION_REQUIRED'
  | 'WAITING_FOR_RESPONSE'
  | 'WAITING_FOR_SETTLE'
  | 'EVALUATING'
  | 'STAGE_TRANSITION'
  | 'VERIFYING_READY'
  | 'RETRY_REQUIRED'
  | 'PAUSED'
  | 'READY';

export interface LivePresentationStateV01 {
  state: LivePresentationStateNameV01;
  primary_copy_zh: string;
  overlay_copy_zh: string;
  action: V3Action | null;
}

const ACTION_PRIMARY:Readonly<Record<V3Action,string>>=Object.freeze({
  MOVE_LEFT_SMALL:'向你自己的左侧移动一小步，然后自然停下',
  MOVE_RIGHT_SMALL:'向你自己的右侧移动一小步，然后自然停下',
  MOVE_CLOSER_SMALL:'靠近一小步，然后自然停下',
  MOVE_FARTHER_SMALL:'退后一小步，然后自然停下',
});

const RETRY_PRIMARY:Readonly<Record<V3Action,string>>=Object.freeze({
  MOVE_LEFT_SMALL:'还差一点，再向你自己的左侧移动一小步，然后自然停下',
  MOVE_RIGHT_SMALL:'还差一点，再向你自己的右侧移动一小步，然后自然停下',
  MOVE_CLOSER_SMALL:'还差一点，再靠近一小步，然后自然停下',
  MOVE_FARTHER_SMALL:'还差一点，再退后一小步，然后自然停下',
});

const result=(state:LivePresentationStateNameV01,primary_copy_zh:string,overlay_copy_zh=primary_copy_zh,action:V3Action|null=null):Readonly<LivePresentationStateV01>=>Object.freeze({state,primary_copy_zh,overlay_copy_zh,action});

export function deriveLivePresentationStateV01(snapshot:V3Snapshot|null):Readonly<LivePresentationStateV01>{
  if(!snapshot?.armed)return result('DISARMED','准备完成，点击开始引导');
  if(snapshot.ready||snapshot.stage==='READY_LATCHED')return result('READY','好，就这里','READY · 好，就这里');
  if(snapshot.stage==='PAUSED')return result('PAUSED','先站稳，我们重新确认一下');
  const measurement=snapshot.measurement;
  if(snapshot.stage==='ACQUIRE'||measurement.subject_state!=='PRESENT'||measurement.measurement_quality==='INVALID'||!measurement.fresh){
    const interrupted=measurement.subject_state!=='PRESENT'||measurement.measurement_quality==='INVALID'||!measurement.fresh;
    return result('ACQUIRING',interrupted?'人物测量中断，请保持完整可见并站稳':'请保持人物完整可见并站稳');
  }
  const active=snapshot.active_episode;
  if(active){
    if(snapshot.action){
      const retry=snapshot.retry_action_candidate===snapshot.action;
      return result(retry?'RETRY_REQUIRED':'ACTION_REQUIRED',retry?RETRY_PRIMARY[snapshot.action]:ACTION_PRIMARY[snapshot.action],V3_ACTION_COPY[snapshot.action],snapshot.action);
    }
    if(active.movement_started_at!==null||active.meaningful_motion_at!==null)return result('WAITING_FOR_SETTLE','已检测到移动，请自然停下');
    return result('WAITING_FOR_RESPONSE','按刚才提示移动一小步，然后自然停下',V3_ACTION_COPY[active.action],active.action);
  }
  if(snapshot.stage==='VERIFY')return result('VERIFYING_READY','位置合适，请保持片刻',`位置合适 · ${Math.min(snapshot.ready_hold_elapsed_ms,snapshot.ready_hold_required_ms).toFixed(0)} / ${snapshot.ready_hold_required_ms} ms`);
  if(snapshot.episode_evaluated_now&&snapshot.episode?.stage==='FRAMING'&&snapshot.stage==='ALIGN_X')return result('STAGE_TRANSITION','距离合适，正在确认水平位置','距离 ✓ · 正在检查左右');
  if(snapshot.episode_evaluated_now)return result('EVALUATING','正在确认这次调整');
  if(snapshot.retry_pending)return result('EVALUATING','正在确认这次调整');
  if(snapshot.last_episode_action&&snapshot.episode?.stage!==snapshot.stage)return result('STAGE_TRANSITION',snapshot.stage==='ALIGN_X'?'距离合适，正在确认水平位置':'正在确认下一步');
  return result('EVALUATING','正在确认这次调整');
}
