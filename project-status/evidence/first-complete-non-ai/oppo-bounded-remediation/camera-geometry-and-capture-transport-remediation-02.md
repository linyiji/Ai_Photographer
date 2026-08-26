# OPPO Camera Geometry and Capture Transport — Bounded Remediation 02

Date: 2026-08-26  
Parent: `XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01`  
Authority: `XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_GEOMETRY_AND_CAPTURE_TRANSPORT_BOUNDED_REMEDIATION_02`

Implementation commit: `31870de126b284efb601ed6b0d5b671111da80d4`

## Camera Root Cause and Fix

The accepted root-cause report remains authoritative. The application previously treated the OPPO raw `1920×1440` video intrinsic coordinate space as the presentation coordinate space and calculated a centered 3:4 viewport (`x=0.21875`, `width=0.5625`). That was not valid authority for the portrait native still composition.

The bounded fix adds an orientation-aware `NormalizedCameraGeometry` model. It keeps raw track/video geometry, device and presentation orientation, normalized presentation geometry, preview viewport, native-still dimensions, mapping mode, mapping confidence, and source separate. In portrait presentation, the deterministic diagnostic sub-gate normalizes the logical `1920×1440` geometry to `1440×1920`; it therefore does not introduce the old false 56.25% center crop. Already-portrait and landscape inputs are not double-rotated.

Preview/still identity is never inferred from equal aspect ratio. Runtime OPPO status remains `FOV_UNVALIDATED / LOW` until real user-visible A/B evidence exists. A known FOV difference becomes `PROJECTION_REQUIRED`; only separately validated evidence can become `IDENTITY_VALIDATED`.

Native `ImageCapture.takePhoto()` JPEG remains immutable and device-native. No lower-resolution video-frame path was promoted; canvas remains only the existing intrinsic-video fallback. No derived user-facing crop is claimed in this automated phase.

## Capture Transport and Resilience

The client now distinguishes:

`LOCAL_CAPTURE_READY → UPLOAD_PENDING → UPLOAD_IN_PROGRESS → UPLOAD_RETRYABLE_FAILED / UPLOAD_SUCCEEDED → CAPTURE_COMMITTED`

The local candidate and native `File` remain available after a transport failure. Explicit retry reuses the same session/candidate idempotency key and the same capture confirmation key. Each attempt records candidate, attempt, session, bytes, MIME, timestamps, duration, result, HTTP status, origin-reached evidence and retry count; photo bytes and secrets are not logged.

`POST /assets/uploads` now accepts the stable idempotency key, returns `X-XFX-Origin-Reached: 1`, and replays the same stored asset on a lost-response retry without creating a second stored asset. Storage validation, SQLite schema, the 20 MiB boundary, and asset lineage semantics were not weakened or rewritten.

## Automated Evidence

```text
Camera tests A-H = PASS
Frontend deterministic suite = 55 PASS
Backend full suite = 106 PASS
Native JPEG 7 MiB = PASS / persisted
Native JPEG 9 MiB = PASS / persisted
Configured max 20 MiB = PASS / persisted
Max + 1 byte = PASS / deterministic HTTP 413
Lost-response retry = PASS / same asset_id / one stored asset
TypeScript = PASS
H5 build = PASS_WITH_WARNING / unchanged 302 KiB advisory
WeChat build = PASS
Provider calls = 0
Luna = OFF
Raw video upload = 0
Frame stream upload = 0
```

## Environment and Remaining Gates

Cloudflare Quick Tunnel is expressly not accepted for the formal native 7.7–8.8 MB OPPO transport gate after the four prior cancellations. No already-authorized named tunnel credentials, trusted local HTTPS endpoint, or reusable certificate are present in the current environment.

```text
TRANSPORT_ENVIRONMENT_GATE = MANUAL_REVIEW_REQUIRED
CAMERA_GEOMETRY = PASS (automated model and tests)
CAMERA_COMPOSITION_FIDELITY = FAIL (real-device A/B not rerun)
NATIVE_STILL = PASS (preservation path and payload classes)
CAPTURE_TRANSPORT = MANUAL_REVIEW_REQUIRED
BACKEND_PERSISTENCE = PASS (automated origin tests); formal OPPO origin gate NOT_EXERCISED
FINAL_DEVICE_SAVE = NOT_REACHED
FINE_TUNE_DEVICE_GATE = NOT_REACHED
FULL_MAIN_GOLDEN_FLOW = FAIL
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```

No real-device result is inferred from numeric geometry alone. The formal OPPO camera composition, interrupted-upload retry, final save, remaining Fine Tune, and full Golden Flow gates require stable trusted HTTPS ingress and real user-visible evidence.
