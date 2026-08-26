import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {cameraVideoConstraints,captureFrameStyle,captureViewportForVideo} from '../src/platform/captureViewport'

test('9:16 video exposes a centered authoritative 3:4 viewport',()=>{
 const viewport=captureViewportForVideo(1080,1920)
 assert.deepEqual(viewport,{x:0,y:.125,width:1,height:.75,aspectRatio:.75})
 assert.deepEqual(captureFrameStyle(1080,1920),{left:'0%',top:'12.5%',width:'100%',height:'75%'})
})

test('native 3:4 video maps directly to the full capture viewport',()=>{
 assert.deepEqual(captureViewportForVideo(1440,1920),{x:0,y:0,width:1,height:1,aspectRatio:.75})
})

test('wider stream uses a centered horizontal 3:4 viewport',()=>{
 const viewport=captureViewportForVideo(1920,1080)
 assert.equal(viewport.y,0)
 assert.equal(viewport.height,1)
 assert.ok(viewport.x>0)
 assert.ok(viewport.width<1)
})

test('camera acquisition requests rear 3:4 high-resolution video without assuming it is honored',()=>{
 const constraints=cameraVideoConstraints('environment',false)
 assert.deepEqual(constraints.facingMode,{ideal:'environment'})
 assert.deepEqual(constraints.aspectRatio,{ideal:.75})
 assert.deepEqual(constraints.width,{ideal:1440})
 assert.deepEqual(constraints.height,{ideal:1920})
 assert.deepEqual(constraints.frameRate,{ideal:30})
})
