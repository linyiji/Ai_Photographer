# Live V4 Current-Position Decision Logic V2

**Document ID:** `XFX_LIVE_V4_CURRENT_POSITION_DECISION_LOGIC_V2`
**Status:** `OWNER_ALGORITHM_AUTHORITY / ALIGNED_AFTER_05A`
**Accepted source evidence:** `ef7f6b52dd2ace562ce3e0e6c39ea856d6bda94c`

---

# 1. Purpose

This document defines the exact order used by Live V4 to answer:

```text
What is visible now?
What can be measured now?
What does this target require?
What is the highest-priority current difference?
What one action, if any, should be issued?
```

It does not define visual rendering details; those belong to Document 18.

---

# 2. Inputs

```text
INPUT A:
Camera / Pose stream

INPUT B:
LiveTargetV02
```

The target is supplied externally. Live does not select the photography concept.

---

# 3. Decision chain

```text
Frame
↓
Pose Result
↓
Subject Lock
↓
Landmark Evidence
↓
Observed Body Coverage
↓
Semantic Region Derivation
↓
Landmark Group Reduction
↓
Semantic Anchors
↓
Measurement Capability
↓
HumanObservation
        +
LiveTarget
↓
Target Measurement Readiness
↓
Constraint Resolver
↓
LiveConstraintState
↓
LiveAction
```

---

# 4. Step A — Subject Lock

If there is no accepted stable active subject:

```text
stage = ACQUIRE_SUBJECT
```

No target-relative scale/X judgment is allowed.

---

# 5. Step B — Infer current body coverage

The runtime must first infer what the current video actually contains.

Possible summary:

```text
HEAD_ONLY
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

This is Observation only.

Hard rule:

```text
DEFAULT_FULL_BODY_REQUIREMENT = NO
```

Example:

```text
ObservedBodyCoverage = HEAD_SHOULDERS
```

does not imply:

```text
TOO_CLOSE
```

It simply constrains what measurements can currently be computed.

---

# 6. Step C — Build semantic regions

Semantic evidence may include:

```text
HEAD
SHOULDERS
UPPER_TORSO
HIPS
KNEES
ANKLES
FEET
```

`UPPER_TORSO` is derived from shoulder/hip evidence and crop consistency.

```text
UPPER_TORSO_BASIS = DERIVED
```

There is no direct upper-torso Pose landmark requirement.

---

# 7. Step D — Landmark group reduction

This rule is mandatory because 05A proved a real bug caused by assuming all groups had `pair_center`.

## 7.1 HEAD_CORE

`HEAD_CORE` is a multi-landmark group.

Correct:

```text
HEAD_CORE_CENTER =
centroid(valid bounded HEAD_CORE landmarks)
```

Forbidden:

```text
HEAD_CORE.pair_center
```

## 7.2 Bilateral groups

For:

```text
SHOULDERS
HIPS
KNEES
ANKLES
```

when both required bilateral landmarks are valid:

```text
center = pair_center(left, right)
```

If evidence is unilateral/low-confidence/cropped:

```text
GOOD / MARGINAL / INVALID
```

must be determined by the accepted measurement rule.

No fabricated counterpart.

---

# 8. Step E — Build semantic anchors

Examples:

```text
HEAD_CENTER
SHOULDER_CENTER
TORSO_CENTER
HIP_CENTER
KNEE_CENTER
ANKLE_CENTER
```

Anchors are still Observation.

They contain no Target-relative quality judgment.

---

# 9. Step F — Calculate Measurement Capability

Each observation asks what can be reliably measured now.

At minimum current V4 may expose:

```text
HEAD_TO_HIP
TORSO_CENTER
HEAD_TO_KNEE
HEAD_TO_ANKLE
```

States:

```text
GOOD
MARGINAL
INVALID
```

## 9.1 Upper body

For current Upper Body fixtures, the critical requirements are:

```text
HEAD_TO_HIP = GOOD
TORSO_CENTER = GOOD
```

plus no real crop that invalidates the intended measurement.

The old wording:

```text
“Upper Body must independently see HEAD + SHOULDERS + UPPER_TORSO + HIPS”
```

is not the canonical Control Gate.

The canonical gate is target measurement validity.

---

# 10. Step G — Compare to LiveTarget measurement requirements

Separate:

```text
coverage_expectation
```

from:

```text
measurement_requirements
```

Example Upper Body:

```text
coverage_expectation:
HEAD
SHOULDERS
UPPER_TORSO
HIPS

