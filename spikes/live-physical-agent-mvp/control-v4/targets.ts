import type { BodyRegionV01, LiveTargetV02, TargetFixtureIdV02 } from './types.js';

const body={upper:['HEAD','SHOULDERS','UPPER_TORSO','HIPS'],three:['HEAD','SHOULDERS','UPPER_TORSO','HIPS','KNEES'],full:['HEAD','SHOULDERS','UPPER_TORSO','HIPS','KNEES','ANKLES','FEET']} as const satisfies Record<string,readonly BodyRegionV01[]>;
const make=(id:TargetFixtureIdV02,label:string,x:number,required:readonly BodyRegionV01[],metric:LiveTargetV02['scale_metric'],scale:number,tolerance:number):Readonly<LiveTargetV02>=>Object.freeze({target_version:'LiveTargetV02',id,source:'FIXTURE',label,required_body_parts:required,primary_anchor:'TORSO_CENTER',target_anchor_x:x,tolerance_x:.055,target_anchor_y:null,tolerance_y:null,scale_metric:metric,target_scale:scale,tolerance_scale:tolerance,control_actor:'SUBJECT',ready_stable_ms:600});
export const LIVE_TARGET_FIXTURES_V02:Readonly<Record<TargetFixtureIdV02,Readonly<LiveTargetV02>>>=Object.freeze({
  CENTER_UPPER_BODY:make('CENTER_UPPER_BODY','居中 · 上半身',.5,body.upper,'HEAD_TO_HIP',.42,.07),
  LEFT_THIRD_UPPER_BODY:make('LEFT_THIRD_UPPER_BODY','左三分 · 上半身',.33,body.upper,'HEAD_TO_HIP',.42,.07),
  RIGHT_THIRD_UPPER_BODY:make('RIGHT_THIRD_UPPER_BODY','右三分 · 上半身',.67,body.upper,'HEAD_TO_HIP',.42,.07),
  CENTER_THREE_QUARTER:make('CENTER_THREE_QUARTER','居中 · 三分之三身',.5,body.three,'HEAD_TO_KNEE',.62,.08),
  LEFT_THIRD_FULL_BODY:make('LEFT_THIRD_FULL_BODY','左三分 · 全身',.33,body.full,'HEAD_TO_ANKLE',.8,.09),
  RIGHT_THIRD_FULL_BODY:make('RIGHT_THIRD_FULL_BODY','右三分 · 全身',.67,body.full,'HEAD_TO_ANKLE',.8,.09),
});
export const DEFAULT_LIVE_TARGET_V02=LIVE_TARGET_FIXTURES_V02.CENTER_UPPER_BODY;

