# Live V4 Body Visibility & Measurement Readiness V2

> Superseded by `17_LIVE_V4_BODY_VISIBILITY_AND_MEASUREMENT_READINESS_V3.md` under 05G. Retained only as historical context.

**Document ID:** `XFX_LIVE_V4_BODY_VISIBILITY_AND_MEASUREMENT_READINESS_V2`
**Status:** `ACCEPTED_05A_MEASUREMENT_AUTHORITY`
**Source head:** `ef7f6b52dd2ace562ce3e0e6c39ea856d6bda94c`

---

# 1. Separation

Live V4 keeps four distinct concepts:

```text
LANDMARK EVIDENCE
↓
OBSERVED BODY COVERAGE / SEMANTIC BODY REGIONS
↓
MEASUREMENT CAPABILITY
↓
TARGET MEASUREMENT READINESS
```

These must not be collapsed.

---

# 2. Landmark Evidence

Pose provides bounded point-level evidence.

For relevant groups record only scalar/bounded evidence needed by runtime:

```text
availability
confidence
normalized coordinate
freshness
edge proximity
crop classification
```

No raw frame/video persistence is required.

---

# 3. Observed Body Coverage

This is inferred from current video only.

Candidate summary:

```text
HEAD_ONLY
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

It is not a Target.

It does not imply too close/far.

It does not force full body.

---

# 4. Semantic Body Regions

```text
HEAD
SHOULDERS
UPPER_TORSO
HIPS
KNEES
ANKLES
FEET
```

Evidence classes:

```text
VISIBLE
PARTIAL
CROPPED
MISSING
LOW_CONFIDENCE
OCCLUDED_OR_UNKNOWN
```

Do not claim occlusion if the detector cannot distinguish it.

---

# 5. Upper torso derivation

Accepted:

```text
UPPER_TORSO_BASIS = DERIVED
```

Pose has no independent upper-torso point.

The region is derived from sufficient:

```text
shoulder evidence
+
hip evidence
+
crop consistency
```

It must never block solely because a nonexistent direct torso landmark is absent.

---

# 6. Landmark Group Reduction Strategy

This is a canonical measurement rule.

## 6.1 Multi-landmark groups

`HEAD_CORE` contains more than two candidate head landmarks.

Accepted 05A reduction:

```text
HEAD_CORE_CENTER =
centroid(valid bounded HEAD_CORE points)
```

The pre-05A assumption:

```text
HEAD_CORE.pair_center
```

is invalid.

## 6.2 Bilateral groups

```text
SHOULDERS
HIPS
KNEES
ANKLES
```

are bilateral two-point groups.

If bilateral evidence is valid:

```text
pair_center(left, right)
```

is allowed.

If only one side is available:

```text
MARGINAL / INVALID
```

according to the accepted target precision requirement.

Do not synthesize the missing bilateral point.

## 6.3 Generic algorithm

```text
switch group.reduction_strategy:

  BILATERAL_PAIR:
    require approved bilateral evidence
    output pair_center

  MULTI_POINT_CENTROID:
    require minimum bounded valid point set
    output centroid

  APPROVED_WEIGHTED_CENTROID:
    only if explicitly versioned and validated

  otherwise:
    INVALID
