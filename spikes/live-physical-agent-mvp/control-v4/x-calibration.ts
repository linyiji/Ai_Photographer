import type { HumanObservationV02, SensorXDeltaSignV01 } from './types.js';
import { evaluateXCalibrationRequirementV01, type XCalibrationBlockingReasonV01, type XCalibrationRequirementV01 } from './x-calibration-requirement.js';

export type SubjectXCalibrationLabelV01='LEFT'|'RIGHT';
export type SubjectXCalibrationPhaseV01='IDLE'|'CAPTURE_BASELINE'|'MOVE_LABELED_DIRECTION'|'WAIT_FOR_SETTLE'|'COMPLETE';
export type SubjectXCalibrationMeasurementStatusV01='VALID'|'OBSERVATION_MISSING'|XCalibrationBlockingReasonV01;

export interface SubjectXCalibrationSnapshotV01 {
  calibration_version:'SubjectXCalibrationV01';
  calibration_action_id:string|null;
  active:boolean;
  label:SubjectXCalibrationLabelV01|null;
  subject_local_label:SubjectXCalibrationLabelV01|null;
  phase:SubjectXCalibrationPhaseV01;
  measurement_status:SubjectXCalibrationMeasurementStatusV01;
  requirement:Readonly<XCalibrationRequirementV01>|null;
  x_calibration_ready:boolean;
  calibration_anchor:'SHOULDER_CENTER';
  baseline_x:number|null;
  current_x:number|null;
  settled_x:number|null;
  sensor_x_before:number|null;
  sensor_x_after:number|null;
  sensor_delta_x:number|null;
  sensor_delta_sign:SensorXDeltaSignV01;
  response_observed:boolean;
  settled:boolean;
  valid_sample_count:number;
  phase_elapsed_ms:number;
  copy_zh:string;
}

const BASELINE_HOLD_MS=1000;
const SETTLE_HOLD_MS=500;
const MIN_BASELINE_SAMPLES=4;
const MIN_SETTLE_SAMPLES=3;
const MIN_LABELED_DELTA=.04;
const median=(values:readonly number[]):number=>{const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;};
const directionName=(label:SubjectXCalibrationLabelV01|null):string=>label==='LEFT'?'左边':'右边';

export class SubjectXCalibrationSessionV01 {
  private active=false;
  private label:SubjectXCalibrationLabelV01|null=null;
  private phase:SubjectXCalibrationPhaseV01='IDLE';
  private phaseSince=0;
  private baselineSince:number|null=null;
  private settleSince:number|null=null;
  private baselineSamples:number[]=[];
  private settleSamples:number[]=[];
  private baselineX:number|null=null;
  private currentX:number|null=null;
  private settledX:number|null=null;
  private deltaX:number|null=null;
  private validSampleCount=0;
  private measurementStatus:SubjectXCalibrationMeasurementStatusV01='OBSERVATION_MISSING';
  private requirement:Readonly<XCalibrationRequirementV01>|null=null;
  private responseObserved=false;
  private actionSequence=0;
  private actionId:string|null=null;

