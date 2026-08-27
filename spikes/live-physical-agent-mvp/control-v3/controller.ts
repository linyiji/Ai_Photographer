import type { TargetState } from '../closed-loop/types.js';
import { HumanSettleDetectorV01 } from './settle-detector.js';
import type { ControlEpochV3, LiveMeasurementV3, V3Action, V3ControllerConfig, V3Episode, V3Metrics, V3Outcome, V3ReadyEntryContext, V3Snapshot, V3Stage } from './types.js';

export const V3_CONFIG:Readonly<V3ControllerConfig>=Object.freeze({stage_persistence_ms:250,response_grace_ms:900,settle_window_ms:375,episode_timeout_ms:4500,ready_stable_ms:600,pause_failure_limit:3,pause_resume_stable_ms:1200,material_improvement_normalized:.18,material_improvement_ratio:.15,motion_threshold_normalized:.08});
export const V3_ACTION_COPY:Readonly<Record<V3Action,string>>=Object.freeze({MOVE_LEFT_SMALL:'往左一点，然后停稳',MOVE_RIGHT_SMALL:'往右一点，然后停稳',MOVE_CLOSER_SMALL:'靠近一点，然后停稳',MOVE_FARTHER_SMALL:'退后一点，然后停稳'});
const initialMetrics=():V3Metrics=>({ordinary_action_count:0,target_reached_count:0,improved_count:0,no_effect_count:0,wrong_direction_count:0,invalidated_count:0,post_ready_ordinary:0,corrections_to_ready:null,time_to_ready_ms:null,action_effectiveness:null,wrong_direction_rate:null,pause_count:0,luna_calls:0,provider_calls:0,backend_per_frame_calls:0,raw_video_upload:0});

