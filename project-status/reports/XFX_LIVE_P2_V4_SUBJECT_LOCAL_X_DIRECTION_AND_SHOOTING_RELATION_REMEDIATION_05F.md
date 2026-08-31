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
| CENTER_X_DEVICE_REVALIDATION | PASS / ONE IMPROVED X EPISODE |
| WRONG_PHYSICAL_DIRECTION | 0 |
| TARGET_VALUES_CHANGED | NO |
| SCALE_MAPPING_CHANGED | NO |
| FIVE_LAYER_MODEL | UNCHANGED |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| NO_RESPONSE_OUTCOME / NO_RESPONSE_REISSUE | 0 / 0 |
| MULTI_TARGET_GATE | NOT_STARTED |
| MAIN_INTEGRATION | NOT_STARTED |
| PROVIDER / BACKEND_PER_FRAME / LUNA / RAW_UPLOAD | 0 / 0 / 0 / 0 |
| AUTOMATED_REGRESSION | 284/284 PASS |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 51 modules |
| BROWSER_GATE | PASS |

## Audit and root cause

The old chain converted `TOO_HIGH` directly to `MOVE_LEFT_SMALL` and `TOO_LOW` directly to `MOVE_RIGHT_SMALL`. Those action names were simultaneously used as subject-local copy and fixed arrow direction. Preview mirroring was not the direct cause; the missing layer was the transform between desired sensor movement and the photographed person's own horizontal direction.

The accepted 05E trace contains six evaluated X episodes requiring negative sensor movement. Every episode issued subject-left and every observed settled sensor delta was positive. Outcomes were four `WRONG_DIRECTION`, two `NO_EFFECT`, zero `IMPROVED` and zero `TARGET_REACHED`. Scale evidence remained independently functional.

## Bounded remediation

The controller now distinguishes canonical sensor X, mirrored display X and subject-local physical X. `SubjectPhysicalDirectionMapperV01` consumes desired sensor sign, control actor, shooting relation and camera facing. For a subject facing the camera it maps positive sensor movement to subject-left and negative sensor movement to subject-right. Camera-operator movement is explicit; ambiguous or unknown relations are unsupported and cannot issue X instructions.

The action, primary copy, overlay copy and voice copy share one physical action. The arrow applies preview mirroring once to the desired sensor sign. The scalar trace records the direction decision and immutable episode action.

## Remaining device gate

Two labeled, non-control front-camera calibration traces remain required: deliberate subject-own-left and subject-own-right. Their sensor deltas must be stable and opposite. The dedicated `V4_X_DEVICE_SINGLE_STEP` Center Upper Body correction has now passed with one detected, error-reducing response; READY was not required. A contradictory fresh calibration stops the task as FAIL; no alternate inversion may be guessed.

## Fresh OPPO evidence and correction

Four fresh traces were audited. The left calibration contained only 35 finite target-anchor rows before target measurement loss; the right calibration contained zero finite target-anchor rows. Because the original calibration surface had no baseline/movement/settle lifecycle, neither is admissible evidence for a physical-direction sign.

The second single-step trace is admissible Center X evidence: one `MOVE_LEFT_SMALL` Episode detected a positive Sensor-X response, moved approximately `0.353 -> 0.564`, reduced absolute target error approximately `0.147 -> 0.064`, and terminated `IMPROVED` with wrong direction 0. Therefore `CENTER_X_DEVICE_REVALIDATION=PASS`, while both explicit calibration signs remain `SOURCE_REQUIRED`.

Commit `8f9a6e4` adds a bounded calibration lifecycle and audit telemetry. Calibration now reports baseline acquisition, labeled movement, settling and a terminal signed Sensor-X delta; invalid target measurement is reported explicitly and cannot invent a sign. Scalar rows include `armed`, `trial_id`, `ready_hold_elapsed_ms` and calibration state. The single-step UI now exposes immediate ARMED state and retains an explicit completed-result message after intentional auto-disarm. Target, scale, five-layer observation/gap, response causality and VERIFY logic were not changed.
