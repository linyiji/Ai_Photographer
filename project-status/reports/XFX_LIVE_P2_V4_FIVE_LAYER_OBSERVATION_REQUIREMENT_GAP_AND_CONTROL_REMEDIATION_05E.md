# XFX_LIVE_P2_V4_FIVE_LAYER_OBSERVATION_REQUIREMENT_GAP_AND_CONTROL_REMEDIATION_05E

## Disposition

| Field | Result |
|---|---|
| TASK_RESULT | PASS_WITH_WARNING |
| ROOT_CAUSE | NON_BILATERAL_GROUP_MISCLASSIFIED_BY_GENERIC_CROP_FALLBACK |
| SUBJECT_RECOGNITION_STATE | PASS |
| OBSERVED_BODY_STATE | PASS |
| TARGET_MEASUREMENT_REQUIREMENT | PASS |
| TARGET_OBSERVATION_GAP | PASS |
| CONTROL_PRESENTATION_LAYER | PASS |
| FIVE_LAYER_SEPARATION | PASS |
| TARGET_INFLUENCES_OBSERVED_BODY_STATE | 0 |
| HEAD_CORE_GROUP_TYPE | MULTI_POINT |
| HEAD_CORE_REDUCTION | CENTROID |
| NON_BILATERAL_FALSE_CROP | 0 |
| REGION_LOCAL_CROP | PASS |
| MEASUREMENT_DEFINITION | PASS |
| BLOCKING_REASON_TAXONOMY | PASS |
| BLOCKER_ACTIONABILITY | PASS |
| SYSTEM_DEFECT_USER_ACTION | 0 |
| 05D_REGRESSION_FIXTURE | PASS |
| UPPER_BODY_GAP_READY | PASS |
| FULL_BODY_GAP_NOT_READY | PASS |
| ACQUIRE_REQUIRED_BODY_SEMANTICS | ENSURE_TARGET_MEASURABILITY |
| RECOGNITION_FIRST_PRESENTATION | PASS |
| INTERNAL_MEASUREMENT_NAME_VISIBLE | 0 |
| BODY_COVERAGE_GUIDE_RELEASE | PASS (automated/browser) |
| TARGET_VALUES_CHANGED | NO |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| AUTOMATED_REGRESSION | 273/273 PASS at 05E implementation head |
| TYPESCRIPT | PASS |
| PRODUCTION_BUILD | PASS / 49 modules |
| BROWSER_GATE | PASS / ADJUST_SCALE |
| CENTER_UPPER_BODY_OPPO_REVALIDATION | PASS_WITH_WARNING |
| MEASUREMENT_READY_OBSERVED | YES / 449 rows |
| TARGET_GAP_READY_OBSERVED | YES / 449 rows |
| ACQUIRE_REQUIRED_BODY_RELEASED | YES / 449 downstream rows |
| V4_DEVICE_PROGRAM | MANUAL_REVIEW_REQUIRED / X direction 05F |
| PROVIDER / BACKEND_PER_FRAME / LUNA / RAW_UPLOAD | 0 / 0 / 0 / 0 |
| MAIN_INTEGRATION | NOT_STARTED |

## Accepted root cause

05D proved that camera and subject recognition worked but Center Upper Body acquisition never released. The region-edge fallback treated `!group.bilateral_valid` as crop evidence. `HEAD_CORE` is not bilateral: it is a multi-point centroid group. A truthful global lower crop therefore falsely became `HEAD EDGE_CROPPED/BOTTOM`, invalidating otherwise usable `HEAD_TO_HIP` evidence.

## Remediation

The runtime now records explicit subject recognition, target-independent observed body, target-only measurement requirement and required-minus-observed gap before control or presentation. Semantic group type and reduction are explicit. Region crop uses region-local visible points rather than group bilateral validity. The resolver consumes the target gap instead of reinterpreting raw Pose evidence.

Presentation is recognition-first and translates target gaps into human body concepts. It does not expose internal measurement names in normal UI. Movement is allowed only for a justified `USER_FIXABLE` blocker; a `SYSTEM_MEASUREMENT_DEFECT` emits no movement instruction.

## Regression evidence

The sanitized 05D fixture preserves global bottom crop while providing a valid head centroid, shoulders and hips. It now produces good `HEAD_TO_HIP` and `TORSO_CENTER`, a ready Center Upper Body gap, and `ADJUST_SCALE` rather than `ACQUIRE_REQUIRED_BODY`. Cross-target tests prove the observed state is unchanged while Upper Body, Three Quarter and Full Body requirements/gaps differ correctly.

The full suite passed 273/273; TypeScript passed; the production build passed with 49 modules. The browser route exposed subject detected, `THREE_QUARTER` observed coverage, ready target gap, truthful global bottom crop and `ADJUST_SCALE`, with recognition-first normal copy.

## Accepted OPPO gate and warning

The fresh OPPO trace `live-p2-v4-v4_center_upper_body-1788169794318.json` (SHA-256 `F9A1D27707662530C663AC34E01E224083F084B1F1FF2E50585A21580F2A2488`) contains 756 scalar-only rows. It records 449 rows with measurement ready and target gap ready, and all 449 are downstream of `ACQUIRE_REQUIRED_BODY`. `ADJUST_SCALE`, `ALIGN_PRIMARY_ANCHOR` and `VERIFY` were reached. This accepts the five-layer measurement gate.

The same trace opened a separate bounded warning: six evaluated X actions all issued `MOVE_LEFT_SMALL` when negative sensor movement was required; four became `WRONG_DIRECTION` and two `NO_EFFECT`. Scale separately recorded one `IMPROVED` and one `TARGET_REACHED`. The measurement result is accepted, while subject-local X mapping proceeds under 05F. Multi-target testing remains stopped.

No raw camera frame/video is saved or committed.
