# OPPO K11 Main H5 — Bounded Defect Report

```text
Task = XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01
Track = MAIN
Evidence Type = USER-OPERATED REAL-DEVICE DEFECT REPORT
Device = OPPO K11
OS = ColorOS 15
Browser = Chrome Mobile 138.0.7204.168
Date = 2026-08-26
Report Status = DEFECTS_CONFIRMED
Solution Proposal = OUT_OF_SCOPE / NOT INCLUDED BY USER REQUEST
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
```

## Scope and evidence boundary

This report records defects observed by the user on the real OPPO device. It does not propose a remediation, change the AdjustmentRecipe Contract, or infer a root cause that has not been demonstrated.

The six supplied screenshots are external user evidence. Their original filenames and SHA256 values are retained below; the images are not copied into the repository because they currently reside in a temporary user-media directory.

| Evidence | SHA256 | Directly visible evidence |
|---|---|---|
| `3417446523f2663a008a5f6360306976.jpg` | `8CB24DAA93FFE9AF9E18A7DFF6CB5026A9612EE6827EF3FB0D6F232743E2A887` | LOCAL mode selected; no visible local-region overlay; severe telemetry latency; adjustment values exceed the labelled ±30% calibration points. |
| `caff9b3ef23abb807a9d617d5c5e045d.jpg` | `7FBA4519D2E8ACD46D944BEE659E1138ECA76B69F97FC00DFC2E910E6713428C` | UI rAF FPS 13.0; max Long Task 882.0ms; input and preview latency near 800ms. |
| `65206a2aa2325e72f34ade5092a4986d.jpg` | `9ABB7C6C904A87373B984CCF0018BEEEF0AE66C73C75E1E0CA9683BDB2332186` | LOCAL mode selected; no visible local-region overlay; a less severe telemetry sample remains visible. |
| `3b2db78d2cc3c7b08247c620c132098e.jpg` | `E6850A9C814EFEBAFB40627A850AD7CCC209E0455B9D723B17061DFD9A9CDAAB` | Camera track 1080×1920 at 30fps, environment; intrinsic video 1080×1920; preview 29.8fps; displayed framing appears strongly cropped/zoomed. |
| `888d1e5de7d2957ba9740d08e4cf60a8.jpg` | `436F54088415DA89B50A7969440CBBAAD7DBE9798DA24171691BFD38AC762DC0` | Native still capture 3072×4096, 7,926,073 bytes; framing differs materially from the preceding camera preview. |
| `4b520f31aea759bc816af283ee34145c.jpg` | `19CDBB9CC121A9D3C7122FA81863202DEA7297B7E40EB0004E990314ECC3863C` | Fine Tune ALL view and full-photo preview; semantic modes remain unavailable without a controlled mask. |

All supplied screenshots are 1080×2412 JPEG screenshots. Screenshot dimensions are not treated as camera capture dimensions.

## Confirmed defect findings

### OPPO-MAIN-DEFECT-01 — Camera preview and captured still framing mismatch

```text
Status = CONFIRMED_BY_USER_AND_SCREENSHOT
Impact = HIGH
Root Cause = UNCLASSIFIED
```

The camera preview appears excessively zoomed/cropped. The photo shown after capture contains a materially wider/different composition than the preview used to frame the shot. The user cannot reliably predict the captured composition from the live view.

Measured evidence:

```text
MediaStreamTrack settings = 1080×1920 @ 30.0fps / environment
video.videoWidth × video.videoHeight = 1080×1920
Camera Preview FPS = 29.8
Captured JPEG = 3072×4096 / 7,926,073 bytes
Capture backend = IMAGE_CAPTURE
Capture quality = DEVICE_NATIVE
```

This report does not classify the cause as optical zoom, camera selection, aspect-ratio projection, CSS cropping, or ImageCapture behavior. The available evidence only proves the user-visible mismatch.

### OPPO-MAIN-DEFECT-02 — Fine Tune interaction has severe jank

```text
Status = CONFIRMED_BY_TELEMETRY_AND_USER_OBSERVATION
Impact = BLOCKING
Candidate Performance Gate = FAIL
```

The user reports that Fine Tune is very laggy. Device telemetry directly supports the report:

```text
Worst visible UI rAF FPS = 13.0
Long Tasks = up to 119 observed
Maximum Long Task = 882.0ms
Slider input→number = 804.7–824.0ms in the severe samples
Input→preview p95 = 802.4–835.8ms
Preview render p95 = 798.7–835.1ms
Preview dimensions = 360×480
Preview JPEG encode count = 0
ObjectURL create/revoke = 0/0
```

A separate screenshot shows a better sample (`UI rAF FPS = 60.0`, maximum Long Task `161.0ms`, preview p95 approximately `141.8ms`), but it does not negate the repeated severe samples. The ordinary-UI requirement of no repeated tasks above 200ms is not met.

### OPPO-MAIN-DEFECT-03 — Fine Tune scope modes are incomplete or non-operational

```text
Status = CONFIRMED_BY_USER_AND_SCREENSHOT
Impact = BLOCKING_FOR_EXPECTED FINE TUNE EXPERIENCE
Root Cause = UNCLASSIFIED
```

The user confirms that only the full-photo (`整体` / ALL) adjustment is operational.

- `人物` and `背景` cannot be adjusted in the current no-mask route. This is consistent with the current mask policy, but still means those modes are not available to the user in this acceptance flow.
- `局部` can be selected and displays `新增局部区域（2/3）`, but no local-region box/overlay is visible in the supplied evidence, and the user reports that local adjustment cannot be practically operated.
- No evidence demonstrates that a local target boundary was created or that an adjustment was restricted to that target.

The screenshots also expose a control-consistency anomaly: the calibration buttons are labelled `-30%`, `0%`, and `+30%`, while displayed/raw values include `+76%`, `+64%`, `+95%`, `+79%`, `-39`, and `-100`. This is recorded as observed behavior, without assigning it to the pixel algorithm or AdjustmentRecipe Contract.

### OPPO-MAIN-DEFECT-04 — Camera result quality is unacceptable to the device tester

```text
Status = CONFIRMED_USER ACCEPTANCE FAILURE
Impact = BLOCKING
Objective Resolution Regression = NOT OBSERVED IN THIS RUN
Root Cause = UNCLASSIFIED
```

The prior 480×640 capture-resolution defect is not reproduced in this run: the captured JPEG is 3072×4096 and approximately 7.93MB using the device-native ImageCapture path. Nevertheless, the user judges the camera result quality as poor, and the preview/capture framing mismatch prevents dependable composition.

High pixel dimensions alone therefore do not constitute a quality PASS. No claim is made here about focus, sharpness, exposure, optical camera selection, post-processing, or compression cause because those were not isolated by the available evidence.

## Acceptance disposition

```text
Camera resolution instrumentation = PASS
Device-native high-resolution capture path = OBSERVED
Camera preview/capture composition fidelity = FAIL
Fine Tune responsiveness = FAIL
Fine Tune ALL mode = PARTIALLY OPERATIONAL
Fine Tune PERSON = UNAVAILABLE_BY_CURRENT_MASK_POLICY
Fine Tune BACKGROUND = UNAVAILABLE_BY_CURRENT_MASK_POLICY
Fine Tune LOCAL_REGION = FAIL / NO VISIBLE OPERABLE REGION
Camera result quality = FAIL_BY_USER_ACCEPTANCE
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
INTERNAL_USER_GOLDEN_FLOW_READY = NO
PUBLIC_PRODUCTION_READY = NO
```

The current task remains open. This report records the failed real-device gate only. It does not authorize a new task, start a next task, or modify product/contract Authority.
