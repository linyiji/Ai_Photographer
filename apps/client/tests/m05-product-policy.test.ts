import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {confirmationKey,mayConfirm,publicRuntimeMayStart,retakeBeforeConfirm,shareFallback} from '../src/product/capturePolicy'

test('capture confirmation key is stable for one local candidate',()=>assert.equal(confirmationKey('local-1'),confirmationKey('local-1')))
test('double submit is disabled while confirmation is busy',()=>assert.equal(mayConfirm({candidateId:'local-1',uploadedAssetId:null,busy:true}),false))
test('retake before confirmation leaves server uploads and workflow unchanged',()=>assert.deepEqual(retakeBeforeConfirm({candidateId:'local-1',uploadedAssetId:null,busy:false},4),{state:{candidateId:null,uploadedAssetId:null,busy:false},serverUploadCount:4,workflowAdvance:false}))
test('production refuses to start while readiness is false',()=>assert.equal(publicRuntimeMayStart('PRODUCTION',false),false))
test('internal demo can start with honest disclosure',()=>assert.equal(publicRuntimeMayStart('INTERNAL_DEMO',true),true))
test('unsupported share retains download fallback',()=>assert.equal(shareFallback(false),'DOWNLOAD'))
