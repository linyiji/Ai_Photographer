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
| SUBJECT_LEFT_SENSOR_SIGN | PASS / POSITIVE SENSOR X DELTA +0.079071 |
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
| 05F_COMPACT_DEVICE_SURFACE | PASS / LEGACY NODES RETAINED AND TOGGLEABLE |

## Audit and root cause

The old chain converted `TOO_HIGH` directly to `MOVE_LEFT_SMALL` and `TOO_LOW` directly to `MOVE_RIGHT_SMALL`. Those action names were simultaneously used as subject-local copy and fixed arrow direction. Preview mirroring was not the direct cause; the missing layer was the transform between desired sensor movement and the photographed person's own horizontal direction.

The accepted 05E trace contains six evaluated X episodes requiring negative sensor movement. Every episode issued subject-left and every observed settled sensor delta was positive. Outcomes were four `WRONG_DIRECTION`, two `NO_EFFECT`, zero `IMPROVED` and zero `TARGET_REACHED`. Scale evidence remained independently functional.

## Bounded remediation

The controller now distinguishes canonical sensor X, mirrored display X and subject-local physical X. `SubjectPhysicalDirectionMapperV01` consumes desired sensor sign, control actor, shooting relation and camera facing. For a subject facing the camera it maps positive sensor movement to subject-left and negative sensor movement to subject-right. Camera-operator movement is explicit; ambiguous or unknown relations are unsupported and cannot issue X instructions.

The action, primary copy, overlay copy and voice copy share one physical action. The arrow applies preview mirroring once to the desired sensor sign. The scalar trace records the direction decision and immutable episode action.

## Remaining device gate

The labeled subject-own-left front-camera calibration now passes with a stable positive Sensor-X delta. The subject-own-right calibration remains required and must complete with a stable opposite negative delta. The dedicated `V4_X_DEVICE_SINGLE_STEP` Center Upper Body correction has already passed with one detected, error-reducing response; READY was not required. A contradictory fresh right calibration stops the task as FAIL; no alternate inversion may be guessed.

## Fresh OPPO evidence and correction

Four fresh traces were audited. The left calibration contained only 35 finite target-anchor rows before target measurement loss; the right calibration contained zero finite target-anchor rows. Because the original calibration surface had no baseline/movement/settle lifecycle, neither is admissible evidence for a physical-direction sign.

The second single-step trace is admissible Center X evidence: one `MOVE_LEFT_SMALL` Episode detected a positive Sensor-X response, moved approximately `0.353 -> 0.564`, reduced absolute target error approximately `0.147 -> 0.064`, and terminated `IMPROVED` with wrong direction 0. Therefore `CENTER_X_DEVICE_REVALIDATION=PASS`; at that checkpoint, both explicit calibration signs remained `SOURCE_REQUIRED`. The fresh evidence below supersedes the left-sign checkpoint only.

Commit `8f9a6e4` adds a bounded calibration lifecycle and audit telemetry. Calibration now reports baseline acquisition, labeled movement, settling and a terminal signed Sensor-X delta; invalid target measurement is reported explicitly and cannot invent a sign. Scalar rows include `armed`, `trial_id`, `ready_hold_elapsed_ms` and calibration state. The single-step UI now exposes immediate ARMED state and retains an explicit completed-result message after intentional auto-disarm. Target, scale, five-layer observation/gap, response causality and VERIFY logic were not changed.

## Fresh device evidence and presentation reduction

The fresh left calibration completed with baseline Sensor X `0.569638`, settled Sensor X `0.648709`, delta `+0.079071`, sign `POSITIVE` and status `VALID`. This is admissible `SUBJECT_LEFT_SENSOR_SIGN=PASS` evidence.

The fresh right calibration stopped before a settled endpoint: baseline `0.213743`, terminal phase `MOVE_LABELED_DIRECTION`, sign `UNKNOWN`, and target measurement not ready at export. It remains `SOURCE_REQUIRED` and is not treated as a negative sign.

The fresh file labeled single-step contains a Scale action (`MOVE_CLOSER_SMALL`) rather than an X Episode and ended `NO_EFFECT`. It is excluded from the Center X decision and does not overwrite the previously accepted improved X Episode. The supporting Center Upper Body trace reached four of four targets with wrong direction 0 and final `READY_LATCHED`.

Commit `7dbe187` reduces the default 05F device UI without deleting diagnostic nodes. Only left calibration, right calibration and Center X revalidation are shown by default; the complete HUD, controller fields and legacy scenario groups remain available through `显示完整调试`, and all scalar telemetry continues to be recorded. This is presentation-only: target values, Scale mapping, five-layer observation/gap, response gate, VERIFY and direction transforms are unchanged. Regression remains 284/284 PASS, TypeScript PASS, production build PASS / 51 modules, mobile browser Smoke PASS with zero console warning/error.
