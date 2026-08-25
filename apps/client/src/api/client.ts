import Taro from '@tarojs/taro'
export type Session={session_id:string;workflow_stage:string;revision:number;state:Record<string,any>;candidates?:Array<any>;assets?:Array<any>;events?:Array<any>}
export type LabScenario={scenario_id:string;title:string;purpose:string;fault_plan:Array<Record<string,any>>}
export type ReplayResult={replay_id:string;scenario_id:string;mode:string;platform_profile?:string;platform?:string;platform_adapters?:Array<{capability_name:string;adapter_id:string;support_level:string;reason:string}>;status:string;duration_ms:number;final_stage:string;final_revision:number;evaluation_status:string;warning_count:number;trace:Array<any>;diff:Array<any>;evaluation:{status:string;dimensions:Record<string,string>;findings:Array<any>};checkpoint?:Record<string,any>;database_bytes:number}
export type UploadedAsset={asset_id:string;asset_kind:string;mime_type:string;size_bytes:number;sha256:string;created_at:string;source:string;storage_ref:string;original_name:string}
export type SessionSummary={session_id:string;created_at:string;updated_at:string;workflow_stage:string;status:'ACTIVE'|'COMPLETED';thumbnail_asset_id?:string;final_asset_id?:string}
export type RuntimeReadiness={schema_version:string;mode:'DEVELOPMENT'|'INTERNAL_DEMO'|'PRODUCTION';ready:boolean;public_production_ready:boolean;disclosure:string;fake_ai_present:boolean;blocking_capabilities:string[];capabilities:Record<string,{implementation:'REAL'|'FAKE_INTERNAL_ONLY'|'EXPERIMENTAL'|'UNAVAILABLE';status:string;note:string}>}
// M02 local runtime endpoint; platform-specific configuration can replace this at L2.
export const API_BASE='http://127.0.0.1:8000'
async function request<T>(path:string,method:'GET'|'POST'='GET',data?:unknown,headers:Record<string,string>={}):Promise<T>{
 const response=await Taro.request<T>({url:`${API_BASE}${path}`,method,data,header:{'Content-Type':'application/json',...headers}})
 if(response.statusCode>=400){const body=response.data as any;throw new Error(`${body?.error?.error_code||body?.error?.code||'API_ERROR'} · ${body?.error?.correlation_id||'no-correlation'}`)}
 return response.data
}
export const api={
 create:()=>request<Session>('/sessions','POST'),
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
}
