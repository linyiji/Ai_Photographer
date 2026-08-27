export type WeChatFacingMode='environment'|'user'
export type WeChatCameraLifecycle='CLOSED'|'OPENING'|'READY'|'CAPTURING'|'ERROR'

export class WeChatCameraState{
 private lifecycle:WeChatCameraLifecycle='CLOSED'
 private facingMode:WeChatFacingMode='environment'
 snapshot(){return {lifecycle:this.lifecycle,facingMode:this.facingMode}}
 open(facingMode:WeChatFacingMode){this.facingMode=facingMode;this.lifecycle='OPENING'}
 ready(){this.lifecycle='READY'}
 capture(){if(this.lifecycle!=='READY')return false;this.lifecycle='CAPTURING';return true}
 captured(){this.lifecycle='READY'}
 fail(){this.lifecycle='ERROR'}
 close(){this.lifecycle='CLOSED'}
 switchFacing(){this.facingMode=this.facingMode==='environment'?'user':'environment';this.lifecycle='OPENING';return this.facingMode}
}
