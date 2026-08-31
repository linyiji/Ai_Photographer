# XFX Live V4 Human Observation & Target-Relative Control — Canonical

**Document ID:** `XFX_LIVE_HUMAN_OBSERVATION_TARGET_CONTROL_V4_CANONICAL`
**Status:** `OWNER_DESIGN_AUTHORITY / ALIGNED_AFTER_05A`
**Accepted runtime evidence:** `ef7f6b52dd2ace562ce3e0e6c39ea856d6bda94c`
**Supersedes:** pre-05A V4 architecture wording where inconsistent

---

# 1. Live role

Live is a target execution system.

It does not decide what composition is aesthetically best.

```text
OBSERVATION
= what current reality is

TARGET
= what the selected Shot Plan requires

CONTROL
= how to reduce Current → Target gap
```

---

# 2. Three foundational abilities

Live must reliably do three things:

```text
1. find and maintain the active subject
2. infer what part of the subject is currently observable/measurable
3. guide the relevant semantic body measurement/anchor toward LiveTarget
```

The second step is **not**:

```text
find the whole body
```

It is:

```text
infer current visible body coverage
+
infer current measurement capability
```

---

# 3. Canonical end-to-end algorithm

```text
Camera / Frame Source
        ↓
Pose / Person Perception
        ↓
SUBJECT LOCK
        ↓
LANDMARK EVIDENCE
        ↓
OBSERVED BODY COVERAGE
        ↓
SEMANTIC BODY REGIONS
        ↓
LANDMARK GROUP REDUCTION
        ↓
SEMANTIC ANCHOR SET
        ↓
MEASUREMENT CAPABILITY
        ↓
HumanObservationV02
        │
        │      LiveTargetV02
        │          ↑
        │      SelectedShotPlan
        │
        └──────────┬──────────
                   ↓
TARGET MEASUREMENT READINESS
                   ↓
LiveConstraintStateV01
                   ↓
CONSTRAINT RESOLVER
                   ↓
HUMAN STEP SERVO
                   ↓
Action
↓
Human Response
↓
Settle
↓
Re-observe
↓
Evaluate
↓
Next Constraint / VERIFY / READY
```

---

# 4. Subject Lock

Within-session subject continuity only.

States:

```text
ACQUIRING
LOCKED
HELD
REACQUIRING
LOST
UNKNOWN
```

No facial identity inference.

No silent multi-person switching.

Output concept:

```text
SubjectLockObservationV01 {
  state,
  confidence,
  subject_region,
  tracking_basis_version
}
```

---

# 5. Landmark Evidence

Raw Pose landmarks are evidence, not directly controller authority.

For each relevant point/group record bounded information such as:

```text
availability
confidence
x/y
freshness
edge proximity
crop risk
```

Key groups:

```text
HEAD_CORE
SHOULDERS
HIPS
KNEES
ANKLES
```

---

# 6. Observed Body Coverage

`ObservedBodyCoverage` is an Observation Summary inferred from the current video.

Possible summary values:

