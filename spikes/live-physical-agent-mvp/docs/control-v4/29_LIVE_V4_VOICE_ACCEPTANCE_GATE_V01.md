# Live V4 Voice Acceptance Gate V01

Status: OWNER_ACCEPTANCE_AUTHORITY

## 1. Automated matrix

At minimum:

```text
ACQUIRE_SUBJECT
SUBJECT_LEFT_SMALL
SUBJECT_RIGHT_SMALL
MOVE_CLOSER_SMALL
MOVE_FARTHER_SMALL
WAIT_FOR_RESPONSE
WAIT_FOR_SETTLE
VERIFY
READY
READY_REVOKE
VOICE_DISABLED
VOICE_UNAVAILABLE
TARGET_REARM
LIVE_DISARM
```

## 2. Semantic alignment

Required:

```text
Controller physical action
=
Text semantic
=
Voice semantic
```

Voice never derives direction from display mirror.

## 3. LEFT / RIGHT

```text
SUBJECT_LEFT
→ text left
→ voice: 往你自己的左边一点

SUBJECT_RIGHT
→ text right
→ voice: 往你自己的右边一点
```

Required:

```text
VOICE_DOUBLE_MIRROR_INVERSION = 0
```

## 4. Scale

```text
MOVE_CLOSER → 靠近一点
MOVE_FARTHER → 退后一点
```

No swap.

## 5. Response causality

For one ControlEpoch:

```text
ordinary voice cue <= 1
```

Repeated WAIT_FOR_RESPONSE observations:

```text
NO_RESPONSE_VOICE_REISSUE = 0
```

## 6. Settle

When WAIT_FOR_SETTLE becomes current:

```text
old movement voice = cancelled/suppressed
settle voice = allowed
```

Required:

```text
OLD_DIRECTION_VOICE_AFTER_SETTLE = 0
```

## 7. VERIFY

One VERIFY voice per verify episode.

No repeated progress chatter.

## 8. READY

Only current READY transition may speak READY.

```text
trial_success_latched=true
current_framing_ready=false
→ READY voice forbidden
```

## 9. READY revoke

Required:

```text
STALE_READY_VOICE = 0
POST_READY_ORDINARY_VOICE = 0
```

## 10. Target re-arm / disarm

Required:

```text
OLD_TARGET_VOICE_AFTER_REARM = 0
VOICE_AFTER_DISARM = 0
```

## 11. Voice OFF

Voice output stops while:

```text
Controller
Text
Overlay
```

remain unchanged.

## 12. Voice unavailable

Required:

```text
CONTROLLER_REGRESSION = 0
VISUAL_GUIDANCE_REGRESSION = 0
```

## 13. Performance

Voice must not be awaited by:

```text
Camera frame callback
Vision loop
Live Controller
```

Required:

```text
CAMERA_FRAME_WAITS_FOR_VOICE = 0
LIVE_LOOP_WAITS_FOR_VOICE = 0
```

## 14. Browser smoke

Required:

```text
voice state debug visibility
cue sequence correct
zero console errors
```

Actual OPPO audible acceptance remains future device evidence.

