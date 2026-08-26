# Filter A/B

Identical 8 Hz synthetic static-noise and step trajectories:

| Filter | Static mean absolute successive jitter | 90% step response |
| --- | ---: | ---: |
| EMA `alpha=0.35` | 0.001496803 | 750 ms |
| One Euro `minCutoff=0.35, beta=2, dCutoff=1` | 0.000941642 | 625 ms |

One Euro improves this fixture's jitter by 37.1% and reaches the 90% step threshold 125 ms earlier. Selected implementation candidate: `ONE_EURO`.

This is an automated candidate result. Device jitter, motion lag, overshoot contribution, and thermal behavior remain mandatory in the OPPO gate. EMA remains implemented as the comparison baseline.
