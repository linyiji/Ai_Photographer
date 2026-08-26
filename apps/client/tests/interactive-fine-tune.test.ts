import {test} from 'node:test'
import {strict as assert} from 'node:assert'
import {createRecipe,defaultRegion,setAdjustment} from '../src/fineTune/core'
import {LatestOnlyQueue,clampV1,deleteRegion,pointerRatioToUiRaw,recipeValueToUi,regionsFromRecipe,uiRawToRecipe,updateRegionGeometry} from '../src/fineTune/interactive'

test('V1 slider maps left center right to -0.30 0 +0.30',()=>{
 assert.equal(pointerRatioToUiRaw(0),-30)
 assert.equal(pointerRatioToUiRaw(.5),0)
 assert.equal(pointerRatioToUiRaw(1),30)
 assert.equal(uiRawToRecipe(-30),-.3)
 assert.equal(uiRawToRecipe(0),0)
 assert.equal(uiRawToRecipe(30),.3)
 assert.equal(clampV1(.95),.3)
 assert.equal(clampV1(-1),-.3)
})

test('historical out-of-range recipe is reported without mutating its stored value',()=>{
 const original=.95,ui=recipeValueToUi(original)
 assert.deepEqual(ui,{value:.3,outOfRange:true})
 assert.equal(original,.95)
})

test('latest-only queue coalesces superseded input before compute',()=>{
 const queue=new LatestOnlyQueue<{value:number}>()
 for(let i=1;i<=10;i++)queue.enqueue({value:i},i)
 assert.deepEqual(queue.take(),{value:10})
 queue.enqueue({value:11},11);queue.enqueue({value:12},12);queue.complete(10)
 assert.deepEqual(queue.take(),{value:12});queue.complete(12)
 assert.deepEqual(queue.snapshot(),{inputCount:12,renderStartedCount:2,renderCompletedCount:2,supersededBeforeComputeCount:10,supersededAfterComputeCount:1})
})

test('local regions create reload move and delete through recipe geometry',()=>{
 const region1=defaultRegion(0),region2=defaultRegion(1)
 let recipe=createRecipe('session','asset')
 recipe=setAdjustment(recipe,'LOCAL_REGION','BRIGHTNESS',.3,region1)
 recipe=setAdjustment(recipe,'LOCAL_REGION','WARMTH',-.3,region2)
 assert.deepEqual(regionsFromRecipe(recipe).map(item=>item.id),['local-1','local-2'])
 const moved={...region1,x:.1,y:.12,width:.5,height:.4}
 recipe=updateRegionGeometry(recipe,moved)
 assert.equal(recipe.adjustments.find(item=>item.region?.id==='local-1')?.region?.x,.1)
 recipe=deleteRegion(recipe,'local-2')
 assert.deepEqual(regionsFromRecipe(recipe).map(item=>item.id),['local-1'])
})
