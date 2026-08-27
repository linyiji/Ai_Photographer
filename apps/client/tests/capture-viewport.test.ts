import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {CameraGeometryTracker,H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02,cameraConstraintRequest,cameraStreamConstraints,cameraVideoConstraints,captureFrameStyle,captureViewportForVideo,hashCameraIdentity,normalizeCameraGeometry,normalizeCameraSettings,productCameraVideoConstraints} from '../src/platform/captureViewport'

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

test('camera stream profiles serialize current, live-like and relaxed requests without conflating final aspect',()=>{
 assert.deepEqual(cameraConstraintRequest('MAIN_CURRENT','environment',false),{profile:'MAIN_CURRENT',facingMode:'environment',strictFacing:false,pinnedDevice:false,width:1440,height:1920,aspectRatio:.75,frameRate:30})
 assert.deepEqual(cameraStreamConstraints('LIVE_LIKE','environment',false),{facingMode:{ideal:'environment'},frameRate:{ideal:30},width:{ideal:1280},height:{ideal:720}})
 assert.deepEqual(cameraStreamConstraints('RELAXED','environment',false),{facingMode:{ideal:'environment'},frameRate:{ideal:30}})
 assert.deepEqual(cameraStreamConstraints('LIVE_LIKE','environment',true,'private-device'),{facingMode:{exact:'environment'},frameRate:{ideal:30},width:{ideal:1280},height:{ideal:720},deviceId:{exact:'private-device'}})
})

test('accepted H5 preview policy decouples stream selection from the 3:4 final composition contract',()=>{
 assert.deepEqual(H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02,{strategy:'DECOUPLED_PREVIEW_STREAM',previewProfile:'LIVE_LIKE',finalCompositionAspect:.75,streamAspectCoupledToComposition:false})
 const constraints=productCameraVideoConstraints('environment',false)
 assert.deepEqual(constraints,{facingMode:{ideal:'environment'},frameRate:{ideal:30},width:{ideal:1280},height:{ideal:720}})
 assert.equal('aspectRatio' in constraints,false)
})

test('actual settings normalization records unsupported values honestly and hashes camera identity',()=>{
 const normalized=normalizeCameraSettings({width:1920,height:1440,frameRate:30,facingMode:'environment',deviceId:'rear-camera',groupId:'rear-group',resizeMode:'none'} as MediaTrackSettings)
 assert.equal(normalized.aspectRatio,4/3);assert.equal(normalized.zoom,null);assert.equal(normalized.resizeMode,'none')
 assert.equal(normalized.deviceIdHash,hashCameraIdentity('rear-camera'));assert.notEqual(normalized.deviceIdHash,'rear-camera')
 assert.deepEqual(normalizeCameraSettings({} as MediaTrackSettings),{width:null,height:null,aspectRatio:null,frameRate:null,facingMode:null,resizeMode:null,zoom:null,deviceIdHash:null,groupIdHash:null})
})

test('A landscape raw intrinsic is logically normalized for portrait presentation',()=>{const g=normalizeCameraGeometry({width:1920,height:1440,deviceOrientation:'PORTRAIT',presentationOrientation:'PORTRAIT'});assert.deepEqual(g.normalized,{width:1440,height:1920,aspectRatio:.75,rotation:'LOGICAL_90'});assert.equal(g.previewViewport.width,1)})
test('B portrait intrinsic is not double rotated',()=>{assert.equal(normalizeCameraGeometry({width:1440,height:1920,deviceOrientation:'PORTRAIT'}).normalized.rotation,'NONE')})
test('C landscape presentation preserves landscape coordinates',()=>{const g=normalizeCameraGeometry({width:1920,height:1440,deviceOrientation:'LANDSCAPE'});assert.equal(g.normalized.rotation,'NONE');assert.equal(g.normalized.aspectRatio,4/3)})
test('D identity is authoritative only with validated evidence',()=>{assert.equal(normalizeCameraGeometry({width:1440,height:1920,deviceOrientation:'PORTRAIT',stillWidth:3072,stillHeight:4096,relation:'VALIDATED_IDENTICAL'}).mappingMode,'IDENTITY_VALIDATED')})
test('E a known FOV difference requires projection',()=>{assert.equal(normalizeCameraGeometry({width:1440,height:1920,deviceOrientation:'PORTRAIT',stillWidth:3072,stillHeight:4096,relation:'KNOWN_DIFFERENT'}).mappingMode,'PROJECTION_REQUIRED')})
test('F unknown orientation makes no authoritative geometry claim',()=>{assert.equal(normalizeCameraGeometry({width:1920,height:1440}).mappingMode,'SAFE_FALLBACK')})
test('G switching recalculates geometry',()=>{const t=new CameraGeometryTracker();const rear=t.recalculate({width:1920,height:1440,deviceOrientation:'PORTRAIT'});const front=t.recalculate({width:1280,height:720,deviceOrientation:'PORTRAIT'});assert.equal(front.generation,rear.generation+1);assert.notDeepEqual(front.geometry.raw,rear.geometry.raw)})
test('H reopen cannot reuse invalidated geometry',()=>{const t=new CameraGeometryTracker();t.recalculate({width:1920,height:1440,deviceOrientation:'PORTRAIT'});t.invalidate();assert.equal(t.snapshot().geometry,null);assert.equal(t.recalculate({width:1440,height:1920,deviceOrientation:'PORTRAIT'}).generation,2)})
