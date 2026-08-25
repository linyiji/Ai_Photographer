# FT-P2 optimization decision

Desktop proxy optimization first established latest-state scheduling, source invalidation, 512 px phone preview, immutable SOFTNESS caching and pre-clamped geometry. It did not justify a new backend before device evidence.

The OPPO K11 then reproduced two failures: COMBINED p95 212.3 ms and 12MP Combined render/encode 11489.1/380.3 ms with a frozen UI. Root cause was repeated scope/parameter weight evaluation per pixel plus synchronous fixture, render and JPEG work on the main thread.

The bounded fix:

1. compiles adjustments by ALL/PERSON/BACKGROUND and local region so each semantic/local weight is evaluated once per pixel;
2. retains the exact Canvas2D/ImageData renderer and pixel semantics;
3. runs full-resolution fixture generation, mask preparation, rendering and JPEG encoding in a dedicated Worker using OffscreenCanvas, with deterministic Canvas2D fallback;
4. keeps Source immutable by transferring copies, and keeps duplicate-export protection.

Existing locked pixel hashes and all 131 tests remained unchanged. Device results after the fix: SEMANTIC 29.0/84.3 ms, LOCAL 26.4/79.1 ms and COMBINED 50.3/109.2 ms p50/p95; 12MP Local 2485.4 ms; 12MP Combined 4172.9 ms with a scrollable UI.

WebGL2 was not required. Canvas2D remains the deterministic reference and admitted renderer; Worker/OffscreenCanvas changes execution placement, not image semantics.
