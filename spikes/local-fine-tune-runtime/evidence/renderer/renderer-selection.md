# Renderer Selection Evidence

## Probe

Candidates considered: WebGL2 shader, Canvas2D/ImageData, hybrid GPU preview plus CPU export, and OffscreenCanvas/Worker.

Canvas2D/ImageData was selected for FT-P0 because it provides one auditable math path for preview, Final, masks, feather, tests, and exact deterministic regression with no rendering dependency. It is broadly portable and directly compatible with a future worker boundary.

## Negative evidence and bounded correction

The first CPU implementation scanned the image once per adjustment and performed a naive 3×3 blur per softness pixel. Desktop browser stress with four global parameters measured approximately `p95=848.5ms`; this candidate was rejected.

The accepted P0 implementation uses:

- canonical parameter order;
- a single compositing pass;
- one separable blur prepass only when required;
- a 640px-long-edge preview;
- full-quality CPU Final render.

Post-fix global desktop evidence: `p50=80.1ms`, `p95=147.9ms`, latest sample `70.9ms`. This is usable for the spike but remains `PASS_WITH_WARNING` against the candidate p95 target.

## Fallback

Canvas2D/ImageData is both primary and portability/reference path. There is no separate GPU backend to fall back from. Lack of Canvas2D fails closed with a clear error. A future WebGL2 implementation must compare against this reference using bounded pixel metrics.
