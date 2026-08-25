# FT-P2 OPPO K11 reproduced baseline

Actual OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.0.0 evidence before the high-resolution Worker fix.

| Path | Count | p50 | p95 | max |
|---|---:|---:|---:|---:|
| ALL | 42 | 44.4 ms | 79.3 ms | 120.6 ms |
| COMBINED | 147 | 134.9 ms | 212.3 ms | 283.4 ms |

COMBINED render p50/p95 was 127.8/175.7 ms with scheduler 206/188/18. The 4000×3000 Combined case measured render 11489.1 ms, encode 380.3 ms and visibly froze the main UI. Ten-minute stress produced warmth and perceived jank. This affirmatively reproduced the failure requiring a bounded fix; it is retained rather than overwritten by final numbers.
