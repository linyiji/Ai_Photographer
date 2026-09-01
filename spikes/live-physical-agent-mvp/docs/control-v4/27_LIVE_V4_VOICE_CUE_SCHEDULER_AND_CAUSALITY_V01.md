# Live V4 Voice Cue Scheduler & Causality V01

Status: OWNER_VOICE_SCHEDULER_AUTHORITY

## 1. Existing Human Step Servo remains authority

```text
ISSUED
→ WAIT_FOR_RESPONSE
→ RESPONSE_OBSERVED
→ WAIT_FOR_SETTLE
→ EVALUATED
```

Voice cannot create an epoch or outcome.

## 2. Scheduler states

```text
IDLE
PENDING
SPEAKING
COOLDOWN
CANCELLED
UNAVAILABLE
```

## 3. Ordinary action

A genuinely new current ControlEpoch may emit one ordinary cue.

Initial hard policy:

```text
MAX_ORDINARY_CUE_PER_CONTROL_EPOCH = 1
NO_RESPONSE_AUTOMATIC_VOICE_REPEAT = OFF
```

Therefore repeated observation rows in WAIT_FOR_RESPONSE remain silent.

## 4. Response / settle

After response_observed:

```text
no second direction cue for the same epoch
```

On WAIT_FOR_SETTLE:

```text
cancel/suppress stale movement cue
allow: 好，站定
```

Hard:

```text
OLD_DIRECTION_VOICE_AFTER_SETTLE = 0
```

## 5. VERIFY

First entry to a VERIFY episode:

```text
很好，保持一下
```

once.

Progress updates do not repeat it.

## 6. READY

First current READY entry:

```text
好，就这里，可以拍了
```

once per READY episode.

READY revoke invalidates pending READY speech immediately.

## 7. Dedupe

Recommended key:

```text
session_revision
+ semantic_id
+ control_epoch_id / verify_episode_id / ready_episode_id
```

Do not dedupe only by phrase text.

## 8. Stale cancellation

Cancel/suppress on:

```text
new session revision
new target armed
control epoch invalidated
subject lost
READY revoked
Voice disabled
Live disarmed
page unmounted
```

## 9. Priority

Semantic priority:

```text
P1 SETTLE / READY
P2 CORRECTIVE_ACTION
P3 STATUS
P4 OPTIONAL
```

Higher-priority current truth may interrupt stale lower-priority speech.

## 10. Cooldown

Implement configurable local cooldown to avoid chatter.

Initial candidate range:

```text
700–1200 ms
```

This is not production tuning authority; record it and device-tune later.

## 11. Telemetry

Scalar only:

```text
voice_cue_requested
voice_cue_started
voice_cue_completed
voice_cue_cancelled
voice_cue_suppressed
voice_suppression_reason
voice_semantic_id
voice_phrase_key
voice_control_epoch_id
voice_request_to_start_ms
```

No audio recording.

## 12. Hard causality

```text
VOICE_NEW_CONTROL_EPOCHS = 0
VOICE_OUTCOME_MUTATIONS = 0
VOICE_RESPONSE_GATE_MUTATIONS = 0
VOICE_READY_MUTATIONS = 0
```

