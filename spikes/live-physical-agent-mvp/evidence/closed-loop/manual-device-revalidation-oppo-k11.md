# LIVE-P2 Recalibration Device Revalidation — OPPO K11

```text
Status = PENDING FRESH DEVICE TEST
Historical result = FAIL / 50% / PRESERVED SEPARATELY
Required sample = >=3 trials AND >=10 terminal ordinary ActionEpisodes
Required success = >=80%
Raw media = MUST REMAIN 0
```

All accepted trials must be explicitly ARMED. Record every terminal episode without cherry-picking, plus Preview FPS, Vision Hz, inference p50/p95, State Hz, instruction timestamp gap, timing plausibility, oscillation, physical direction, READY causality, HOLD count, thermal, stalls, and external counters.

## Diagnostic attempt 1 — not accepted

The first uploaded scalar trace contained 267 rows / 38.05 s, no raw media, eight ordinary instruction events, two HOLD events, and minimum ordinary gap 1201.3 ms. Episode 1 correctly terminated SUCCESS and entered READY about 2.15 s after its instruction. Subsequent movement nevertheless created more Episodes inside the already-ready trial (seven terminal Episodes total plus Episode 8 incomplete). This exposed post-READY denominator contamination. The run is excluded in full and triggered the bounded READY-latch fix; no favorable subset is counted toward the >=10 accepted Episodes.
