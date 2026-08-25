# XFX_LOCAL_FINE_TUNE_SEMANTIC_MASK_RUNTIME_01

```text
Status: PASS_WITH_WARNING
Track: PARALLEL_LOCAL_FINE_TUNE
Worktree: D:\Projects\_worktrees\Ai_Photographer-fine-tune
Branch: spike/local-fine-tune-runtime-v0.1
Start Head: 1baaca415ea596a0404f1e69af3dcfd4cc33edd1
Common Base: 68afacb7b9900f27fc99b75a63ef68724177f0d1

Renderer: Canvas2D ImageData deterministic renderer
Mask Runtime: PASS
MaskProvider: PASS
FixtureMaskProvider: PASS
ExternalMaskProvider: PASS
Local Semantic Provider: DEFERRED_WITH_EVIDENCE
Local Provider Runtime: MediaPipe Tasks Vision Image Segmenter evaluated, not admitted
Package: @mediapipe/tasks-vision (evaluated, not installed)
Model: image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite
Model Size: 2780176 bytes
Model SHA256: FF36E24D40547FE9E645E2F4E8745D1876D6E38B332D39A82F0BF0F5D1D561B3
Model Binary Committed: NO

PERSON Scope: PASS
BACKGROUND Scope: PASS
ALL Scope Regression: PASS
LOCAL_REGION Regression: PASS
Mask Normalization: PASS
Mask Refinement: PASS
Feather: PASS
Hair/Thin-detail Quality: PASS_WITH_WARNING (synthetic PASS; real portrait deferred)
Person→Background Leakage: 0 (analytic fixture)
Background→Person Leakage: 0 (analytic fixture)
Mask Cache: PASS
Per-slider Segmentation Inference: 0
Source Change Invalidation: PASS
Orientation: NOT_FULLY_TESTED

AdjustmentRecipe PERSON: PASS
AdjustmentRecipe BACKGROUND: PASS
semantic_edit_allowed: false / PASS
Recipe Save/Reload: PASS
Deterministic Re-render: PASS
Tests: 96/96 PASS
Pixel/Visual Regression: PASS
FT-P0 Regression: PASS
Fresh npm Reproduction: PASS (repository-root copy, npm ci + validate)

Desktop Browser: PASS
Console Errors: 0
Mask Init Time: 1011.5ms fixture full-resolution creation
First Inference: 1011.5ms fixture provider
Warm Inference: 0ms cache hit
Slider p50: 65.6ms
Slider p95: 123.1ms
FT-P0 p95 baseline: 147.9ms
Performance Regression: -16.8% (improvement)

Third-party Image Upload: 0
Cloud Image Provider Calls: 0
Generative AI: 0
M01: PRESERVED
Mask Contract: EPHEMERAL / GAP_RECORDED
Real Device Gate: NOT_REQUIRED_FOR_FT_P1
FT-P1: PASS_WITH_WARNING
AUTO_SEMANTIC_MASK: NOT_YET_PASS

Commits: 437d723 (runtime), 916cb0b (scopes), report-containing evidence commit
Remote Fine Tune Branch: PASS (push verified in final closure)
Main: UNTOUCHED (read-only observed main aa816548a53384e4e215e1496d6697f2aff25a16)
Live: UNTOUCHED (read-only observed 7fa45fae5790825207ff1e7bf0860947dede2f5a)
AI Visual: UNTOUCHED / NOT_PRESENT in worktree list
Fine Tune Worktree: CLEAN (verified after push)
```

## Admission and authority

Admission matched the requested worktree, branch and exact start head. The published branch was not rebased and Main/develop were not merged. M01 schema files and global project status were not modified.

## Warning rationale

MediaPipe SDK licensing and browser-local processing are documented, but model redistribution authority on the evaluated download surface is not sufficiently explicit and real portrait hair/hand quality is unproven. The provider-independent runtime therefore ships with deterministic fixture and external/precomputed adapters only. Uploaded images enter a controlled semantic-unavailable state without disabling ALL or LOCAL_REGION.

Orientation is also retained as `NOT_FULLY_TESTED`: source-upright coordinate semantics and EXIF 1/6/8 synthetic contract checks pass, but no browser-decoded EXIF photographic fixture was executed.

## Next recommended task

`XFX_LOCAL_FINE_TUNE_REAL_DEVICE_AND_PERFORMANCE_01` — DO NOT START AUTOMATICALLY.
