import type { V4Presentation } from './presentation.js';
import { VoiceCueEngineV01 } from './voice-engine.js';
import { FakeVoiceOutputAdapterV01 } from './voice-fake-adapter.js';
import type { VoicePresentationCueV01, VoiceSemanticIdV01 } from './voice-types.js';

const cue=(semantic:VoiceSemanticIdV01,phrase:string,epoch:string|null,priority:1|2|3|4):Readonly<VoicePresentationCueV01>=>Object.freeze({enabled:true,cue_id:`browser:${semantic}`,semantic_id:semantic,phrase_key:semantic,phrase_text:phrase,priority,interrupt_policy:priority===1?'INTERRUPT_LOWER':'REPLACE_STALE',repeat_policy:epoch?'ONCE_PER_CONTROL_EPOCH':'ONCE_PER_SEMANTIC_ENTRY',control_epoch_id:epoch,expires_at:5000});
const model=(voice:Readonly<VoicePresentationCueV01>|null,state:V4Presentation['state'],ready=false):Readonly<V4Presentation>=>Object.freeze({presentation_version:'LivePresentationModelV03',state,primary_copy_zh:voice?.phrase_text??'silent',overlay_copy_zh:voice?.phrase_text??'silent',voice_copy_zh:voice?.phrase_text??null,voice,action:voice?.semantic_id==='SUBJECT_LEFT_SMALL'?'MOVE_LEFT_SMALL':null,display_axis_sign:0,current_framing_ready:ready,trial_success_latched:ready});

export interface VoiceBrowserSmokeResultV01 {pass:boolean;cue_sequence:readonly VoiceSemanticIdV01[];ordinary_count:number;settle_count:number;ready_count:number;cancel_count:number;voice_off_suppressed:boolean;provider_calls:0}

export function runVoiceBrowserSmokeV01():Readonly<VoiceBrowserSmokeResultV01>{
  let now=1000;const adapter=new FakeVoiceOutputAdapterV01(true,()=>now),engine=new VoiceCueEngineV01(adapter,{cooldown_ms:0});engine.prepareFromUserGesture();
  const context=(overrides:Partial<{session_revision:number;armed:boolean;target_id:string;current_framing_ready:boolean;trial_success_latched:boolean}>={})=>({now,session_revision:1,armed:true,target_id:'HEAD_SHOULDERS_CENTER',current_framing_ready:false,trial_success_latched:false,...overrides});
  const ordinary=model(cue('SUBJECT_LEFT_SMALL','往你自己的左边一点','1:1',2),'ACTION_REQUIRED');engine.update(ordinary,context());engine.update(ordinary,context());
  engine.update(model(null,'WAITING_FOR_RESPONSE'),context());now+=100;engine.update(model(cue('HOLD_STILL','好，站定',null,1),'WAITING_FOR_SETTLE'),context());
  engine.update(model(null,'VERIFYING_READY'),context());now+=100;const ready=model(cue('CURRENT_READY_ENTER','好，就这里，可以拍了',null,1),'READY',true);engine.update(ready,context({current_framing_ready:true,trial_success_latched:true}));engine.update(ready,context({current_framing_ready:true,trial_success_latched:true}));engine.update(model(null,'ACQUIRING'),context({current_framing_ready:false,trial_success_latched:true}));
  engine.setEnabled(false);const beforeOff=adapter.spoken.length;engine.update(model(cue('MOVE_FARTHER_SMALL','退后一点','1:2',2),'ACTION_REQUIRED'),context());
  const sequence=adapter.spoken.map(item=>item.cue.semantic_id),ordinaryCount=sequence.filter(value=>value==='SUBJECT_LEFT_SMALL').length,settleCount=sequence.filter(value=>value==='HOLD_STILL').length,readyCount=sequence.filter(value=>value==='CURRENT_READY_ENTER').length,voiceOffSuppressed=adapter.spoken.length===beforeOff;
  return Object.freeze({pass:ordinaryCount===1&&settleCount===1&&readyCount===1&&adapter.cancelled.length>=2&&voiceOffSuppressed,cue_sequence:Object.freeze(sequence),ordinary_count:ordinaryCount,settle_count:settleCount,ready_count:readyCount,cancel_count:adapter.cancelled.length,voice_off_suppressed:voiceOffSuppressed,provider_calls:0});
}
