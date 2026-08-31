# Live V4 current-position decision logic

## 1. Current Observation (no Target meaning)

Each bounded Pose result is converted to `HumanObservationV02`:

1. `SubjectLockObservationV01`: `ACQUIRING / LOCKED / HELD / REACQUIRING / LOST`. It is within-session continuity only, supports one detected subject, and makes no identity claim.
2. `BodyVisibilityGraphV01`: named evidence for head, shoulders, upper torso, hips, knees, ankles and feet, including crop risk. `BodyMode` is diagnostic summary only.
3. `SemanticAnchorSetV01`: head, shoulder, torso, hip, knee and ankle centers in `SENSOR_NORMALIZED_NON_MIRRORED` coordinates.
4. Scale spans: `HEAD_TO_HIP`, `HEAD_TO_KNEE`, `HEAD_TO_ANKLE` from matching semantic anchors.
5. Motion: X/scale direction and velocity. `DistanceProxy` is response evidence only.

No `TOO_LEFT / TOO_RIGHT / TOO_CLOSE / TOO_FAR` exists in the observation layer.

## 2. Active Target

| Target | X | X tolerance | Required body | Scale |
|---|---:|---:|---|---|
| CENTER_UPPER_BODY | 0.50 | ±0.055 | head, shoulders, upper torso, hips | HEAD_TO_HIP 0.42 ±0.07 |
| LEFT_THIRD_UPPER_BODY | 0.33 | ±0.055 | head, shoulders, upper torso, hips | HEAD_TO_HIP 0.42 ±0.07 |
| RIGHT_THIRD_UPPER_BODY | 0.67 | ±0.055 | head, shoulders, upper torso, hips | HEAD_TO_HIP 0.42 ±0.07 |
| CENTER_THREE_QUARTER | 0.50 | ±0.055 | through knees | HEAD_TO_KNEE 0.62 ±0.08 |
| LEFT_THIRD_FULL_BODY | 0.33 | ±0.055 | through feet | HEAD_TO_ANKLE 0.80 ±0.09 |
| RIGHT_THIRD_FULL_BODY | 0.67 | ±0.055 | through feet | HEAD_TO_ANKLE 0.80 ±0.09 |

These are deterministic acceptance fixtures, not universal photography rules.

## 3. Constraint Resolver

Only `LiveConstraintStateV01` compares Current with Target, in this strict order:

1. `ACQUIRE_SUBJECT`: subject is not locked/reacquired.
2. `ACQUIRE_REQUIRED_BODY`: one or more Target-required body regions are not visible.
3. `ADJUST_SCALE`: matching semantic scale is outside the Target interval.
4. `ALIGN_PRIMARY_ANCHOR`: torso X is outside the Target interval.
5. `ALIGN_SECONDARY_CONSTRAINT`: optional Y is outside range; unsupported camera/operator movement does not become a fake subject instruction.
6. `VERIFY`: all required constraints are satisfied.
7. `READY_LATCHED`: verification evidence reaches the Target hold and the final sample is stable.

## 4. Action mapping

- Current scale below target range → `MOVE_CLOSER_SMALL`.
- Current scale above target range → `MOVE_FARTHER_SMALL`.
- Current torso X below current target range → move toward larger sensor X (`MOVE_RIGHT_SMALL`).
- Current torso X above current target range → move toward smaller sensor X (`MOVE_LEFT_SMALL`).

Front-camera mirroring changes display projection only. It never changes sensor-space relation or physical instruction meaning.

## 5. VERIFY and READY

Target/deadband satisfaction is not widened. While every constraint remains satisfied, stable `GOOD` samples accumulate 600 ms of evidence. A brief unstable gap pauses accumulation instead of restarting from zero; continuous instability for 1000 ms resets it. READY still requires the current/final sample to be stable and `GOOD`.

The UI reports either exact progress (`稳定确认 n / 600 ms`) or `位置已满足，检测到轻微移动，请停稳`, so VERIFY no longer looks frozen.

## 6. Human-response causality

`ISSUED → WAIT_FOR_RESPONSE → WAIT_FOR_SETTLE → EVALUATED`

- 900 ms without motion: presentation reminder only.
- Long no-response: records `NO_RESPONSE`; no outcome and no new epoch.
- Relation drift without motion: diagnostic `PASSIVE_RELATION_CHANGE` only.
- `response_observed=false` can never reach `EVALUATED`.

## 7. Overlay boundary

V4 hides the MODE/BodyMode debug card, raw pose debug rectangle, semantic debug point and conventional Target/acceptable rectangle. The latter cannot truthfully represent a semantic anchor plus a body-span target. The green subject box uses the stabilized semantic display path and appears only after subject lock and required-body satisfaction.

