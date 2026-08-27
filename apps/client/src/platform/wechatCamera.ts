import Taro from '@tarojs/taro'
import {normalizedFailure,type PlatformResult} from './model'
import type {LocalCaptureCandidate} from './runtime'
import {WeChatCameraState,type WeChatFacingMode} from './wechatCameraState'

const permissionDenied=(value:unknown)=>String(value).toLowerCase().includes('auth deny')||String(value).toLowerCase().includes('permission')

export class WeChatCameraAdapter{
 private stateMachine=new WeChatCameraState()
 private context:any=null

 state(){return this.stateMachine.snapshot()}
 open(facingMode:WeChatFacingMode){this.stateMachine.open(facingMode);this.context=null}
 ready(){this.context=Taro.createCameraContext();this.stateMachine.ready()}
 fail(){this.context=null;this.stateMachine.fail()}
 close(){this.context=null;this.stateMachine.close()}
 switchFacing(){this.context=null;return this.stateMachine.switchFacing()}

 async capture():Promise<PlatformResult<LocalCaptureCandidate>>{
  if(!this.stateMachine.capture())return normalizedFailure('CAMERA_FAILURE','UNVERIFIED_REAL_DEVICE','WECHAT_CAMERA_NOT_READY')
  try{
   const context=this.context||Taro.createCameraContext()
   const result=await context.takePhoto({quality:'high'}) as {tempImagePath?:string}
   const filePath=result.tempImagePath
   if(!filePath)throw new Error('WECHAT_CAPTURE_EMPTY_PATH')
   let orientation:LocalCaptureCandidate['orientation']='UNKNOWN'
   try{const info=await Taro.getImageInfo({src:filePath});orientation=info.height>=info.width?'PORTRAIT':'LANDSCAPE'}catch{}
   this.stateMachine.captured()
   return {ok:true,code:'OK',supportLevel:'UNVERIFIED_REAL_DEVICE',value:{id:`wechat-capture-${Date.now()}`,source:'camera',previewUrl:filePath,filePath,filename:`wechat-capture-${Date.now()}.jpg`,orientation,confirmed:false}}
  }catch(error){
   this.stateMachine.fail()
   return normalizedFailure(permissionDenied(error)?'CAMERA_PERMISSION_DENIED':'CAPTURE_FAILED','UNVERIFIED_REAL_DEVICE',error instanceof Error?error.message:String(error))
  }
 }
}

export const weChatCamera=new WeChatCameraAdapter()
