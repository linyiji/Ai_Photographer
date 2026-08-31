# XFX_LIVE_P2_V4_TARGET_SCOPED_CROP_AND_MEASUREMENT_VALIDITY_REMEDIATION_05D

## Disposition

| Field | Result |
|---|---|
| TASK_RESULT | FAIL |
| ROOT_CAUSE | GLOBAL_BOTTOM_CROP_OVERAPPLIED_TO_TARGET_MEASUREMENTS |
| GLOBAL_CROP_EVIDENCE | PRESERVED |
| REGION_SCOPED_CROP | FAIL — HEAD_CORE inherited global bottom crop via bilateral fallback |
| MEASUREMENT_SCOPED_CROP | FAIL — HEAD_TO_HIP remained blocked on device |
| HIPS_GLOBAL_CROP_INHERITANCE | REMOVED |
| HEAD_TO_HIP_CROP_SCOPE | FAIL |
| TORSO_CENTER_CROP_SCOPE | PASS |
| HEAD_TO_KNEE_CROP_SCOPE | PASS |
| HEAD_TO_ANKLE_CROP_SCOPE | PASS |
| TARGET_SCOPED_CROP_VALIDITY | PASS |
| 05C_REGRESSION_FIXTURE | PASS |
| UPPER_BODY_WITH_LOWER_CROP | PASS |
| THREE_QUARTER_WITH_ANKLES_OUT | PASS |
| FULL_BODY_WITH_ANKLES_OUT | NOT_READY |
| BODY_COVERAGE_GUIDE_RELEASE | FAIL (device) |
| TARGET_VALUES_CHANGED | NO |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| AUTOMATED_REGRESSION | 264/264 PASS |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 46 modules |
| BROWSER_GATE | PASS / ADJUST_SCALE |
| CENTER_UPPER_BODY_OPPO_REVALIDATION | FAIL |
| MEASUREMENT_READY_OBSERVED | NO — 0/406 |
| ACQUIRE_REQUIRED_BODY_RELEASED | NO — 389/406 ACQUIRE_REQUIRED_BODY |
| V4_DEVICE_PROGRAM | REQUIRES_REVISION |
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

## Fresh OPPO result

The fresh OPPO K11 trace `live-p2-v4-v4_center_upper_body-1788165652825.json` (SHA-256 `A1CDCE40B7626976CC02ABCE9E0022DC104CD8E647AB74336C60A28ABE380E64`) contains 406 scalar rows over 61.38 seconds. Subject detection worked: detected ratio was 99.49%, with 385 LOCKED rows. The system also recorded observed extent: 219 HEAD_SHOULDERS, 142 UPPER_BODY and 26 THREE_QUARTER summaries; 146 rows had bilateral valid hips and 326 had bilateral valid shoulders.

The Gate still failed. Measurement ready was never true, and 389 rows remained ACQUIRE_REQUIRED_BODY. There were 134 rows with `TORSO_CENTER=GOOD` but `HEAD_TO_HIP=INVALID`.

## Newly exposed defect

The new region-edge helper treated `!group.bilateral_valid` as proof that every globally asserted edge affected that region. `HEAD_CORE` is a centroid/multi-landmark group and is intentionally not bilateral. Therefore all 168 global-bottom-crop rows classified HEAD as `EDGE_CROPPED/BOTTOM`; all 146 rows where shoulders and hips were simultaneously bilateral-valid inherited this false HEAD crop. This is not a user positioning failure and must not be presented as “please show head/shoulders/hips.”

## Required decision layering

The next bounded remediation must make the processing order explicit and auditable:

1. **SubjectRecognitionState** — detected, lock state and confidence.
2. **ObservedBodyState** — accepted/partial/low-confidence/edge-cropped regions and observed coverage, independent of target.
3. **TargetMeasurementRequirement** — required anchors, regions and measurement definitions for the selected target.
4. **TargetObservationGap** — required minus observed, with explicit blocking reasons.
5. **Control and presentation** — acquisition guidance or target-relative correction only after the four preceding records exist.

The current scalar trace already contains most underlying fields but exposes them as a flat record. The user-facing copy collapses internal measurement identifiers and target requirements before explaining what was recognized. That ordering is rejected for the next remediation.

Per the 05D STOP rule, no Left Third, Right Third or larger device gate was started. Privacy counters remained `0/0/0/0` for provider/backend/Luna/raw upload, and no raw camera frame was committed.
