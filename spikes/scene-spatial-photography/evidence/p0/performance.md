# Performance Evidence

Browser fixture observations:

| Mode | Coverage | Keyframes | Orientation Hz | Quality p50/p95 | Preview FPS |
|---|---:|---:|---:|---:|---:|
| QUICK | 114° | 10 | 29.7 | 0.0 / 0.2 ms | 0 (fixture) |
| WIDE | 180° | 15 | 26.7 | 0.0 / 0.1 ms | 0 (fixture) |

Candidate evaluation is synchronous and bounded at 8 Hz for camera mode; telemetry clamps queue length to 1 and tests confirm the invariant. Browser fixture rows are not used as device-performance evidence.

## OPPO K11 / ColorOS 15 / Chrome Mobile

- Camera source: 1080×1920 rear environment.
- Accepted trial Preview median: 27.52–29.97 FPS; ordinary minima: 24.57–29.85 FPS.
- One WIDE trial recorded an isolated 3.93 FPS estimator minimum while its median was 27.52 FPS; tester reported no visible freeze, black screen, or jank. Retained as warning.
- Orientation event rate: 39.4–52.6 Hz on accepted recorded trials.
- Quality evaluation p50: 15.8–20.6 ms; p95: 22.1–40.1 ms.
- Frame-quality queue: 0 throughout supplied evidence.
- Input blur score distributions were recorded; real-device blur rejections occurred without returning to a zero-keyframe outcome.
- Memory and thermal APIs: unavailable; no qualitative crash/freeze or abnormal behavior reported.
