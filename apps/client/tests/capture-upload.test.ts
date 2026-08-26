import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {captureUploadKey,nextUploadState} from '../src/platform/captureUpload'

test('local candidate survives a retryable failure and can retry',()=>{let state=nextUploadState('LOCAL_CAPTURE_READY','QUEUE');state=nextUploadState(state,'START');state=nextUploadState(state,'RETRYABLE_FAILURE');assert.equal(state,'UPLOAD_RETRYABLE_FAILED');assert.equal(nextUploadState(state,'START'),'UPLOAD_IN_PROGRESS')})
test('upload and capture commit are distinct authority states',()=>{assert.equal(nextUploadState(nextUploadState('UPLOAD_PENDING','START'),'SUCCESS'),'UPLOAD_SUCCEEDED');assert.equal(nextUploadState('UPLOAD_SUCCEEDED','COMMIT'),'CAPTURE_COMMITTED')})
test('same session and candidate produce a stable upload idempotency key',()=>{assert.equal(captureUploadKey('s1','c1'),captureUploadKey('s1','c1'));assert.notEqual(captureUploadKey('s1','c1'),captureUploadKey('s1','c2'))})
