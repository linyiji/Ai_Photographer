import { v4ObservationFixture } from '../fixtures/control-v4/human-observations.js';
import { targetScopedCropState } from '../fixtures/control-v4/target-scoped-crop.js';
import { HumanTargetRelativeServoV04 } from './controller.js';
import { HumanObservationV02Projector } from './observation.js';
import { LIVE_TARGET_FIXTURES_V02 } from './targets.js';
import type { HumanObservationV02, TargetFixtureIdV02, V4Snapshot } from './types.js';

export const V4_BROWSER_MATRIX:readonly TargetFixtureIdV02[]=['CENTER_UPPER_BODY','LEFT_THIRD_UPPER_BODY','RIGHT_THIRD_UPPER_BODY','CENTER_THREE_QUARTER','LEFT_THIRD_FULL_BODY','RIGHT_THIRD_FULL_BODY'];
const coverageFor=(id:TargetFixtureIdV02):'UPPER_BODY'|'THREE_QUARTER'|'FULL_BODY'=>id.includes('FULL_BODY')?'FULL_BODY':id.includes('THREE_QUARTER')?'THREE_QUARTER':'UPPER_BODY';
const offX=(x:number)=>x<.5?Math.min(.9,x+.18):Math.max(.1,x-.18);
export function v4BrowserObservations(id:TargetFixtureIdV02):ReadonlyArray<Readonly<HumanObservationV02>>{const target=LIVE_TARGET_FIXTURES_V02[id],coverage=coverageFor(id),metric=target.scale_metric;let v=1;const o=(timestamp_ms:number,overrides:Partial<Parameters<typeof v4ObservationFixture>[0]>={})=>v4ObservationFixture({timestamp_ms,state_version:v++,coverage,scale_metric:metric,...overrides});return [
  o(0,{present:false}),o(300,{coverage:'HEAD_ONLY'}),o(650,{scale:target.target_scale-target.tolerance_scale*2,x:offX(target.target_anchor_x)}),o(950,{scale:target.target_scale-target.tolerance_scale*2,x:offX(target.target_anchor_x)}),
  o(1100,{scale:target.target_scale-target.tolerance_scale*1.5,x:offX(target.target_anchor_x),scale_motion:'POSITIVE',stable:false}),o(1400,{scale:target.target_scale,x:offX(target.target_anchor_x),scale_motion:'STILL'}),o(1800,{scale:target.target_scale,x:offX(target.target_anchor_x),scale_motion:'STILL'}),
  o(2100,{scale:target.target_scale,x:offX(target.target_anchor_x)}),o(2400,{scale:target.target_scale,x:target.target_anchor_x,x_motion:target.target_anchor_x<.5?'NEGATIVE':'POSITIVE',stable:false}),o(2700,{scale:target.target_scale,x:target.target_anchor_x}),o(3100,{scale:target.target_scale,x:target.target_anchor_x}),o(3500,{scale:target.target_scale,x:target.target_anchor_x}),o(3650,{scale:target.target_scale,x:target.target_anchor_x}),o(3800,{scale:target.target_scale,x:target.target_anchor_x}),o(3950,{scale:target.target_scale,x:target.target_anchor_x}),o(4100,{scale:target.target_scale,x:target.target_anchor_x}),
];}
export function runV4BrowserScenario(id:TargetFixtureIdV02):ReadonlyArray<Readonly<V4Snapshot>>{const c=new HumanTargetRelativeServoV04(LIVE_TARGET_FIXTURES_V02[id]);c.arm(0);return v4BrowserObservations(id).map(o=>c.update(o));}
export function runV4TargetScopedCropBrowserGate():ReadonlyArray<Readonly<V4Snapshot>>{const projector=new HumanObservationV02Projector(),controller=new HumanTargetRelativeServoV04(LIVE_TARGET_FIXTURES_V02.CENTER_UPPER_BODY);controller.arm(0);return [targetScopedCropState({timestamp_ms:0,sequence:1}),targetScopedCropState({timestamp_ms:400,sequence:2})].map(state=>controller.update(projector.project(state)));}
