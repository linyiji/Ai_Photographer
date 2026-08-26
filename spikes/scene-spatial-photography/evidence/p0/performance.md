# Performance Evidence

Browser fixture observations:

| Mode | Coverage | Keyframes | Orientation Hz | Quality p50/p95 | Preview FPS |
|---|---:|---:|---:|---:|---:|
| QUICK | 114° | 10 | 29.7 | 0.0 / 0.2 ms | 0 (fixture) |
| WIDE | 180° | 15 | 26.7 | 0.0 / 0.1 ms | 0 (fixture) |

Candidate evaluation is synchronous and bounded at 8 Hz for camera mode; telemetry clamps queue length to 1 and tests confirm the invariant. Real preview FPS, camera dimensions, memory trend, thermal behavior, and device orientation frequency remain unavailable until OPPO acceptance.
