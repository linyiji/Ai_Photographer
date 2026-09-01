# Live V4 Functional vs Performance Acceptance V01

**Status:** `OWNER_ACCEPTANCE_AUTHORITY`

---

# 1. Why separate them

A correct algorithm may run with a performance warning.

A fast system may still be algorithmically wrong.

Do not collapse these into one metric.

---

# 2. Functional gate

Functional questions:

```text
Did extent classification match reality?
Did profile readiness use the correct body requirements?
Did target-zone relation match reality?
Did the issued action reduce the correct error?
Did current READY revoke when reality changed?
```

Results:

```text
PASS
FAIL
```

---

# 3. Performance gate

Record:

```text
Preview FPS
Vision Hz
Inference p50
Inference p95
skipped busy ratio
thermal observation
visible freeze
black screen
crash
```

---

# 4. Candidate performance interpretation

Historical OPPO evidence shows performance variability.

Therefore 05H does not declare an arbitrary single p95 threshold as a functional correctness requirement.

Candidate interpretation:

```text
Preview around 30 FPS = desired
Vision around 6–8 Hz = desired current class
local inference P95 should remain low enough for useful guidance
```

Exact production SLO remains a later performance authority.

---

# 5. PASS_WITH_WARNING

Allowed when:

```text
Functional = PASS
```

and performance has measurable degradation but:

```text
no visible freeze
no black screen
no crash
guidance remains causally usable
```

---

# 6. Blocking performance failure

Performance becomes blocking if it causes:

```text
camera preview unusable
long visible freeze
control feedback obviously stale
repeated missed human response due to processing delay
crash
thermal throttling severe enough to break guidance
```

---

# 7. Final composition

Examples:

```text
FUNCTIONAL PASS
PERFORMANCE PASS
→ TASK PASS

FUNCTIONAL PASS
PERFORMANCE PASS_WITH_WARNING
→ TASK PASS_WITH_WARNING

FUNCTIONAL FAIL
→ TASK FAIL

PERFORMANCE BLOCKING_FAIL
→ TASK FAIL
```

