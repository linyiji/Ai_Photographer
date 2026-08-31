# XFX_LIVE_P2_V4_SUBJECT_LOCAL_X_DIRECTION_AND_SHOOTING_RELATION_REMEDIATION_05F

## Disposition

| Field | Result |
|---|---|
| TASK_RESULT | MANUAL_REVIEW_REQUIRED |
| 05E_DEVICE_MEASUREMENT_GATE | PASS_WITH_WARNING |
| X_DIRECTION_ROOT_CAUSE | SENSOR_X_AND_SUBJECT_LOCAL_X_TREATED_AS_SAME_AXIS / SHOOTING_RELATION_ABSENT |
| SENSOR_X_AUTHORITY | PASS |
| DISPLAY_X_AUTHORITY | PASS |
| SUBJECT_LOCAL_X_AUTHORITY | PASS (implementation) |
| SHOOTING_RELATION_TRANSFORM | PASS (deterministic) |
| SUBJECT_LEFT_SENSOR_SIGN | SOURCE_REQUIRED |
| SUBJECT_RIGHT_SENSOR_SIGN | SOURCE_REQUIRED |
| OLD_DIRECTION_MAPPING | INVERTED |
| DOUBLE_MIRROR_INVERSION | 0 |
| 05E_X_WRONG_DIRECTION_RECONSTRUCTION | PASS |
| ACTION_ARROW_TEXT_VOICE_ALIGNMENT | PASS |
| CENTER_X_DEVICE_REVALIDATION | MANUAL_REVIEW_REQUIRED |
| WRONG_PHYSICAL_DIRECTION | NOT_EXERCISED |
| TARGET_VALUES_CHANGED | NO |
| SCALE_MAPPING_CHANGED | NO |
| FIVE_LAYER_MODEL | UNCHANGED |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| NO_RESPONSE_OUTCOME / NO_RESPONSE_REISSUE | 0 / 0 |
| MULTI_TARGET_GATE | NOT_STARTED |
| MAIN_INTEGRATION | NOT_STARTED |
| PROVIDER / BACKEND_PER_FRAME / LUNA / RAW_UPLOAD | 0 / 0 / 0 / 0 |
| AUTOMATED_REGRESSION | 281/281 PASS |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 50 modules |
| BROWSER_GATE | PASS |

## Audit and root cause

The old chain converted `TOO_HIGH` directly to `MOVE_LEFT_SMALL` and `TOO_LOW` directly to `MOVE_RIGHT_SMALL`. Those action names were simultaneously used as subject-local copy and fixed arrow direction. Preview mirroring was not the direct cause; the missing layer was the transform between desired sensor movement and the photographed person's own horizontal direction.

The accepted 05E trace contains six evaluated X episodes requiring negative sensor movement. Every episode issued subject-left and every observed settled sensor delta was positive. Outcomes were four `WRONG_DIRECTION`, two `NO_EFFECT`, zero `IMPROVED` and zero `TARGET_REACHED`. Scale evidence remained independently functional.

## Bounded remediation

The controller now distinguishes canonical sensor X, mirrored display X and subject-local physical X. `SubjectPhysicalDirectionMapperV01` consumes desired sensor sign, control actor, shooting relation and camera facing. For a subject facing the camera it maps positive sensor movement to subject-left and negative sensor movement to subject-right. Camera-operator movement is explicit; ambiguous or unknown relations are unsupported and cannot issue X instructions.

The action, primary copy, overlay copy and voice copy share one physical action. The arrow applies preview mirroring once to the desired sensor sign. The scalar trace records the direction decision and immutable episode action.

## Remaining device gate

Two labeled, non-control front-camera calibration traces are required: deliberate subject-own-left and subject-own-right. Their sensor deltas must be stable and opposite. After calibration confirms the transform, exactly one Center Upper Body X correction must reduce absolute sensor target error after a detected response. READY is not required. A contradictory calibration or one wrong correction stops the task as FAIL; no alternate inversion may be guessed.
