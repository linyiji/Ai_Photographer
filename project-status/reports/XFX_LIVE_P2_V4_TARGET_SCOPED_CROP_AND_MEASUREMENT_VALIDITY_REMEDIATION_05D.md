# XFX_LIVE_P2_V4_TARGET_SCOPED_CROP_AND_MEASUREMENT_VALIDITY_REMEDIATION_05D

## Disposition

| Field | Result |
|---|---|
| TASK_RESULT | MANUAL_REVIEW_REQUIRED |
| ROOT_CAUSE | GLOBAL_BOTTOM_CROP_OVERAPPLIED_TO_TARGET_MEASUREMENTS |
| GLOBAL_CROP_EVIDENCE | PRESERVED |
| REGION_SCOPED_CROP | PASS |
| MEASUREMENT_SCOPED_CROP | PASS |
| HIPS_GLOBAL_CROP_INHERITANCE | REMOVED |
| HEAD_TO_HIP_CROP_SCOPE | PASS |
| TORSO_CENTER_CROP_SCOPE | PASS |
| HEAD_TO_KNEE_CROP_SCOPE | PASS |
| HEAD_TO_ANKLE_CROP_SCOPE | PASS |
| TARGET_SCOPED_CROP_VALIDITY | PASS |
| 05C_REGRESSION_FIXTURE | PASS |
| UPPER_BODY_WITH_LOWER_CROP | PASS |
| THREE_QUARTER_WITH_ANKLES_OUT | PASS |
| FULL_BODY_WITH_ANKLES_OUT | NOT_READY |
| BODY_COVERAGE_GUIDE_RELEASE | PASS (automated/browser) |
| TARGET_VALUES_CHANGED | NO |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| AUTOMATED_REGRESSION | 264/264 PASS |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 46 modules |
| BROWSER_GATE | PASS / ADJUST_SCALE |
| CENTER_UPPER_BODY_OPPO_REVALIDATION | MANUAL_REVIEW_REQUIRED |
| MEASUREMENT_READY_OBSERVED | NOT_EXERCISED |
| ACQUIRE_REQUIRED_BODY_RELEASED | NOT_EXERCISED |
| V4_DEVICE_PROGRAM | MANUAL_REVIEW_REQUIRED |
| PROVIDER / BACKEND_PER_FRAME / LUNA / RAW_UPLOAD | 0 / 0 / 0 / 0 |
| MAIN_INTEGRATION | NOT_STARTED |

## 05C root cause and old propagation path

The accepted OPPO 05C trace contained 427 locked rows. In 27 THREE_QUARTER rows, bilateral hips were finite and high-confidence at approximately sensor y=0.846. The old projector nevertheless propagated the global bottom-crop flag directly into HIPS, UPPER_TORSO, KNEES and ANKLES and then into every span readiness. The resolver added an additional target-independent `REAL_BOTTOM_CROP` blocker. This kept all 427 rows in `ACQUIRE_REQUIRED_BODY`.

## New applicability model

Global crop remains observation evidence. Region crop now requires evidence that the semantic region itself is at/affected by the asserted sensor edge. Measurement readiness uses an explicit `MeasurementDefinitionV01` map:

| Measurement | Crop dependencies |
|---|---|
| HEAD_TO_HIP | HEAD + HIPS |
| TORSO_CENTER | SHOULDERS + HIPS |
| HEAD_TO_KNEE | HEAD + KNEES |
| HEAD_TO_ANKLE | HEAD + ANKLES |

The generic resolver blocker was removed. A crop below the hips can no longer invalidate an Upper Body measurement; a crop of the hip itself still does. The same endpoint rule applies to knee and ankle measurements.

## 05C sanitized scalar fixture

The fixture records no real frame, video or full landmark stream. It retains only the counterexample's bounded scalars: global bottom crop, valid bilateral hips at y=0.846, valid head/shoulder/hip geometry, knees present and ankles absent. Center Upper Body resolves `HEAD_TO_HIP=GOOD`, `TORSO_CENTER=GOOD`, `measurement_ready=true` and proceeds to `ADJUST_SCALE`.

## Target-differentiated matrix

For one observation with good head/shoulders/hips/knees, missing ankles and global bottom crop:

- Upper Body: ready for control.
- Three Quarter: ready for control.
- Full Body: not ready because `HEAD_TO_ANKLE` is invalid.

Regression also proves actual hip, knee and ankle edge crop invalidates its corresponding measurement.

## Browser result

The production build route `?v4CropGate=05C` returned `v4CropGate=PASS`, `v4CropStage=ADJUST_SCALE`, and `v4CropGlobalBottom=true`. This proves the acquisition guide releases while truthful global crop evidence remains.

## Device boundary

Automated and browser evidence cannot substitute for fresh OPPO evidence. One Center Upper Body run is required; the subject does not need to show full body. Device success requires at least one fresh scalar row with measurement ready and a stage downstream of ACQUIRE_REQUIRED_BODY. READY is explicitly not required. The larger multi-target gate remains stopped.
