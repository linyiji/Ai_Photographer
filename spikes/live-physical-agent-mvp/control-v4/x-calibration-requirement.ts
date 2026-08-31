import type { HumanObservationV02 } from './types.js';

export type XCalibrationBlockingReasonV01=
  |'SUBJECT_NOT_LOCKED'
  |'HEAD_INVALID'
  |'SHOULDERS_NOT_BILATERAL'
  |'SHOULDER_CENTER_INVALID'
  |'STALE'
  |'UNSTABLE';

export interface XCalibrationRequirementV01 {
  requirement_version:'XCalibrationRequirementV01';
  control_task_requirement_version:'ControlTaskRequirementV01';
  control_task:'SUBJECT_LOCAL_X_CALIBRATION';
  anchor:'SHOULDER_CENTER';
  coordinate_basis:'SENSOR_NORMALIZED_NON_MIRRORED';
  subject_locked:boolean;
  head_valid:boolean;
  shoulders_bilateral_valid:boolean;
  shoulder_center_good:boolean;
  fresh:boolean;
  stable:boolean;
  anchor_x:number|null;
  ready:boolean;
  blocking_reasons:readonly XCalibrationBlockingReasonV01[];
  photography_target_gap_required:false;
  hips_required:false;
  scale_required:false;
}

export function evaluateXCalibrationRequirementV01(observation:Readonly<HumanObservationV02>):Readonly<XCalibrationRequirementV01>{
  const head=observation.observed_body.landmark_basis.HEAD;
  const shoulders=observation.observed_body.landmark_basis.SHOULDERS;
  const anchor=observation.observed_body.semantic_anchors.anchors.SHOULDER_CENTER;
  const subjectLocked=observation.subject_recognition.lock_state==='LOCKED';
  const headValid=head.status==='VALID';
  const shouldersBilateralValid=shoulders.status==='BILATERAL_VALID';
  const shoulderCenterGood=Boolean(anchor&&Number.isFinite(anchor.x)&&Number.isFinite(anchor.y)&&anchor.confidence>=.6);
  const fresh=observation.fresh&&observation.observed_body.fresh&&head.fresh&&shoulders.fresh;
  const stable=observation.stable&&observation.observed_body.stable&&head.stable&&shoulders.stable;
  const blocking:XCalibrationBlockingReasonV01[]=[];
  if(!subjectLocked)blocking.push('SUBJECT_NOT_LOCKED');
  if(!headValid)blocking.push('HEAD_INVALID');
  if(!shouldersBilateralValid)blocking.push('SHOULDERS_NOT_BILATERAL');
  if(!shoulderCenterGood)blocking.push('SHOULDER_CENTER_INVALID');
  if(!fresh)blocking.push('STALE');
  if(!stable)blocking.push('UNSTABLE');
  return Object.freeze({requirement_version:'XCalibrationRequirementV01',control_task_requirement_version:'ControlTaskRequirementV01',control_task:'SUBJECT_LOCAL_X_CALIBRATION',anchor:'SHOULDER_CENTER',coordinate_basis:'SENSOR_NORMALIZED_NON_MIRRORED',subject_locked:subjectLocked,head_valid:headValid,shoulders_bilateral_valid:shouldersBilateralValid,shoulder_center_good:shoulderCenterGood,fresh,stable,anchor_x:shoulderCenterGood?anchor!.x:null,ready:blocking.length===0,blocking_reasons:Object.freeze(blocking),photography_target_gap_required:false,hips_required:false,scale_required:false});
}
