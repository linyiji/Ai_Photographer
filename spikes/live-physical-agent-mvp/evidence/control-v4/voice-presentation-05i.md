# Live V4 05I Voice Presentation Evidence

Date: 2026-09-01
Task: `XFX_LIVE_V4_VOICE_PRESENTATION_AND_AUDIO_CUE_IMPLEMENTATION_05I`
Scope: additive Presentation runtime only

## Implementation boundary

- One `LivePresentationModelV03` supplies current text, visual, and voice semantics.
- `VoiceCueEngine` consumes Presentation semantics only; it has no raw-pose,
  target, measurement, direction-mapper, response-gate, outcome, or READY write
  access.
- H5 uses a guarded `BrowserSpeechSynthesisVoiceAdapter` (`zh-CN`).
- WeApp voice runtime remains deferred behind the output-port boundary.
- External TTS/AI provider calls, audio upload, and audio recording are all 0.
- Preview/green-frame projection code was not changed.

## Deterministic acceptance

`FakeVoiceOutputAdapter` scenarios cover acquire, physical left/right, closer,
farther, no-response silence, response no-reissue, settle cancellation, verify
once, current READY entry once, historical-success exclusion, READY revoke,
post-READY silence, target/session/disarm cancellation, Voice OFF, unavailable
fallback, and front-preview mirror non-inversion.

Full Live regression result: `309/309 PASS`.

Hard invariant result:

```text
MAX_ORDINARY_CUE_PER_CONTROL_EPOCH = 1
NO_RESPONSE_VOICE_REISSUE = 0
OLD_DIRECTION_VOICE_AFTER_SETTLE = 0
READY_VOICE_FROM_TRIAL_SUCCESS_ONLY = 0
STALE_READY_VOICE = 0
POST_READY_ORDINARY_VOICE = 0
VOICE_NEW_CONTROL_EPOCHS = 0
VOICE_OUTCOME_MUTATIONS = 0
VOICE_RESPONSE_GATE_MUTATIONS = 0
VOICE_READY_MUTATIONS = 0
VOICE_DOUBLE_MIRROR_INVERSION = 0
VOICE_PROVIDER_CALLS = 0
VOICE_AUDIO_UPLOAD = 0
VOICE_AUDIO_RECORDING = 0
CAMERA_FRAME_WAITS_FOR_VOICE = 0
LIVE_LOOP_WAITS_FOR_VOICE = 0
```

## Builds

- Live TypeScript: PASS
- Live production build: PASS (`58 modules`)
- Frontend compatibility H5: PASS with existing 299 KiB entry-size warning
- Frontend compatibility WeApp: PASS

The compatibility package declares npm. A transient pnpm install attempt was
discarded; no pnpm lock/workspace configuration is retained.

## Browser smoke

Route: `?controlPolicy=V4&voiceGate=05I`

```text
voiceGate = PASS
voiceCueSequence = SUBJECT_LEFT_SMALL,HOLD_STILL,CURRENT_READY_ENTER
voiceCancelCount = 3
voiceOffSuppressed = true
voiceProviderCalls = 0
Voice toggle ON -> OFF -> ON = PASS
external provider scripts = 0
console errors = 0
```

The Codex in-app browser did not expose `window.speechSynthesis`; graceful
fallback was confirmed. Actual audible OPPO speech is therefore not claimed by
this implementation evidence and remains a separate device gate.

## Gate separation

```text
OPPO_VOICE_DEVICE_GATE = NOT_STARTED
PROJECTION_DEVICE_GATE = PENDING / EXISTING_DEFECT_EVIDENCE
COMBINED_05H_VOICE_GATE = NOT_STARTED
MAIN_INTEGRATION = NOT_STARTED
```

