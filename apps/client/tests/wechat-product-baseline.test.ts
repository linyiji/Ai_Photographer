import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {reconcileContext,safeHomeContext,CONTEXT_RELIABILITY_ORDER} from '../src/product/homeContext'
import {WeChatCameraState} from '../src/platform/wechatCameraState'
import {fineTunePlatformCapability} from '../src/fineTune/platform'
import {createRecipe} from '../src/fineTune/core'
import {WeChatFineTuneRuntime} from '../src/fineTune/wechatRuntime'

test('Home context is external and landmark remains decorative only',()=>{const context=safeHomeContext();assert.equal(context.reliability,'EXTERNAL_CONTEXT');const result=reconcileContext(context);assert.deepEqual(result.ordering,CONTEXT_RELIABILITY_ORDER);assert.equal(result.landmarkAuthority,'DECORATIVE_ONLY');assert.ok(result.discarded.includes('landmark_asset_id:DECORATIVE_ONLY'))})
test('reliability order keeps observed reality above intent, external and decorative context',()=>{assert.deepEqual(CONTEXT_RELIABILITY_ORDER,['OBSERVED','USER_INTENT','EXTERNAL_CONTEXT','DECORATIVE'])})
test('WeChat camera lifecycle covers open ready capture switch failure and close',()=>{const state=new WeChatCameraState();assert.equal(state.snapshot().lifecycle,'CLOSED');state.open('environment');assert.equal(state.snapshot().lifecycle,'OPENING');state.ready();assert.equal(state.capture(),true);state.captured();assert.equal(state.switchFacing(),'user');state.fail();assert.equal(state.snapshot().lifecycle,'ERROR');state.close();assert.equal(state.snapshot().lifecycle,'CLOSED')})
test('WeChat camera cannot capture before component readiness',()=>{const state=new WeChatCameraState();state.open('environment');assert.equal(state.capture(),false)})
test('Fine Tune audit preserves shared core behind a WeChat rendering adapter',()=>{const result=fineTunePlatformCapability('WECHAT');assert.equal(result.core,'SHARED');assert.equal(result.interactiveRenderer,'WECHAT_CANVAS2D_ADAPTER');assert.equal(result.finalRenderer,'WECHAT_OFFSCREEN_CANVAS2D');assert.equal(result.derivedUpload,'IMPLEMENTED');assert.equal(result.localRegionTouch,'IMPLEMENTED');assert.equal(result.deviceAcceptance,'NOT_EXERCISED')})

test('WeChat Fine Tune adapter decodes, previews and finalizes through platform canvas APIs',async()=>{
  const previous=(globalThis as any).wx
  const writes:Array<{filePath:string;data:ArrayBuffer}>=[]
  const pixels=new Uint8ClampedArray([80,90,100,255,110,120,130,255,140,150,160,255,170,180,190,255])
  const context={
    drawImage:()=>undefined,
    getImageData:()=>({data:pixels}),
    createImageData:(width:number,height:number)=>({data:new Uint8ClampedArray(width*height*4)}),
    putImageData:()=>undefined
  }
  const canvas=()=>({
    width:1,
    height:1,
    getContext:()=>context,
    createImage:()=>{const image:any={width:2,height:2,onload:undefined,onerror:undefined};Object.defineProperty(image,'src',{set:()=>queueMicrotask(()=>image.onload?.())});return image},
    toDataURL:()=>`data:image/jpeg;base64,${Buffer.from([0xff,0xd8,0xff,0xd9]).toString('base64')}`
  })
  ;(globalThis as any).wx={
    downloadFile:({success}:any)=>success({statusCode:200,tempFilePath:'/tmp/source.jpg'}),
    createOffscreenCanvas:canvas,
    getFileSystemManager:()=>({writeFile:({filePath,data,success}:any)=>{writes.push({filePath,data});success()}}),
    env:{USER_DATA_PATH:'/user'},
    base64ToArrayBuffer:(value:string)=>Uint8Array.from(Buffer.from(value,'base64')).buffer
  }
  try{
    const recipe=createRecipe('wechat-session','asset-source')
    const session=await new WeChatFineTuneRuntime().open({source:{asset_id:'asset-source',content_url:'https://example.test/source.jpg',checksum:{algorithm:'SHA256',value:'test-checksum'}},recipe,options:{preview_long_edge:480,jpeg_quality:.92}})
    const preview=await session.project(recipe)
    assert.deepEqual([preview.width,preview.height],[2,2])
    const final=await session.renderFinal(recipe,'wechat-final')
    assert.equal(final.backend,'WECHAT_OFFSCREEN_CANVAS2D')
    assert.equal(final.filePath,'/user/fine-tune-wechat-final.jpg')
    assert.equal(final.bytes,4)
    assert.equal(writes.length,1)
    session.close()
  }finally{(globalThis as any).wx=previous}
})
