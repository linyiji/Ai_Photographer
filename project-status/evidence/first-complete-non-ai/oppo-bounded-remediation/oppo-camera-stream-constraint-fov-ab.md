# OPPO Camera Stream Constraint FOV A/B and Reacceptance — Gate 05

Date: 2026-08-27  
Task: `XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_STREAM_CONSTRAINT_FOV_AB_AND_BOUNDED_FIX_05`  
Parent: `XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01`  
Branch: `feature/first-complete-non-ai-product-flow`

## Decision

The controlled A/B proved that OPPO Chrome stream-profile selection is affected by the Main portrait constraints. A same-camera Live-like request produced a materially wider stream and was therefore selected as the bounded preview-stream policy. The production path was changed to decouple preview-stream acquisition from the final 3:4 composition contract and to pin the resolved rear-camera device during renegotiation.

The post-fix OPPO three-case reacceptance nevertheless failed 3/3. The selected `720×1280` preview stream and the preserved `3072×4096` `ImageCapture.takePhoto()` native still remain materially different in visible composition. The remaining blocker is therefore classified as an OPPO Chrome video-stream versus native-still capture-pipeline FOV divergence, not an application crop, digital zoom, low-resolution capture, backend crop, or lifecycle failure.

```text
TASK_RESULT = FAIL
CAMERA_STREAM_PROFILE_AB = PASS
CONSTRAINT_TRIGGER = CONFIRMED
CAMERA_COMPOSITION_FIDELITY = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```

## Controlled A/B admission

- Same fixed OPPO K11 rear camera and physical scene were used.
- Rear-camera identifiers were retained only as non-reversible FNV-style hashes.
- Rear camera device hash: `fnv1a-e702c3f6`.
- Rear camera group hash: `fnv1a-32779bc7`.
- `SAME_PHYSICAL_CAMERA = YES`.
- Digital zoom remained `1`.
- Diagnostic presentation used `contain`; no application crop was active.

## Profile A — Main Current

```text
REQUESTED = width ideal 1440 / height ideal 1920 / aspectRatio ideal 0.75 / frameRate ideal 30 / environment
ACTUAL = 1920×1440 / aspect 1.3333 / approximately 30.9fps / environment / zoom 1
VIDEO INTRINSIC = 1920×1440
NATIVE STILL = 3072×4096 / 7,517,618 bytes / image/jpeg / DEVICE_NATIVE
PREVIEW ↔ STILL FIDELITY = FAIL
```

The preview was materially narrower/more magnified than the native still.

## Profile B — Live-like

```text
REQUESTED = width ideal 1280 / height ideal 720 / no aspectRatio / frameRate ideal 30 / environment / same device pinned
ACTUAL = 720×1280 / aspect 0.5625 / approximately 28.0–29.6fps / environment / zoom 1
VIDEO INTRINSIC = 720×1280
NATIVE STILL = 3072×4096 / 7,798,621 bytes / image/jpeg / DEVICE_NATIVE
PREVIEW ↔ STILL FIDELITY = FAIL
```

Profile B exposed materially more of the same scene than Profile A and was visually closer to the native still during the controlled diagnostic. It did not, however, establish product-level preview/still fidelity.

```text
A_VS_B_FOV = B_MATERIALLY_WIDER
CONSTRAINT_TRIGGER = CONFIRMED
ROOT CAUSE PROMOTION = OPPO_CHROME_STREAM_PROFILE_SELECTION_TRIGGERED_BY_MAIN_CONSTRAINTS
```

## Bounded implementation

The following evidence-backed policy was introduced:

```text
POLICY = H5_CAMERA_STREAM_CONSTRAINT_POLICY_V02
STRATEGY = DECOUPLED_PREVIEW_STREAM
SELECTED_STREAM_PROFILE = LIVE_LIKE
FINAL_COMPOSITION_ASPECT = 0.75
STREAM_ASPECT_COUPLED_TO_COMPOSITION = false
```

The production path now performs an initial device resolution followed by a same-device pinned renegotiation. Native `ImageCapture.takePhoto()` remains the default source-quality capture; Canvas remains fallback-only. No old 56.25% software center crop was restored.

Implementation commits:

