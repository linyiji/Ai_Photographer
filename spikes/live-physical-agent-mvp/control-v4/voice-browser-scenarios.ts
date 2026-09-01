import type { V4Presentation } from './presentation.js';
import { VoiceCueEngineV01 } from './voice-engine.js';
import { FakeVoiceOutputAdapterV01 } from './voice-fake-adapter.js';
import type { VoicePresentationCueV01, VoiceSemanticIdV01 } from './voice-types.js';

const cue=(semantic:VoiceSemanticIdV01,phrase:string,commandId:string,priority:1|2|3|4):Readonly<VoicePresentationCueV01>=>Object.freeze({enabled:true,cue_id:`browser:${semantic}:${commandId}`,semantic_id:semantic,phrase_key:semantic,phrase_text:phrase,priority,interrupt_policy:priority===1?'INTERRUPT_LOWER':'REPLACE_STALE',repeat_policy:'ONCE_PER_COMMAND_EVENT',control_epoch_id:commandId,command_id:commandId,target_id:'HEAD_SHOULDERS_CENTER',expires_at:5000});
const model=(voice:Readonly<VoicePresentationCueV01>|null,state:V4Presentation['state'],ready=false):Readonly<V4Presentation>=>Object.freeze({presentation_version:'LivePresentationModelV04',state,primary_copy_zh:voice?.phrase_text??'silent',secondary_copy_zh:'progress',overlay_copy_zh:voice?.phrase_text??'silent',voice_copy_zh:voice?.phrase_text??null,voice,action:null,command_id:voice?.command_id??null,display_axis_sign:0,current_framing_ready:ready,trial_success_latched:ready});

export interface VoiceBrowserSmokeResultV01 {pass:boolean;cue_sequence:readonly VoiceSemanticIdV01[];ordinary_count:number;settle_count:number;ready_count:number;cancel_count:number;voice_off_suppressed:boolean;provider_calls:0}
export function runVoiceBrowserSmokeV01():Readonly<VoiceBrowserSmokeResultV01>{
  let now=1000;const adapter=new FakeVoiceOutputAdapterV01(true,()=>now),engine=new VoiceCueEngineV01(adapter,{cooldown_ms:0});engine.prepareFromUserGesture();
  const context=(overrides:Partial<{session_revision:number;armed:boolean;target_id:string;current_framing_ready:boolean;trial_success_latched:boolean}>={})=>({now,session_revision:1,armed:true,target_id:'HEAD_SHOULDERS_CENTER',current_framing_ready:false,trial_success_latched:false,...overrides});
  const activated=model(cue('COMMAND_ACTIVATED','往你自己的左边一点','cmd-1',2),'ACTION_REQUIRED');engine.update(activated,context());engine.update(activated,context());
  engine.update(model(null,'WAITING_FOR_SETTLE'),context());now+=100;const reached=model(cue('TARGET_REACHED','位置合适，保持一下','cmd-hold',1),'VERIFYING_READY');engine.update(reached,context());engine.update(reached,context());
  engine.update(model(null,'READY',true),context({current_framing_ready:true,trial_success_latched:true}));engine.setEnabled(false);const beforeOff=adapter.spoken.length;engine.update(model(cue('COMMAND_ACTIVATED','退后一点','cmd-2',2),'ACTION_REQUIRED'),context());
  const sequence=adapter.spoken.map(item=>item.cue.semantic_id),ordinaryCount=sequence.filter(value=>value==='COMMAND_ACTIVATED').length,settleCount=0,readyCount=sequence.filter(value=>value==='TARGET_REACHED').length,voiceOffSuppressed=adapter.spoken.length===beforeOff;
  return Object.freeze({pass:ordinaryCount===1&&settleCount===0&&readyCount===1&&voiceOffSuppressed,cue_sequence:Object.freeze(sequence),ordinary_count:ordinaryCount,settle_count:settleCount,ready_count:readyCount,cancel_count:adapter.cancelled.length,voice_off_suppressed:voiceOffSuppressed,provider_calls:0});
}
