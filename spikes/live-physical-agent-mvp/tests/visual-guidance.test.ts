import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_TARGET } from '../closed-loop/config.js';
import { LocalClosedLoopEngine } from '../closed-loop/engine.js';
import type { ClosedLoopSnapshot } from '../closed-loop/types.js';
import { frame } from '../fixtures/closed-loop/trajectories.js';
import type { PoseMeasurement, StructuredPerceptionState } from '../perception/types.js';
import { VisualGuidanceProjector } from '../visual-guidance/projector.js';

const control = (state: StructuredPerceptionState): ClosedLoopSnapshot => {
  const engine = new LocalClosedLoopEngine(); engine.armTrial(0); engine.update({ ...state, timestamp_ms: 0 }); return engine.update({ ...state, timestamp_ms: 300 });
};
const raw = (timestamp_ms:number,center_x:number,center_y=.5,width_ratio=.3,height_ratio=.35):PoseMeasurement=>({timestamp_ms,confidence:.9,pose_presence:.9,valid_landmark_count:20,min_x:center_x-width_ratio/2,max_x:center_x+width_ratio/2,min_y:center_y-height_ratio/2,max_y:center_y+height_ratio/2,center_x,center_y,width_ratio,height_ratio});
const update = (projector:VisualGuidanceProjector,state:StructuredPerceptionState,measurement:PoseMeasurement|null=null,now=state.timestamp_ms)=>projector.update(state,control(state),measurement,{now});

