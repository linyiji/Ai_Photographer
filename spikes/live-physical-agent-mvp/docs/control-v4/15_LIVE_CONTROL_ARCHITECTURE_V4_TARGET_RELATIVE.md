# Live Control Architecture V4 — Human Observation + Target-relative Servo

V4 separates sensing facts from aesthetic intent:

`Camera/Pose → HumanObservationV02 → LiveTargetV02 → LiveConstraintStateV01 → HumanTargetRelativeServoV04 → Presentation`

## Contracts

- `SubjectLockObservationV01` tracks only within-session continuity. It makes no identity claim and supports one detected subject only.
- `BodyVisibilityGraphV01` records named visible regions and crop risk. `BodyMode` is retained only as a diagnostic summary.
- `SemanticAnchorSetV01` remains in `SENSOR_NORMALIZED_NON_MIRRORED`; preview mirroring never changes control meaning.
- `HumanObservationV02` contains current evidence only. It contains no `TOO_*` target judgment.
- `LiveTargetV02` is externally supplied. Fixtures define required body regions, primary anchor, target-relative X, scale metric/range, optional Y, and `control_actor`.
- `LiveConstraintStateV01` is the first layer allowed to compare Current with Target.

## Resolver order

`ACQUIRE_SUBJECT → ACQUIRE_REQUIRED_BODY → ADJUST_SCALE → ALIGN_PRIMARY_ANCHOR → ALIGN_SECONDARY_CONSTRAINT → VERIFY → READY_LATCHED`

Only one high-impact constraint can own the instruction at a time. Y exists in the contract, but when the supported fixture would require camera motion V4 reports the operator boundary instead of inventing a person action.

## Scale and position

X is `target_anchor_x - current_anchor_x`, never distance from frame center. Scale compares a target-selected semantic span (`HEAD_TO_HIP`, `HEAD_TO_KNEE`, or `HEAD_TO_ANKLE`) with the matching current span. `DistanceProxy` is response evidence only and `BodyMode` cannot decide closer/farther.

## Human causality

The only evaluable path is:

`ISSUED → WAIT_FOR_RESPONSE → WAIT_FOR_SETTLE → EVALUATED`

At 900 ms, no response may change presentation only. A long wait may record `NO_RESPONSE`, but cannot produce an outcome or a new epoch. Relation drift without motion evidence is `PASSIVE_RELATION_CHANGE` diagnostic only. Measurement loss cancels the epoch without fabricating an action result.

## Boundary

V4 remains local-device-only. Provider, Luna, backend per-frame calls, raw frame storage, raw landmark export, and raw upload remain zero. V4 is not integrated into Main by this task.

