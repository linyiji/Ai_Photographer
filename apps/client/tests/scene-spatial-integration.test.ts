import {strict as assert} from 'node:assert'
import {readFile} from 'node:fs/promises'
import {test} from 'node:test'
import type {SceneGeometryRequestV01,SpatialEvidenceV02} from '../src/sceneSpatial/contracts'
import {SceneSpatialCoordinator,type SceneSpatialSessionGateway} from '../src/sceneSpatial/coordinator'
import {prepareGeometryRequest} from '../src/sceneSpatial/geometryPreparation'
import {sha256Hex} from '../src/sceneSpatial/hash'
import {analyzeSceneScan,H5SceneScanAdapter,WeChatSceneScanAdapter} from '../src/sceneSpatial/portableAnalysis'
import {FakeSceneSpatialAdapter,ReplaySceneSpatialAdapter,type PreparedGeometryFrame,type SceneSpatialPort} from '../src/sceneSpatial/port'

const encoder=new TextEncoder()
const observations=[0,15,30,45].map((yaw,index)=>({frameId:`frame-${index}`,relativeYawDeg:yaw,width:640,height:480,technicalUsability:.9-index*.05,clutterScore:.2,sharpnessScore:.8,encodedBytes:encoder.encode(`frame-${index}`).buffer,timestampMs:index*250}))
const bundle=analyzeSceneScan('scan-01',observations)

async function prepared(){return prepareGeometryRequest({scanId:'scan-01',requestId:'request-01',platform:'fixture',precheck:bundle.precheck,cameraModel:{status:'KNOWN',focal_source:'FIXTURE',principal_point_assumption:'IMAGE_CENTER',distortion_assumption:'NONE',platform_device_profile:'TEST',confidence:1},frames:observations.slice(0,3).map(frame=>({frameId:frame.frameId,timestampMs:frame.timestampMs,relativeYawDeg:frame.relativeYawDeg,width:frame.width,height:frame.height,sourceWidth:frame.width,sourceHeight:frame.height,quality:frame.technicalUsability,bytes:frame.encodedBytes!,orientationSource:'CONTROLLED_FIXTURE'}))})}