```

A group type must explicitly declare its reduction strategy.

---

# 7. Semantic Anchors

Examples:

```text
HEAD_CENTER
SHOULDER_CENTER
TORSO_CENTER
HIP_CENTER
KNEE_CENTER
ANKLE_CENTER
```

Each anchor records its `basis`.

This allows traces/tests to distinguish:

```text
HEAD_CENTER basis = HEAD_CORE_CENTROID
HIP_CENTER basis = BILATERAL_HIP_PAIR
```

---

# 8. MeasurementCapabilityV01

Each target-relevant measurement is classified:

```text
GOOD
MARGINAL
INVALID
```

Current set:

```text
HEAD_TO_HIP
TORSO_CENTER
HEAD_TO_KNEE
HEAD_TO_ANKLE
```

`GOOD` requires:

- required endpoint/anchor evidence;
- sufficient confidence;
- fresh evidence;
- no crop invalidating the span;
- finite/consistent normalized geometry.

`MARGINAL` means partial usable evidence exists but precision control is not yet authorized unless an explicit bounded policy allows it.

`INVALID` means the target measurement cannot safely drive precision control.

---

# 9. HEAD_TO_HIP

Conceptually:

```text
head_endpoint = HEAD_CORE_CENTROID
hip_endpoint = accepted HIP_CENTER
span = semantic vertical/geometric span per runtime contract
```

If head or hip basis is invalid:

```text
HEAD_TO_HIP = INVALID
```

The system must not fall back to a nonexistent head pair center.

---

# 10. TORSO_CENTER

Must use accepted shoulder/hip-derived semantics.

It is not a global person bounding-box center unless explicitly defined by the contract.

The exact existing runtime formula may remain if already accepted, but the basis must be traceable.

---

# 11. Hip evidence

Classify bounded evidence:

```text
BILATERAL_VALID
UNILATERAL_PARTIAL
LOW_CONFIDENCE
EDGE_CROPPED
UNKNOWN
```

`BILATERAL_VALID` can support `GOOD`.

Other states may become `MARGINAL` or `INVALID`.

True bottom crop affecting required span remains non-ready.

---

# 12. Coverage expectation vs Measurement requirement

Example:

```text
Upper Body Shot
```

may have:

```text
coverage_expectation:
HEAD / SHOULDERS / UPPER_TORSO / HIPS
```

but controller precision requirements are:

```text
HEAD_TO_HIP
TORSO_CENTER
```

If both measurements are `GOOD` and no true crop invalidates the target:

```text
measurement_ready = true
```

The controller must not additionally wait for an independent `UPPER_TORSO=VISIBLE` token.

---

# 13. `coverage_satisfied`

`coverage_satisfied` answers:

> Does the observation match the semantic body extent expected by the shot fixture?

It is useful for product/evidence semantics.

It is not identical to:

```text
measurement_ready
```

---

# 14. `measurement_ready`

`measurement_ready` answers:

> Can Live now safely calculate the active target-relative control error?

This is the authoritative controller readiness concept.

---

# 15. `required_body_satisfied`

For compatibility, an existing `required_body_satisfied` field may remain.

After 05A it must mirror target measurability semantics rather than old “every label visible” semantics.

Do not reintroduce the old meaning through UI code.

---

# 16. Upper Body readiness

Canonical current rule:

```text
subject lock valid
+
HEAD_TO_HIP = GOOD
+
TORSO_CENTER = GOOD
+
no real crop invalidation
→ measurement_ready = true
```

The resolver must then leave `ACQUIRE_REQUIRED_BODY`.

Next stage may be:

```text
ADJUST_SCALE
ALIGN_PRIMARY_ANCHOR
ALIGN_SECONDARY_CONSTRAINT
VERIFY
```

depending on Current vs Target.

---

# 17. Close Portrait readiness

A Close Portrait target may require only:

```text
HEAD_SIZE
EYE_LINE
HEAD/SHOULDER evidence
```

It must not require hips, knees or feet unless the target contract explicitly says so.

---

# 18. Full Body readiness

Only a target that truly requires full-body measurement may demand lower-body evidence.

Even then the requirement must be expressed as target measurements/coverage, not as a global Live rule.

---

# 19. Failure classification

If measurement is invalid, distinguish:

```text
REAL_CROP_OR_MISSING_EVIDENCE
LOW_CONFIDENCE
INSUFFICIENT_BILATERAL_BASIS
LANDMARK_REDUCTION_DEFECT
STALE_EVIDENCE
UNKNOWN
```

User guidance is only allowed when the failure reason supports a user-fixable action.

Algorithm defects must not be translated into “please move”.

---

# 20. Scalar trace

Trace should expose enough bounded data to diagnose:

```text
subject_lock_state
observed_body_coverage
coverage_satisfied
measurement_ready
blocking_measurements
head_basis_summary
upper_torso_basis
hip_evidence_classification
HEAD_TO_HIP readiness
TORSO_CENTER readiness
resolver_stage
```

No raw image/video/full landmark array.

---

# 21. 05A accepted defect closure

```text
DEFECT:
HEAD_CORE.pair_center assumption

