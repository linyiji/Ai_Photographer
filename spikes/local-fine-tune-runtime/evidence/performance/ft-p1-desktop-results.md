# FT-P1 desktop performance

1920×1080 synthetic source, 640×360 preview:

- Fixture first creation: 1011.5ms
- Warm cache: 0ms contractually; inference count stayed 1
- Slider p50/p95: 65.6ms / 123.1ms
- FT-P0 p95: 147.9ms; regression -16.8% (improvement)
- Per-slider inference: 0; network render path: none

An initial p95 of 193.5ms exposed repeated mask resizing. Caching preview masks on source/mask change removed it from the slider hot path.
