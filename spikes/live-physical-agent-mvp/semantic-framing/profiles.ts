import type { DirectionalAction } from '../closed-loop/types.js';
import type { BodyMode, ScaleMetricType } from './types.js';

export interface FramingTargetProfile { target_id:string; intent:string; compatible_modes:readonly BodyMode[]; precision_metrics:readonly ScaleMetricType[]; incompatible_action:(mode:BodyMode)=>DirectionalAction|null; calibration:'SEMANTIC_VISIBLE_OCCUPANCY_EQUIVALENT'; }
const mediumModes=Object.freeze<BodyMode[]>(['UPPER_BODY','THREE_QUARTER','FULL_BODY']); const closeModes=Object.freeze<BodyMode[]>(['HEAD_SHOULDERS','UPPER_BODY']);
const metrics=Object.freeze<ScaleMetricType[]>(['HEAD_SHOULDER_SCALE','TORSO_COMPOSITE_SCALE','THREE_QUARTER_COMPOSITE_SCALE','FULL_BODY_ROBUST_SCALE']);
export const FRAMING_TARGET_PROFILES:Readonly<Record<string,FramingTargetProfile>>=Object.freeze({
  'center-medium':Object.freeze({target_id:'center-medium',intent:'居中自然中景；至少稳定上半身语义',compatible_modes:mediumModes,precision_metrics:metrics,incompatible_action:(mode:BodyMode)=>['HEAD_ONLY','HEAD_SHOULDERS'].includes(mode)?'MOVE_FARTHER':null,calibration:'SEMANTIC_VISIBLE_OCCUPANCY_EQUIVALENT'}),
  'left-composition':Object.freeze({target_id:'left-composition',intent:'左侧构图自然中景；至少稳定上半身语义',compatible_modes:mediumModes,precision_metrics:metrics,incompatible_action:(mode:BodyMode)=>['HEAD_ONLY','HEAD_SHOULDERS'].includes(mode)?'MOVE_FARTHER':null,calibration:'SEMANTIC_VISIBLE_OCCUPANCY_EQUIVALENT'}),
  'center-close':Object.freeze({target_id:'center-close',intent:'居中近景；头肩或上半身语义',compatible_modes:closeModes,precision_metrics:metrics,incompatible_action:(mode:BodyMode)=>['THREE_QUARTER','FULL_BODY'].includes(mode)?'MOVE_CLOSER':null,calibration:'SEMANTIC_VISIBLE_OCCUPANCY_EQUIVALENT'}),
});
export const profileFor=(targetId:string):FramingTargetProfile|null=>FRAMING_TARGET_PROFILES[targetId]??null;
