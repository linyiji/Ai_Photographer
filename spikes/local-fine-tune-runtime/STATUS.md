# FT-P0 Status

FT-P2: `READY_FOR_MANUAL_DEVICE_TEST`. Implementation, automated and browser-proxy gates pass with 131 tests; OPPO K11 performance, touch, 10-minute stability, thermal and real-device orientation remain `MANUAL_REVIEW_REQUIRED`. `FT-P2=NOT_YET_PASS`, `FINE_TUNE_INTEGRATION_READINESS=NOT_READY`, `AUTO_SEMANTIC_MASK=NOT_YET_PASS`.

FT-P1 is `PASS_WITH_WARNING`: semantic runtime, fixture/external providers, PERSON/BACKGROUND, cache, quality metrics, 96 tests, build, and desktop browser acceptance pass. `AUTO_SEMANTIC_MASK=NOT_YET_PASS` because the evaluated model redistribution authority and portrait quality are not established. Orientation is `NOT_FULLY_TESTED`; real device is not required for FT-P1.

```text
TASK=XFX_LOCAL_FINE_TUNE_RENDERER_RECIPE_SPIKE_01
TRACK=PARALLEL_LOCAL_FINE_TUNE
STATUS=PASS_WITH_WARNING
BASE=68afacb7b9900f27fc99b75a63ef68724177f0d1
REAL_DEVICE_GATE=NOT_REQUIRED_FOR_FT_P0
```

Implemented and validated:

- deterministic Canvas2D/ImageData CPU renderer;
- canonical parameter evaluation order;
- ALL and LOCAL_REGION with smoothstep feather;
- maximum three local regions, selectable chips, drag, resize, and delete;
- schema-valid AdjustmentRecipe with `semantic_edit_allowed=false`;
- save/reload, Undo/Redo/Reset, Compare, full-resolution JPEG export;
- 47 automated tests including locked pixel regression;
- production build and desktop in-app browser acceptance.

Warnings retained:

- desktop global adjustment latency measured `p50=80.1ms`, `p95=147.9ms`; p95 misses the candidate `<100ms` target;
- overlapping multi-region/gesture work produced higher transient latency, up to `557.4ms` in the bounded stress path;
- EXIF orientation is decoded through `createImageBitmap(..., imageOrientation: "from-image")`, but no orientation-tagged fixture was accepted, so Orientation is `NOT_FULLY_TESTED`;
- real-device and real-photo quality/performance remain outside FT-P0.

Next task candidate: `XFX_LOCAL_FINE_TUNE_SEMANTIC_MASK_RUNTIME_01`. Do not start automatically.
