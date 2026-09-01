import assert from 'node:assert/strict';
import test from 'node:test';
import { HumanTargetRelativeServoV04 } from '../control-v4/controller.js';
import { deriveV4Presentation, type V4Presentation } from '../control-v4/presentation.js';
import { LIVE_TARGET_FIXTURES_V02, V4_FRAMING_TARGET_FIXTURES_V01 } from '../control-v4/targets.js';
import { VoiceCueEngineV01 } from '../control-v4/voice-engine.js';
import { FakeVoiceOutputAdapterV01 } from '../control-v4/voice-fake-adapter.js';
import { BrowserSpeechSynthesisVoiceAdapterV01 } from '../control-v4/voice-browser-adapter.js';
import { runVoiceBrowserSmokeV01 } from '../control-v4/voice-browser-scenarios.js';
import { v4ObservationFixture } from '../fixtures/control-v4/human-observations.js';
import type { VoiceCueContextV01 } from '../control-v4/voice-types.js';

let now=1000;
const context=(overrides:Partial<VoiceCueContextV01>={}):VoiceCueContextV01=>({now,session_revision:1,armed:true,target_id:'CENTER_UPPER_BODY',current_framing_ready:false,trial_success_latched:false,...overrides});
const engine=(available=true)=>{const adapter=new FakeVoiceOutputAdapterV01(available,()=>now),scheduler=new VoiceCueEngineV01(adapter,{cooldown_ms:0});scheduler.prepareFromUserGesture();return{adapter,scheduler};};

test('06 Primary Text and Voice derive from one Canonical Command id',()=>{const c=new HumanTargetRelativeServoV04(LIVE_TARGET_FIXTURES_V02.CENTER_UPPER_BODY);c.arm(0);const input=(t:number,v:number)=>v4ObservationFixture({timestamp_ms:t,state_version:v,coverage:'UPPER_BODY',scale_metric:'HEAD_TO_HIP',x:.7});c.update(input(0,1));const p=deriveV4Presentation(c.update(input(300,2)));assert.equal(p.voice?.semantic_id,'COMMAND_ACTIVATED');assert.equal(p.voice?.command_id,p.command_id);assert.equal(p.primary_copy_zh,p.voice?.phrase_text);assert.match(p.primary_copy_zh,/右侧/);});

test('06 movement keeps the active goal command and never presents 好，站定',()=>{const c=new HumanTargetRelativeServoV04(LIVE_TARGET_FIXTURES_V02.CENTER_UPPER_BODY);c.arm(0);const input=(t:number,v:number,motion:'STILL'|'NEGATIVE'='STILL')=>v4ObservationFixture({timestamp_ms:t,state_version:v,coverage:'UPPER_BODY',scale_metric:'HEAD_TO_HIP',x:.7,x_motion:motion,stable:motion==='STILL'});c.update(input(0,1));c.update(input(300,2));const moving=deriveV4Presentation(c.update(input(450,3,'NEGATIVE')));assert.equal(moving.state,'WAITING_FOR_SETTLE');assert.match(moving.secondary_copy_zh,/正在接近目标/);assert.doesNotMatch(`${moving.primary_copy_zh}${moving.secondary_copy_zh}${moving.voice_copy_zh??''}`,/好，站定/);assert.equal(moving.voice,null);});

test('06 target reached emits HOLD_POSITION once before rolling READY verification',()=>{const target=V4_FRAMING_TARGET_FIXTURES_V01.HEAD_SHOULDERS_CENTER,c=new HumanTargetRelativeServoV04(target),input=(t:number,v:number)=>v4ObservationFixture({timestamp_ms:t,state_version:v,coverage:'HEAD_SHOULDERS',scale_metric:'HEAD_SHOULDER_SCALE',scale:target.target_scale,x:target.target_anchor_x,head_y:(target.target_anchor_y??.5)-.12});c.arm(0);const first=deriveV4Presentation(c.update(input(0,1)));assert.equal(first.voice?.semantic_id,'TARGET_REACHED');assert.equal(first.primary_copy_zh,'位置合适，保持一下');const second=deriveV4Presentation(c.update(input(300,2)));assert.equal(second.voice,null);assert.equal(second.secondary_copy_zh.includes('正在确认稳定性'),true);const ready=c.update(input(600,3));assert.equal(ready.current_framing_ready,true);});

