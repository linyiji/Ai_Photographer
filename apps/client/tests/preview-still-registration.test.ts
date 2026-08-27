import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {classifyRegistrationStability,registerPointPairs,type Matrix3,type Point2,type PointPair,type PreviewStillRegistrationV01} from '../src/platform/previewStillRegistration'

const apply=(m:Matrix3,p:Point2)=>{const d=m[6]*p.x+m[7]*p.y+m[8];return {x:(m[0]*p.x+m[1]*p.y+m[2])/d,y:(m[3]*p.x+m[4]*p.y+m[5])/d}}
const fixture=(matrix:Matrix3,count=30):PointPair[]=>Array.from({length:count},(_,index)=>{const x=.08+(index%6)*.16,y=.08+Math.floor(index/6)*.18,preview={x,y};return {preview,still:apply(matrix,preview)}})
const approximate=(actual:number,expected:number,tolerance=.03)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`)

test('registration fixture identity',()=>assert.equal(registerPointPairs(fixture([1,0,0,0,1,0,0,0,1])).result,'IDENTITY'))
test('registration fixture center crop scale translation',()=>{const value=registerPointPairs(fixture([.78,0,.11,0,.78,.11,0,0,1]));assert.ok(['STATIC_SCALE_TRANSLATION','STATIC_CROP'].includes(value.result));approximate(value.matrix[0],.78)})
test('registration fixture off-center crop',()=>{const value=registerPointPairs(fixture([.72,0,.18,0,.72,.06,0,0,1]));assert.equal(value.result,'STATIC_SCALE_TRANSLATION');approximate(value.matrix[2],.18)})
test('registration fixture scale translation',()=>{const value=registerPointPairs(fixture([.86,0,.05,0,.86,-.03,0,0,1]));assert.equal(value.result,'STATIC_SCALE_TRANSLATION')})
test('registration fixture small rotation selects affine',()=>{const a=3*Math.PI/180,s=.9,value=registerPointPairs(fixture([s*Math.cos(a),-s*Math.sin(a),.08,s*Math.sin(a),s*Math.cos(a),.02,0,0,1]));assert.equal(value.result,'AFFINE')})
test('registration fixture affine',()=>{const value=registerPointPairs(fixture([.88,.06,.03,-.02,.93,.04,0,0,1]));assert.equal(value.result,'AFFINE')})
test('registration fixture perspective selects homography',()=>{const value=registerPointPairs(fixture([.9,.02,.03,.01,.88,.05,.09,-.06,1]));assert.equal(value.result,'HOMOGRAPHY')})
test('registration fixture low texture fails closed',()=>assert.equal(registerPointPairs([]).result,'UNSUPPORTED'))
test('registration fixture repetitive texture ambiguity fails closed',()=>assert.equal(registerPointPairs(fixture([1,0,0,0,1,0,0,0,1],12),{ambiguous:true}).result,'LOW_CONFIDENCE'))
test('registration fixture insufficient matches fails closed',()=>assert.equal(registerPointPairs(fixture([1,0,0,0,1,0,0,0,1],3)).result,'UNSUPPORTED'))

const registration=(overrides:Partial<PreviewStillRegistrationV01>={}):PreviewStillRegistrationV01=>({preview_reference_id:'p',native_capture_source_id:'s',preview_dimensions:{width:720,height:960},still_dimensions:{width:3072,height:4096},preview_orientation:'PORTRAIT',still_orientation:'PORTRAIT',same_camera_device:true,camera_device_identity:'hash',stream_profile:'LIVE_LIKE',method:'FEATURE_RANSAC_V01',transform_model:'SCALE_TRANSLATION',matrix:[.8,0,.1,0,.8,.1,0,0,1],crop_rect_in_still:{x:.1,y:.1,width:.8,height:.8,aspectRatio:.75},scale_x:.8,scale_y:.8,translation_x:.1,translation_y:.1,rotation_deg:0,mirror_x:false,mirror_y:false,match_count:30,inlier_count:28,inlier_ratio:.93,reprojection_error:.01,overlap_ratio:.64,confidence:.9,stability_class:'UNSUPPORTED',result:'STATIC_SCALE_TRANSLATION',analysis_dimensions:{preview:{width:360,height:480},still:{width:360,height:480}},retained_pixel_percent:64,elapsed_ms:100,...overrides})
test('five consistent registrations classify static stable',()=>assert.equal(classifyRegistrationStability(Array.from({length:5},(_,index)=>registration({translation_x:.1+index*.001}))).classification,'STATIC_STABLE'))
test('five high-confidence varying registrations classify per-capture stable',()=>assert.equal(classifyRegistrationStability(Array.from({length:5},(_,index)=>registration({translation_x:.05+index*.07,crop_rect_in_still:{x:.05+index*.07,y:.1,width:.7,height:.8,aspectRatio:.65625}}))).classification,'PER_CAPTURE_STABLE'))
test('registration stability rejects unsupported samples',()=>assert.equal(classifyRegistrationStability(Array.from({length:5},(_,index)=>registration(index<2?{}:{result:'LOW_CONFIDENCE',confidence:.4}))).classification,'UNSUPPORTED'))
