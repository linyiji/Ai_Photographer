# Live V4 Body Extent & Position Guidance Acceptance Gate V02 — 05H

**Status:** `OWNER_ACCEPTANCE_AUTHORITY`

---

# 1. Gate purpose

05H closes three SOURCE_REQUIRED gates from 05G:

```text
DEVICE_EXTENT_SWEEP
DEVICE_POSITION_GATE
DEVICE_READY_REVOKE
```

It also allows conditional reuse for the remaining 05F Target-relative X Phase C evidence.

---

# 2. Gate order

```text
PHASE A
BODY EXTENT SWEEP

↓ only if PASS

PHASE B
REPRESENTATIVE POSITION GUIDANCE

↓ only if PASS

PHASE C
DYNAMIC READY ENTER / REVOKE / REACQUIRE
```

Hard STOP between phases.

---

# 3. Phase A — Body Extent Sweep

Use one camera session.

This is primarily an Observation test.

Do not require a product target to make the Observation valid.

Progress through:

```text
HEAD
→ HEAD_SHOULDERS
→ UPPER_BODY
→ THREE_QUARTER
→ FULL_BODY
```

Hold each extent approximately long enough to produce a stable bounded interval.

No need to force exact seconds if evidence quality is already sufficient.

---

# 4. Phase A required evidence

For each extent capture scalar evidence:

```text
observed_extent
region states
active semantic anchors
measurement capabilities
fresh/stable
Preview FPS
Vision Hz
inference p50/p95
```

No raw media.

---

# 5. Phase A expected semantics

## HEAD

Expected:

```text
HEAD valid
shoulders may be absent
observed_extent = HEAD
```

## HEAD_SHOULDERS

Expected:

```text
HEAD valid
bilateral shoulders valid
HIPS may be absent
observed_extent = HEAD_SHOULDERS
```

Hard:

```text
HIPS_MISSING_DOES_NOT_INVALIDATE_HEAD_SHOULDERS = PASS
```

## UPPER_BODY

Expected:

```text
head/shoulder/hip basis valid
observed_extent = UPPER_BODY
```

## THREE_QUARTER

Expected:

```text
knee-capable observation
observed_extent = THREE_QUARTER
ANKLES may be absent
```

## FULL_BODY

Expected:

```text
accepted full-body lower endpoint valid
observed_extent = FULL_BODY
```

---

# 6. Phase A hard invariants

```text
TARGET_INFLUENCES_OBSERVED_EXTENT = 0
DEFAULT_FULL_BODY_REQUIREMENT = NO
```

If any extent is structurally misclassified:

```text
PHASE_A = FAIL
STOP
```

Do not continue Position Gate.

---

# 7. Phase B — Representative Position Gate

Run only three device cases.

Automated 15/15 matrix already covers exhaustive combinations.

Device representatives:

```text
B1:
HEAD_SHOULDERS × LEFT_TOP

B2:
UPPER_BODY × CENTER

B3:
THREE_QUARTER × RIGHT_BOTTOM
```

---

# 8. B1 — HEAD_SHOULDERS × LEFT_TOP

Required measurement basis:

```text
HEAD
bilateral SHOULDERS
SHOULDER_CENTER
```

Hard:

```text
HIPS_REQUIRED = NO
HEAD_TO_HIP_REQUIRED = NO
```

Required evidence:

```text
profile measurement-ready
active anchor valid
target zone = LEFT_TOP
X relation correct
Y relation correct
one action only
presentation matches controller
```

If a real X correction is issued and evaluated, it may satisfy 05F Phase C reuse.

---

# 9. B2 — UPPER_BODY × CENTER

This case specifically validates persistent missing-hip semantics.

Start from a state where:

```text
HEAD/SHOULDERS visible
HIPS not yet usable
```

Expected early classification:

```text
TEMPORARILY_UNSTABLE
```

only for the bounded waiting interval.

If HIPS remain unavailable after the accepted bounded wait and evidence indicates they are not actually observable:

```text
REGION_NOT_OBSERVED
or another precise user-fixable blocker
```

Presentation must stop saying generic:

```text
“等待身体测量稳定”
```

forever.

Expected human concept:

```text
已识别到人物。
当前半身构图还需要看到腰部和双髋。
```

Only append “稍微退后” if geometry/actionability proves that direction.

Once HIPS become valid:

```text
HEAD_TO_HIP = GOOD
TORSO_CENTER = GOOD
Target Gap ready
```

and acquisition must release.

---

# 10. B3 — THREE_QUARTER × RIGHT_BOTTOM

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

Once knee-based measurement is valid:

```text
missing ankles must not invalidate THREE_QUARTER
```

Validate:

```text
RIGHT_BOTTOM target zone
X relation
Y relation
one action only
presentation coherence
```

Y subject movement remains deferred unless supported by current accepted actor semantics.

---

# 11. Phase B functional success

Required:

```text
HEAD_SHOULDERS_LEFT_TOP = PASS
UPPER_BODY_CENTER = PASS
THREE_QUARTER_RIGHT_BOTTOM = PASS

X_RELATION = PASS
Y_RELATION = PASS
ONE_ACTION_ONLY = PASS
```

---

# 12. 05F Phase C conditional reuse

May set:

```text
05F_PHASE_C_REUSED = YES
```

only if a real X episode contains:

```text
target-relative X error before
physical action issued
response observed
settled
evaluated
target-relative X error after
```

and:

```text
abs(error_after) < abs(error_before)
WRONG_DIRECTION = 0
```

No “support rows” or passive movement may substitute.

---

# 13. Phase C — Dynamic READY

Recommended stable scenario:

```text
HEAD_SHOULDERS × CENTER
```

Reason:

```text
no hip dependency
lower measurement complexity
```

---

# 14. Phase C entry

Prove:

```text
measurement-ready
scale/active target constraints satisfied
VERIFY
current_framing_ready = true
trial_success_latched = true
```

---

# 15. Phase C revoke

After valid READY:

deliberately move clearly outside the accepted current target.

Required:

```text
current_framing_ready:
true → false
```

while:

```text
trial_success_latched:
true → true
```

UI/capture truth must revoke.

---

# 16. Stale READY forbidden

After current truth is lost:

```text
stale green READY = 0
stale “可以拍了” = 0
stale capture permission = 0
```

Expected copy concept:

```text
位置发生变化，正在重新确认
```

---

# 17. Phase C reacquisition

Return to target.

Required:

```text
measurement reacquired
correct correction/verify sequence
current_framing_ready = true again
```

Allowed result:

```text
PASS_WITH_WARNING
```

only for bounded jitter/performance warning, not stale READY.

---

# 18. Functional vs performance result

Judge separately.

```text
FUNCTIONAL_GATE
PERFORMANCE_GATE
```

If function is correct but performance misses candidate SLO without user-visible freeze:

```text
FUNCTIONAL = PASS
PERFORMANCE = PASS_WITH_WARNING
TASK_RESULT = PASS_WITH_WARNING
```

If performance causes:

```text
visible freeze
black screen
control too stale to follow movement
crash
```

then performance becomes blocking.

---

# 19. Privacy

Required:

```text
Provider = 0
Backend per-frame AI = 0
Luna = 0
Raw upload = 0
Raw frame/video persistence = 0
```

Scalar trace only.

---

# 20. Final gate

05G may be promoted from:

```text
READY_FOR_MANUAL_DEVICE_TEST
```

only after:

```text
Phase A accepted
Phase B accepted
Phase C accepted
```

No Main integration in 05H.

