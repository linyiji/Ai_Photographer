# Live V4 Audio Platform Adapter & Unlock V01

Status: OWNER_PLATFORM_AUTHORITY

## 1. VoiceOutputPort

Define a platform-isolated port:

```text
isAvailable()
prepareFromUserGesture()
speak(cue)
cancel(cue_id | all)
setEnabled(boolean)
dispose()
```

It must not import the Controller.

## 2. H5 runtime

Initial implementation:

```text
BrowserSpeechSynthesisVoiceAdapter
```

Use feature detection around:

```text
window.speechSynthesis
SpeechSynthesisUtterance
```

No external TTS Provider.

## 3. User gesture

The existing explicit action:

```text
开始 V4 引导
```

may initialize:

```text
Camera
Live Arm
VoiceOutputPort
```

Do not speak before the user's start gesture.

Voice readiness must not block Camera startup.

## 4. Language

Initial voice:

```text
zh-CN
```

Prefer an available Chinese system voice.
If unavailable, use a safe fallback or mark Voice unavailable.

## 5. Browser voice loading

Voice lists may arrive asynchronously.

Handle:

```text
voices initially empty
voiceschanged later
```

Do not wait synchronously for voice inventory.

## 6. Speech parameters

Keep configurable.

Initial candidates only:

```text
rate: ~1.05–1.15
pitch: default
volume: default
```

Do not treat these as final product tuning.

## 7. Failure fallback

If speech APIs are missing/fail:

```text
VOICE_AVAILABLE = false
```

Live continues using visual/text guidance.

## 8. WeChat Mini Program

05I must keep WeChat build healthy.

Do not assume browser SpeechSynthesis exists in WeApp.

Required boundary:

```text
VoiceCueEngine
→ VoiceOutputPort
   ├─ H5 BrowserSpeechSynthesisVoiceAdapter
   └─ WeApp Voice Adapter (may remain DEFERRED)
```

Allowed result:

```text
WEAPP_VOICE_RUNTIME = DEFERRED
WEAPP_BUILD = PASS
```

Do not invent a WeChat TTS service.

## 9. Test adapter

Automated tests use:

```text
FakeVoiceOutputAdapter
```

for deterministic cue order, cancel, stale suppression, and unavailable behavior.

## 10. Lifecycle

Cancel/suspend on:

```text
Live disarm
page hide/unmount
camera stop
route change
Voice disabled
```

No speech from inactive Live.

## 11. Privacy

Initial H5 voice:

```text
NETWORK_VOICE_CALLS = 0
VOICE_AUDIO_UPLOAD = 0
VOICE_RECORDING = 0
```

