# XFX_LOCAL_FINE_TUNE_REAL_DEVICE_AND_PERFORMANCE_01

```text
Status: READY_FOR_MANUAL_DEVICE_TEST
Start Head: 4ea34e2e36bec4a6f5b8ab181eb51e85b3336110
Device: OPPO K11 / actual OS pending / actual Chrome pending
Renderer Before: CANVAS2D_IMAGE_DATA
Renderer After: CANVAS2D_IMAGE_DATA
Reference Backend: CANVAS2D_IMAGE_DATA
Preview Resolution: adaptive 512 / 640 / 768 long edge; phone-width proxy 512×288
Optimization: latest-state scheduler; stale-source invalidation; cached preview masks; cached immutable SOFTNESS blur; pre-clamped local geometry; adaptive preview; duplicate-export guard

ALL: device count/p50/p95/max=pending manual
SEMANTIC: device count/p50/p95/max=pending manual
LOCAL: device count/p50/p95/max=pending manual
COMBINED: device count/p50/p95/max=pending manual

Desktop mobile-viewport proxy (390×844, not device evidence):
ALL count=35 p50=33.6ms p95=53.3ms max=68.8ms
SEMANTIC count=30 p50=11.6ms p95=24.8ms max=26.6ms
LOCAL count=32 p50=13.7ms p95=27.8ms max=32.0ms
COMBINED count=36 p50=54.6ms p95=63.8ms max=74.7ms

PERSON=PASS (implementation/browser proxy)
BACKGROUND=PASS (implementation/browser proxy)
LOCAL_REGION_TOUCH=MANUAL_REVIEW_REQUIRED
MAX_LOCAL_REGIONS=3/PASS (automated/browser proxy)
Mask Cache=PASS
Per-slider Mask Inference=0
Source Switch Invalidation=PASS
Cross-source Mask Reuse=0

Orientation EXIF1=PASS desktop / pending OPPO
Orientation EXIF6=PASS desktop / pending OPPO
Orientation EXIF8=PASS desktop / pending OPPO
Orientation Final=NOT_FULLY_TESTED

1080p Neutral Final Render=88.6ms; Encode=89.0ms
1080p Global Final Render=380.6ms; Encode=70.6ms
1080p Semantic Final Render=736.6ms; Encode=66.6ms
1080p Combined Final Render=818.1ms; Encode=60.7ms
High-res Source=4000×3000
High-res Local Final Render=877.3ms; Encode=277.2ms
High-res Combined Final Render=5976.2ms; Encode=287.8ms (desktop Chromium; >3s warning, <8s fail boundary)
High-res automated combined CPU render=7888.6ms isolated / 21698.3ms under parallel CPU contention (non-device diagnostic)
Final Dimensions=PRESERVED

Recipe Save/Reload Device=MANUAL_REVIEW_REQUIRED (browser proxy PASS)
Undo=MANUAL_REVIEW_REQUIRED (automated/browser proxy PASS)
Redo=MANUAL_REVIEW_REQUIRED (automated/browser proxy PASS)
Compare Touch=MANUAL_REVIEW_REQUIRED (cancel regression PASS)
10-minute Stability=MANUAL_REVIEW_REQUIRED
Crash=pending device
OOM=pending device
Blank Canvas=pending device
Thermal=pending device

Console Errors=0 desktop browser
Slider Network Calls=0 implementation/browser
Third-party Image Upload=0
Cloud Provider Calls=0
Generative AI=0
AUTO_SEMANTIC_MASK=NOT_YET_PASS

Automated Tests=131/131 PASS
Fresh npm Reproduction=PASS
FT-P0 Regression=PASS
FT-P1 Regression=PASS
Pixel/Visual Regression=PASS
Cross-backend Consistency=NOT_APPLICABLE
M01=PRESERVED

Implementation Gate=PASS
Real Device Gate=MANUAL_REVIEW_REQUIRED
FINE_TUNE_INTEGRATION_READINESS=NOT_READY
FT-P2=NOT_YET_PASS

Commits: 27f61eb (runtime/perf), 5779aee (tests), report-containing documentation commit
Remote Fine Tune Branch=PASS (verified at final push)
Main=UNTOUCHED
Live=UNTOUCHED
AI Visual=UNTOUCHED/NOT_PRESENT
Fine Tune Worktree=CLEAN (verified after push)
```

## Evidence boundary

No controllable physical OPPO K11 was available. Desktop Chromium and a 390×844 viewport were used only to validate instrumentation, functional browser behavior and proxy performance. They are not represented as phone, thermal, touch or stability evidence.

The implementation is ready for the owner to run `spikes/local-fine-tune-runtime/evidence/manual-device/ft-p2-oppo-k11.md`. Until that sheet is completed, FT-P2 and integration readiness cannot pass.

No automatic semantic model was admitted. No M01 schema or Main global project status was modified.

## Next candidate

After real-device closure only: `XFX_LOCAL_FINE_TUNE_INTEGRATION_READINESS_AND_ADVANCED_POLISH_01`. Do not start automatically.
