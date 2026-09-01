# Live V4 05H + Voice Combined Device Gate Amendment V01

Status: FUTURE_DEVICE_GATE_AUTHORITY

## 1. Decision

Voice is implemented now, then the next real OPPO acceptance tests the complete Live C-end experience together.

Do not modify runtime during the combined device run.

Sequence:

```text
05I voice implementation
→ automated/build/browser PASS
→ freeze Live HEAD
→ combined OPPO gate
```

## 2. Gate A — Clean startup

Use a clean URL without synthetic 05G matrix injection.

Before arm:

```text
V4 · DISARMED
CURRENT READY · FALSE
TRIAL SUCCESS · FALSE
准备完成，点击开始 V4 引导
```

## 3. Gate B — Real observation / green subject frame

Validate first:

```text
real Camera Observation
→ subject recognition
→ semantic anchor
→ stabilization
→ preview cover-crop projection
→ one front-camera mirror display transform
→ green observed-subject frame
```

Hard:

- green frame = observed/stabilized subject range;
- target zone is independent;
- no green subject frame before subject lock;
- long subject loss hides it;
- Target does not change `observed_extent`;
- visible offset/wrong body coverage/not following movement = projection defect.

If projection fails:

```text
STOP
```

Do not continue voice-action acceptance.

## 4. Gate C — Voice start

Press:

```text
开始 V4 引导
```

Confirm:

```text
Camera active
Live armed
VoiceOutputPort prepared
Voice enabled
```

## 5. Gate D — Action + voice

For real corrective actions verify:

```text
Text
Visual/Arrow
Voice
```

all represent the same physical instruction.

Exercise where available:

```text
left/right
closer/farther
settle
VERIFY
READY
```

## 6. Gate E — Causality

During WAIT_FOR_RESPONSE:

```text
no repeated ordinary voice
```

After settle:

```text
old direction voice = 0
```

## 7. Gate F — Dynamic READY

Reach current READY:

```text
voice: 好，就这里，可以拍了
```

Then deliberately leave target:

```text
current_framing_ready=false
```

Required:

```text
stale READY visual = 0
stale READY voice = 0
stale capture permission = 0
```

## 8. Separate verdicts

Report:

```text
PROJECTION_GATE
VOICE_GATE
CONTROL_CAUSALITY_GATE
DYNAMIC_READY_GATE
PERFORMANCE_GATE
```

Do not misclassify a Voice failure as a projection failure.

