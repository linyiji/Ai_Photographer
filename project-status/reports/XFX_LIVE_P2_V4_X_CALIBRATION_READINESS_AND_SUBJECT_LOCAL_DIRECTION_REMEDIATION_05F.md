# XFX_LIVE_P2_V4_X_CALIBRATION_READINESS_AND_SUBJECT_LOCAL_DIRECTION_REMEDIATION_05F

## Result

| Field | Result |
|---|---|
| TASK_RESULT | FAIL / FRESH DEVICE PHASE B INCOMPLETE |
| ROOT_CAUSE | X_CALIBRATION_OVERCOUPLED_TO_FULL_PHOTOGRAPHY_TARGET_GATE |
| X_CALIBRATION_REQUIREMENT | PASS |
| CALIBRATION_TARGET_GAP_DEPENDENCY | REMOVED |
| X_CALIBRATION_REQUIRES_HIPS | NO |
| X_CALIBRATION_REQUIRES_SCALE | NO |
| X_CALIBRATION_ANCHOR | SHOULDER_CENTER |
| HEAD_SHOULDERS_UPPER_BODY_SEPARATION | PASS |
| HEAD_SHOULDERS_TARGET_REQUIRES_HIPS | NO |
| CENTER_UPPER_BODY_SEMANTICS | PRESERVED |
| SUBJECT_LEFT_SENSOR_SIGN | POSITIVE / FRESH SHOULDER-CENTER DEVICE TRACE / DELTA +0.110091 |
| SUBJECT_RIGHT_SENSOR_SIGN | SOURCE_REQUIRED / FRESH ATTEMPT LOST HEAD+SHOULDER VALIDITY BEFORE SETTLEMENT |
| OPPOSITE_SIGN_CALIBRATION | NOT_EXERCISED |
| SUBJECT_LOCAL_DIRECTION_MAPPING | NOT_EXERCISED / NO NEW INVERSION |
| DISPLAY_MIRROR_MAPPING | PASS |
| DOUBLE_MIRROR_INVERSION | 0 |
| CENTER_X_TARGET_ERROR_REDUCTION | NOT_EXERCISED / SUBMITTED TRACE INADMISSIBLE AFTER PHASE B FAILURE |
| WRONG_PHYSICAL_DIRECTION | 0 / HISTORICAL ACCEPTED CENTER X EPISODE |
| FIVE_LAYER_MODEL | UNCHANGED |
| TARGET_VALUES_CHANGED | NO |
| SCALE_MAPPING_CHANGED | NO |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| MULTI_TARGET_GATE | NOT_STARTED |
| MAIN_INTEGRATION | NOT_STARTED |
| IMPLEMENTATION_HEAD | a8fc8ef |
| AUTOMATED_REGRESSION | 287/287 PASS |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 52 MODULES |
| MOBILE_BROWSER_SMOKE | PASS / ZERO CONSOLE WARNING OR ERROR |
| FRESH_DEVICE_PHASE_A | PASS / RESPONSE + SETTLED / POSITIVE |
| FRESH_DEVICE_PHASE_B | FAIL / INCOMPLETE / RESPONSE FALSE / SETTLED FALSE / SIGN UNKNOWN |
| FRESH_DEVICE_PHASE_C | NOT_EXERCISED / 3 CANCELLED EPISODES / 0 EVALUATED |
| DEVICE_PERFORMANCE_WARNING | VISION 5.70-6.03 HZ / INFERENCE P95 194.8-227.5 MS |
| RAW_MEDIA_PROVIDER_BACKEND_LUNA | 0 / 0 / 0 / 0 |

## Architecture correction

The old calibration Session consumed the full product `V4Snapshot`, used the selected photography Target's `primary_anchor=TORSO_CENTER`, and rejected every observation for which `TargetObservationGap.ready=false`. For `CENTER_UPPER_BODY`, that transitively required hips, `HEAD_TO_HIP`, `TORSO_CENTER`, and Scale readiness. This was an invalid dependency for a task whose only question is the Sensor-X sign of the photographed person's labeled left/right movement.

`XCalibrationRequirementV01` is now an independent `ControlTaskRequirementV01`-class boundary over target-independent `HumanObservationV02`. It requires subject lock, valid head, bilateral-valid shoulders, finite/confident `SHOULDER_CENTER`, fresh evidence and a stable baseline. It explicitly serializes target-gap, hip and Scale dependencies as false. `SubjectXCalibrationSessionV01.update` accepts only the observation, so calibration cannot silently recover the old product-gate coupling.

The anchor is `SHOULDER_CENTER.x` in canonical non-mirrored Sensor coordinates. Calibration records a unique action ID, subject-local label, before/after Sensor X, signed delta, response detection and stable settlement. UI prompts use “向你自己的左边” and “向你自己的右边”. Front mirror affects only display projection.

## Preserved product truth

The five-layer model remains unchanged. `HEAD_SHOULDERS` means head plus bilateral shoulders and needs no hips. Existing `CENTER_UPPER_BODY` still means head-to-hip upper-body framing, uses `HEAD_TO_HIP` and `TORSO_CENTER`, and may remain not ready without hips. No new head-and-shoulders Target Scale metric is invented. Target values, Scale direction mapping, response causality and VERIFY are unchanged.

## Verification

Automated tests prove calibration-ready with valid head/shoulders while hips are missing and `HEAD_TO_HIP` is invalid; not-ready when `SHOULDER_CENTER` is invalid; and normal `CENTER_UPPER_BODY` still not-ready without hips. A scalar Trace test records `target_observation_gap.ready=false` concurrently with `x_calibration_ready=true`, establishing coupling count 0. Full suite is 287/287 PASS; TypeScript and production build / 52 modules pass. Mobile browser Smoke shows only head-and-shoulders calibration instructions and zero console warning/error.

## Fresh device gate result

Phase A LEFT passed on `live-p2-v4-v4_x_calibrate_subject_left-1788179406826.json`: action `X_CAL_LEFT_1` completed from Sensor X `0.591067` to `0.701158`, producing delta `+0.110091`, response observed and a settled endpoint. All 82 calibration-ready rows occurred while the product Target gap was false, directly proving the removed coupling on device.

Phase B RIGHT failed on `live-p2-v4-v4_x_calibrate_subject_right-1788179430225.json`. A baseline at `0.421015` existed, but the session remained in `MOVE_LABELED_DIRECTION`; the final observation had invalid head and bilateral-shoulder structure, no accepted response, no settled endpoint and sign `UNKNOWN`. The changed instantaneous Sensor X is not sufficient to infer a sign from structurally invalid evidence.

The serial Gate therefore stopped before Phase C. `live-p2-v4-v4_x_device_single_step-1788179452704.json` and its byte-identical `(1)` copy are counted once and rejected as Phase C acceptance: three X Episodes were cancelled, zero responded, zero were evaluated and no target-error reduction was established. Its final `READY_LATCHED` with a false Target gap, unsatisfied required body, null anchor and unknown X relation is recorded as a separate READY-causality diagnostic warning.

Repeat only Phase B with a smaller subject-own-right movement while the full head and both shoulders remain visible, then remain still until the UI reports `COMPLETE`. Phase C must not resume until the right trace provides a settled sign opposite the accepted left positive sign. No implementation change, mapper inversion, multi-target work or next task is started from this failed attempt.
