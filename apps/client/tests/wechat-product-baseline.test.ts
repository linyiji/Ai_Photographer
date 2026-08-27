import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {reconcileContext,safeHomeContext,CONTEXT_RELIABILITY_ORDER} from '../src/product/homeContext'
import {WeChatCameraState} from '../src/platform/wechatCameraState'
import {fineTunePlatformCapability} from '../src/fineTune/platform'

test('Home context is external and landmark remains decorative only',()=>{const context=safeHomeContext();assert.equal(context.reliability,'EXTERNAL_CONTEXT');const result=reconcileContext(context);assert.deepEqual(result.ordering,CONTEXT_RELIABILITY_ORDER);assert.equal(result.landmarkAuthority,'DECORATIVE_ONLY');assert.ok(result.discarded.includes('landmark_asset_id:DECORATIVE_ONLY'))})
test('reliability order keeps observed reality above intent, external and decorative context',()=>{assert.deepEqual(CONTEXT_RELIABILITY_ORDER,['OBSERVED','USER_INTENT','EXTERNAL_CONTEXT','DECORATIVE'])})
test('WeChat camera lifecycle covers open ready capture switch failure and close',()=>{const state=new WeChatCameraState();assert.equal(state.snapshot().lifecycle,'CLOSED');state.open('environment');assert.equal(state.snapshot().lifecycle,'OPENING');state.ready();assert.equal(state.capture(),true);state.captured();assert.equal(state.switchFacing(),'user');state.fail();assert.equal(state.snapshot().lifecycle,'ERROR');state.close();assert.equal(state.snapshot().lifecycle,'CLOSED')})
test('WeChat camera cannot capture before component readiness',()=>{const state=new WeChatCameraState();state.open('environment');assert.equal(state.capture(),false)})
test('Fine Tune audit preserves shared core without claiming an unbuilt WeChat renderer',()=>{const result=fineTunePlatformCapability('WECHAT');assert.equal(result.core,'SHARED');assert.equal(result.interactiveRenderer,'WECHAT_CANVAS2D_REQUIRED');assert.equal(result.deviceAcceptance,'NOT_EXERCISED')})