test('06 Voice scheduler deduplicates command lifecycle event',()=>{const c=new HumanTargetRelativeServoV04(LIVE_TARGET_FIXTURES_V02.CENTER_UPPER_BODY);c.arm(0);const input=(t:number,v:number)=>v4ObservationFixture({timestamp_ms:t,state_version:v,coverage:'UPPER_BODY',x:.7});c.update(input(0,1));const presentation=deriveV4Presentation(c.update(input(300,2))),{adapter,scheduler}=engine();scheduler.update(presentation,context());scheduler.update(presentation,context());assert.equal(adapter.spoken.length,1);});

test('06 Voice OFF remains presentation-only',()=>{const c=new HumanTargetRelativeServoV04(LIVE_TARGET_FIXTURES_V02.CENTER_UPPER_BODY);c.arm(0);const input=(t:number,v:number)=>v4ObservationFixture({timestamp_ms:t,state_version:v,coverage:'UPPER_BODY',x:.7});c.update(input(0,1));const presentation=deriveV4Presentation(c.update(input(300,2))),{adapter,scheduler}=engine();scheduler.setEnabled(false);scheduler.update(presentation,context());assert.equal(adapter.spoken.length,0);assert.match(presentation.primary_copy_zh,/右侧/);assert.equal(presentation.command_id,presentation.voice?.command_id);});

test('06 unavailable adapter preserves graceful silent fallback',()=>{const target=V4_FRAMING_TARGET_FIXTURES_V01.HEAD_SHOULDERS_CENTER,c=new HumanTargetRelativeServoV04(target);c.arm(0);const presentation=deriveV4Presentation(c.update(v4ObservationFixture({timestamp_ms:0,state_version:1,coverage:'HEAD_SHOULDERS',scale_metric:'HEAD_SHOULDER_SCALE',scale:target.target_scale,x:target.target_anchor_x,head_y:(target.target_anchor_y??.5)-.12}))),{adapter,scheduler}=engine(false);scheduler.update(presentation,context({target_id:target.id}));assert.equal(adapter.spoken.length,0);assert.equal(scheduler.snapshot().voice_available,false);});

test('06 voice telemetry remains local scalar-only',()=>{const {scheduler}=engine();const silent:Readonly<V4Presentation>=Object.freeze({presentation_version:'LivePresentationModelV04',state:'ACQUIRING',primary_copy_zh:'观察中',secondary_copy_zh:'无命令',overlay_copy_zh:'观察中',voice_copy_zh:null,voice:null,action:null,command_id:null,display_axis_sign:0,current_framing_ready:false,trial_success_latched:false});scheduler.update(silent,context());const telemetry=scheduler.snapshot();assert.equal(telemetry.voice_provider_calls,0);assert.equal(telemetry.voice_audio_upload,0);assert.equal(telemetry.voice_audio_recording,0);});

test('06 browser adapter reports unavailable without browser speech APIs',()=>{const adapter=new BrowserSpeechSynthesisVoiceAdapterV01({speechSynthesis:undefined,SpeechSynthesisUtterance:undefined,now:()=>0});assert.equal(adapter.isAvailable(),false);adapter.dispose();});
test('06 deterministic voice browser smoke contains no settle cue',()=>{const result=runVoiceBrowserSmokeV01();assert.equal(result.pass,true);assert.deepEqual(result.cue_sequence,['COMMAND_ACTIVATED','TARGET_REACHED']);assert.equal(result.settle_count,0);assert.equal(result.provider_calls,0);});
