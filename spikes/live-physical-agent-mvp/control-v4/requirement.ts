import { V4_MEASUREMENT_DEFINITIONS } from './measurement-definitions.js';
import type { LiveTargetV02, MeasurementTypeV01, SemanticAnchorNameV01, TargetMeasurementRequirementV01 } from './types.js';

export function projectTargetMeasurementRequirementV01(target:LiveTargetV02):Readonly<TargetMeasurementRequirementV01>{
  const requiredMeasurements=Object.freeze([target.scale_metric,'TORSO_CENTER'] as MeasurementTypeV01[]);
  const requiredAnchors=Object.freeze([...new Set<SemanticAnchorNameV01>([target.primary_anchor,...requiredMeasurements.flatMap(metric=>V4_MEASUREMENT_DEFINITIONS[metric].required_anchors)])]);
  return Object.freeze({requirement_version:'TargetMeasurementRequirementV01',target_id:target.id,coverage_expectation:Object.freeze([...target.required_body_parts]),required_anchors:requiredAnchors,required_measurements:requiredMeasurements,scale_constraint:Object.freeze({metric:target.scale_metric,target:target.target_scale,tolerance:target.tolerance_scale}),primary_anchor_constraint:Object.freeze({anchor:target.primary_anchor,target_x:target.target_anchor_x,tolerance_x:target.tolerance_x}),secondary_constraint:Object.freeze({target_y:target.target_anchor_y,tolerance_y:target.tolerance_y}),control_actor:target.control_actor});
}