test('portable SHA-256 matches the standard known vector',()=>{assert.equal(sha256Hex(encoder.encode('abc')),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')})

test('one Scene Scan produces immediate P1 views, image-plane anchors and routing-only precheck',()=>{
 assert.equal(bundle.sceneScan.scan_id,'scan-01')
 assert.equal(bundle.frameSet.source_scan_id,'scan-01')
 assert.equal(bundle.directionMap.source_scan_id,'scan-01')
 assert.equal(bundle.viewEvidence.view_candidates.length,3)
 assert.equal(bundle.viewEvidence.composition_anchors.length,9)
 assert.equal(bundle.precheck.authority,'ROUTING_HINT_ONLY')
 assert.ok(['UNRELIABLE','NO_SIGNAL','POSSIBLE'].includes(bundle.precheck.status))
 assert.deepEqual(bundle.sceneScan.privacy,{raw_video_uploaded:0,frame_stream_uploaded:0,provider_calls:0,luna_calls:0})
})

test('H5 and WeChat adapters share portable domain semantics',()=>{
 const h5=new H5SceneScanAdapter().prepare('same-scan',observations)
 const wechat=new WeChatSceneScanAdapter().prepare('same-scan',observations)
 assert.deepEqual({...h5.sceneScan,captured_at:'normalized'},{...wechat.sceneScan,captured_at:'normalized'})
 assert.deepEqual(h5.viewEvidence,wechat.viewEvidence)
})

test('geometry preparation preserves exact binary hashes, ordered frame-set hash and privacy boundary',async()=>{
 const first=await prepared(),second=await prepared()
 assert.equal(first.frames.length,3)
 assert.equal(first.request.frame_set_hash,second.request.frame_set_hash)
 assert.equal(first.request.privacy.raw_video_upload,0)
 assert.equal(first.request.privacy.frame_stream_upload,0)
 assert.equal(first.request.privacy.provider_upload,0)
 assert.equal(first.request.privacy.luna_upload,0)
 assert.equal(first.request.privacy.selected_geometry_frame_upload,'FIRST_PARTY_BACKEND_ONLY')
 assert.ok(first.request.selected_geometry_frames.every(frame=>Math.max(frame.working_width,frame.working_height)<=640))
})

test('client rejects geometry working frames above the accepted 640px target',async()=>{
 const input={scanId:'scan-01',requestId:'too-large',platform:'fixture' as const,precheck:bundle.precheck,cameraModel:{status:'KNOWN' as const,focal_source:'FIXTURE',principal_point_assumption:'CENTER',distortion_assumption:'NONE',platform_device_profile:'TEST',confidence:1},frames:observations.slice(0,3).map(frame=>({frameId:frame.frameId,timestampMs:frame.timestampMs,relativeYawDeg:frame.relativeYawDeg,width:641,height:480,sourceWidth:641,sourceHeight:480,quality:.9,bytes:frame.encodedBytes!,orientationSource:'CONTROLLED_FIXTURE' as const}))}
 await assert.rejects(()=>prepareGeometryRequest(input),/GEOMETRY_CLIENT_WORKING_EDGE_OUT_OF_BOUNDS/)
})

test('Main reaches VIEW_READY_GEOMETRY_PENDING before fake Geometry completes',async()=>{
 let committed=false
 const gateway:SceneSpatialSessionGateway={async commitScan(){committed=true}}
 const request=await prepared(),run=new SceneSpatialCoordinator(gateway,new FakeSceneSpatialAdapter()).start('session-01',bundle,request.request,request.frames)
 assert.equal(run.state,'VIEW_READY_GEOMETRY_PENDING')
 assert.equal(run.viewEvidence.source_scan_id,'scan-01')
 const completion=await run.completion
 assert.equal(committed,true)
 assert.equal(completion.event,'SPATIAL_EVIDENCE_AVAILABLE')
 assert.equal(completion.viewPathUsable,true)
})

test('replay provider is deterministic and missing fixture becomes successful INSUFFICIENT',async()=>{
 const request=await prepared(),replay=new ReplaySceneSpatialAdapter()
 const result=await replay.analyze('session-01',request.request)
 assert.equal(result.providerMode,'REPLAY')
 assert.equal(result.spatialEvidence.status,'INSUFFICIENT')
})

test('backend failure degrades to NOT_PRODUCED completion while P1 stays usable',async()=>{
 const gateway:SceneSpatialSessionGateway={async commitScan(){}}
 const failing:SceneSpatialPort={mode:'REAL',async analyze(){throw new Error('TRANSPORT_TIMEOUT')}}
 const request=await prepared(),run=new SceneSpatialCoordinator(gateway,failing).start('session-01',bundle,request.request,request.frames)
 const completion=await run.completion
 assert.equal(completion.event,'GEOMETRY_FAILED')
 assert.equal(completion.spatialEvidence,null)
 assert.equal(completion.viewPathUsable,true)
 assert.equal(completion.errorCode,'TRANSPORT_TIMEOUT')
})

test('superseded Geometry cannot replace the active scan result',async()=>{
 let release!:()=>void
 const pending=new Promise<void>(resolve=>{release=resolve})
 const gateway:SceneSpatialSessionGateway={async commitScan(){}}
 const provider:SceneSpatialPort={mode:'FAKE',async analyze(_sessionId:string,request:SceneGeometryRequestV01,_frames:readonly PreparedGeometryFrame[],signal:AbortSignal){await pending;if(signal.aborted)throw new Error('ABORTED');return {geometryRequestId:request.geometry_request_id,spatialEvidence:{} as SpatialEvidenceV02,cacheStatus:'CACHE_MISS',providerMode:'FAKE'}}}
 const request=await prepared(),coordinator=new SceneSpatialCoordinator(gateway,provider),run=coordinator.start('session-01',bundle,request.request,request.frames)
 run.supersede();release()
 assert.equal((await run.completion).event,'GEOMETRY_SUPERSEDED')
})

test('Main coordinator contains no Scene Spatial private algorithm imports',async()=>{
 const source=await readFile('src/sceneSpatial/coordinator.ts','utf8')
 for(const token of ['GFTT','PyrLK','ORB','RANSAC','Homography','recoverPose','triangulation','OpenCV','GeometrySolver'])assert.equal(source.includes(token),false)
})
