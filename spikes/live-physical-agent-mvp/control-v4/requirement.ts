import { V4_MEASUREMENT_DEFINITIONS } from './measurement-definitions.js';
import { V4_FRAMING_PROFILES_V01 } from './framing-profiles.js';
import type { LiveTargetV02, MeasurementTypeV01, SemanticAnchorNameV01, TargetMeasurementRequirementV01 } from './types.js';

export function projectTargetMeasurementRequirementV01(target:LiveTargetV02):Readonly<TargetMeasurementRequirementV01>{
  const profile=V4_FRAMING_PROFILES_V01[target.framing_profile_id];const requiredMeasurements=Object.freeze([...profile.required_measurements] as MeasurementTypeV01[]);
  const requiredAnchors=Object.freeze([...new Set<SemanticAnchorNameV01>([target.primary_anchor,...profile.required_anchors,...requiredMeasurements.flatMap(metric=>V4_MEASUREMENT_DEFINITIONS[metric].required_anchors)])]);
  return Object.freeze({requirement_version:'TargetMeasurementRequirementV01',target_id:target.id,framing_profile_id:profile.id,position_zone:target.position_zone,coverage_expectation:Object.freeze([...profile.required_regions]),observed_extent_expectation:profile.coverage_expectation,required_anchors:requiredAnchors,required_measurements:requiredMeasurements,scale_constraint:Object.freeze({metric:target.scale_metric,target:target.target_scale,tolerance:target.tolerance_scale}),primary_anchor_constraint:Object.freeze({anchor:target.primary_anchor,target_x:target.target_anchor_x,tolerance_x:target.tolerance_x}),secondary_constraint:Object.freeze({target_y:target.target_anchor_y,tolerance_y:target.tolerance_y}),control_actor:target.control_actor});
}