  start(label:SubjectXCalibrationLabelV01,now:number):Readonly<SubjectXCalibrationSnapshotV01>{
    this.actionSequence+=1;this.actionId=`X_CAL_${label}_${this.actionSequence}`;this.active=true;this.label=label;this.phase='CAPTURE_BASELINE';this.phaseSince=now;this.baselineSince=null;this.settleSince=null;this.baselineSamples=[];this.settleSamples=[];this.baselineX=null;this.currentX=null;this.settledX=null;this.deltaX=null;this.validSampleCount=0;this.measurementStatus='OBSERVATION_MISSING';this.requirement=null;this.responseObserved=false;return this.snapshot(now);
  }
  reset():Readonly<SubjectXCalibrationSnapshotV01>{this.active=false;this.label=null;this.phase='IDLE';this.phaseSince=0;this.baselineSince=null;this.settleSince=null;this.baselineSamples=[];this.settleSamples=[];this.baselineX=null;this.currentX=null;this.settledX=null;this.deltaX=null;this.validSampleCount=0;this.measurementStatus='OBSERVATION_MISSING';this.requirement=null;this.responseObserved=false;this.actionId=null;return this.snapshot(0);}
  update(observation:Readonly<HumanObservationV02>):Readonly<SubjectXCalibrationSnapshotV01>{
    if(!this.active||this.phase==='COMPLETE')return this.snapshot(observation.timestamp_ms);
    const requirement=evaluateXCalibrationRequirementV01(observation);this.requirement=requirement;this.currentX=requirement.anchor_x;
    this.measurementStatus=requirement.ready?'VALID':requirement.blocking_reasons[0]??'OBSERVATION_MISSING';
    const structuralReady=requirement.blocking_reasons.every(reason=>reason==='UNSTABLE');
    if(this.phase==='CAPTURE_BASELINE'){
      if(!requirement.ready){this.baselineSince=null;this.baselineSamples=[];return this.snapshot(observation.timestamp_ms);}
      this.validSampleCount+=1;const now=observation.timestamp_ms,x=this.currentX!;this.baselineSince??=now;this.baselineSamples.push(x);
      if(now-this.baselineSince>=BASELINE_HOLD_MS&&this.baselineSamples.length>=MIN_BASELINE_SAMPLES){this.baselineX=median(this.baselineSamples);this.phase='MOVE_LABELED_DIRECTION';this.phaseSince=now;}
      return this.snapshot(now);
    }
    if(!structuralReady||this.currentX===null)return this.snapshot(observation.timestamp_ms);
    this.validSampleCount+=1;const now=observation.timestamp_ms,x=this.currentX;
    if(this.phase==='MOVE_LABELED_DIRECTION'){
      if(this.baselineX!==null&&Math.abs(x-this.baselineX)>=MIN_LABELED_DELTA){this.responseObserved=true;this.phase='WAIT_FOR_SETTLE';this.phaseSince=now;this.settleSince=null;this.settleSamples=[];}
      return this.snapshot(now);
    }
    if(this.phase==='WAIT_FOR_SETTLE'){
      if(!requirement.ready||observation.motion_evidence.x_motion!=='STILL'){this.settleSince=null;this.settleSamples=[];return this.snapshot(now);}
      this.settleSince??=now;this.settleSamples.push(x);
      if(now-this.settleSince>=SETTLE_HOLD_MS&&this.settleSamples.length>=MIN_SETTLE_SAMPLES){
        const settled=median(this.settleSamples),delta=this.baselineX===null?null:settled-this.baselineX;
        if(delta!==null&&Math.abs(delta)>=MIN_LABELED_DELTA){this.settledX=settled;this.deltaX=delta;this.phase='COMPLETE';this.phaseSince=now;this.active=false;}
        else {this.phase='MOVE_LABELED_DIRECTION';this.phaseSince=now;this.settleSince=null;this.settleSamples=[];}
      }
    }
    return this.snapshot(now);
  }
  private snapshot(now:number):Readonly<SubjectXCalibrationSnapshotV01>{
    const sign:SensorXDeltaSignV01=this.deltaX===null?'UNKNOWN':this.deltaX>0?'POSITIVE':this.deltaX<0?'NEGATIVE':'ZERO';
    let copy='请选择左/右标定并点击开始';
    if(this.phase==='CAPTURE_BASELINE')copy=this.requirement?.ready?`保持不动，正在采集肩部中心 X 基线 ${Math.min(BASELINE_HOLD_MS,Math.max(0,now-(this.baselineSince??now))).toFixed(0)} / ${BASELINE_HOLD_MS} ms`:'尚未满足标定条件：请让头部和双肩清晰可见，并保持不动';
    else if(this.phase==='MOVE_LABELED_DIRECTION')copy=`基线已取得（${this.baselineX?.toFixed(3)}）；向你自己的${directionName(this.label)}移动一小步，然后自然停下`;
    else if(this.phase==='WAIT_FOR_SETTLE')copy=this.requirement?.ready?'已检测到移动，请自然停下，正在确认终点':'已检测到移动；请保持当前位置，让头部和双肩清晰可见并停稳';
    else if(this.phase==='COMPLETE')copy=`标定完成：人物向自己的${directionName(this.label)}移动，Sensor X ${sign}（Δ ${this.deltaX?.toFixed(3)}）`;
    return Object.freeze({calibration_version:'SubjectXCalibrationV01',calibration_action_id:this.actionId,active:this.active,label:this.label,subject_local_label:this.label,phase:this.phase,measurement_status:this.measurementStatus,requirement:this.requirement,x_calibration_ready:this.requirement?.ready??false,calibration_anchor:'SHOULDER_CENTER',baseline_x:this.baselineX,current_x:this.currentX,settled_x:this.settledX,sensor_x_before:this.baselineX,sensor_x_after:this.settledX,sensor_delta_x:this.deltaX,sensor_delta_sign:sign,response_observed:this.responseObserved,settled:this.phase==='COMPLETE',valid_sample_count:this.validSampleCount,phase_elapsed_ms:Math.max(0,now-this.phaseSince),copy_zh:copy});
  }
}
