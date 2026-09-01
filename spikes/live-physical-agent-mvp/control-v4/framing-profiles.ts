import type { FramingProfileIdV01, ObservedBodyCoverageV01, ObservedExtentV01, TargetFramingProfileV01 } from './types.js';

const profile=(value:TargetFramingProfileV01):Readonly<TargetFramingProfileV01>=>Object.freeze({...value,required_regions:Object.freeze([...value.required_regions]),required_anchors:Object.freeze([...value.required_anchors]),required_measurements:Object.freeze([...value.required_measurements])});

export const V4_FRAMING_PROFILES_V01:Readonly<Record<FramingProfileIdV01,Readonly<TargetFramingProfileV01>>>=Object.freeze({
  HEAD:profile({profile_version:'TargetFramingProfileV01',id:'HEAD',coverage_expectation:'HEAD',required_regions:['HEAD'],required_anchors:['HEAD_CENTER'],required_measurements:['HEAD_SIZE'],scale_metric:'HEAD_SIZE',preferred_primary_anchor:'HEAD_CENTER',hips_required:false,full_body_required:false}),
  HEAD_SHOULDERS:profile({profile_version:'TargetFramingProfileV01',id:'HEAD_SHOULDERS',coverage_expectation:'HEAD_SHOULDERS',required_regions:['HEAD','SHOULDERS'],required_anchors:['HEAD_CENTER','SHOULDER_CENTER'],required_measurements:['HEAD_SHOULDER_SCALE'],scale_metric:'HEAD_SHOULDER_SCALE',preferred_primary_anchor:'SHOULDER_CENTER',hips_required:false,full_body_required:false}),
  UPPER_BODY:profile({profile_version:'TargetFramingProfileV01',id:'UPPER_BODY',coverage_expectation:'UPPER_BODY',required_regions:['HEAD','SHOULDERS','UPPER_TORSO','HIPS'],required_anchors:['HEAD_CENTER','SHOULDER_CENTER','HIP_CENTER','TORSO_CENTER'],required_measurements:['HEAD_TO_HIP','TORSO_CENTER'],scale_metric:'HEAD_TO_HIP',preferred_primary_anchor:'TORSO_CENTER',hips_required:true,full_body_required:false}),
  THREE_QUARTER:profile({profile_version:'TargetFramingProfileV01',id:'THREE_QUARTER',coverage_expectation:'THREE_QUARTER',required_regions:['HEAD','SHOULDERS','UPPER_TORSO','HIPS','KNEES'],required_anchors:['HEAD_CENTER','HIP_CENTER','KNEE_CENTER'],required_measurements:['HEAD_TO_KNEE'],scale_metric:'HEAD_TO_KNEE',preferred_primary_anchor:'HIP_CENTER',hips_required:true,full_body_required:false}),
  FULL_BODY:profile({profile_version:'TargetFramingProfileV01',id:'FULL_BODY',coverage_expectation:'FULL_BODY',required_regions:['HEAD','SHOULDERS','UPPER_TORSO','HIPS','KNEES','ANKLES'],required_anchors:['HEAD_CENTER','ANKLE_CENTER','BODY_CENTER'],required_measurements:['HEAD_TO_ANKLE'],scale_metric:'HEAD_TO_ANKLE',preferred_primary_anchor:'BODY_CENTER',hips_required:true,full_body_required:true}),
});

export const normalizeObservedExtentV01=(coverage:ObservedBodyCoverageV01):ObservedExtentV01=>coverage==='HEAD_ONLY'?'HEAD':coverage;

