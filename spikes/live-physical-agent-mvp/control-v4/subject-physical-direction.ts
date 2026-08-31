import type { ControlActorV02, PhysicalXActionV01, SensorXDeltaSignV01, SubjectPhysicalDirectionDecisionV01, V4Action, V4DirectionContextV01 } from './types.js';

export const DEFAULT_V4_DIRECTION_CONTEXT:Readonly<V4DirectionContextV01>=Object.freeze({camera_facing:'FRONT',preview_mirror_state:'MIRRORED',shooting_relation:'SUBJECT_FACING_CAMERA'});

const displaySign=(sensor:SensorXDeltaSignV01,mirror:V4DirectionContextV01['preview_mirror_state']):-1|0|1=>{
  const sign=sensor==='NEGATIVE'?-1:sensor==='POSITIVE'?1:0;
  return mirror==='MIRRORED'?(sign===0?0:(-sign as -1|1)):mirror==='NON_MIRRORED'?sign:0;
};

export function mapSubjectPhysicalDirectionV01(desiredSensorDeltaSign:SensorXDeltaSignV01,controlActor:ControlActorV02,context:V4DirectionContextV01):Readonly<SubjectPhysicalDirectionDecisionV01>{
  let physicalAction:PhysicalXActionV01='UNSUPPORTED';
  const knownSensor=desiredSensorDeltaSign==='NEGATIVE'||desiredSensorDeltaSign==='POSITIVE',knownCamera=context.camera_facing==='FRONT'||context.camera_facing==='REAR';
  if(knownSensor&&knownCamera&&controlActor==='SUBJECT'){
    if(context.shooting_relation==='SUBJECT_FACING_CAMERA')physicalAction=desiredSensorDeltaSign==='POSITIVE'?'SUBJECT_LEFT':'SUBJECT_RIGHT';
    else if(context.shooting_relation==='SUBJECT_BACK_TO_CAMERA')physicalAction=desiredSensorDeltaSign==='POSITIVE'?'SUBJECT_RIGHT':'SUBJECT_LEFT';
  }else if(knownSensor&&knownCamera&&controlActor==='CAMERA_OPERATOR'){
    physicalAction=desiredSensorDeltaSign==='POSITIVE'?'CAMERA_LEFT':'CAMERA_RIGHT';
  }
  return Object.freeze({mapper_version:'SubjectPhysicalDirectionMapperV01',desired_sensor_delta_sign:desiredSensorDeltaSign,control_actor:controlActor,shooting_relation:context.shooting_relation,camera_facing:context.camera_facing,preview_mirror_state:context.preview_mirror_state,physical_action:physicalAction,display_axis_sign:displaySign(desiredSensorDeltaSign,context.preview_mirror_state),supported:physicalAction!=='UNSUPPORTED'});
}

export function physicalXActionToV4Action(action:PhysicalXActionV01):V4Action|null{
  return action==='SUBJECT_LEFT'?'MOVE_LEFT_SMALL':action==='SUBJECT_RIGHT'?'MOVE_RIGHT_SMALL':action==='CAMERA_LEFT'?'MOVE_CAMERA_LEFT_SMALL':action==='CAMERA_RIGHT'?'MOVE_CAMERA_RIGHT_SMALL':null;
}