export class HumanStepServoV3 {
  private armed=false;private ready=false;private trialId=0;private episodeId=0;private stage:V3Stage='ACQUIRE';private stageSince=0;private episode:V3Episode|null=null;private lastEpisode:V3Episode|null=null;private settle:HumanSettleDetectorV01|null=null;private consecutiveFailures=0;private pausedStableSince:number|null=null;private readyStableSince:number|null=null;private readyContext:V3ReadyEntryContext=null;private firstActionAt:number|null=null;private metrics=initialMetrics();private lastEvaluatedVersion:number|null=null;
  constructor(private target:TargetState,private readonly config:V3ControllerConfig=V3_CONFIG){}
  setTarget(target:TargetState):void{this.target=target;this.reset();}
  arm(now:number):void{this.armed=true;this.ready=false;this.trialId+=1;this.stage='ACQUIRE';this.stageSince=now;this.episode=this.lastEpisode=this.settle=null;this.consecutiveFailures=0;this.pausedStableSince=this.readyStableSince=null;this.readyContext=null;this.firstActionAt=null;this.lastEvaluatedVersion=null;}
  reset():void{this.armed=false;this.ready=false;this.trialId=this.episodeId=0;this.stage='ACQUIRE';this.stageSince=0;this.episode=this.lastEpisode=null;this.settle=null;this.consecutiveFailures=0;this.pausedStableSince=this.readyStableSince=null;this.readyContext=null;this.firstActionAt=null;this.metrics=initialMetrics();this.lastEvaluatedVersion=null;}
  update(measurement:LiveMeasurementV3):V3Snapshot{
    if(!this.armed)return this.snapshot(measurement,null,null);
    if(this.ready){this.stage='READY_LATCHED';return this.snapshot(measurement,null,null);}
    if(this.episode)return this.updateEpisode(measurement);
    if(this.stage==='PAUSED'){
      if(measurement.fresh&&measurement.stable&&measurement.measurement_quality!=='INVALID')this.pausedStableSince??=measurement.timestamp_ms;else this.pausedStableSince=null;
      if(this.pausedStableSince===null||measurement.timestamp_ms-this.pausedStableSince<this.config.pause_resume_stable_ms)return this.snapshot(measurement,null,null);
      this.consecutiveFailures=0;this.pausedStableSince=null;
    }
    const next=this.selectStage(measurement);
    if(next!==this.stage){this.stage=next;this.stageSince=measurement.timestamp_ms;this.readyStableSince=null;}
    if(next==='VERIFY')return this.updateVerify(measurement);
    if(next==='ACQUIRE')return this.snapshot(measurement,null,null);
    if(!measurement.fresh||!measurement.stable||measurement.measurement_quality==='INVALID'||(this.lastEvaluatedVersion!==null&&measurement.state_version<=this.lastEvaluatedVersion))return this.snapshot(measurement,null,null);
    if(measurement.timestamp_ms-this.stageSince<this.config.stage_persistence_ms)return this.snapshot(measurement,null,null);
    const action=this.actionFor(next,measurement);if(!action)return this.snapshot(measurement,null,null);
    return this.issue(measurement,next,action);
  }
  private selectStage(m:LiveMeasurementV3):Exclude<V3Stage,'PAUSED'|'READY_LATCHED'>{
    if(m.subject_state!=='PRESENT'||m.measurement_quality==='INVALID'||!m.fresh||m.framing_relation==='UNKNOWN')return 'ACQUIRE';
    if(m.framing_relation!=='IN_RANGE')return 'FRAMING';
    if(m.x_relation==='UNKNOWN')return 'ACQUIRE';
    if(m.x_relation!=='IN_RANGE')return 'ALIGN_X';
    return 'VERIFY';
  }
  private updateVerify(m:LiveMeasurementV3):V3Snapshot{
    if(m.measurement_quality==='GOOD'&&m.fresh&&m.stable){this.readyStableSince??=m.timestamp_ms;}else this.readyStableSince=null;
    if(this.readyStableSince!==null&&m.timestamp_ms-this.readyStableSince>=this.config.ready_stable_ms){
      this.ready=true;this.stage='READY_LATCHED';this.readyContext=this.lastEpisode?.stage==='FRAMING'?'AFTER_FRAMING_STEP':this.lastEpisode?.stage==='ALIGN_X'?'AFTER_X_STEP':'ALREADY_SATISFIED';this.metrics.corrections_to_ready=this.metrics.ordinary_action_count;this.metrics.time_to_ready_ms=this.firstActionAt===null?0:m.timestamp_ms-this.firstActionAt;
    }
    return this.snapshot(m,null,null);
  }
  private issue(m:LiveMeasurementV3,stage:Extract<V3Stage,'FRAMING'|'ALIGN_X'>,action:V3Action):V3Snapshot{
    this.episodeId+=1;this.metrics.ordinary_action_count+=1;this.firstActionAt??=m.timestamp_ms;
    const startError=this.errorFor(stage,m);const epoch:ControlEpochV3=Object.freeze({trial_id:this.trialId,episode_id:this.episodeId,stage,action,target_snapshot:Object.freeze({id:this.target.id,center_x:this.target.center_x,tolerance_x:this.target.tolerance_x,ready_stable_ms:this.target.ready_stable_ms}),measurement_snapshot:m,sensor_action_mapping:'SENSOR_NORMALIZED_NON_MIRRORED',measurement_age_ms:m.measurement_age_ms,state_version:m.state_version,issued_timestamp_ms:m.timestamp_ms,diagnostics_ref:m.diagnostics_ref});
    this.episode={trial_id:this.trialId,episode_id:this.episodeId,state:'ISSUED',stage,action,issued_at:m.timestamp_ms,start_error:startError,settled_error:null,outcome:null,evaluated_at:null,control_epoch:epoch};this.settle=new HumanSettleDetectorV01(m.timestamp_ms,m.state_version,stage,m,this.config);
    return this.snapshot(m,action,V3_ACTION_COPY[action]);
  }
  private updateEpisode(m:LiveMeasurementV3):V3Snapshot{
    const episode=this.episode!;episode.state='WAIT_FOR_SETTLE';const status=this.settle!.observe(m);
    if(status==='WAITING')return this.snapshot(m,null,null);
    const outcome=status==='INVALIDATED'?'INVALIDATED':this.classify(episode,m);episode.state='EVALUATED';episode.outcome=outcome;episode.evaluated_at=m.timestamp_ms;episode.settled_error=this.errorFor(episode.stage,m);this.recordOutcome(outcome);this.lastEvaluatedVersion=m.state_version;this.lastEpisode={...episode,control_epoch:episode.control_epoch};this.episode=null;this.settle=null;
    if(outcome==='NO_EFFECT'||outcome==='WRONG_DIRECTION')this.consecutiveFailures+=1;else if(outcome!=='INVALIDATED')this.consecutiveFailures=0;
    if(this.consecutiveFailures>=this.config.pause_failure_limit){this.stage='PAUSED';this.stageSince=m.timestamp_ms;this.metrics.pause_count+=1;}
    else {this.stage=this.selectStage(m);this.stageSince=m.timestamp_ms;}
    return this.snapshot(m,null,null,outcome);
  }
  private classify(e:V3Episode,end:LiveMeasurementV3):V3Outcome{
    const relation=e.stage==='FRAMING'?end.framing_relation:end.x_relation;if(relation==='IN_RANGE')return 'TARGET_REACHED';
    const start=e.start_error;const settled=this.errorFor(e.stage,end);if(start!==null&&settled!==null){const reduction=start-settled;const material=Math.max(this.config.material_improvement_normalized,start*this.config.material_improvement_ratio);if(reduction>=material)return 'IMPROVED';if(settled-start>=material)return 'WRONG_DIRECTION';return 'NO_EFFECT';}
    const startRelation=e.stage==='FRAMING'?e.control_epoch.measurement_snapshot.framing_relation:e.control_epoch.measurement_snapshot.x_relation;if(relation!==startRelation&&relation!=='UNKNOWN')return 'IMPROVED';
    const startPosition=e.stage==='FRAMING'?e.control_epoch.diagnostics_ref.framing_position:e.control_epoch.diagnostics_ref.x_position;const endPosition=e.stage==='FRAMING'?end.diagnostics_ref.framing_position:end.diagnostics_ref.x_position;if(startPosition===null||endPosition===null)return 'INVALIDATED';const signed=e.stage==='FRAMING'?(startRelation==='TOO_CLOSE'?startPosition-endPosition:endPosition-startPosition):(startRelation==='TOO_LEFT'?endPosition-startPosition:startPosition-endPosition);const ratio=signed/Math.max(Math.abs(startPosition),.01);if(ratio>=this.config.material_improvement_ratio)return 'IMPROVED';if(ratio<=-this.config.material_improvement_ratio)return 'WRONG_DIRECTION';return 'NO_EFFECT';
  }
  private actionFor(stage:Extract<V3Stage,'FRAMING'|'ALIGN_X'>,m:LiveMeasurementV3):V3Action|null{return stage==='FRAMING'?(m.framing_relation==='TOO_CLOSE'?'MOVE_FARTHER_SMALL':m.framing_relation==='TOO_FAR'?'MOVE_CLOSER_SMALL':null):(m.x_relation==='TOO_LEFT'?'MOVE_LEFT_SMALL':m.x_relation==='TOO_RIGHT'?'MOVE_RIGHT_SMALL':null);}
  private errorFor(stage:Extract<V3Stage,'FRAMING'|'ALIGN_X'>,m:LiveMeasurementV3):number|null{return stage==='FRAMING'?m.diagnostics_ref.framing_error_normalized:m.diagnostics_ref.x_error_normalized;}
  private recordOutcome(outcome:V3Outcome):void{if(outcome==='TARGET_REACHED')this.metrics.target_reached_count+=1;else if(outcome==='IMPROVED')this.metrics.improved_count+=1;else if(outcome==='NO_EFFECT')this.metrics.no_effect_count+=1;else if(outcome==='WRONG_DIRECTION')this.metrics.wrong_direction_count+=1;else this.metrics.invalidated_count+=1;const valid=this.metrics.target_reached_count+this.metrics.improved_count+this.metrics.no_effect_count+this.metrics.wrong_direction_count;this.metrics.action_effectiveness=valid?(this.metrics.target_reached_count+this.metrics.improved_count)/valid:null;this.metrics.wrong_direction_rate=valid?this.metrics.wrong_direction_count/valid:null;}
  private snapshot(m:LiveMeasurementV3,action:V3Action|null,copy:string|null,outcome:V3Outcome|null=null):V3Snapshot{return Object.freeze({timestamp_ms:m.timestamp_ms,armed:this.armed,trial_id:this.armed?this.trialId:null,stage:this.stage,measurement:m,action,instruction_copy_zh:copy,episode:this.episode?Object.freeze({...this.episode}):this.lastEpisode?Object.freeze({...this.lastEpisode}):null,outcome:outcome??this.lastEpisode?.outcome??null,ready:this.ready,ready_entry_context:this.readyContext,metrics:Object.freeze({...this.metrics})});}
}
