import { resolveLiveConstraintsV01 } from './constraints.js';
import type { ControlEpochV04, HumanObservationV02, LiveConstraintStateV01, LiveTargetV02, V4Action, V4Episode, V4Metrics, V4Outcome, V4Snapshot, V4Stage } from './types.js';

export const V4_ACTION_COPY:Readonly<Record<V4Action,string>>=Object.freeze({MOVE_LEFT_SMALL:'向你自己的左侧移动一小步，然后自然停下',MOVE_RIGHT_SMALL:'向你自己的右侧移动一小步，然后自然停下',MOVE_CLOSER_SMALL:'靠近一小步，然后自然停下',MOVE_FARTHER_SMALL:'退后一小步，然后自然停下'});
const metrics=():V4Metrics=>({issued_actions:0,responded_actions:0,no_response_actions:0,causally_evaluable_actions:0,invalidated_actions:0,target_reached_count:0,improved_count:0,no_effect_count:0,wrong_direction_count:0,no_response_outcome_count:0,no_response_reissue_count:0,passive_relation_change_count:0,post_ready_ordinary:0,action_effectiveness:null,provider_calls:0,luna_calls:0,backend_per_frame_calls:0,raw_video_upload:0});
export interface V4Config {stage_persistence_ms:number;response_reminder_ms:number;long_no_response_ms:number;settle_window_ms:number;ready_stable_ms:number;material_improvement_normalized:number;material_improvement_ratio:number}
export const V4_CONFIG:Readonly<V4Config>=Object.freeze({stage_persistence_ms:250,response_reminder_ms:900,long_no_response_ms:4500,settle_window_ms:375,ready_stable_ms:600,material_improvement_normalized:.18,material_improvement_ratio:.15});

