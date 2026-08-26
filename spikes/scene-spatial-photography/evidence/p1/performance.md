# P1 Performance

P1 runs only after P0 sweep completion. P0 camera candidate evaluation remains unchanged at its bounded 8 Hz path.

Desktop fixture observations:

| Mode | Descriptors | Regions | Opportunities | Total P1 |
|---|---:|---:|---:|---:|
| QUICK cold | 10 | 3 | 3 | 27.1 ms |
| WIDE | 15 | 3 | 3 | 2.9–13.5 ms |

P1 V2 OPPO K11 observations across 5 trials:

- prepared frames: 4–11;
- total analysis: 13.8–67.6 ms;
- descriptor: 10.8–52.4 ms;
- region metadata: 0.3–1.4 ms;
- candidate generation: 0.2–1.6 ms;
- recorded Preview FPS median: 29.69–29.97.

All results are below the 1500 ms candidate target. The user reported no black screen, jank, freeze, or huge false jump. Browser memory/thermal APIs remain unavailable.
