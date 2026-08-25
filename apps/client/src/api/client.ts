import Taro from '@tarojs/taro'
export type Session={session_id:string;workflow_stage:string;revision:number;state:Record<string,any>;candidates?:Array<any>;assets?:Array<any>;events?:Array<any>}
// M02 local runtime endpoint; platform-specific configuration can replace this at L2.
const API_BASE='http://127.0.0.1:8000'
async function request<T>(path:string,method:'GET'|'POST'='GET',data?:unknown,headers:Record<string,string>={}):Promise<T>{
 const response=await Taro.request<T>({url:`${API_BASE}${path}`,method,data,header:{'Content-Type':'application/json',...headers}})
 if(response.statusCode>=400){const body=response.data as any;throw new Error(`${body?.error?.code||'API_ERROR'} · ${body?.error?.correlation_id||'no-correlation'}`)}
 return response.data
}
export const api={
 create:()=>request<Session>('/sessions','POST'),
 get:(id:string)=>request<Session>(`/sessions/${id}`),
 action:async(id:string,action:string,payload:Record<string,any>={})=>{const key=`ui-${action}-${Date.now()}-${Math.random().toString(16).slice(2)}`;const result=await request<{readback:Session}>(`/sessions/${id}/actions`,'POST',{action,payload},{'Idempotency-Key':key});return result.readback}
}
