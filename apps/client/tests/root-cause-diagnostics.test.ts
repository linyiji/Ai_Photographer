import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {centeredAspectCrop,estimateCentralCropByLuma,projectObjectFit} from '../src/diagnostics/cameraGeometry'
import {controlledMaskAudit,localRegionAudit,rangeClassification,simulateLatestSlotScheduler,traceRange} from '../src/diagnostics/fineTuneDiagnostics'

test('9:16 stream projected cover into 3:4 portrait viewport crops top and bottom',()=>{const p=projectObjectFit(1080,1920,360,480,'cover');assert.equal(p.visibleSourceRect.x0,0);assert.ok(p.visibleSourceRect.y0>0);assert.ok(p.visibleSourceRect.y1<1)})
test('9:16 stream centered 3:4 crop is deterministic',()=>{assert.deepEqual(centeredAspectCrop(1080,1920,3/4),{x0:0,y0:.125,x1:1,y1:.875})})
test('synthetic transform estimator recognizes identity',()=>{const data=new Uint8Array(32*32);for(let y=0;y<32;y++)for(let x=0;x<32;x++)data[y*32+x]=(x*7+y*11+x*y)%256;const result=estimateCentralCropByLuma(data,32,32,data,32,32);assert.equal(result.classification,'CENTER_CROP_ONLY');assert.ok(result.confidence>=.25)})
test('range trace preserves min calibration zero and max without recipe mapping defect',()=>{for(const raw of [-100,-30,0,30,100]){const t=traceRange(raw);assert.equal(t.normalized,t.recipe);assert.equal(t.recipe,t.renderer);assert.equal(t.renderer,t.reloaded)}assert.equal(rangeClassification(),'UI_LABEL_ONLY_MISMATCH')})
test('local runtime restricts pixels while UI failure layers are overlay and touch',()=>{const result=localRegionAudit();assert.equal(result.objectCreated,true);assert.equal(result.validGeometry,true);assert.equal(result.persists,true);assert.equal(result.previewRestricted,true);assert.deepEqual(result.layers,['OVERLAY_MISSING','TOUCH_INTERACTION_MISSING'])})
test('controlled person and background masks pass and no-mask route fails closed',()=>{assert.deepEqual(controlledMaskAudit(),{personPass:true,backgroundPass:true,failClosedWithoutMask:true,productionMaskProvider:'NOT_IMPLEMENTED'})})
test('latest slot bounds pending depth but does not cancel already-running work',()=>{const result=simulateLatestSlotScheduler(5,[0,1,2,3,20],[10,10,10,10,10]);assert.equal(result.maxPendingDepth,1);assert.ok(result.superseded>0);assert.equal(result.supersededWorkActuallyCancelled,false)})
