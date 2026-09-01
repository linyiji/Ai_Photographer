# Live V4 05H OPPO Device Gate Protocol V01

**Task target:** `XFX_LIVE_V4_05G_OPPO_FRAMING_EXTENT_POSITION_AND_DYNAMIC_READY_DEVICE_GATE_05H`

---

# 1. Device

Use the accepted OPPO test device/environment.

Record:

```text
device model
OS
browser
camera facing
orientation
preview mirror state
build/head
```

---

# 2. Before test

Required:

```text
HEAD = 8dfe92b272efd0c0bc5785d6cf2e102cf21f6d75
remote parity
worktree clean
no runtime code edits
```

Build/test status may be rechecked but must not be reinterpreted as device evidence.

---

# 3. Phase A operator steps

One camera session.

Move through:

```text
A1 HEAD
A2 HEAD_SHOULDERS
A3 UPPER_BODY
A4 THREE_QUARTER
A5 FULL_BODY
```

Do not chase a Target during this phase.

Goal:

```text
observe what Live thinks is visible
```

not:

```text
make every target ready
```

Download/export scalar evidence after Phase A if the harness supports phase tagging.

---

# 4. Phase A stop rule

If a structurally wrong extent persists:

```text
STOP
```

Example:

```text
HEAD_SHOULDERS with no hips
→ classified as UPPER_BODY only because target expects hips
```

is a hard fail.

---

# 5. Phase B1 operator steps

Select:

```text
HEAD_SHOULDERS
LEFT_TOP
```

Keep:

```text
head + both shoulders visible
```

Do not deliberately include hips just to satisfy readiness.

Confirm:

```text
HIPS not required
profile measurement ready
LEFT_TOP zone visible
X/Y relation changes correctly
```

If an X action is issued, follow the exact physical instruction.

Do not manufacture additional motion.

---

# 6. Phase B2 operator steps

Select:

```text
UPPER_BODY
CENTER
```

Begin close enough that hips are initially unavailable.

Observe:

```text
temporary wait
→ persistent precise blocker
```

Then adjust only according to valid user-facing guidance.

Confirm acquisition releases once hip-based measurements become valid.

---

# 7. Phase B3 operator steps

Select:

```text
THREE_QUARTER
RIGHT_BOTTOM
```

Keep knees visible.

Ankles need not be visible.

Confirm:

```text
THREE_QUARTER remains valid without ankles
RIGHT_BOTTOM relation is correct
```

Do not expect subject Y movement action if actor mapping remains deferred.

---

# 8. Phase C operator steps

Select a stable:

```text
HEAD_SHOULDERS × CENTER
```

Reach current READY.

Hold briefly.

Then deliberately step/move out of the target.

Observe:

```text
current READY disappears
historical trial success stays true
```

Then return to target and allow reacquisition.

---

# 9. Evidence required

Scalar trace must contain enough to prove:

```text
observed_extent
active profile
required regions/measurements
active anchor
target zone
X relation
Y relation
current_framing_ready
trial_success_latched
stage
action
episode response/settle/evaluation
performance
privacy counters
```

No screenshots are required for algorithm verdict if scalar evidence is sufficient.

Optional screenshot may document UI only, but is not a substitute for trace.

---

# 10. No code changes

During 05H:

```text
NO BOUNDED FIX
NO TARGET TUNING
NO THRESHOLD TUNING
```

A defect ends the gate.

A follow-up remediation gets a new Task ID.