```text
HEAD_ONLY
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

It answers:

> What part of the person is currently represented by usable evidence?

It does not answer:

- whether this framing is aesthetically correct;
- whether the person is too close/far;
- whether the current Target is satisfied;
- whether more body must be shown.

Hard rule:

```text
DEFAULT_FULL_BODY_REQUIREMENT = NO
```

---

# 7. Semantic Body Regions

Body region evidence may include:

```text
HEAD
SHOULDERS
UPPER_TORSO
HIPS
KNEES
ANKLES
FEET
```

Possible evidence states:

```text
VISIBLE
PARTIAL
CROPPED
MISSING
LOW_CONFIDENCE
OCCLUDED_OR_UNKNOWN
```

Do not fabricate `OCCLUDED` when the local basis cannot distinguish it.

`UPPER_TORSO` is a derived region.

```text
UPPER_TORSO_BASIS = DERIVED
```

It is not an independent Pose landmark.

---

# 8. Landmark Group Reduction Strategy

A Semantic Anchor must use the reduction strategy appropriate for its landmark group type.

## 8.1 Bilateral two-point groups

Examples:

```text
SHOULDERS
HIPS
KNEES
ANKLES
```

If both required bilateral points are valid:

```text
center = pair_center(left, right)
quality = GOOD
```

If only partial bounded evidence exists:

```text
quality = MARGINAL / INVALID
```

according to the accepted Measurement rules.

Do not manufacture the missing side.

## 8.2 Multi-landmark groups

Example:

```text
HEAD_CORE
```

The accepted 05A rule is:

```text
HEAD_CORE_CENTER
=
centroid(valid bounded HEAD_CORE landmarks)
```

Hard prohibition:

```text
HEAD_CORE.pair_center
```

`HEAD_CORE` is not a two-point bilateral group.

## 8.3 General rule

```text
if group.type == BILATERAL_TWO_POINT
and required bilateral evidence is valid:
    use pair_center

elif group.type == MULTI_LANDMARK
and enough valid bounded points exist:
    use centroid / approved bounded weighted centroid

elif bounded partial rule exists:
    produce MARGINAL

else:
    INVALID / UNKNOWN
```

No one universal center-reduction method exists for all groups.

---

# 9. Semantic Anchor Set

Candidate anchors:

```text
HEAD_CENTER
EYE_LINE
SHOULDER_CENTER
TORSO_CENTER
HIP_CENTER
KNEE_CENTER
ANKLE_CENTER
FOOT_LINE
BODY_CENTER
```

Each anchor contains bounded:

```text
x
y
confidence
availability
basis
```

Anchors are Observation.

They do not contain:

```text
should_be_left
should_be_center
too_close
too_far
```

---

# 10. Measurement Capability

`MeasurementCapability` answers:

> Given what I currently observe, what target-relevant measurements can I reliably compute now?

Current accepted states:

```text
GOOD
MARGINAL
INVALID
```

Examples:

```text
HEAD_SIZE
EYE_LINE
TORSO_CENTER
HEAD_TO_HIP
HEAD_TO_KNEE
HEAD_TO_ANKLE
```

For 05A upper-body control:

```text
HEAD_TO_HIP
TORSO_CENTER
```

are the critical measurements.

## 10.1 Accepted head basis

`HEAD_TO_HIP` head endpoint must derive from valid `HEAD_CORE` centroid evidence, not `pair_center`.

## 10.2 Accepted hip basis

`HIPS` is bilateral evidence.

Conceptually distinguish:

```text
BILATERAL_VALID
UNILATERAL_PARTIAL
LOW_CONFIDENCE
EDGE_CROPPED
UNKNOWN
```

Only accepted precision quality may issue precision target-relative control.

---

# 11. HumanObservationV02

Canonical meaning:

```text
HumanObservationV02 {
  subject_lock,
  landmark_evidence_summary,
  observed_body_coverage,
  body_visibility,
  semantic_anchors,
  measurement_capability,
  crop_evidence,
  scale_measurements,
  motion_evidence,
  quality,
  fresh,
  stable,
  observation_version
}
```

It answers:

> What is true now?

It does not answer:

> Is this good relative to the target?

---

# 12. LiveTargetV02

LiveTarget is supplied externally by the selected Shot Plan / deterministic fixture.

Conceptually separate:

```text
coverage_expectation
measurement_requirements
scale_constraint
primary_anchor_constraint
secondary_constraints
pose_constraints
camera_constraints
control_actor
tolerance_profile
```

## 12.1 Coverage expectation

Describes the body extent the selected shot intends to include.

## 12.2 Measurement requirements

Describes the measurements Live must currently be able to calculate to control that target.

These are not the same object.

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

Do not gate on every coverage label being independently `VISIBLE` when the required measurements are already valid.

---

# 13. No universal best distance

Live does not judge an absolute best physical distance.

Only:

```text
Current semantic scale
vs
LiveTarget semantic scale
```

may produce:

```text
TOO_LARGE
IN_RANGE
TOO_SMALL
```

`DistanceProxy` remains primarily:

```text
MOTION_EVIDENCE
DIRECTION_VERIFICATION
RESPONSE_EVIDENCE
```

It is not a Target definition.

---

# 14. Target Measurement Readiness

Canonical question:

```text
Can the active Target be controlled using current valid measurements?
```

Not:

```text
Are all target body labels visible?
```

Example Upper Body:

```text
HEAD_TO_HIP = GOOD
TORSO_CENTER = GOOD
real crop invalidation = NO
```

then:

```text
TARGET_MEASUREMENT_READY = YES
```

The controller may proceed even though there is no direct `UPPER_TORSO` Pose landmark.

If a real crop invalidates the measurement:

```text
TARGET_MEASUREMENT_READY = NO
```

---

# 15. Constraint Resolver

Compatibility enum sequence remains:

```text
ACQUIRE_SUBJECT
↓
ACQUIRE_REQUIRED_BODY
↓
ADJUST_SCALE
↓
ALIGN_PRIMARY_ANCHOR
↓
ALIGN_SECONDARY_CONSTRAINT
↓
VERIFY
↓
READY_LATCHED
```

Canonical semantic correction:

```text
ACQUIRE_REQUIRED_BODY
=
ENSURE_TARGET_MEASURABILITY
```

It must not be interpreted as:

```text
ACQUIRE_FULL_BODY
```

or:

```text
ALL COVERAGE LABELS MUST BE VISIBLE
```

---

# 16. `ACQUIRE_REQUIRED_BODY` / Ensure Target Measurability

If target measurements are unavailable, identify the blocking evidence.

Examples:

```text
HEAD_TO_HIP INVALID because hip basis is genuinely cropped
→ guide required body extent into frame