export class HumanTargetRelativeServoV04 {
  private armed=false;private ready=false;private trialId=0;private episodeId=0;private stageSince=0;private resolvedStage:V4Stage='ACQUIRE_SUBJECT';private readyEvidenceMs=0;private lastVerifyAt:number|null=null;private verifyUnstableSince:number|null=null;private episode:V4Episode|null=null;private lastEpisode:V4Episode|null=null;private state=metrics();
  constructor(private target:LiveTargetV02,private readonly config=V4_CONFIG){}
  setTarget(target:LiveTargetV02):void{this.target=target;this.reset();}
  arm(now:number):void{this.armed=true;this.ready=false;this.trialId+=1;this.stageSince=now;this.resolvedStage='ACQUIRE_SUBJECT';this.resetVerifyEvidence();this.episode=this.lastEpisode=null;this.state=metrics();}
  reset():void{this.armed=false;this.ready=false;this.trialId=this.episodeId=0;this.stageSince=0;this.resolvedStage='ACQUIRE_SUBJECT';this.resetVerifyEvidence();this.episode=this.lastEpisode=null;this.state=metrics();}
  update(observation:HumanObservationV02):Readonly<V4Snapshot>{
    let constraints=resolveLiveConstraintsV01(observation,this.target);
    if(!this.armed)return this.snapshot(observation,constraints,null,null);
    if(this.ready){constraints=Object.freeze({...constraints,stage:'READY_LATCHED',all_satisfied:true});return this.snapshot(observation,constraints,null,null);}
    if(this.episode)return this.updateEpisode(observation,constraints);
    if(constraints.stage==='VERIFY'){
      const delta=this.lastVerifyAt===null?0:Math.min(250,Math.max(0,observation.timestamp_ms-this.lastVerifyAt));this.lastVerifyAt=observation.timestamp_ms;
      if(!observation.fresh||observation.quality==='INVALID')this.resetVerifyEvidence();
      else if(observation.stable&&observation.quality==='GOOD'){this.readyEvidenceMs+=delta;this.verifyUnstableSince=null;}
      else {this.verifyUnstableSince??=observation.timestamp_ms;if(observation.timestamp_ms-this.verifyUnstableSince>=1000)this.readyEvidenceMs=0;}
      if(this.readyEvidenceMs>=this.target.ready_stable_ms&&observation.stable&&observation.quality==='GOOD'){this.ready=true;constraints=Object.freeze({...constraints,stage:'READY_LATCHED'});}
      return this.snapshot(observation,constraints,null,null);
    }
    this.resetVerifyEvidence();
    if(this.resolvedStage!==constraints.stage){this.resolvedStage=constraints.stage;this.stageSince=observation.timestamp_ms;}
    if((constraints.stage==='ADJUST_SCALE'||constraints.stage==='ALIGN_PRIMARY_ANCHOR')&&observation.fresh&&observation.stable&&observation.quality==='GOOD'&&observation.timestamp_ms-this.stageSince>=this.config.stage_persistence_ms){const action=this.actionFor(constraints);if(action)return this.issue(observation,constraints,action);}
    const acquisition=constraints.stage==='ACQUIRE_SUBJECT'?'请让人物进入画面并保持片刻':constraints.stage==='ACQUIRE_REQUIRED_BODY'?`请调整取景，让${constraints.missing_body_parts.join('、')}完整进入画面`:constraints.stage==='ALIGN_SECONDARY_CONSTRAINT'?'当前纵向约束需要相机操作者调整，本机不伪造人物移动指令':null;
    return this.snapshot(observation,constraints,null,acquisition);
  }
  private actionFor(c:LiveConstraintStateV01):V4Action|null{return c.stage==='ADJUST_SCALE'?(c.scale_relation==='TOO_LOW'?'MOVE_CLOSER_SMALL':c.scale_relation==='TOO_HIGH'?'MOVE_FARTHER_SMALL':null):c.stage==='ALIGN_PRIMARY_ANCHOR'?(c.x_relation==='TOO_LOW'?'MOVE_RIGHT_SMALL':c.x_relation==='TOO_HIGH'?'MOVE_LEFT_SMALL':null):null;}
  private issue(o:HumanObservationV02,c:LiveConstraintStateV01,action:V4Action):Readonly<V4Snapshot>{const stage=c.stage as 'ADJUST_SCALE'|'ALIGN_PRIMARY_ANCHOR';const startError=(stage==='ADJUST_SCALE'?c.scale_error_normalized:c.x_error_normalized)??0;this.episodeId+=1;this.state.issued_actions+=1;const epoch:Readonly<ControlEpochV04>=Object.freeze({trial_id:this.trialId,episode_id:this.episodeId,issued_at:o.timestamp_ms,stage,action,actor:this.target.control_actor,target_snapshot:this.target,constraint_snapshot:c,observation_state_version:o.state_version,coordinate_basis:'SENSOR_NORMALIZED_NON_MIRRORED'});this.episode={trial_id:this.trialId,episode_id:this.episodeId,state:'ISSUED',stage,action,issued_at:o.timestamp_ms,response_observed:false,response_observed_at:null,movement_started_at:null,settle_started_at:null,settled_at:null,evaluated_at:null,cancelled_at:null,start_error:startError,settled_error:null,outcome:null,reminder_emitted:false,no_response_recorded:false,passive_relation_change:false,control_epoch:epoch};return this.snapshot(o,c,action,null);}
  private updateEpisode(o:HumanObservationV02,c:LiveConstraintStateV01):Readonly<V4Snapshot>{const e=this.episode!;e.state=e.response_observed?'WAIT_FOR_SETTLE':'WAIT_FOR_RESPONSE';
    if(!o.fresh||o.quality==='INVALID'||c.stage==='ACQUIRE_SUBJECT'){e.state='CANCELLED';e.cancelled_at=o.timestamp_ms;this.state.invalidated_actions+=1;this.lastEpisode={...e};this.episode=null;this.stageSince=o.timestamp_ms;return this.snapshot(o,c,null,'测量中断，正在重新获取人物');}
    const relevant=e.stage==='ADJUST_SCALE'?o.motion_evidence.scale_motion:o.motion_evidence.x_motion;const currentError=(e.stage==='ADJUST_SCALE'?c.scale_error_normalized:c.x_error_normalized);
    if(!e.response_observed){
      if(relevant!=='STILL'&&relevant!=='UNKNOWN'){e.response_observed=true;e.response_observed_at=o.timestamp_ms;e.movement_started_at=o.timestamp_ms;e.state='WAIT_FOR_SETTLE';this.state.responded_actions+=1;}
      else {if(currentError!==null&&Math.abs(currentError-e.start_error)>=.18&&!e.passive_relation_change){e.passive_relation_change=true;this.state.passive_relation_change_count+=1;}const age=o.timestamp_ms-e.issued_at;if(age>=this.config.response_reminder_ms)e.reminder_emitted=true;if(age>=this.config.long_no_response_ms&&!e.no_response_recorded){e.no_response_recorded=true;this.state.no_response_actions+=1;}return this.snapshot(o,c,null,null,e.reminder_emitted);}
    }
    if(relevant==='STILL'&&o.stable)e.settle_started_at??=o.timestamp_ms;else e.settle_started_at=null;
    if(e.settle_started_at===null||o.timestamp_ms-e.settle_started_at<this.config.settle_window_ms)return this.snapshot(o,c,null,null);
    e.settled_at=o.timestamp_ms;e.settled_error=currentError;e.state='EVALUATED';e.evaluated_at=o.timestamp_ms;e.outcome=this.classify(e,c);this.state.causally_evaluable_actions+=1;this.recordOutcome(e.outcome);this.lastEpisode={...e};this.episode=null;this.resolvedStage=c.stage;this.stageSince=o.timestamp_ms;return this.snapshot(o,c,null,null);
  }
  private classify(e:V4Episode,c:LiveConstraintStateV01):V4Outcome{const relation=e.stage==='ADJUST_SCALE'?c.scale_relation:c.x_relation;if(relation==='IN_RANGE')return 'TARGET_REACHED';const end=e.settled_error;if(end===null)return 'NO_EFFECT';const material=Math.max(this.config.material_improvement_normalized,e.start_error*this.config.material_improvement_ratio);if(e.start_error-end>=material)return 'IMPROVED';if(end-e.start_error>=material)return 'WRONG_DIRECTION';return 'NO_EFFECT';}
  private recordOutcome(outcome:V4Outcome):void{if(outcome==='TARGET_REACHED')this.state.target_reached_count+=1;else if(outcome==='IMPROVED')this.state.improved_count+=1;else if(outcome==='NO_EFFECT')this.state.no_effect_count+=1;else this.state.wrong_direction_count+=1;const good=this.state.target_reached_count+this.state.improved_count;this.state.action_effectiveness=this.state.causally_evaluable_actions?good/this.state.causally_evaluable_actions:null;}
  private resetVerifyEvidence():void{this.readyEvidenceMs=0;this.lastVerifyAt=null;this.verifyUnstableSince=null;}
  private snapshot(o:HumanObservationV02,c:LiveConstraintStateV01,action:V4Action|null,acquisition:string|null,reminder=false):Readonly<V4Snapshot>{return Object.freeze({timestamp_ms:o.timestamp_ms,armed:this.armed,trial_id:this.armed?this.trialId:null,stage:this.ready?'READY_LATCHED':c.stage,observation:o,target:this.target,constraints:c,action,instruction_copy_zh:action?V4_ACTION_COPY[action]:null,acquisition_copy_zh:acquisition,active_episode:this.episode?Object.freeze({...this.episode}):null,last_episode:this.lastEpisode?Object.freeze({...this.lastEpisode}):null,ready:this.ready,ready_hold_elapsed_ms:this.readyEvidenceMs,reminder_due:reminder,metrics:Object.freeze({...this.state})});}
}
