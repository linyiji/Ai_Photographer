# OPPO Preview ↔ Native Still Registration Evidence

```text
TASK_ID = XFX_FIRST_COMPLETE_NON_AI_OPPO_PREVIEW_NATIVE_STILL_REGISTRATION_AND_CAPTURE_AUTHORITY_06
PARENT_TASK = XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01
DEVICE = OPPO K11 / ColorOS 15 / Chrome Mobile
DATE = 2026-08-27
IMPLEMENTATION_COMMIT = bab6124b8bbd7ed5be622ca3ca31225143cf7031
```

## Decision

The final bounded H5 registration experiment completed with a legitimate negative architecture result.

```text
PREVIEW_NATIVE_STILL_REGISTRATION = FAIL
MAPPING_STABILITY = UNSUPPORTED
ALIGNMENT_MODE = UNSUPPORTED
H5_OPPO_CAMERA_COMPATIBILITY = UNSUPPORTED
H5_OPPO_IMAGECAPTURE_COMPOSITION_FIDELITY = UNSUPPORTED
PREVIEW_MATCHED_CAPTURE = NOT_CREATED
CAMERA_COMPOSITION_FIDELITY = FAIL
```

All five fresh real-device pairs failed closed as `LOW_CONFIDENCE`. Four pairs produced only low-confidence scale/translation candidates; the different-distance pair rejected every model and returned `NONE`. A transform that fails under ordinary subject placement or distance change is not an authoritative capture mapping. No raw native still was promoted directly into Review and no speculative crop was accepted.

This is the final H5 Camera mapping experiment for the Parent. It does not authorize another speculative H5 Camera algorithm task. WeChat and Douyin Camera adapters require independent validation and must not inherit this OPPO Chrome classification by assumption.

## Preserved accepted authority

```text
CAMERA_GEOMETRY = PASS
CONSTRAINT_TRIGGER = CONFIRMED
SELECTED_STREAM_PROFILE = LIVE_LIKE
STREAM_COMPOSITION_DECOUPLED = YES
SAME_PHYSICAL_CAMERA = YES
Request = 1280×720 / aspect none / 30fps / environment / pinned device
Actual stream = 720×1280 @ approximately 30fps
Native source = 3072×4096 JPEG / ImageCapture / DEVICE_NATIVE
Native source pixels = 12,582,912 / approximately 12.58 MP
CAPTURE_TRANSPORT = PASS
BACKEND_PERSISTENCE = PASS
```

The shutter-time `PreviewReferenceFrameV01` remained one transient local frame per shutter. It was not uploaded, committed, or converted into a frame stream. Native JPEG preservation remained unchanged.

## Controlled fixtures

The bounded implementation tests models in increasing complexity and fails closed when evidence is inadequate. Automated fixtures passed for:

```text
IDENTITY
CENTER_CROP
OFF_CENTER_CROP
SCALE_TRANSLATION
SMALL_ROTATION / AFFINE
AFFINE
PERSPECTIVE / HOMOGRAPHY
LOW_TEXTURE → fail closed
REPETITIVE_TEXTURE → fail closed
INSUFFICIENT_MATCHES → fail closed
```

The stability fixtures also passed for `STATIC_STABLE`, `PER_CAPTURE_STABLE`, and rejection of unsupported samples.

## Five fresh OPPO pairs

The user operated the real device. Screenshots were reviewed as external evidence only; no screenshot or real camera image binary was copied into Git.

| Case | Registration result | Model | Matches / inliers | Inlier ratio | Error | Overlap | Confidence | Scale | Translation | Rotation | Retained | Evidence limitation |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: | --- |
| 1 — centered object | LOW_CONFIDENCE | SCALE_TRANSLATION | 63 / 38 | 0.603 | 0.0068 | 0.576 | 0.459 | 0.7591 × 0.7591 | 0.1206, 0.1162 | 0.00° | 57.6% | Complete on-device telemetry captured |
| 2 — object near left edge | LOW_CONFIDENCE | SCALE_TRANSLATION | 63 / 35 | 0.556 | not retained | not retained | below acceptance | computed on device | computed on device | computed on device | below acceptance | Lower telemetry rows were outside the supplied screenshot |
| 3 — object near right edge | LOW_CONFIDENCE | SCALE_TRANSLATION | 82 / 48 | 0.585 | 0.0058 | 0.568 | 0.464 | 0.7536 × 0.7536 | 0.1221, 0.1154 | 0.00° | 56.8% | Complete on-device telemetry captured |
| 4 — environment-heavy | LOW_CONFIDENCE | SCALE_TRANSLATION | 64 / 31 | 0.484 | not retained | not retained | below acceptance | computed on device | computed on device | computed on device | below acceptance | Lower telemetry rows were outside the supplied screenshot |
| 5 — different distance | LOW_CONFIDENCE | NONE | 67 / 0 | 0.000 | not applicable | not applicable | rejected | not applicable | not applicable | not applicable | not applicable | No model survived fail-closed validation |

The unavailable lower rows are reported as evidence limitations, not reconstructed or invented. They cannot change the gate: every result is explicitly `LOW_CONFIDENCE`, stability is explicitly `UNSUPPORTED`, and Pair 5 has zero inliers with model `NONE`.

## Stability classification

```text
Successful authoritative pairs = 0 / 5
Low-confidence pairs = 5 / 5
Model-family consistency = FAIL / pair 5 NONE
Ordinary distance robustness = FAIL
MAPPING_STABILITY = UNSUPPORTED
REGISTRATION_CONFIDENCE = INSUFFICIENT / per-pair observed 0.459 and 0.464 where fully captured
```

The superficially similar Pair 1 and Pair 3 crops retain only about 57% of native pixels and remain below confidence acceptance. Those values therefore do not establish a static calibration.

## Pixel and derived-asset accounting

```text
Native dimensions = 3072×4096
Native MP = 12.58
PreviewMatchedCaptureAsset = NOT_CREATED
Derived dimensions = NOT_CREATED
Derived MP = NOT_CREATED
Authoritative retained pixel percent = NOT_CREATED
Derived capture quality = NOT_CREATED
```

For diagnostic context only, the rejected Pair 1 and Pair 3 candidates would retain approximately 57.6% and 56.8% of source pixels. They are not product assets and are not labelled 12 MP.

## Composition guide and downstream disposition

Because registration did not pass, the visible 3:4 guide cannot be mapped authoritatively into the native still. The additional three-case guide validation is therefore not admissible and was not run.

```text
COMPOSITION_GUIDE = NOT_CREATED
OPPO_FINAL_3_CASE_AB = NOT_REACHED
FINE_TUNE_DEVICE_GATE = NOT_REACHED
FINAL_DEVICE_SAVE = NOT_REACHED
MY_WORKS_READBACK = NOT_REACHED
FULL_MAIN_GOLDEN_FLOW = FAIL
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
```

Transport remains independently accepted and was not reopened. Parent Fine Tune, Final Save, My Works, and Full Golden Flow were not resumed because the automatic-resume precondition `CAMERA_COMPOSITION_FIDELITY = PASS` was not met.

## Regression

```text
Frontend full suite = 81 / 81 PASS
Registration tests = PASS
Camera tests = PASS
TypeScript = PASS
H5 build = PASS_WITH_WARNING / existing bundle-size and DefinePlugin advisories
Backend full suite = 106 / 106 PASS
Provider calls = 0
Luna calls = 0
Raw Video Upload = 0
Frame Stream Upload = 0
```

The test result proves implementation determinism and fail-closed behavior; it does not override the negative real-device compatibility result.
