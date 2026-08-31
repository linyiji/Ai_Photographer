import type { LandmarkBasisScalarV01, MeasurementDefinitionV01, MeasurementReadinessV01 } from './types.js';

const define=(definition:MeasurementDefinitionV01):Readonly<MeasurementDefinitionV01>=>Object.freeze(definition);
export const V4_MEASUREMENT_DEFINITIONS:Readonly<Record<MeasurementDefinitionV01['measurement_type'],Readonly<MeasurementDefinitionV01>>>=Object.freeze({
  HEAD_TO_HIP:define({measurement_type:'HEAD_TO_HIP',required_anchors:Object.freeze(['HEAD_CENTER','HIP_CENTER']),required_regions:Object.freeze(['HEAD','HIPS']),crop_dependencies:Object.freeze(['HEAD','HIPS'])}),
  TORSO_CENTER:define({measurement_type:'TORSO_CENTER',required_anchors:Object.freeze(['SHOULDER_CENTER','HIP_CENTER','TORSO_CENTER']),required_regions:Object.freeze(['SHOULDERS','HIPS','UPPER_TORSO']),crop_dependencies:Object.freeze(['SHOULDERS','HIPS'])}),
  HEAD_TO_KNEE:define({measurement_type:'HEAD_TO_KNEE',required_anchors:Object.freeze(['HEAD_CENTER','KNEE_CENTER']),required_regions:Object.freeze(['HEAD','KNEES']),crop_dependencies:Object.freeze(['HEAD','KNEES'])}),
  HEAD_TO_ANKLE:define({measurement_type:'HEAD_TO_ANKLE',required_anchors:Object.freeze(['HEAD_CENTER','ANKLE_CENTER']),required_regions:Object.freeze(['HEAD','ANKLES']),crop_dependencies:Object.freeze(['HEAD','ANKLES'])}),
});

export function measurementReadinessV01(definition:MeasurementDefinitionV01,basis:Readonly<Record<'HEAD'|'SHOULDERS'|'HIPS'|'KNEES'|'ANKLES',Readonly<LandmarkBasisScalarV01>>>,valid:boolean,confidence:number,fresh:boolean):MeasurementReadinessV01{
  if(definition.crop_dependencies.some(region=>basis[region].status==='EDGE_CROPPED'))return 'INVALID';
  const required=definition.crop_dependencies.map(region=>basis[region].status);
  if(!valid)return required.some(status=>status==='UNILATERAL_PARTIAL'||status==='LOW_CONFIDENCE')?'MARGINAL':'INVALID';
  return fresh&&confidence>=.6&&required.every(status=>status==='BILATERAL_VALID'||status==='VALID')?'GOOD':'MARGINAL';
}
