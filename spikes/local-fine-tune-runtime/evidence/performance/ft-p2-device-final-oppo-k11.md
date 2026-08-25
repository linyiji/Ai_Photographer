# FT-P2 OPPO K11 final

Status: `PASS_WITH_WARNING`.

Implementation gate: PASS. Real device gate: PASS_WITH_WARNING. Automatic semantic mask remains `NOT_YET_PASS`.

| Path | Count | p50 | p95 | max | Disposition |
|---|---:|---:|---:|---:|---|
| ALL | 42 | 44.4 ms | 79.3 ms | 120.6 ms | PASS |
| SEMANTIC | 300 | 29.0 ms | 84.3 ms | 96.8 ms | PASS |
| LOCAL | 227 | 26.4 ms | 79.1 ms | 94.6 ms | PASS |
| COMBINED | 189 | 50.3 ms | 109.2 ms | 126.1 ms | PASS_WITH_WARNING |

Post-fix 12MP Local was 2485.4 ms total. Post-fix 12MP Combined was 4172.9 ms total, down from approximately 11869.4 ms; `worker=true` and the page stayed scrollable. No crash, OOM, blank canvas, reload, persistent freeze or progressive slowdown occurred in the post-fix 10-minute run. Memory was observed between 40.1 and 87.5 MB.

The warning is retained because COMBINED misses the ideal p50 <50 ms / p95 <100 ms target and thermal evidence is qualitative. It remains inside the accepted p50 ≤80 ms / p95 ≤150 ms warning range without severe stalls.
