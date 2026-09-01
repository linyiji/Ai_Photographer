# Live V4 Voice Presentation & Audio Cue Algorithm V01

Status: OWNER_PRESENTATION_ALGORITHM_AUTHORITY

## 1. Single semantic source

Voice, text and visual guidance must derive from the SAME current presentation semantic.

```text
Live Controller
→ PresentationSemantic
→ LivePresentationModelV03
   ├─ TextRenderer
   ├─ OverlayRenderer
   └─ VoiceCueResolver
```

Forbidden:

```text
VOICE_INDEPENDENT_DIRECTION_RESOLUTION
VOICE_INDEPENDENT_TARGET_LOGIC
```

Voice never reads raw Pose/MediaPipe to decide what to say.

## 2. LivePresentationModelV03

Additive conceptual shape:

```text
LivePresentationModelV03 {
  primary_message,
  visual,
  voice {
    enabled,
    cue_id,
    semantic_id,
    phrase_key,
    phrase_text,
    priority,
    interrupt_policy,
    repeat_policy,
    control_epoch_id,
    expires_at
  },
  haptic,
  debug
}
```

Voice is presentation-only.

## 3. Initial voice vocabulary

```text
ACQUIRE_SUBJECT
→ 站到画面里

SUBJECT_LEFT_SMALL
→ 往你自己的左边一点

SUBJECT_RIGHT_SMALL
→ 往你自己的右边一点

MOVE_CLOSER_SMALL
→ 靠近一点

MOVE_FARTHER_SMALL
→ 退后一点

WAIT_FOR_SETTLE / HOLD_STILL
→ 好，站定

VERIFY
→ 很好，保持一下

CURRENT_READY_ENTER
→ 好，就这里，可以拍了
```

Required-body acquisition must reuse the accepted blocker/actionability result.
Example only if target and geometry prove it:

```text
UPPER_BODY requires hips + farther action proven
→ 再退一点，让腰部进入画面
```

LOW_CONFIDENCE alone may not generate a movement phrase.

## 4. Silence is valid

Do not narrate every state.

```text
WAIT_FOR_RESPONSE → SILENT
passive observation update → SILENT
same action unchanged → SILENT
debug-only state → SILENT
```

## 5. Direction authority

Three spaces remain separate:

```text
SENSOR_X
DISPLAY_X
SUBJECT_LOCAL_PHYSICAL_X
```

Voice follows the already-resolved SUBJECT_LOCAL_PHYSICAL action.
Front-camera mirroring must never invert voice again.

Hard:

```text
VOICE_DOUBLE_MIRROR_INVERSION = 0
```

## 6. READY authority

READY voice is allowed only from:

```text
current_framing_ready: false → true
```

Not from historical:

```text
trial_success_latched
```

Hard:

```text
READY_VOICE_FROM_TRIAL_SUCCESS_ONLY = 0
STALE_READY_VOICE = 0
POST_READY_ORDINARY_VOICE = 0
```

## 7. Voice toggle

```text
VOICE_GUIDANCE = ON / OFF
```

Recommended Live default: ON after explicit user start gesture.

Turning voice off cancels current/pending speech but never changes Controller state.

## 8. Fallback

If VoiceOutputPort is unavailable:

```text
Text + Overlay + Controller continue normally
```

Voice failure is not a Live-control failure.

