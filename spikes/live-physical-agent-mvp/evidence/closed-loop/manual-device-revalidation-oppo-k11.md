# LIVE-P2 Recalibration Device Revalidation — OPPO K11

```text
Status = COMPLETE / FAIL
Historical result = FAIL / 50% / PRESERVED SEPARATELY
Required sample = >=3 trials AND >=10 terminal ordinary ActionEpisodes
Required success = >=80%
Raw media = MUST REMAIN 0
```

All accepted trials must be explicitly ARMED. Record every terminal episode without cherry-picking, plus Preview FPS, Vision Hz, inference p50/p95, State Hz, instruction timestamp gap, timing plausibility, oscillation, physical direction, READY causality, HOLD count, thermal, stalls, and external counters.

## Diagnostic attempt 1 — not accepted

The first uploaded scalar trace contained 267 rows / 38.05 s, no raw media, eight ordinary instruction events, two HOLD events, and minimum ordinary gap 1201.3 ms. Episode 1 correctly terminated SUCCESS and entered READY about 2.15 s after its instruction. Subsequent movement nevertheless created more Episodes inside the already-ready trial (seven terminal Episodes total plus Episode 8 incomplete). This exposed post-READY denominator contamination. The run is excluded in full and triggered the bounded READY-latch fix; no favorable subset is counted toward the >=10 accepted Episodes.

## Accepted post-fix sample

Device: OPPO K11 / ColorOS 15 / Chrome Mobile. All three trials were explicitly ARMED and their complete scalar traces were included. No raw media was present or uploaded.

Fresh Preview FPS, Vision Hz, and inference percentiles were not separately transcribed with these three uploads. The scalar cadence remained active, but it is not substituted for those HUD metrics. This missing performance transcription cannot rescue or alter the already-failed 17.6% core control gate.

| Trial | Trace rows / duration | Terminal Episodes | SUCCESS | NO_EFFECT | WRONG | Rate | Min gap | Time to target | Post-READY ordinary |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A — horizontal offset | 148 / 20.94 s | 5 | 1 | 4 | 0 | 20.0% | 1601.6 ms | 15.62 s | 0 |
| B — mixed horizontal/scale observed | 200 / 27.91 s | 7 | 2 | 4 | 1 | 28.6% | 1301.1 ms | 21.64 s | 0 |
| C — combined offset | 267 / 38.44 s | 5 | 0 | 4 | 1 | 0.0% | 1568.2 ms | 33.18 s | 0 |
| **All accepted** | **615 rows** | **17** | **3** | **12** | **2** | **17.6%** | **>=1301.1 ms** | **all <60 s** | **0** |

Defined denominator: `3 / (3 + 12 + 2) = 17.6%`. The required `>=80%` gate fails. No terminal outcome was excluded and the earlier diagnostic trace was excluded in full rather than cherry-picked.

Telemetry semantics pass: ordinary/HOLD are separate, every accepted ordinary Episode has one terminal result, instruction gaps exceed 1200 ms, trial timing begins at first ordinary instruction, and READY prevents post-ready Episode creation. Trial C reached READY after the latest Episode terminally reported WRONG_DIRECTION; this did not rewrite that outcome to SUCCESS, but it is retained as a next diagnostic concern alongside the high overshoot/no-effect rate.

```text
P2 Recalibration Implementation Gate = PASS
P2 Real Device Gate = FAIL
LIVE-P2 = FAIL
Provider / Backend / Luna / Raw Upload = 0 / 0 / 0 / 0
Next hypothesis = action-response/settle policy still allows large human overshoot and READY presentation after a non-SUCCESS latest Episode
```