test('visual projection exposes implementation-owned semantic fields',()=>{const s=frame(300,.2,.35,false);const v=update(new VisualGuidanceProjector(),s);assert.equal(v.source_timestamp,300);assert.ok(v.target_box);assert.ok(v.acceptable_zone);});
test('raw MediaPipe box is never returned as stabilized object identity',()=>{const p=new VisualGuidanceProjector();const s=frame(300,.2,.35,false);const m=raw(300,.2);const v=update(p,s,m);assert.notEqual(v.tracked_subject_box,v.raw_subject_box);});
test('visual EMA reduces alternating measurement jitter',()=>{const p=new VisualGuidanceProjector();let v;for(let i=0;i<20;i++){const x=.5+(i%2?-.012:.012);const s=frame(i*125,x,.35,true);v=update(p,s,raw(i*125,x));}assert.ok(v!.metrics.stabilized_box_jitter<v!.metrics.raw_box_jitter);assert.ok(v!.metrics.jitter_reduction_ratio!>0);});
test('visual projection follows meaningful movement without frozen lag',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.2,.35,false,.5,.3),raw(0,.2));const v=update(p,frame(125,.5,.35,false,.5,.3),raw(125,.5));assert.ok(v.tracked_subject_box!.center_x>.3);assert.ok(v.tracked_subject_box!.center_x<.5);});
test('projection does not mutate structured perception',()=>{const p=new VisualGuidanceProjector();const s=frame(0,.2,.35);const before=structuredClone(s);update(p,s);assert.deepEqual(s,before);});
test('target box derives center and height from TargetState',()=>{const s=frame(300,.2,.35);const v=update(new VisualGuidanceProjector(),s);assert.equal(v.target_box.center_x,DEFAULT_TARGET.center_x);assert.equal(v.target_box.height,DEFAULT_TARGET.height_ratio);});
test('acceptable zone exposes exact controller x deadband',()=>{const v=update(new VisualGuidanceProjector(),frame(300,.2,.35));assert.equal(v.acceptable_zone.center_x_min,DEFAULT_TARGET.center_x-DEFAULT_TARGET.tolerance_x);assert.equal(v.acceptable_zone.center_x_max,DEFAULT_TARGET.center_x+DEFAULT_TARGET.tolerance_x);});
test('acceptable zone exposes exact controller scale deadband',()=>{const v=update(new VisualGuidanceProjector(),frame(300,.2,.35));assert.equal(v.acceptable_zone.height_min,DEFAULT_TARGET.height_ratio-DEFAULT_TARGET.tolerance_height);assert.equal(v.acceptable_zone.height_max,DEFAULT_TARGET.height_ratio+DEFAULT_TARGET.tolerance_height);});
test('outside x status remains explicit',()=>assert.equal(update(new VisualGuidanceProjector(),frame(300,.2,.35)).x_status,'OUTSIDE'));
test('approaching x status uses braking corridor without widening target',()=>assert.equal(update(new VisualGuidanceProjector(),frame(300,.43,.35)).x_status,'APPROACHING'));
test('inside x status maps controller deadband',()=>assert.equal(update(new VisualGuidanceProjector(),frame(300,.48,.35)).x_status,'INSIDE'));
test('scale status is independent from x status',()=>{const v=update(new VisualGuidanceProjector(),frame(300,.5,.12));assert.equal(v.x_status,'INSIDE');assert.equal(v.scale_status,'OUTSIDE');});
test('measurement stability requires quiet hysteresis window',()=>{const p=new VisualGuidanceProjector();const a=update(p,frame(0,.5,.35,true));const b=update(p,frame(400,.5,.35,true));assert.equal(a.measurement_stable,false);assert.equal(b.measurement_stable,true);});
test('projection age is timestamp based and bounded nonnegative',()=>{const s=frame(300,.5,.35,true);const v=update(new VisualGuidanceProjector(),s,null,345);assert.equal(v.projection_age,45);});
test('subject starts acquiring before lock',()=>assert.equal(update(new VisualGuidanceProjector(),frame(0,.5,.35,true)).tracking_status,'ACQUIRING'));
test('stable detected subject becomes locked',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.5,.35,true));const v=update(p,frame(300,.5,.35,true));assert.equal(v.tracking_status,'LOCKED');});
test('brief detection loss holds stabilized box',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.5,.35,true));update(p,frame(300,.5,.35,true));const v=update(p,frame(600,null,null));assert.equal(v.tracking_status,'HELD');assert.ok(v.tracked_subject_box);});
test('long detection loss unlocks and hides box',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.5,.35,true));update(p,frame(300,.5,.35,true));const v=update(p,{...frame(1100,null,null),measurement_age_ms:800});assert.equal(v.tracking_status,'UNLOCKED');assert.equal(v.tracked_subject_box,null);assert.equal(v.metrics.subject_lock_loss_count,1);});
test('nearby reacquisition restores same visual lock',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.5,.35,true));update(p,frame(300,.5,.35,true));update(p,frame(600,null,null));const v=update(p,frame(700,.52,.36,true));assert.equal(v.tracking_status,'LOCKED');assert.equal(v.metrics.reacquisition_count,1);});
test('far reacquisition restarts acquisition instead of jumping lock',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.2,.2,true));update(p,frame(300,.2,.2,true));update(p,frame(600,null,null));const v=update(p,frame(700,.8,.7,true));assert.equal(v.tracking_status,'ACQUIRING');});
test('visual state admits only one directional hint',()=>{const v=update(new VisualGuidanceProjector(),frame(300,.2,.35));assert.equal(v.direction_hint,'MOVE_LEFT');assert.equal(Array.isArray(v.direction_hint),false);});
test('near-target is distinct from inside target',()=>{const v=update(new VisualGuidanceProjector(),frame(300,.43,.35));assert.equal(v.near_target,true);assert.equal(v.inside_target,false);});
test('overlay mode and grid preference are presentation only',()=>{const p=new VisualGuidanceProjector();const s=frame(300,.2,.35);const c=control(s);const a=p.update(s,c,null,{mode:'TEXT_DOMINANT',grid:false});p.reset();const b=p.update(s,c,null,{mode:'VISUAL_SERVO',grid:true});assert.equal(a.overlay_mode,'TEXT_DOMINANT');assert.equal(b.overlay_mode,'VISUAL_SERVO');assert.deepEqual(a.target_box,b.target_box);});
test('projector reset clears lock and visual counters',()=>{const p=new VisualGuidanceProjector();update(p,frame(0,.5,.35,true));update(p,frame(300,.5,.35,true));p.reset();const v=update(p,frame(0,.5,.35,true));assert.equal(v.tracking_status,'ACQUIRING');assert.equal(v.metrics.target_box_entry_count,1);});
