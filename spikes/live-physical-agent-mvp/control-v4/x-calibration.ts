import type { SensorXDeltaSignV01, V4Snapshot } from './types.js';

export type SubjectXCalibrationLabelV01='LEFT'|'RIGHT';
export type SubjectXCalibrationPhaseV01='IDLE'|'CAPTURE_BASELINE'|'MOVE_LABELED_DIRECTION'|'WAIT_FOR_SETTLE'|'COMPLETE';
export type SubjectXCalibrationMeasurementStatusV01='VALID'|'TARGET_MEASUREMENT_NOT_READY'|'STALE'|'QUALITY_INVALID'|'ANCHOR_MISSING';

export interface SubjectXCalibrationSnapshotV01 {
  calibration_version:'SubjectXCalibrationV01';
  active:boolean;
  label:SubjectXCalibrationLabelV01|null;
  phase:SubjectXCalibrationPhaseV01;
  measurement_status:SubjectXCalibrationMeasurementStatusV01;
  baseline_x:number|null;
  current_x:number|null;
  settled_x:number|null;
  sensor_delta_x:number|null;
  sensor_delta_sign:SensorXDeltaSignV01;
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
const directionName=(label:SubjectXCalibrationLabelV01|null):string=>label==='LEFT'?'左':'右';

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
  private measurementStatus:SubjectXCalibrationMeasurementStatusV01='ANCHOR_MISSING';

  start(label:SubjectXCalibrationLabelV01,now:number):Readonly<SubjectXCalibrationSnapshotV01>{
    this.active=true;this.label=label;this.phase='CAPTURE_BASELINE';this.phaseSince=now;this.baselineSince=null;this.settleSince=null;this.baselineSamples=[];this.settleSamples=[];this.baselineX=null;this.currentX=null;this.settledX=null;this.deltaX=null;this.validSampleCount=0;this.measurementStatus='ANCHOR_MISSING';return this.snapshot(now);
  }
  reset():Readonly<SubjectXCalibrationSnapshotV01>{this.active=false;this.label=null;this.phase='IDLE';this.phaseSince=0;this.baselineSince=null;this.settleSince=null;this.baselineSamples=[];this.settleSamples=[];this.baselineX=null;this.currentX=null;this.settledX=null;this.deltaX=null;this.validSampleCount=0;this.measurementStatus='ANCHOR_MISSING';return this.snapshot(0);}
  update(source:Readonly<V4Snapshot>):Readonly<SubjectXCalibrationSnapshotV01>{
    if(!this.active||this.phase==='COMPLETE')return this.snapshot(source.timestamp_ms);
    const anchor=source.observation.observed_body.semantic_anchors.anchors[source.target.primary_anchor];
    this.currentX=anchor?.x??null;
    this.measurementStatus=!source.target_gap.ready?'TARGET_MEASUREMENT_NOT_READY':!source.observation.fresh?'STALE':source.observation.quality==='INVALID'?'QUALITY_INVALID':this.currentX===null||!Number.isFinite(this.currentX)?'ANCHOR_MISSING':'VALID';
    if(this.measurementStatus!=='VALID'){
      if(this.phase==='CAPTURE_BASELINE'){this.baselineSince=null;this.baselineSamples=[];}
      if(this.phase==='WAIT_FOR_SETTLE'){this.settleSince=null;this.settleSamples=[];}
      return this.snapshot(source.timestamp_ms);
    }
    this.validSampleCount+=1;
    const now=source.timestamp_ms,x=this.currentX!;
    if(this.phase==='CAPTURE_BASELINE'){
      if(!source.observation.stable){this.baselineSince=null;this.baselineSamples=[];return this.snapshot(now);}
      this.baselineSince??=now;this.baselineSamples.push(x);
      if(now-this.baselineSince>=BASELINE_HOLD_MS&&this.baselineSamples.length>=MIN_BASELINE_SAMPLES){this.baselineX=median(this.baselineSamples);this.phase='MOVE_LABELED_DIRECTION';this.phaseSince=now;}
      return this.snapshot(now);
    }
    if(this.phase==='MOVE_LABELED_DIRECTION'){
      if(this.baselineX!==null&&Math.abs(x-this.baselineX)>=MIN_LABELED_DELTA){this.phase='WAIT_FOR_SETTLE';this.phaseSince=now;this.settleSince=null;this.settleSamples=[];}
      return this.snapshot(now);
    }
    if(this.phase==='WAIT_FOR_SETTLE'){
      if(!source.observation.stable||source.observation.motion_evidence.x_motion!=='STILL'){this.settleSince=null;this.settleSamples=[];return this.snapshot(now);}
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
    if(this.phase==='CAPTURE_BASELINE')copy=this.measurementStatus==='VALID'?`保持不动，正在采集 X 基线 ${Math.min(BASELINE_HOLD_MS,Math.max(0,now-(this.baselineSince??now))).toFixed(0)} / ${BASELINE_HOLD_MS} ms`:'尚未取得有效 TORSO_CENTER；请让头、双肩和双髋清晰可见并保持不动';
    else if(this.phase==='MOVE_LABELED_DIRECTION')copy=`基线已取得（${this.baselineX?.toFixed(3)}）；现在向你自己的${directionName(this.label)}侧移动一步，然后停稳`;
    else if(this.phase==='WAIT_FOR_SETTLE')copy=this.measurementStatus==='VALID'?'已检测到位移，请停稳，正在确认终点':'移动后测量暂时失效；请保持当前位置并让头、双肩和双髋重新清晰可见';
    else if(this.phase==='COMPLETE')copy=`标定完成：人物向自己的${directionName(this.label)}侧移动，Sensor X ${sign}（Δ ${this.deltaX?.toFixed(3)}）`;
    return Object.freeze({calibration_version:'SubjectXCalibrationV01',active:this.active,label:this.label,phase:this.phase,measurement_status:this.measurementStatus,baseline_x:this.baselineX,current_x:this.currentX,settled_x:this.settledX,sensor_delta_x:this.deltaX,sensor_delta_sign:sign,valid_sample_count:this.validSampleCount,phase_elapsed_ms:Math.max(0,now-this.phaseSince),copy_zh:copy});
  }
}
