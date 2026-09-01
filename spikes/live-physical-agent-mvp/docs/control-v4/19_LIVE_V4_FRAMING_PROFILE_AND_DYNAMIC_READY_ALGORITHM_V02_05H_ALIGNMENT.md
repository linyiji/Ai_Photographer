# Live V4 Framing Profile & Dynamic READY Algorithm V02 — 05H Device Alignment

**Status:** `OWNER_ALGORITHM_AUTHORITY / DEVICE_ACCEPTANCE_ALIGNMENT`  
**Source implementation:** `05G`  
**Expected source head:** `8dfe92b272efd0c0bc5785d6cf2e102cf21f6d75`

---

# 1. Purpose

05G already implemented and automated:

```text
HEAD
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
```

with:

```text
HEAD_SHOULDERS_REQUIRES_HIPS = NO
DEFAULT_FULL_BODY_REQUIREMENT = NO
TARGET_INFLUENCES_OBSERVED_EXTENT = 0
```

05H does not redesign those algorithms.

05H exists to prove the accepted 05G semantics on a real OPPO camera path.

---

# 2. Canonical framing semantics

## HEAD

Minimum accepted observed extent:

```text
HEAD
```

Typical primary anchor:

```text
HEAD_CENTER
```

No shoulder/hip/knee/ankle requirement.

---

## HEAD_SHOULDERS

Required:

```text
HEAD
BILATERAL SHOULDERS
```

Typical primary anchor:

```text
SHOULDER_CENTER
```

Hard:

```text
HIPS_REQUIRED = NO
HEAD_TO_HIP_REQUIRED = NO
```

---

## UPPER_BODY

Means:

```text
head-to-hip upper-body framing
```

Required basis may include:

```text
HEAD
SHOULDERS
UPPER_TORSO
HIPS
HEAD_TO_HIP
TORSO_CENTER
```

Hips are valid requirements for this profile.

---

## THREE_QUARTER

Means:

```text
head-to-knee / knee-up framing
```

Required:

```text
HEAD
SHOULDERS
HIPS
KNEES
```

Hard:

```text
ANKLES_REQUIRED = NO
```

---

## FULL_BODY

Means complete lower-body chain.

Required may include:

```text
HEAD
SHOULDERS
HIPS
KNEES
ANKLES / accepted full-body endpoint
```

Only this profile defaults to full lower-body measurement.

---

# 3. Observation remains target-independent

05H must validate:

```text
Camera reality
→ ObservedBodyState
```

before Target evaluation.

Hard:

```text
Target must not alter observed_extent
```

If the user currently shows only HEAD_SHOULDERS:

```text
observed_extent = HEAD_SHOULDERS
```

even if the selected target is FULL_BODY.

Target mismatch belongs in:

```text
TargetObservationGap
```

not Observation.

---

# 4. Profile-specific measurement readiness

Same Observation may produce different readiness.

Example:

```text
HEAD + SHOULDERS valid
HIPS absent
```

Expected:

```text
HEAD_SHOULDERS
→ measurement-capable

UPPER_BODY
→ not measurement-ready

FULL_BODY
→ not measurement-ready
```

No global “more body is always better” rule exists.

---

# 5. Dynamic READY authority

Two states remain separate:

```text
trial_success_latched
current_framing_ready
```

`trial_success_latched`:

```text
historical evidence
monotonic
not user-facing capture truth
```

`current_framing_ready`:

```text
current reversible state
user-facing READY/capture truth
```

---

# 6. READY entry

Conceptual:

```text
Subject usable
Target Gap ready
Scale in ENTER range
X in ENTER range
Y / active secondary constraints satisfied where required
fresh
stable
VERIFY hold satisfied
→ current_framing_ready = true
```

05H does not tune target values.

---

# 7. READY revoke

If current truth becomes invalid for the accepted bounded exit hold:

```text
Subject lost
Target Gap false
required measurement invalid/stale
Scale leaves EXIT condition
X leaves EXIT condition
Y leaves active EXIT condition
meaningful movement invalidates current framing
```

then:

```text
current_framing_ready = false
```

while:

```text
trial_success_latched = true
```

may remain.

---

# 8. READY reacquisition

After revoke:

```text
Live must return to the correct active stage
```

such as:

```text
ENSURE_TARGET_MEASURABILITY
ADJUST_SCALE
ALIGN_PRIMARY_X
ALIGN_PRIMARY_Y
VERIFY
```

When conditions again satisfy the entry rule:

```text
current_framing_ready
may become true again
```

No permanent terminal READY state.

---

# 9. Position zones

05H real-device representative zones:

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

These remain algorithm acceptance fixtures only.

They are not universal photography aesthetics.

---

# 10. X / Y authority

X:

```text
LEFT_OF_ZONE
IN_X_RANGE
RIGHT_OF_ZONE
```

Y:

```text
ABOVE_ZONE
IN_Y_RANGE
BELOW_ZONE
```

Current 05G authority:

```text
Y_RELATION = SUPPORTED
Y_SUBJECT_ACTION = DEFERRED / CAMERA_OPERATOR_REQUIRED
```

05H must not invent subject-up/down action merely to pass.

---

# 11. One-action rule

At any ordinary correction step:

```text
ONE_ACTION_ONLY = TRUE
```

No simultaneous:

```text
move left + move down + farther
```

Presentation follows controller state.

---

# 12. 05F direction mapping inheritance

05H inherits accepted 05F calibration evidence.

Do not repeat LEFT/RIGHT physical calibration unless fresh evidence proves it invalid.

05H may conditionally close the remaining 05F Phase C only if a real Target-relative X correction produces:

```text
response_observed = true
settled = true
evaluated = true
abs(x_error_after) < abs(x_error_before)
wrong_direction = 0
```

---

# 13. No runtime change during gate

05H is initially:

```text
DEVICE_EVIDENCE_ONLY
```

If a new algorithm defect is found:

```text
preserve evidence
FAIL / REQUIRES_REVISION
STOP
```

Do not patch code and continue the same acceptance run.

