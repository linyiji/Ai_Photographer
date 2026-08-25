# Platform requirements

| Capability | H5 requirement/fallback | Status |
|---|---|---|
| Canvas2D + ImageData | deterministic preview/reference and final fallback | EVIDENCE_BACKED |
| orientation-aware decode | createImageBitmap/browser decode; EXIF 1/6/8 required | EVIDENCE_BACKED on tested Chrome |
| Worker | preferred final execution | EVIDENCE_BACKED on OPPO Chrome |
| OffscreenCanvas + JPEG Blob | preferred Worker encode | EVIDENCE_BACKED on OPPO Chrome |
| Blob download/storage adapter | browser demo downloads; Main supplies persistence | EVIDENCE_BACKED demo only |
| Pointer Events | slider/region drag/resize/Compare | EVIDENCE_BACKED on OPPO Chrome |

Fallback policy: Worker/OffscreenCanvas absence uses Canvas2D on the main thread with an explicit performance warning and duplicate-export guard. Unsupported decode/Canvas fails closed; preview pixels are never promoted as Final.

Scope of evidence is H5 on Chrome, including OPPO K11. WeChat Fine Tune runtime is `UNVERIFIED`; iOS/Safari is `UNVERIFIED`. The future integration task must validate H5, WeChat build/runtime capability mapping and at least one iOS/Safari disposition without generalizing OPPO results.
