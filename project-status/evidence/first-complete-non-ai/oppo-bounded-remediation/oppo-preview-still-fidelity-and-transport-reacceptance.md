# OPPO Preview/Still Fidelity and Transport Reacceptance

Date: 2026-08-26  
Parent: `XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01`  
Authority: `XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_FIDELITY_AND_TRANSPORT_REACCEPTANCE_AMENDMENT_03`  
Implementation commit: `35aca06031c98021d800c530853abeb9f47869d1`

## Previous Gate State

```text
CAMERA_GEOMETRY = PASS
CAMERA_COMPOSITION_FIDELITY = FAIL
NATIVE_STILL = PASS
CAPTURE_TRANSPORT = MANUAL_REVIEW_REQUIRED
BACKEND_PERSISTENCE = PASS
FINAL_DEVICE_SAVE = NOT_REACHED
FINE_TUNE_DEVICE_GATE = NOT_REACHED
FULL_MAIN_GOLDEN_FLOW = FAIL
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```

## Remaining Camera Mismatch Classification

```text
Classification = UNKNOWN / MULTIPLE
Candidate classes = VIDEO_STILL_FOV_DIFFERENCE + PREVIEW_STILL_SCALE_DIFFERENCE + PREVIEW_STILL_CENTER_OFFSET + CSS_PRESENTATION_GEOMETRY_DIFFERENCE + IMAGE_CAPTURE_SENSOR_CROP_DIFFERENCE + CAMERA_LENS_OR_PIPELINE_DIFFERENCE
Device-specific lens switching claim = NOT MADE
Reason = no post-remediation three-composition OPPO Preview-vs-Review A/B set exists
```

The old `1920×1440 → false 56.25% centered portrait crop` defect remains closed by the accepted orientation-aware geometry remediation. The remaining mismatch cannot honestly be assigned to one static transform, browser presentation, sensor crop, or lens/pipeline behavior without the required real-device A/B evidence.

## Preview Reference Geometry

At shutter time the H5 camera now creates one transient local-only `PREVIEW_REFERENCE_FRAME` for the same `CaptureCandidate`. It is timestamped, orientation-normalized, cropped to the authoritative `CaptureViewport`, and carries viewport metadata. Its object URL is revoked with the candidate. It is neither uploaded nor committed and does not replace the native still.

```text
Real OPPO reference dimensions = NOT_EXERCISED
Reference upload = 0
Frame stream upload = 0
```

## Native Still Geometry

Accepted OPPO evidence remains:

```text
Backend = ImageCapture.takePhoto()
Dimensions = 3072×4096
Payload = approximately 7.7–8.8 MB JPEG
Native source preserved = YES
Video-frame default = NO
```

## PreviewStillAlignment Result

Implementation-local `PreviewStillAlignmentResultV01` records preview/native ids, dimensions, normalized orientations, crop, scale, translation, mirror flags, confidence, residual, generation, source and result. It is not an M01 contract.

Automated fixtures A–J pass for identity, orientation-only, centered crop, off-center crop, scale+translation, mirror, low confidence, unsupported mapping, camera-switch recalibration and close/reopen stale rejection. `LOW_CONFIDENCE` and `UNSUPPORTED` cannot become authoritative.

```text
Real-device result = UNSUPPORTED / NOT_EXERCISED
Alignment mode = UNSUPPORTED
Alignment confidence = 0 (initial fail-closed state)
Static mapping across three OPPO compositions = NOT_EXERCISED
PreviewMatchedCaptureAsset = NOT CREATED
PreviewMatched dimensions = NOT AVAILABLE
```

No derived crop is presented as native 12MP, and no upscale, stretch, generated pixels, beautification or generative fill was introduced.

## 3-case OPPO Preview vs Review Result

```text
CASE A centered subject = NOT_EXERCISED
CASE B edge subject = NOT_EXERCISED
CASE C environment-heavy composition = NOT_EXERCISED
User qualitative confirmation = NOT_OBTAINED
CAMERA_COMPOSITION_FIDELITY = FAIL
```

Automated geometry/alignment success is not substituted for user-visible composition fidelity.

## Transport Environment

```text
Stable named HTTPS tunnel = NOT AVAILABLE
Trusted controlled HTTPS endpoint = NOT AVAILABLE
Reusable trusted certificate = NOT AVAILABLE
Cloudflare named-tunnel credential = NOT AVAILABLE
Anonymous Quick Tunnel accepted as final proof = NO
STABLE_HTTPS_INGRESS = NOT_AVAILABLE
CAPTURE_TRANSPORT = MANUAL_REVIEW_REQUIRED
```

The exact Owner-operated procedure is in `TRANSPORT_MANUAL_GATE_INSTRUCTIONS.md`.

## 7–9 MB Upload Result

```text
Local/backend representative 7 MiB = PASS
Local/backend representative 9 MiB = PASS
Configured 20 MiB boundary = PASS
OPPO stable-HTTPS 7–9 MB upload = NOT_EXERCISED
```

## Origin Reachability

```text
Automated FastAPI origin reachability = PASS
OPPO request reached stable origin = NOT_EXERCISED
X-XFX-Origin-Reached on formal device request = NOT_EXERCISED
```

## Backend Persistence

The full backend suite reconfirmed handler validation, Asset persistence, lineage, the configured boundary and idempotent replay. The accepted backend persistence area was not rewritten.

```text
BACKEND_PERSISTENCE = PASS
Backend full suite = 106 PASS
```

## Retry / Idempotency

```text
Automated lost-response retry = PASS / same asset_id / one stored asset
OPPO controlled interruption = NOT_EXERCISED
OPPO retry without retake = NOT_EXERCISED
Formal device UPLOAD_RETRY = NOT_EXERCISED
Formal device UPLOAD_IDEMPOTENCY = NOT_EXERCISED
```

## Fine Tune Result

`NOT_REACHED`. The automatic resume condition was not met because Camera composition fidelity and Capture transport did not both pass. Production MaskProvider was not started.

## FINAL Save Result

`NOT_REACHED`. `使用这张` capture persistence remains distinct from FINAL `保存照片`.

## Full Golden Flow

`FAIL / NOT_RERUN`. No later phase was started while the two remaining blockers were open.

## Automated Regression

```text
Frontend deterministic suite = 65 PASS
Preview/still alignment A-J = 10 PASS
Backend full suite = 106 PASS
TypeScript = PASS
H5 build = PASS_WITH_WARNING / unchanged 302 KiB advisory
Provider = 0
Luna = OFF
Raw video upload = 0
Frame stream upload = 0
```

## Final Gate State

```text
TASK_RESULT = MANUAL_REVIEW_REQUIRED
CAMERA_GEOMETRY = PASS
PREVIEW_STILL_ALIGNMENT = PASS_WITH_WARNING / automated model PASS, OPPO calibration NOT_EXERCISED
ALIGNMENT_MODE = UNSUPPORTED
CAMERA_COMPOSITION_FIDELITY = FAIL
NATIVE_STILL = PASS
CAPTURE_TRANSPORT = MANUAL_REVIEW_REQUIRED
BACKEND_PERSISTENCE = PASS
FINE_TUNE_DEVICE_GATE = NOT_REACHED
FINAL_DEVICE_SAVE = NOT_REACHED
FULL_MAIN_GOLDEN_FLOW = FAIL
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```
