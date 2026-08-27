import type { StructuredPerceptionState } from '../perception/types.js';
import { framingCompatibilityFor, precisionScaleCalibrationFor } from '../semantic-framing/profiles.js';
import type { TargetState } from '../closed-loop/types.js';
import type { LiveMeasurementV3, V3FramingMotion, V3FramingRelation, V3MeasurementQuality, V3XMotion, V3XRelation } from './types.js';

const finite=(value:number|null|undefined):value is number=>typeof value==='number'&&Number.isFinite(value);
const relationX=(value:number|null,target:TargetState):V3XRelation=>!finite(value)?'UNKNOWN':value<target.center_x-target.tolerance_x?'TOO_LEFT':value>target.center_x+target.tolerance_x?'TOO_RIGHT':'IN_RANGE';
const motionX=(velocity:number|null):V3XMotion=>!finite(velocity)?'UNKNOWN':velocity<-.08?'LEFT':velocity>.08?'RIGHT':'STILL';
const motionFraming=(velocity:number|null):V3FramingMotion=>!finite(velocity)?'UNKNOWN':velocity<-.08?'FARTHER':velocity>.08?'CLOSER':'STILL';

export interface V3ProjectionContext { decision_age_ms?:number; reacquisition_barrier?:boolean }

export function projectLiveMeasurementV3(state:StructuredPerceptionState,target:TargetState,context:V3ProjectionContext={}):LiveMeasurementV3 {
  const framing=state.framing;
  const present=state.subject.present;
  const measurementAge=state.measurement_age_ms??0;
  const fresh=present&&state.coordinate_basis==='SENSOR_NORMALIZED_NON_MIRRORED'&&measurementAge<=180&&(context.decision_age_ms??0)<=160&&!context.reacquisition_barrier;
  let framingRelation:V3FramingRelation='UNKNOWN';
  let framingError:number|null=null;
  let framingPosition:number|null=null;
  let comparisonKey:string|null=null;
  let validityReason='NO_SEMANTIC_FRAMING';
  if(framing&&present){
    const compatibility=framingCompatibilityFor(target.id,framing.body_mode);
    const calibration=precisionScaleCalibrationFor(target,framing.body_mode,framing.scale_metric_type);
    framingPosition=framing.distance_proxy.valid?framing.distance_proxy.value:null;
    comparisonKey=`FRAMING_V3:${target.id}`;
    if(compatibility==='TOO_TIGHT'){framingRelation='TOO_CLOSE';validityReason=framing.distance_proxy.valid?'COMPATIBILITY_TOO_CLOSE':'DISTANCE_PROXY_INVALID';}
    else if(compatibility==='TOO_WIDE'){framingRelation='TOO_FAR';validityReason=framing.distance_proxy.valid?'COMPATIBILITY_TOO_FAR':'DISTANCE_PROXY_INVALID';}
    else if(compatibility==='COMPATIBLE'&&calibration&&framing.valid_for_precision_scale&&finite(framing.scale)){
      const delta=calibration.target_scale_value-framing.scale;framingError=Math.abs(delta)/calibration.target_scale_tolerance;
      framingRelation=framingError<=1?'IN_RANGE':delta>0?'TOO_FAR':'TOO_CLOSE';
      framingPosition=framing.scale;validityReason='PRECISION_SCALE_VALID';
    }else validityReason=compatibility==='UNCERTAIN'?'BODY_MODE_UNCERTAIN':'PRECISION_SCALE_INVALID';
  }
  const anchor=framing?.anchor_x??null;
  const xValid=Boolean(present&&framing?.valid_for_precision_x&&finite(anchor));
  const xRelation=xValid?relationX(anchor,target):'UNKNOWN';
  const xError=xValid&&finite(anchor)?Math.abs(target.center_x-anchor)/target.tolerance_x:null;
  const framingUsable=framingRelation!=='UNKNOWN'&&((framingRelation==='IN_RANGE'&&framing?.valid_for_precision_scale)||framing?.distance_proxy.valid);
  let quality:V3MeasurementQuality='INVALID';
  if(present&&framing&&framingUsable){
    const allPrecision=framingRelation!=='IN_RANGE'||xValid;
    quality=framing.stable&&allPrecision&&fresh?'GOOD':'MARGINAL';
  }
  return Object.freeze({timestamp_ms:state.timestamp_ms,subject_state:present?'PRESENT':'LOST',measurement_quality:quality,fresh,stable:Boolean(framing?.stable??state.subject.stable),framing_relation:framingRelation,x_relation:xRelation,framing_motion:motionFraming(framing?.distance_proxy.filtered_velocity??framing?.velocity_scale??state.subject.velocity_scale??null),x_motion:motionX(framing?.velocity_x??state.subject.velocity_x??null),state_version:state.sequence,measurement_age_ms:measurementAge,diagnostics_ref:Object.freeze({measurement_id:`${state.sequence}@${state.timestamp_ms}`,framing_error_normalized:framingError,x_error_normalized:xError,framing_position:framingPosition,x_position:anchor,framing_comparison_key:comparisonKey,x_comparison_key:xValid?`X_V3:${target.id}`:null,internal_body_mode:framing?.body_mode??null,internal_scale_metric_type:framing?.scale_metric_type??null,validity_reason:validityReason})});
}

export class LiveMeasurementV3Projector {
  private previousReacquisitionCount=0;
  reset():void{this.previousReacquisitionCount=0;}
  project(state:StructuredPerceptionState,target:TargetState,decisionAgeMs=0):LiveMeasurementV3{
    const barrier=state.reacquisition_count>this.previousReacquisitionCount;
    this.previousReacquisitionCount=Math.max(this.previousReacquisitionCount,state.reacquisition_count);
    return projectLiveMeasurementV3(state,target,{decision_age_ms:decisionAgeMs,reacquisition_barrier:barrier});
  }
}
