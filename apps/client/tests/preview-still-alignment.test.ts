import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {PreviewStillAlignmentTracker,classifyPreviewStillAlignment,fullViewport,type AlignmentEstimate,type AlignmentMode} from '../src/platform/previewStillAlignment'

const estimate=(alignmentMode:AlignmentMode='IDENTITY',overrides:Partial<AlignmentEstimate>={}):AlignmentEstimate=>({previewReferenceId:'preview-1',nativeStillId:'still-1',alignmentMode,previewWidth:1440,previewHeight:1920,stillWidth:3072,stillHeight:4096,normalizedPreviewOrientation:'PORTRAIT',normalizedStillOrientation:'PORTRAIT',cropRectNormalized:fullViewport(.75),scaleX:1,scaleY:1,translationX:0,translationY:0,mirrorX:false,mirrorY:false,confidence:.99,residualError:.01,generation:1,source:'CONTROLLED_FIXTURE',...overrides})

test('A identity preview/still is authoritative only with high confidence',()=>assert.equal(classifyPreviewStillAlignment(estimate()).result,'IDENTITY'))
test('B orientation-only difference calibrates without crop',()=>assert.deepEqual(classifyPreviewStillAlignment(estimate('ORIENTATION_NORMALIZED',{normalizedPreviewOrientation:'LANDSCAPE'})).result,'CALIBRATED'))
test('C centered FOV crop is explicit',()=>{const value=classifyPreviewStillAlignment(estimate('CALIBRATED_CROP',{cropRectNormalized:{x:.1,y:.1,width:.8,height:.8,aspectRatio:.75}}));assert.equal(value.result,'CALIBRATED')})
test('D off-center crop preserves translation',()=>assert.equal(classifyPreviewStillAlignment(estimate('CALIBRATED_TRANSFORM',{translationX:.08,cropRectNormalized:{x:.18,y:.1,width:.75,height:.8,aspectRatio:.75}})).translationX,.08))
test('E scale plus translation is calibrated, not identity',()=>assert.equal(classifyPreviewStillAlignment(estimate('CALIBRATED_TRANSFORM',{scaleX:1.08,scaleY:1.08,translationY:-.04})).result,'CALIBRATED'))
test('F mirror mismatch is explicit and cannot be identity',()=>assert.equal(classifyPreviewStillAlignment(estimate('CALIBRATED_TRANSFORM',{mirrorX:true})).result,'CALIBRATED'))
test('G low confidence never becomes authoritative',()=>assert.equal(classifyPreviewStillAlignment(estimate('CALIBRATED_CROP',{confidence:.55})).result,'LOW_CONFIDENCE'))
test('H unsupported mapping cannot pretend fidelity',()=>assert.equal(classifyPreviewStillAlignment(estimate('UNSUPPORTED')).result,'UNSUPPORTED'))
test('I front rear switch requires a new alignment generation',()=>{const t=new PreviewStillAlignmentTracker();const rear=t.evaluate({...estimate(),previewReferenceId:'rear',source:'CONTROLLED_FIXTURE'});const front=t.evaluate({...estimate(),previewReferenceId:'front',source:'CONTROLLED_FIXTURE'});assert.equal(front.generation,rear.generation+1)})
test('J close reopen rejects stale alignment',()=>{const t=new PreviewStillAlignmentTracker();t.evaluate({...estimate(),source:'CONTROLLED_FIXTURE'});t.invalidate();assert.equal(t.snapshot().result,null)})
