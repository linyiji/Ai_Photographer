# XFX_LOCAL_FINE_TUNE_FT_P2_REAL_DEVICE_ACCEPTANCE_AND_CLOSURE_01

```text
Status: PASS_WITH_WARNING
Start Head: dee3c9645388d3efee09a7783b649cb8a37330f9
Device: OPPO K11
OS: ColorOS 15.0
Chrome: Chrome Mobile 138.0.0.0
Viewport: not separately captured (evidence limitation)
Preview: 512x288 from 1920x1080 Source
Renderer: CANVAS2D_IMAGE_DATA; Worker/OffscreenCanvas final export

ALL: count=42 p50=44.4ms p95=79.3ms max=120.6ms
SEMANTIC: count=300 p50=29.0ms p95=84.3ms max=96.8ms
LOCAL: count=227 p50=26.4ms p95=79.1ms max=94.6ms
COMBINED: count=189 p50=50.3ms p95=109.2ms max=126.1ms
Repeated >300ms Stalls: 0 post-fix
Persistent >500ms Stalls: 0 post-fix

Touch Drag: PASS
Touch Resize: PASS
Max Regions: 3 / PASS; fourth blocked
PERSON: PASS
BACKGROUND: PASS
Mask Cache: PASS
Per-slider Mask Inference: 0
Source Switch: PASS
Cross-source Mask Reuse: 0
Recipe Save/Reload: PASS
Undo/Redo/Reset: PASS
Compare Touch: PASS
EXIF 1/6/8: PASS
Orientation Final: PASS

1080p representative device JPEG: render=333ms encode=84ms total=417ms
4000x3000 Local: render=2174.2ms encode=311.2ms total=2485.4ms
4000x3000 Combined: render=3929.4ms encode=243.5ms total=4172.9ms
Pre-fix 4000x3000 Combined: render=11489.1ms encode=380.3ms; main UI freeze reproduced
Final Dimensions: PRESERVED
Duplicate Export: BLOCKED (counter observed at 5)

10-minute Stability: PASS post-fix
Crash/OOM/Blank Canvas: 0 observed
Progressive Slowdown: NONE post-fix
Memory API: 40.1-87.5MB observed
Thermal: WARM pre-fix; qualitative/no throttling symptom post-fix
Console Fatal Errors: 0 observed
Slider Network Calls: 0 observed
Third-party Image Upload: 0
Cloud Image Provider: 0
Generative AI: 0
AUTO_SEMANTIC_MASK: NOT_YET_PASS

Automated Tests: 131/131 PASS
FT-P0 Regression: PASS
FT-P1 Regression: PASS
M01: PRESERVED
Bounded Fix Required: YES
Fix Commits: 68f5fc9, 2ca2ecc
Implementation Gate: PASS
Real Device Gate: PASS_WITH_WARNING
FT-P2: PASS_WITH_WARNING
FINE_TUNE_INTEGRATION_READINESS: READY_FOR_INTEGRATION_DESIGN
Main: UNTOUCHED
Live: UNTOUCHED
AI Visual: UNTOUCHED / NOT_PRESENT
```

## Disposition

The actual device reproduced a duplicate-export observability defect, COMBINED p95 212.3 ms and an 11.87 s 12MP main-thread freeze. The bounded fixes exposed/count duplicate blocks, precompiled adjustment weights and moved final rendering/encoding into a Worker. Post-fix COMBINED fell to p95 109.2 ms and 12MP Combined to 4.17 s while scrolling remained responsive.

The gate is `PASS_WITH_WARNING`, not PASS, because COMBINED misses the ideal p50/p95 targets and thermal evidence is qualitative. It remains within the accepted warning range with no post-fix severe stall, crash, OOM, blank canvas or slowdown.

No automatic semantic model, cloud provider, generative edit, M01 change, Main/Live/AI Visual mutation, rebase or merge occurred. Integration readiness means only that a separate design task may be authored; raw Spike merge is not authorized.

Evidence: `spikes/local-fine-tune-runtime/evidence/manual-device/ft-p2-oppo-k11.md`.

Next recommended task: `XFX_LOCAL_FINE_TUNE_INTEGRATION_READINESS_AND_ADVANCED_POLISH_01`. Do not start automatically.
