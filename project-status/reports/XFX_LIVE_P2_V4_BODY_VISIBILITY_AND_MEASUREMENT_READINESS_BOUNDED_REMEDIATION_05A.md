# XFX_LIVE_P2_V4_BODY_VISIBILITY_AND_MEASUREMENT_READINESS_BOUNDED_REMEDIATION_05A

## Result

`TASK_RESULT = MANUAL_REVIEW_REQUIRED`

Implementation and deterministic gates pass. Fresh OPPO `CENTER_UPPER_BODY` evidence is still required for the device hard check.

| Output | Result |
|---|---|
| UPPER_TORSO_BASIS | DERIVED |
| BODY_VISIBILITY_GRAPH | PASS_WITH_WARNING — single-person Pose and device revalidation pending |
| HIPS_EVIDENCE_CLASSIFICATION | PASS |
| MEASUREMENT_CAPABILITY | PASS |
| COVERAGE_MEASUREMENT_SEPARATION | PASS |
| HEAD_TO_HIP_READINESS | PASS |
| TORSO_CENTER_READINESS | PASS |
| FALSE_REQUIRED_BODY_DEADLOCK | DEVICE CHECK PENDING; automated 0 |
| TARGET_VALUES_CHANGED | NO |
| FIXED_CENTER_AUTHORITY | REMOVED |
| BODYMODE_DISTANCE_AUTHORITY | REMOVED |
| RESPONSE_GATE | PRESERVED |
| VERIFY_LOGIC | PRESERVED |
| AUTOMATED_REGRESSION | 257/257 PASS |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 44 MODULES |
| BROWSER | 6/6 PASS / ZERO CONSOLE ERROR |
| CENTER_UPPER_BODY_DEVICE_REVALIDATION | MANUAL_REVIEW_REQUIRED |
| V4_DEVICE_PROGRAM | REQUIRES_REVISION UNTIL DEVICE CHECK |
| MAIN_INTEGRATION | NOT_STARTED |
| PROVIDER / BACKEND_PER_FRAME / LUNA / RAW_UPLOAD | 0 / 0 / 0 / 0 |

## Defect and correction

`HEAD_CORE.pair_center` was an invalid assumption because the head group is not a two-point bilateral group. The projector now consumes a bounded centroid generated from valid head-core evidence. Measurement readiness is explicit and separate from semantic shot coverage. One-sided/low-confidence hip evidence remains non-actionable, and genuine bottom crop remains `NOT_READY`.

No V4 redesign was performed. Target X/scale values, tolerances, constraint order, actor boundary, response causality, VERIFY 600 ms and unstable reset 1000 ms remain unchanged.
