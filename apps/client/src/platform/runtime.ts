import Taro from '@tarojs/taro'
import {API_BASE,UploadedAsset} from '../api/client'
import {AdapterDescriptor,CapabilityName,CapabilitySelection,PlatformResult,RuntimePlatform,selectionFrom,normalizedFailure} from './model'

const ALL:CapabilityName[]=['CameraAdapter','FrameAdapter','AlbumAdapter','ShareAdapter','HapticAdapter','VoiceOutputAdapter','AuthAdapter','PaymentAdapter','DeviceMotionAdapter','StorageAdapter','NetworkAdapter']

function descriptor(capabilityName:CapabilityName,platform:RuntimePlatform):AdapterDescriptor{
 const h5:Partial<Record<CapabilityName,[string,AdapterDescriptor['supportLevel'],string]>>={
  NetworkAdapter:['h5-network-v1','SUPPORTED','Browser online state and authorized transport'],
  HapticAdapter:['h5-haptic-v1','PARTIAL','Vibration API when available'],
  ShareAdapter:['h5-share-v1','PARTIAL','Web Share API when available'],
  AlbumAdapter:['h5-download-v1','PARTIAL','Download only; not a system album save'],
  CameraAdapter:['h5-still-camera-v1','UNVERIFIED_REAL_DEVICE','Single-shot chooser/camera implementation'],
  StorageAdapter:['development-local-storage-v1','SUPPORTED','Authorized multipart API'],
  VoiceOutputAdapter:['h5-voice-output-v1','PARTIAL','Optional speech synthesis only'],
  DeviceMotionAdapter:['h5-device-motion-shell-v1','PARTIAL','Permission and support vary']
 }
 const wechatNames=new Set<CapabilityName>(['NetworkAdapter','HapticAdapter','ShareAdapter','AlbumAdapter','CameraAdapter','StorageAdapter'])
 const spec=platform==='WECHAT'&&wechatNames.has(capabilityName)
  ? [`wechat-${capabilityName.replace('Adapter','').toLowerCase()}-v1`,'UNVERIFIED_REAL_DEVICE' as const,'Compile-safe Taro facade; real-device acceptance required'] as [string,AdapterDescriptor['supportLevel'],string]
  : h5[capabilityName]
 const [adapterId,supportLevel,reason]=spec||[`unavailable-${capabilityName.replace('Adapter','').toLowerCase()}`,'UNSUPPORTED' as const,'Not configured in M04']
 return {capabilityName,adapterId,adapterVersion:'1.0.0',platform,available:supportLevel!=='UNSUPPORTED',supportLevel,reason,provenance:{implementationSource:'MAIN_M04',runtimeSupport:supportLevel}}
}

export function detectPlatform():RuntimePlatform{return Taro.getEnv()===Taro.ENV_TYPE.WEAPP?'WECHAT':'H5'}

export class PlatformAdapterRegistry{
 readonly platform:RuntimePlatform
 readonly descriptors:AdapterDescriptor[]
 constructor(platform:RuntimePlatform=detectPlatform()){this.platform=platform;this.descriptors=ALL.map(name=>descriptor(name,platform))}
 availability(name:CapabilityName){return this.descriptors.find(item=>item.capabilityName===name)!}
 selections():CapabilitySelection[]{return [...this.descriptors.map(selectionFrom),{capabilityName:'LiveGuidanceCapability',selectedAdapter:'fake-live-guidance-m02',implementationType:'FAKE',supportLevel:'SUPPORTED',sourceTrack:'MAIN_M02',acceptanceLevel:'DETERMINISTIC_REGRESSION',platform:this.platform,version:'1.0.0'}]}

 async networkStatus():Promise<PlatformResult<{online:boolean}>>{
  try{const result=await Taro.getNetworkType();const online=result.networkType!=='none';return online?{ok:true,code:'OK',supportLevel:'SUPPORTED',value:{online}}:normalizedFailure('NETWORK_UNAVAILABLE','SUPPORTED','Device reports offline')}
  catch{return normalizedFailure('NETWORK_UNAVAILABLE','PARTIAL','Network status unavailable')}
 }

 async haptic(cue:'SUCCESS'|'WARNING'|'CAPTURE'|'READY'):Promise<PlatformResult>{
  try{await Taro.vibrateShort({type:cue==='WARNING'?'heavy':cue==='CAPTURE'?'medium':'light'});return {ok:true,code:'OK',supportLevel:this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL'}}
  catch{return normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED','Haptic API unavailable')}
 }

 async captureAndUpload():Promise<PlatformResult<UploadedAsset>>{
  try{
   const chosen=await Taro.chooseImage({count:1,sizeType:['original'],sourceType:['camera','album']})
   const filePath=chosen.tempFilePaths[0]
   if(!filePath)return normalizedFailure('USER_CANCELLED','UNVERIFIED_REAL_DEVICE','No image selected')
   const response=await Taro.uploadFile({url:`${API_BASE}/assets/uploads`,filePath,name:'file'})
   if(response.statusCode!==201){return normalizedFailure(response.statusCode===422?'INVALID_ASSET':'STORAGE_FAILURE','SUPPORTED',response.data)}
   return {ok:true,code:'OK',supportLevel:this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'SUPPORTED',value:JSON.parse(response.data) as UploadedAsset}
  }catch(error){const message=error instanceof Error?error.message:String(error);return normalizedFailure(message.toLowerCase().includes('cancel')?'USER_CANCELLED':'CAMERA_FAILURE',this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'PARTIAL',message)}
 }

 async download(url:string,filename='xiangfengxing-final.jpg'):Promise<PlatformResult>{
  if(this.platform==='WECHAT'){
   try{await Taro.downloadFile({url});return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE'}}catch{return normalizedFailure('STORAGE_FAILURE','UNVERIFIED_REAL_DEVICE','WeChat download requires device acceptance')}
  }
  try{const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.rel='noopener';document.body.appendChild(anchor);anchor.click();anchor.remove();return {ok:true,code:'OK',supportLevel:'SUPPORTED'}}catch{return normalizedFailure('STORAGE_FAILURE','PARTIAL','Browser download failed')}
 }

 async share(url:string):Promise<PlatformResult>{
  if(this.platform==='H5'&&typeof navigator!=='undefined'&&typeof navigator.share==='function'){
   try{await navigator.share({title:'向风行 · My Final Photo',url});return {ok:true,code:'OK',supportLevel:'PARTIAL'}}catch(error){return normalizedFailure(error instanceof DOMException&&error.name==='AbortError'?'USER_CANCELLED':'SHARE_FAILURE','PARTIAL',String(error))}
  }
  return normalizedFailure('PLATFORM_UNSUPPORTED',this.platform==='WECHAT'?'UNVERIFIED_REAL_DEVICE':'UNSUPPORTED','Share capability is unavailable in this runtime')
 }
}

export const platformRegistry=new PlatformAdapterRegistry()
