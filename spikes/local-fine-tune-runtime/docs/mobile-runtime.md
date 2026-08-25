# Mobile runtime (FT-P2)

The Canvas2D reference preview now uses a latest-state-wins scheduler: recipe authority mutates immediately, one animation-frame render is queued, obsolete pending states are coalesced, and source replacement invalidates queued work. A second animation frame closes the input-to-present measurement.

The development-only device panel reports user agent, source/preview dimensions, backend, benchmark path, input-to-present and render p50/p95/max, mask state/inference count, scheduled/executed/coalesced counters, final render/encode, and memory when available.

Adaptive preview is deterministic: 512px long edge for viewport ≤520px or ≤4GB reported memory, 640px default, 768px for wide/high-memory desktop, never above source size. Final export always reads immutable full-resolution Source.

SOFTNESS semantics are unchanged; its separable blur buffer is cached by immutable Source identity. Canvas2D remains the only admitted/reference backend. Worker, OffscreenCanvas and WebGL2 were not justified by post-optimization proxy evidence.