measurement_requirements:
HEAD_TO_HIP
TORSO_CENTER
```

Then:

```text
if HEAD_TO_HIP == GOOD
and TORSO_CENTER == GOOD
and no crop invalidation:
    measurement_ready = true
else:
    measurement_ready = false
```

---

# 11. `ACQUIRE_REQUIRED_BODY` semantic

The enum may remain for compatibility.

Its meaning is:

```text
ENSURE_TARGET_MEASURABILITY
```

If the active target is already measurable, the resolver must not remain here merely because a redundant semantic label is not independently `VISIBLE`.

False deadlock is forbidden.

```text
FALSE_REQUIRED_BODY_DEADLOCK = 0
```

---

# 12. Blocking-evidence interpretation

If measurement is not ready, identify why.

Examples:

```text
HEAD_TO_HIP invalid
because true bottom crop excludes hips
→ user-facing body-coverage acquisition may be valid

HEAD_TO_HIP invalid
because head reduction strategy is wrong
→ algorithm defect, not user-action evidence

TORSO_CENTER marginal
because one hip is low-confidence
→ bounded measurement pending
```

Do not convert every invalid measurement into `MOVE_FARTHER`.

---

# 13. ADJUST_SCALE

Only after measurement readiness.

```text
current_scale
vs
target_scale_range
```

Example:

```text
current > target_max
→ current visual subject scale is too large relative to this target

current < target_min
→ current visual subject scale is too small relative to this target
```

This is not an absolute physical-distance judgment.

Target values/tolerances remain unchanged by 05A.

---

# 14. ALIGN_PRIMARY_ANCHOR

Only after the required scale condition is accepted.

Example:

```text
current_torso_x
vs
target_x ± tolerance
```

```text
current_x < target_min
→ LEFT_OF_TARGET

current_x > target_max
→ RIGHT_OF_TARGET

else
→ IN_TARGET
```

These terms are relative to the active target, not frame center.

---

# 15. Mirror / physical direction

Business comparison uses canonical:

```text
SENSOR_NORMALIZED_NON_MIRRORED
```

Front-camera mirroring affects display projection only.

Physical instruction must go through the direction mapper.

Never compare Target against an already mirrored UI coordinate.

---

# 16. Secondary constraint

Only after scale + primary anchor are satisfied.

Examples:

```text
HEAD_CENTER.y
BODY_ORIENTATION
CAMERA_HEIGHT
```

Respect:

```text
SUBJECT
CAMERA_OPERATOR
EITHER
```

Do not issue a subject action for a camera-only correction.

---

# 17. VERIFY

Only when all active Target constraints pass.

Accepted logic remains:

```text
GOOD + stable samples
→ accumulate 600ms

short unstable gap
→ pause accumulation

continuous instability >1000ms
→ reset

final READY sample
→ GOOD + stable + valid
```

05A did not change this logic.

---

# 18. READY

READY means:

```text
selected LiveTarget currently satisfied
```

It does not mean:

```text
person merely detected
```

Hard invariant:

```text
POST_READY_ORDINARY = 0
```

---

# 19. Human-response causality

For an issued ordinary action:

```text
ISSUED
↓
WAIT_FOR_RESPONSE
↓
WAIT_FOR_SETTLE
↓
EVALUATED
```

Hard:

```text
response_observed = false
→ EVALUATED = impossible
```

900ms may trigger reminder presentation only.

No-response cannot produce:

```text
TARGET_REACHED
IMPROVED
NO_EFFECT
WRONG_DIRECTION
new ControlEpoch
```

---

# 20. Output

The decision layer outputs normalized current state, not renderer guesses.

Conceptually:

```text
HumanObservationV02
LiveConstraintStateV01
LiveActionV01
ResponseState
VerifyState
ReadyState
```

These become the only inputs for `LivePresentationModelV02`.

---

# 21. Current 05A facts

```text
HEAD_CORE.pair_center defect = FIXED
HEAD_CORE reduction = CENTROID
UPPER_TORSO = DERIVED
HEAD_TO_HIP readiness = PASS
TORSO_CENTER readiness = PASS
TARGET_VALUES_CHANGED = NO
FIXED_CENTER_AUTHORITY = REMOVED
BODYMODE_DISTANCE_AUTHORITY = REMOVED
RESPONSE_GATE = PRESERVED
VERIFY_LOGIC = PRESERVED
```

Fresh OPPO revalidation remains pending.
