import type {ContextReliability,HomeContextV01} from '../api/client'

export const CONTEXT_RELIABILITY_ORDER:readonly ContextReliability[]=['OBSERVED','USER_INTENT','EXTERNAL_CONTEXT','DECORATIVE']

export function safeHomeContext():HomeContextV01{
 return {schema_version:'0.1.0',reliability:'EXTERNAL_CONTEXT',city_code:'440100',city_name:'广州',weather:'SUNNY',temperature_c:null,observed_at:null,landmark_asset_id:'guangzhou-tower-home-v1'}
}

export function reconcileContext(context:HomeContextV01){
 return {ordering:CONTEXT_RELIABILITY_ORDER,accepted:['city_code','city_name','weather'],discarded:context.landmark_asset_id?['landmark_asset_id:DECORATIVE_ONLY']:[],landmarkAuthority:'DECORATIVE_ONLY' as const}
}
