# 向风行｜Live Observation / Target / Control V4 Architecture Target

**Status:** `DOCUMENTED_TARGET / IMPLEMENTATION_NOT_STARTED`
**Current V3 disposition:** `DEVICE_GATE_FAIL / NOT_PROMOTED / REQUIRES_REVISION`

## Separation invariant

```text
OBSERVATION = what reality currently is
TARGET = what the selected Shot Plan requires
CONTROL = how to reduce Current → Target gap
```

`HumanObservation` must not contain `too close`, `too far`, `too left` or `too right`. Those judgments exist only after comparison with `LiveTarget`.

## Target architecture

```text
Subject Lock
→ Body Visibility Graph
→ Semantic Anchor Set
→ HumanObservationV02

SelectedShotPlan → LiveTargetV02

HumanObservationV02 + LiveTargetV02
→ Constraint Resolver
→ Human Step Servo
```

The resolver progresses through subject acquisition, required body acquisition, target-relative scale, primary anchor, secondary constraints, verification and ready latch.

## Deprecated universal assumptions

Fixed target `x = 0.5`, `BodyMode → TOO_CLOSE`, `BodyMode → TOO_FAR` and an absolute universal best distance are no longer Control Authority. `BodyMode` may remain a compatibility/debug summary. Scale guidance is `Current Scale vs LiveTarget Scale`; horizontal guidance is `Current Anchor vs LiveTarget Anchor`.

## Human-response causality

The accepted V3 defect was `no detected movement → grace expiration → evaluation → NO_EFFECT / possible TARGET_REACHED → new ControlEpoch`.

Future hard invariant:

```text
NO_RESPONSE
→ NO_ACTION_OUTCOME
→ NO_NEW_CONTROLEPOCH
```

Elapsed presentation time may trigger a reminder, but cannot manufacture response evidence, outcome evaluation or a new ordinary instruction epoch.

## Gate order

Live V4 must pass target-relative browser fixtures, an independent OPPO real-device gate, WeChat portability and only then selective Main integration. This rebaseline does not implement or promote Live V4.
