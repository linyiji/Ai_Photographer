# XFX_LOCAL_FINE_TUNE_RENDERER_RECIPE_SPIKE_01

## Result

```text
Status=PASS_WITH_WARNING
Track=PARALLEL_LOCAL_FINE_TUNE
Profile=FRONTEND_RUNTIME_COMPATIBILITY
Mode=FEATURE_INTEGRATION
FT-P0=PASS_WITH_WARNING
Real Device Gate=NOT_REQUIRED_FOR_FT_P0
```

The deterministic editor core is viable and M01-compatible. The bounded warnings are desktop preview p95 above the candidate target, slower dense multi-region pointer updates, and incomplete orientation fixture coverage. Core recipe determinism and export did not fail.

## Admission and lineage

```text
Worktree=D:\Projects\_worktrees\Ai_Photographer-fine-tune
Branch=spike/local-fine-tune-runtime-v0.1
Base Commit=68afacb7b9900f27fc99b75a63ef68724177f0d1
Start Head=68afacb7b9900f27fc99b75a63ef68724177f0d1
Main develop observed read-only=46393ce0a37bb9e339933679438ff57f58c1e835
Main head observed read-only=46393ce0a37bb9e339933679438ff57f58c1e835
Rebase=0
Merge Main=0
Cherry-pick Main=0
```

Main had advanced and remained outside this task. Main working files and the Live worktree were not modified.

## Runtime

```text
Node=24.18.0
npm=11.6.2
TypeScript=5.9.3
Vite=8.2.2
Vitest=4.1.11
Ajv=8.20.0
Ajv Formats=3.0.1
@types/node=24.13.3
Fresh npm ci=PASS
TypeScript=PASS
Build=PASS
```

All direct versions and the full transitive tree are exactly pinned by `package-lock.json`. Ajv/Ajv-formats are MIT-licensed contract validation dependencies; no image/editor SDK is used.

## Renderer

```text
Renderer Selection=CANVAS2D_IMAGE_DATA
Renderer Fallback=CANVAS2D CPU reference is primary/portability path; fail closed if unavailable
Preview Source=DOWNSAMPLED 640x360 from 1920x1080 fixture
Final Source=FULL_QUALITY
Source Immutable=PASS
Canonical order=BRIGHTNESS > WARMTH > SATURATION > SOFTNESS
```

The rejected initial per-adjustment/multi-pass renderer measured about p95 848.5 ms. The accepted single-pass canonical renderer with separable softness reduced normal global interaction to p50 80.1 ms / p95 147.9 ms.

## Functional acceptance

```text
BRIGHTNESS=PASS
WARMTH=PASS
SATURATION=PASS
SOFTNESS=PASS
ALL Scope=PASS
LOCAL_REGION=PASS
Feather=PASS
Local Drag=PASS
Local Resize=PASS
Max Local Regions=3 / PASS
Fourth Region=BLOCKED / PASS
PERSON=DEFERRED
BACKGROUND=DEFERRED
MOOD=DEFERRED
SKIN_TONE=DEFERRED
SKIN_RETOUCH=DEFERRED
BLUR=DEFERRED
```

Overlapping region selection was repaired by adding bounded region chips; drag and resize remain directly available on the overlay. Local geometry never changes crop, dimensions, or composition.

## Recipe and history

```text
AdjustmentRecipe=PASS
AdjustmentRecipe Schema=PASS
semantic_edit_allowed=false / PASS
Recipe Save=PASS
Recipe Reload=PASS
Deterministic Re-render=PASS
Undo=PASS
Redo=PASS
Redo invalidation=PASS
Reset=PASS
Compare=PASS
```

Save → Reset → Reload restored three independently adjusted region descriptors. Compare did not mutate recipe values. History stores recipe clones only.

## Export

```text
JPEG Export=PASS
Output Dimensions=PRESERVED (1920x1080)
MIME=image/jpeg
Byte Size=137.7 KB
Browser Final Render=1397 ms
Browser Encode=79 ms
Node 1920x1080 Render=1516.3 ms
Node 2560x1440 Render=2566.5 ms
Orientation=NOT_FULLY_TESTED
```

The decode path requests EXIF-aware orientation through `createImageBitmap`, but no accepted orientation-tagged JPEG fixture was available. This remains a warning rather than an invented PASS.

## Automated and browser evidence

```text
Unit Tests=47/47 PASS
Test Files=5/5 PASS
Pixel/Visual Regression=PASS
Repeat Pixel MAE=0
Repeat Max Channel Difference=0
Reference SHA256=0d614e1807c312e6a5846f401a94b4317d628ce9ab7b28973e964cda59d578fd
Desktop Browser=PASS_WITH_WARNING
Console Errors=0
```

Desktop browser acceptance verified page/fixture load, global and local parameter changes, three-region limit, region selection, drag, resize, Undo/Redo/Reset, Save/Reload, Compare, and JPEG export. Visual inspection found no obvious hard rectangle, severe halo, severe seam, clipping, or destructive softness at tested safe values.

## Performance warning

```text
Desktop Input-to-preview p50=80.1 ms
Desktop Input-to-preview p95=147.9 ms
Dense overlapping local/gesture transient p95=up to 557.4 ms
Candidate target p50<50ms / p95<100ms=MISS
Disposition=PASS_WITH_WARNING
```

The 1080p Final target `<3s` passed. Preview p95 remains a real optimization input for a later GPU/worker or dirty-region evaluation and must not be called mobile performance PASS.

## Privacy, cost, and Authority

```text
Provider Calls=0
AI Token Cost=0
Third-party Image Upload=0
Backend Per-slider Calls=0
Generative AI=0
M01 AdjustmentRecipe=PRESERVED
M01 Mapping=GAP_RECORDED
```

The spike-local normalized region descriptor and feather/overlap semantics fit the current schema's open `region` object but are not promoted global Authority.

## Git closure

Up to three logical commits are used:

1. `spike: bootstrap local fine tune renderer`
2. `feat: add recipe history and local adjustment`
3. `test: validate fine tune renderer spike`

The closure commit contains this report. The isolated branch is pushed after final validation; exact SHAs are authoritative in Git and the final operator output.

```text
Remote Fine Tune Branch=PASS after closure push
Main Repository=UNTOUCHED
Live Worktree=UNTOUCHED
Fine Tune Worktree=CLEAN after closure push
```

## Next task

```text
Next Recommended Task=XFX_LOCAL_FINE_TUNE_SEMANTIC_MASK_RUNTIME_01
DO NOT START NEXT TASK
```