- `b55821c7d377d2d8260ac458a50ed390c25df491` — A/B instrumentation.
- `a57277239a660cc787cc53355acba3240dad35d5` — stream/composition decoupling.
- `1081f6f0c1507b2f7dcf78020797ae0ef2b76754` — resolved-device pin and renegotiation.

## Post-fix OPPO production evidence

The first retest on port 4176 loaded stale browser chunks. Its missing `Profile` and `Request` telemetry and `1920×1440` actual stream were rejected as invalid post-fix evidence. A fresh loopback origin on port 4177 loaded the current build and showed:

```text
Profile = LIVE_LIKE
Pinned device = YES
Request = 1280×720 / aspect none / 30fps
Actual track = 720×1280 @30fps / environment
Video intrinsic = 720×1280 / aspect 0.5625
CaptureViewport = x 0 / y 0.125 / width 1 / height 0.75 / aspect 0.75
Preview FPS = 29.3–30.1
Screenshot-only black frame = NOT A RUNTIME BLACK SCREEN; user confirmed live picture normal
```

Three preserved native stills recorded in the product path:

```text
CASE A native still = 3072×4096 / 8,885,975 bytes / IMAGE_CAPTURE / DEVICE_NATIVE
CASE B native still = 3072×4096 / 7,401,774 bytes / IMAGE_CAPTURE / DEVICE_NATIVE
CASE C native still = 3072×4096 / 8,247,707 bytes / IMAGE_CAPTURE / DEVICE_NATIVE
Native still preserved = YES
```

Owner real-device classifications:

```text
CASE A — centered subject = MATERIAL_MISMATCH
CASE B — edge subject = MATERIAL_MISMATCH
CASE C — environment-heavy = MATERIAL_MISMATCH
OPPO_CAMERA_FINAL_A_B = FAIL
CAMERA_COMPOSITION_FIDELITY = FAIL
ALIGNMENT_MODE = UNSUPPORTED
```

The 3/3 mandatory no-material-mismatch gate was not met. A static crop/scale/translation must not be invented from this evidence.

## Lifecycle regression

Owner-reported OPPO results:

```text
Rear open = PASS
Rear → front = PASS
Front → rear = PASS
Close/reopen = PASS
Refresh/reopen = PASS
Visible black screen = 0
Crash = 0
Stuck UI = 0
```

## Automated regression

Before real-device reacceptance:

```text
Frontend = 68/68 PASS
Backend = 106/106 PASS
TypeScript = PASS
H5 build = PASS_WITH_WARNING / existing bundle-size warning
```

No backend or Fine Tune behavior was modified by Gate 05.

## Transport and persistence

Transport remains a separate gate. Accepted local-loopback evidence from the parent task is retained:

```text
7 MiB upload = HTTP 201 / asset upload-aacec0e4c12e4035afd8ad7c
9 MiB upload = HTTP 201 / asset upload-92a2221bb0814dd69447306b
BACKEND_PERSISTENCE = PASS
```

The earlier Quick Tunnel cancellation history remains valid and is not rewritten as a transport pass. Because Camera composition fidelity failed, transport was not reopened by Gate 05.

## Final classification

```text
CAMERA_GEOMETRY = PASS
SAME_PHYSICAL_CAMERA = YES
A_VS_B_FOV = B_MATERIALLY_WIDER
CONSTRAINT_TRIGGER = CONFIRMED
SELECTED_STREAM_PROFILE = LIVE_LIKE
STREAM_COMPOSITION_DECOUPLED = YES
REMAINING_CAMERA_ROOT_CAUSE = IMAGE_CAPTURE_PIPELINE_DIFFERENCE / OPPO_CHROME_VIDEO_STREAM_VS_NATIVE_STILL_FOV_DIVERGENCE
ALIGNMENT_MODE = UNSUPPORTED
OPPO_CAMERA_FINAL_A_B = FAIL
CAMERA_COMPOSITION_FIDELITY = FAIL
NATIVE_STILL = PASS
NATIVE_SOURCE_DIMENSIONS = 3072×4096
CAPTURE_TRANSPORT = PASS / ACCEPTED_LOCAL_LOOPBACK_EVIDENCE_UNCHANGED
BACKEND_PERSISTENCE = PASS
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
PROVIDER = 0
LUNA = 0
RAW_VIDEO_UPLOAD = 0
FRAME_STREAM_UPLOAD = 0
```
