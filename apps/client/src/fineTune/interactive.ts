import {MAX_LOCAL_REGIONS,clampRegion,cloneRecipe,type AdjustmentRecipe,type LocalRegion} from './core'

export const V1_ADJUSTMENT_LIMIT=.3

export const clampV1=(value:number)=>Math.max(-V1_ADJUSTMENT_LIMIT,Math.min(V1_ADJUSTMENT_LIMIT,Number.isFinite(value)?value:0))
export const uiRawToRecipe=(raw:number)=>clampV1(raw/100)
export const pointerRatioToUiRaw=(ratio:number)=>Math.round((Math.max(0,Math.min(1,ratio))*2-1)*V1_ADJUSTMENT_LIMIT*100)
export const recipeValueToUi=(value:number)=>({value:clampV1(value),outOfRange:Math.abs(value)>V1_ADJUSTMENT_LIMIT+.0001})

export type LatestOnlyStats={inputCount:number;renderStartedCount:number;renderCompletedCount:number;supersededBeforeComputeCount:number;supersededAfterComputeCount:number}

export class LatestOnlyQueue<T>{
 private pending:T|null=null
 private latestSequence=0
 readonly stats:LatestOnlyStats={inputCount:0,renderStartedCount:0,renderCompletedCount:0,supersededBeforeComputeCount:0,supersededAfterComputeCount:0}
 enqueue(value:T,sequence:number){this.stats.inputCount++;if(this.pending)this.stats.supersededBeforeComputeCount++;this.pending=value;this.latestSequence=sequence}
 take(){if(!this.pending)return null;const value=this.pending;this.pending=null;this.stats.renderStartedCount++;return value}
 complete(sequence:number){this.stats.renderCompletedCount++;if(sequence!==this.latestSequence)this.stats.supersededAfterComputeCount++}
 hasPending(){return this.pending!==null}
 snapshot(){return {...this.stats}}
}

export function regionsFromRecipe(recipe:AdjustmentRecipe):LocalRegion[]{
 const regions=new Map<string,LocalRegion>()
 for(const adjustment of recipe.adjustments)if(adjustment.scope==='LOCAL_REGION'&&adjustment.region&&!regions.has(adjustment.region.id))regions.set(adjustment.region.id,clampRegion(adjustment.region))
 return [...regions.values()].slice(0,MAX_LOCAL_REGIONS)
}

export function updateRegionGeometry(recipe:AdjustmentRecipe,region:LocalRegion):AdjustmentRecipe{
 const bounded=clampRegion(region),next=cloneRecipe(recipe)
 next.adjustments=next.adjustments.map(item=>item.scope==='LOCAL_REGION'&&item.region?.id===bounded.id?{...item,region:bounded}:item)
 return next
}

export function deleteRegion(recipe:AdjustmentRecipe,regionId:string):AdjustmentRecipe{
 const next=cloneRecipe(recipe)
 next.adjustments=next.adjustments.filter(item=>!(item.scope==='LOCAL_REGION'&&item.region?.id===regionId))
 return next
}
