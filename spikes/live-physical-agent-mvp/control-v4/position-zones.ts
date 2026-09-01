import type { ConstraintRelationV01, PositionZoneIdV01, PositionZoneV01, XZoneRelationV01, YZoneRelationV01 } from './types.js';

export const V4_POSITION_ZONES_V01:Readonly<Record<PositionZoneIdV01,Readonly<PositionZoneV01>>>=Object.freeze({
  LEFT_TOP:Object.freeze({zone_version:'PositionZoneV01',id:'LEFT_TOP',target_x:.30,tolerance_x_enter:.06,tolerance_x_exit:.085,target_y:.34,tolerance_y_enter:.07,tolerance_y_exit:.10,y_action_owner:'CAMERA_OPERATOR_DEFERRED'}),
  CENTER:Object.freeze({zone_version:'PositionZoneV01',id:'CENTER',target_x:.50,tolerance_x_enter:.055,tolerance_x_exit:.08,target_y:.50,tolerance_y_enter:.07,tolerance_y_exit:.10,y_action_owner:'CAMERA_OPERATOR_DEFERRED'}),
  RIGHT_BOTTOM:Object.freeze({zone_version:'PositionZoneV01',id:'RIGHT_BOTTOM',target_x:.70,tolerance_x_enter:.06,tolerance_x_exit:.085,target_y:.66,tolerance_y_enter:.07,tolerance_y_exit:.10,y_action_owner:'CAMERA_OPERATOR_DEFERRED'}),
});

export const xZoneRelationV01=(relation:ConstraintRelationV01):XZoneRelationV01=>relation==='TOO_LOW'?'LEFT_OF_ZONE':relation==='TOO_HIGH'?'RIGHT_OF_ZONE':relation==='IN_RANGE'?'IN_X_RANGE':'UNKNOWN';
export const yZoneRelationV01=(relation:ConstraintRelationV01):YZoneRelationV01=>relation==='TOO_LOW'?'ABOVE_ZONE':relation==='TOO_HIGH'?'BELOW_ZONE':relation==='IN_RANGE'?'IN_Y_RANGE':'UNKNOWN';

