# XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01

```text
Status = IN_PROGRESS
Branch = feature/first-complete-non-ai-product-flow
Main Base Head = 56cd8e5c41ef35b3af43ff5979e5c921fdfddd17
Implementation head under test = faff0f727389f615c80a92c4fc5fe20455cda556
Product provenance commit = 02821e6c4dcefbef8d916c61eeb502b9ddba5ddd
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
INTERNAL_USER_GOLDEN_FLOW_READY = NO
PUBLIC_PRODUCTION_READY = NO
```

## Product provenance implementation state

The pre-diagnostic Camera and Fine Tune product implementation was isolated, validated, and preserved in Product Commit `02821e6c4dcefbef8d916c61eeb502b9ddba5ddd`. Diagnostic restoration does not change its production Camera constraints, ImageCapture path, intrinsic-video canvas fallback, or capture backend.

## ROOT_CAUSE_DIAGNOSTIC_AMENDMENT

Amendment Authority:

`XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_FINE_TUNE_ROOT_CAUSE_DIAGNOSTIC_AMENDMENT_01`

The amendment continues this parent task; it is not a new milestone or product task. DEV-only/query-build diagnostic instrumentation and test harnesses were added without applying product remediation.

Current evidence-supported classifications:

```text
Diagnostic amendment = PASS_WITH_WARNING
Camera root cause = MIXED / CSS_COVER_CROP + ASPECT_RATIO_MISMATCH
Camera transform estimator = MANUAL_VISUAL_ONLY / low confidence
Fine Tune dominant cause = MAIN_THREAD_RENDERER / PIXEL_LOOP
Fine Tune secondary causes = H5_BROWSER_BASELINE + TARO_REACT_RENDER_CHURN + TELEMETRY_CHURN
Generic H5 primary = NO
Taro primary = NO / PARTIAL SECONDARY CONTRIBUTOR
Diagnostic Worker = WORKER_TRANSFER / STARTUP dominant in the tested per-sample Worker path
LOCAL_REGION = MULTIPLE / OVERLAY_MISSING + TOUCH_INTERACTION_MISSING
PERSON controlled-mask runtime = PASS
BACKGROUND controlled-mask runtime = PASS
Production MaskProvider = NOT_IMPLEMENTED
Range mapping = UI_LABEL_ONLY_MISMATCH
Product fixes applied by amendment = 0
```

Device evidence:

```text
Camera = 1080×1920 @30fps / environment / zoom 1
Current cover visible rect = x 0..1 / y 0.33174294..0.66825706
Native still = 3× 3072×4096 ImageCapture JPEG / 7.90–7.92MB
Main Fine Tune matrix = 12/12 rows complete
Plain H5 = 3 runs complete
Screenshot evidence = external filename/hash only; real media committed = 0
```

Evidence directory:

`project-status/evidence/first-complete-non-ai/root-cause-diagnostic/`

The parent OPPO and first-complete gates remain failed/not-yet-pass. No remediation is authorized or started automatically.

## OPPO_CAMERA_AND_SAVE_FAILURE_ROOT_CAUSE_REPORT — 2026-08-26

The bounded remediation rerun reproduced blocking Camera composition and capture persistence failures. This section records evidence and classification only; it does not authorize or apply another fix.

```text
Track = 1920×1440 @30fps / environment / aspect 1.3333
Canonical portrait viewport = x 0.21875 / width 0.5625 / aspect 0.75
Preview apparent center-crop scale = 1.7778× relative to full video width
Native still = 3072×4096 / IMAGE_CAPTURE / DEVICE_NATIVE
Camera classification = PREVIEW_STILL_PIPELINE_GEOMETRY_DIVERGENCE
Capture upload attempts = 4
Tunnel result = Incoming request ended abruptly: context canceled
FastAPI POST /assets/uploads reached = NO
Capture asset persisted = NO
Final browser download gate = NOT_REACHED / NOT_CLASSIFIED
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
```

Full report:

`project-status/evidence/first-complete-non-ai/oppo-bounded-remediation/oppo-camera-and-save-failure-root-cause-report.md`

## BOUNDED_REMEDIATION_02 — Camera Geometry and Capture Transport

Automated remediation is complete. Camera geometry is now orientation-aware, preserves raw and normalized coordinate spaces separately, does not reintroduce the OPPO 56.25% false center crop, and does not claim Preview/Still identity without A/B evidence. Native ImageCapture stills remain unchanged.

Capture transport now retains the local candidate, exposes explicit upload states, records bounded per-attempt telemetry, and uses stable upload/action idempotency. Backend tests prove 7 MiB, 9 MiB, 20 MiB boundary persistence and lost-response replay without duplicate stored-asset authority.

```text
Camera Root Cause = RAW_INTRINSIC_PRESENTATION_CONFLATION + PREVIEW_STILL_FOV_UNVALIDATED
Camera Fix Applied = ORIENTATION_AWARE_NORMALIZED_GEOMETRY
Normalized Geometry Result = PASS / 1920×1440 portrait presentation → logical 1440×1920
Preview ↔ Still Result = FOV_UNVALIDATED / REAL_DEVICE_A_B_REQUIRED
Native Still Preservation = PASS / DEVICE_NATIVE / no derived replacement
Capture Transport Result = MANUAL_REVIEW_REQUIRED_FOR_FORMAL_OPPO
Origin Reachability = PASS_AUTOMATED / OPPO_STABLE_HTTPS_NOT_EXERCISED
Backend Persistence = PASS_AUTOMATED / 7MiB + 9MiB + 20MiB
Retry / Idempotency = PASS_AUTOMATED / SAME_ASSET_ID / NO_DUPLICATE
FINAL Device Save Result = NOT_REACHED
Fine Tune Result = NOT_REACHED
Full Golden Flow Result = FAIL / NOT_RERUN
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
Automated Tests = Backend 106 PASS / Frontend 55 PASS / TypeScript PASS / H5 PASS_WITH_WARNING / WeChat PASS
Implementation Commit = 31870de126b284efb601ed6b0d5b671111da80d4
Current HEAD = SELF_AFTER_CLOSURE_COMMIT
Remote HEAD = SAME_AS_CURRENT_AFTER_PUSH
Worktree Status = CLEAN_AFTER_CLOSURE_COMMIT
TRANSPORT_ENVIRONMENT_GATE = MANUAL_REVIEW_REQUIRED
```

The current environment has no already-authorized stable trusted HTTPS ingress. Quick Tunnel is not reused as formal evidence. Real-device Camera composition fidelity, OPPO upload/persistence, controlled interruption/retry, final device save, remaining Fine Tune, and full Golden Flow remain open.

Evidence:

`project-status/evidence/first-complete-non-ai/oppo-bounded-remediation/camera-geometry-and-capture-transport-remediation-02.md`
