# V4 body visibility and measurement readiness

## Separation

V4 keeps three distinct layers:

1. Landmark evidence: bounded scalar evidence for head, shoulders, hips, knees and ankles.
2. Semantic body regions: coverage labels used to describe which body extent is observed or expected.
3. Measurement capability: whether the selected target's anchor and scale can be measured safely now.

`BodyMode` remains summary-only. It is not a distance or readiness authority.

## Upper-body derivation

`UPPER_TORSO_BASIS = DERIVED`. Pose has no independent upper-torso landmark. V4 derives the region from bilateral shoulder and bilateral hip evidence plus crop consistency.

The head basis uses the centroid of valid `HEAD_CORE` landmarks. It must not use `HEAD_CORE.pair_center`, because that field only exists for two-landmark bilateral groups.

## MeasurementCapabilityV01

Each observation reports `GOOD`, `MARGINAL` or `INVALID` for:

- `HEAD_TO_HIP`
- `TORSO_CENTER`
- `HEAD_TO_KNEE`
- `HEAD_TO_ANKLE`

`GOOD` requires the relevant endpoints/anchor, fresh evidence and sufficient confidence. Unilateral or low-confidence evidence is `MARGINAL` and cannot issue precision control. A real top/bottom crop affecting the required span is `INVALID`.

For an upper-body target, acquisition ends only when `HEAD_TO_HIP` and `TORSO_CENTER` are both `GOOD` and no real bottom crop is present. The controller does not independently require an imaginary direct `UPPER_TORSO` marker.

## Coverage versus control

`coverage_satisfied` answers whether every semantic region named by the shot-plan fixture is currently visible. `measurement_ready` answers whether target-relative X and scale are currently measurable. `required_body_satisfied` remains as the presentation compatibility field and now mirrors `measurement_ready`.

The controller stage resolver is unchanged in order:

`ACQUIRE_SUBJECT → ACQUIRE_REQUIRED_BODY → ADJUST_SCALE → ALIGN_PRIMARY_ANCHOR → ALIGN_SECONDARY_CONSTRAINT → VERIFY → READY_LATCHED`

Targets, tolerances, 600 ms VERIFY evidence, 1000 ms unstable reset and response causality are unchanged.

## Trace

The scalar-only V4 trace includes subject lock, coverage status, measurement readiness, bounded landmark-basis summaries, upper-torso derivation, hip evidence classification, per-span readiness, blocking measurements and resolver stage. No frame, image, video or full raw landmark array is stored.