HEAD_TO_HIP INVALID because head reduction was invalid
→ Measurement defect / no user movement instruction

TORSO_CENTER INVALID due bilateral hip confidence
→ bounded acquisition / measurement guidance
```

Missing body evidence alone does not prove `MOVE_FARTHER`.

---

# 17. ADJUST_SCALE

Use target-specific semantic metrics.

Examples:

```text
HEAD_SIZE
HEAD_TO_HIP
HEAD_TO_KNEE
HEAD_TO_ANKLE
BODY_BBOX_HEIGHT
```

Only compare measurements that are currently valid for the active target.

---

# 18. ALIGN_PRIMARY_ANCHOR

Target-relative only.

```text
delta_x = target_anchor_x - current_anchor_x
```

`TOO_LEFT / TOO_RIGHT` means:

> relative to current LiveTarget

not:

> relative to frame center.

No universal center authority.

---

# 19. Secondary Constraints

Examples:

```text
HEAD_CENTER.y
BODY_ORIENTATION
CAMERA_HEIGHT
```

Only one active high-priority correction at a time.

Respect `control_actor`:

```text
SUBJECT
CAMERA_OPERATOR
EITHER
```

Do not map unsupported camera corrections into fake subject movement.

---

# 20. Human Response Causality

Hard invariant:

```text
NO RESPONSE EVIDENCE
=
NO ACTION OUTCOME
```

Episode:

```text
ISSUED
↓
WAIT_FOR_RESPONSE
↓
WAIT_FOR_SETTLE
↓
EVALUATED
```

`response_observed = true` is required before settle/evaluation.

900 ms without response may change presentation only.

It may not create:

```text
TARGET_REACHED
IMPROVED
NO_EFFECT
WRONG_DIRECTION
new ControlEpoch
```

---

# 21. Passive Drift

Without response evidence:

```text
PASSIVE_RELATION_CHANGE
```

is diagnostic only.

Hard prohibition:

```text
movement_started_at = null
+
TARGET_REACHED
```

---

# 22. No Response

Long no-response may record:

```text
NO_RESPONSE
```

but:

```text
NO_RESPONSE != NO_EFFECT
NO_RESPONSE != WRONG_DIRECTION
NO_RESPONSE != INVALIDATED
```

No automatic ordinary reissue.

---

# 23. Metrics

Use:

```text
ISSUED_ACTIONS
RESPONDED_ACTIONS
NO_RESPONSE_ACTIONS
CAUSALLY_EVALUABLE_ACTIONS
INVALIDATED_ACTIONS
```

```text
ACTION_EFFECTIVENESS =
(TARGET_REACHED + IMPROVED)
/
CAUSALLY_EVALUABLE_ACTIONS
```

No-response actions do not enter the effectiveness denominator.

---

# 24. Presentation boundary

Live presentation is separately specified by:

```text
18_LIVE_V4_VISUAL_GUIDANCE_AND_OVERLAY_ALGORITHM_V02.md
```

The Presentation layer must consume the same authoritative Observation / Target / Constraint / Action state.

No second frontend control interpretation is allowed.

---

# 25. Current acceptance context

As of accepted 05A:

```text
UPPER_TORSO_BASIS = DERIVED
HIPS_EVIDENCE_CLASSIFICATION = PASS
MEASUREMENT_CAPABILITY = PASS
COVERAGE_MEASUREMENT_SEPARATION = PASS
HEAD_TO_HIP_READINESS = PASS
TORSO_CENTER_READINESS = PASS
TARGET_VALUES_CHANGED = NO
FIXED_CENTER_AUTHORITY = REMOVED
BODYMODE_DISTANCE_AUTHORITY = REMOVED
RESPONSE_GATE = PRESERVED
VERIFY_LOGIC = PRESERVED
```

Fresh OPPO `CENTER_UPPER_BODY` revalidation remains manual/pending.

---

# 26. 05E five-layer observation authority

The canonical V4 data flow is:

```text
Camera / Pose
  -> SubjectRecognitionStateV01
  -> ObservedBodyStateV01
       + TargetMeasurementRequirementV01
  -> TargetObservationGapV01
  -> Constraint Resolver / LivePresentationModelV02
