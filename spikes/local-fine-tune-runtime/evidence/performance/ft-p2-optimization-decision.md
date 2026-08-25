# FT-P2 optimization decision

Pre-optimization 640×360 desktop preview:

- ALL: 33, p50 90.1ms, p95 148.3ms, max 272.5ms
- SEMANTIC: 30, p50 44.7ms, p95 56.0ms, max 110.6ms
- LOCAL: 32, p50 85.8ms, p95 140.3ms, max 194.5ms
- COMBINED + SOFTNESS: 34, p50 216.9ms, p95 288.3ms, max 457.0ms

SOFTNESS recomputed invariant blur and LOCAL repeatedly clamped invariant geometry. Fixes cache blur by immutable Source, pre-clamp geometry per render, and select 512px preview for phone-width/low-memory environments.

Post-optimization 390×844 Chromium viewport, 512×288 preview (desktop proxy, not phone evidence):

- ALL: 35, p50 33.6ms, p95 53.3ms, max 68.8ms
- SEMANTIC: 30, p50 11.6ms, p95 24.8ms, max 26.6ms
- LOCAL: 32, p50 13.7ms, p95 27.8ms, max 32.0ms
- COMBINED: 36, p50 54.6ms, p95 63.8ms, max 74.7ms

Canvas2D remains reference/only backend. Worker/WebGL2/dirty-region rewrites were not justified. Scheduler tests prove final-state-wins and cross-source invalidation.

Desktop Chromium full-resolution evidence: 4000×3000 LOCAL render/encode 877.3/277.2ms; 4000×3000 COMBINED with semantic masks and SOFTNESS 5976.2/287.8ms. The combined case is stable and below the 8s fail threshold but exceeds the 3s candidate target, so a warning remains for device confirmation.