ROOT:
HEAD_CORE is a multi-landmark group

FIX:
centroid(valid HEAD_CORE landmarks)

RESULT:
HEAD_TO_HIP can now establish valid head basis
```

This fact must remain documented in regression tests and canonical docs.

---

# 22. Current gate

```text
AUTOMATED_FALSE_REQUIRED_BODY_DEADLOCK = 0
DEVICE_FALSE_REQUIRED_BODY_DEADLOCK = PENDING
CENTER_UPPER_BODY_DEVICE_REVALIDATION = MANUAL_REVIEW_REQUIRED
```

No device PASS may be claimed from automated evidence alone.

---

# 23. Measurement-scoped crop model (05D)

`ObservedBodyCoverage` and global crop remain truthful observation facts. They are not universal measurement blockers.

| Measurement | Required anchors | Required regions | Crop dependencies |
|---|---|---|---|
| `HEAD_TO_HIP` | `HEAD_CENTER`, `HIP_CENTER` | HEAD, HIPS | HEAD, HIPS |
| `TORSO_CENTER` | `SHOULDER_CENTER`, `HIP_CENTER`, `TORSO_CENTER` | SHOULDERS, HIPS, UPPER_TORSO | SHOULDERS, HIPS |
| `HEAD_TO_KNEE` | `HEAD_CENTER`, `KNEE_CENTER` | HEAD, KNEES | HEAD, KNEES |
| `HEAD_TO_ANKLE` | `HEAD_CENTER`, `ANKLE_CENTER` | HEAD, ANKLES | HEAD, ANKLES |

`EDGE_CROPPED` is assigned from the region's own landmark evidence near the corresponding sensor edge (or the required region being absent at that asserted edge). It is not inherited merely because `GLOBAL_BOTTOM_CROP = true`.

The same observation can therefore resolve differently by target:

```text
head/shoulders/hips/knees = valid
ankles = missing
GLOBAL_BOTTOM_CROP = true

Upper Body:     HEAD_TO_HIP + TORSO_CENTER = GOOD -> READY FOR CONTROL
Three Quarter:  HEAD_TO_KNEE = GOOD              -> READY FOR CONTROL
Full Body:      HEAD_TO_ANKLE = INVALID           -> ACQUIRE_REQUIRED_BODY
```

Body coverage guidance must release as soon as the active target measurements are `GOOD`. It must not keep asking an Upper Body subject to show ankles or feet. Conversely, crop of the actual hip, knee or ankle endpoint remains invalid for the measurement that depends on that endpoint.

The sanitized 05C regression fixture preserves only scalar facts (`raw_media = false`): global bottom crop, bilateral hips at approximately `y = 0.846`, valid head/shoulder/hip geometry, knees present and ankles absent. For `CENTER_UPPER_BODY`, it must produce `HEAD_TO_HIP = GOOD`, `TORSO_CENTER = GOOD`, `measurement_ready = true`, and leave `ACQUIRE_REQUIRED_BODY`.

---

# 24. 05E observation, requirement and gap separation

Body visibility answers only what is observed. It never defaults to a full-body requirement and never changes when the selected target changes. Each semantic region records `VALID`, `PARTIAL`, `LOW_CONFIDENCE`, `EDGE_CROPPED`, `NOT_OBSERVED` or `UNKNOWN`; region crop requires region-local evidence.

Measurement capability remains target-independent. Targets select those capabilities through `TargetMeasurementRequirementV01`, and `TargetObservationGapV01` alone computes required minus observed. A Center Upper Body observation with good head, shoulders and hips is ready without knees, ankles or feet.

The accepted 05E OPPO trace observed 449 measurement-ready/gap-ready rows and 449 downstream rows outside `ACQUIRE_REQUIRED_BODY`. 05F changes no observation, region, anchor, measurement definition, readiness or gap semantics.