```

Each layer owns one kind of truth and later layers must not rewrite earlier facts:

- `SubjectRecognitionStateV01` owns detection, lock, confidence, subject region and freshness only.
- `ObservedBodyStateV01` owns target-independent semantic regions, anchors, coverage, measurement capabilities and crop evidence.
- `TargetMeasurementRequirementV01` is projected from `LiveTargetV02` only and contains no current observation.
- `TargetObservationGapV01` is the sole `required - observed` computation and records bounded blocker reasons and actionability.
- Control consumes the gap plus target-relative constraints. Presentation consumes the same authoritative states and remains decision-free at render time.

Compatibility scalar aliases on `HumanObservationV02` are transitional trace/runtime accessors. They do not replace the nested canonical owners above.

Group reduction is explicit:

| Group | Type | Reduction |
|---|---|---|
| HEAD_CORE | MULTI_POINT | centroid of valid bounded points |
| SHOULDERS | BILATERAL_PAIR | pair center with valid bilateral evidence |
| HIPS | BILATERAL_PAIR | pair center with valid bilateral evidence |
| KNEES | BILATERAL_PAIR | pair center with valid bilateral evidence |
| ANKLES | BILATERAL_PAIR | pair center with valid bilateral evidence |

`bilateral_valid=false` is never crop evidence for a multi-point or single-point group. Global crop remains observation evidence; region crop requires region-local points at the asserted edge. For `CENTER_UPPER_BODY`, valid `HEAD_TO_HIP` and `TORSO_CENTER` capabilities make the target gap ready without knees, ankles or feet.

Only `USER_FIXABLE` gaps with a justified direction may produce movement guidance. `SYSTEM_MEASUREMENT_DEFECT` produces no user movement instruction. Normal copy recognizes the person and visible body evidence first and does not expose internal measurement or reduction identifiers.
