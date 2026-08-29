import Taro from '@tarojs/taro'
export type Session={session_id:string;workflow_stage:string;revision:number;state:Record<string,any>;candidates?:Array<any>;assets?:Array<any>;events?:Array<any>}
export type LabScenario={scenario_id:string;title:string;purpose:string;fault_plan:Array<Record<string,any>>}
export type ReplayResult={replay_id:string;scenario_id:string;mode:string;platform_profile?:string;platform?:string;platform_adapters?:Array<{capability_name:string;adapter_id:string;support_level:string;reason:string}>;status:string;duration_ms:number;final_stage:string;final_revision:number;evaluation_status:string;warning_count:number;trace:Array<any>;diff:Array<any>;evaluation:{status:string;dimensions:Record<string,string>;findings:Array<any>};checkpoint?:Record<string,any>;database_bytes:number}
export type UploadedAsset={asset_id:string;asset_kind:string;mime_type:string;size_bytes:number;sha256:string;created_at:string;source:string;storage_ref:string;original_name:string}
export type SessionSummary={session_id:string;created_at:string;updated_at:string;workflow_stage:string;status:'ACTIVE'|'COMPLETED';thumbnail_asset_id?:string;final_asset_id?:string}
export type RuntimeReadiness={schema_version:string;mode:'DEVELOPMENT'|'INTERNAL_DEMO'|'PRODUCTION';ready:boolean;public_production_ready:boolean;disclosure:string;fake_ai_present:boolean;blocking_capabilities:string[];capabilities:Record<string,{implementation:'REAL'|'FAKE_INTERNAL_ONLY'|'EXPERIMENTAL'|'UNAVAILABLE';status:string;note:string}>}
export type FineTuneSource={schema_version:'1.0.0';asset_id:string;asset_kind:'REALITY_PLUS';version:number;status:'ACCEPTED';storage_ref:string;created_at:string;producer:string;source_asset_ids:string[];checksum:{algorithm:'SHA256';value:string};mime_type:string;size_bytes:number;content_asset_id:string}
export type PersistedRecipe<T=unknown>={recipe:T;version:number;recipe_hash:string;persistence:string}
export type ContextReliability='OBSERVED'|'USER_INTENT'|'EXTERNAL_CONTEXT'|'DECORATIVE'
export type HomeContextV01={schema_version:'0.1.0';reliability:ContextReliability;city_code:string;city_name:string;weather:'SUNNY'|'CLOUDY'|'RAIN'|'SNOW'|'UNKNOWN';temperature_c?:number|null;observed_at?:string|null;landmark_asset_id?:string|null}
export type IntentSeed={method_id:string;title:string;tag?:string|null}
export type PhotographySessionCreateInputV01={schema_version:'0.1.0';entry_source:'LIVE'|'REFERENCE'|'RECOMMENDED_METHOD';home_context?:HomeContextV01;reference_asset_id?:string|null;intent_seed?:IntentSeed|null}
// Defaults to the locked local runtime; mobile acceptance injects an ephemeral HTTPS API tunnel at build time.
export const API_BASE=__XFX_API_BASE__
async function request<T>(path:string,method:'GET'|'POST'='GET',data?:unknown,headers:Record<string,string>={}):Promise<T>{
 const response=await Taro.request<T>({url:`${API_BASE}${path}`,method,data,header:{'Content-Type':'application/json',...headers}}).catch(error=>{const candidate=error as {errMsg?:string};const detail=candidate?.errMsg||String(error);throw new Error(`NETWORK_UNAVAILABLE · ${detail}`)})
 if(response.statusCode>=400){const body=response.data as any;throw new Error(`${body?.error?.error_code||body?.error?.code||'API_ERROR'} · ${body?.error?.correlation_id||'no-correlation'}`)}
 return response.data
}
export const api={
 create:(input?:PhotographySessionCreateInputV01)=>request<Session>('/sessions','POST',input),
 list:(classification?:'ACTIVE'|'COMPLETED')=>request<SessionSummary[]>(`/sessions${classification?`?classification=${classification}`:''}`),
 get:(id:string)=>request<Session>(`/sessions/${id}`),
 action:async(id:string,action:string,payload:Record<string,any>={},idempotencyKey?:string)=>{const key=idempotencyKey||`ui-${action}-${Date.now()}-${Math.random().toString(16).slice(2)}`;const result=await request<{readback:Session}>(`/sessions/${id}/actions`,'POST',{action,payload},{'Idempotency-Key':key});return result.readback},
 readiness:(mode?:'DEVELOPMENT'|'INTERNAL_DEMO'|'PRODUCTION')=>request<RuntimeReadiness>(`/runtime/readiness${mode?`?mode=${mode}`:''}`),
 labScenarios:()=>request<Array<LabScenario>>('/__lab__/scenarios'),
 labPlatformProfiles:()=>request<Array<{profile:string;overrides:Record<string,any>}>>('/__lab__/platform-profiles'),
 runReplay:(scenario_id:string,mode:string,checkpoint_position?:number,platform_profile='H5_FULL')=>request<ReplayResult>('/__lab__/replays','POST',{scenario_id,mode,checkpoint_position,platform_profile}),
 platformAdapters:(platform:'H5'|'WECHAT')=>request<{platform:string;profile:string;adapters:Array<any>}>(`/platform/adapters?platform=${platform}`),
 capabilitySelection:(platform:'H5'|'WECHAT')=>request<{platform:string;selection:Array<any>}>(`/platform/capability-selection?platform=${platform}`),
 assetContentUrl:(assetId:string)=>`${API_BASE}/assets/${assetId}/content`,
 finalDownloadUrl:(sessionId:string)=>`${API_BASE}/sessions/${sessionId}/final/content`
 ,fineTuneSource:(sessionId:string)=>request<FineTuneSource>(`/sessions/${sessionId}/fine-tune/source`)
 ,fineTuneSourceContentUrl:(sessionId:string)=>`${API_BASE}/sessions/${sessionId}/fine-tune/source/content`
 ,fineTuneRecipe:<T=unknown>(sessionId:string)=>request<PersistedRecipe<T>|null>(`/sessions/${sessionId}/fine-tune/recipe`)
 ,saveFineTuneRecipe:<T=unknown>(sessionId:string,recipe:T,key:string)=>request<PersistedRecipe<T>>(`/sessions/${sessionId}/fine-tune/recipes`,'POST',{recipe},{'Idempotency-Key':key})
}
