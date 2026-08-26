# Root-Cause Diagnostic Summary

## CAMERA

```text
Preview stream = 1080×1920 @30fps / environment / camera2 0 facing back
Native still = 3072×4096 JPEG / 7,899,471–7,922,931 bytes / IMAGE_CAPTURE
Current preview crop = CSS cover into 320.9375×192 landscape container; visible rect x 0..1 / y 0.33174294..0.66825706
3:4 diagnostic crop vs still = PARTIAL_MATCH / materially closer than CURRENT COVER
Camera primary cause = MIXED / CSS_COVER_CROP + ASPECT_RATIO_MISMATCH
Camera secondary cause = VIDEO_VS_STILL_FOV_PIPELINE UNRESOLVED / MANUAL_VISUAL_ONLY
Physical lens/zoom evidence = selected back-camera device; current zoom 1; exposed labels only distinguish front/back; no alternate rear-lens claim supported
Recommended remediation direction = DOCUMENT_ONLY / NO IMPLEMENTATION
```

## FINE TUNE PERFORMANCE

```text
UI_ONLY = p50 33.1–33.5ms / p95 34.8–41.6ms / max 34.8–41.6ms / 26.6–26.9 per second / Long Task max 0
CURRENT = p50 124.8–159.9ms / p95 144.8–206.7ms / max 144.8–206.7ms / Long Task max 124–161ms; earlier product path p95 802–836ms / FPS as low as 13 / Long Task max 882ms
RENDERER_MAIN = p50 83.6–96.1ms / p95 109.7–206.0ms / max 109.7–206.0ms / Long Task max 110–193ms
WORKER = roundtrip p50 148.8–328.6ms / p95 295.1–924.9ms / max 295.1–924.9ms; per-sample Worker startup/transfer path
PLAIN_H5 = 3 OPPO runs complete: p50 66.5–84.8ms; p95 80.4–98.7ms; 20 Long Tasks/run; max 81–100ms
Dominant cause = MAIN_THREAD_RENDERER / PIXEL_LOOP
Secondary cause = H5_BROWSER_BASELINE + TARO_REACT_RENDER_CHURN + TELEMETRY_CHURN
Is generic H5 primary? = NO
Is Taro primary? = NO / PARTIAL SECONDARY CONTRIBUTOR
Is Main-thread renderer primary? = YES for sustained Main-thread jank; Worker startup/transfer dominates the current diagnostic Worker alternative
```

## FINE TUNE CAPABILITY

```text
ALL = PASS
LOCAL runtime = PASS
LOCAL overlay = FAIL
LOCAL touch interaction = FAIL
LOCAL classification = MULTIPLE / OVERLAY_MISSING + TOUCH_INTERACTION_MISSING
PERSON controlled-mask runtime = PASS
BACKGROUND controlled-mask runtime = PASS
Production MaskProvider = NOT_IMPLEMENTED
AUTO_SEMANTIC_MASK = NOT_YET_PASS
```

## RANGE

```text
User labelled range = visually presented -30 / 0 / +30 presets
Raw slider range = -100..100
Recipe range = -1..1
Observed +95/-100 cause = UI_LABEL_ONLY_MISMATCH
```

```text
Amendment status = PASS_WITH_WARNING / ROOT CAUSES CLASSIFIED
Warning = preview↔still estimator remained MANUAL_VISUAL_ONLY; diagnostic Worker creates one Worker per sample and is not a production architecture result
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
INTERNAL_USER_GOLDEN_FLOW_READY = NO
PUBLIC_PRODUCTION_READY = NO
Product fixes applied = 0
```
