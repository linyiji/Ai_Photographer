# LIVE V2 to V3 Migration Matrix

Status: design mapping complete; runtime migration not admitted.

| Concern | V2 implemented baseline | V3 design candidate | Disposition |
| --- | --- | --- | --- |
| Measurement input | Semantic framing plus controller knowledge of compatibility/scale family | `LiveMeasurementV3` relation/quality/freshness projection | Adapter implemented |
| Framing control | Controller-level compatibility plus `CoarseFramingEpisode` | Unified `FRAMING` stage | Pure controller only |
| Precision order | Dynamic X/Scale ranking | Fixed FRAMING then ALIGN_X | Implemented in pure V3 |
| Priority | missing 100, X 10, Scale 8, Y 6 | none | Removed from V3 |
| Axis switching | 1.25x dominance and hysteresis | no competing axes | Removed from V3 |
| Ordinary action | continuous motion until STOP | one small human step, then settle | Implemented in pure V3 |
| STOP | corridor 1.5 + 350 ms prediction | absent from default | Removed from V3 |
| Episode states | WAITING/TRACKING/BRAKING/VERIFYING/TERMINAL | ISSUED/WAIT_FOR_SETTLE/EVALUATED | Implemented in pure V3 |
| Intermediate improvement | non-terminal | terminal `IMPROVED` | Implemented with noise-safe threshold |
| Invalid evidence | often suppress/timeout into V2 taxonomy | explicit `INVALIDATED`, excluded from effectiveness | Implemented |
| READY | success or passive-confirmation branches into shared latch | one stable GOOD/fresh geometry path | Implemented in pure V3 |
| Recovery | four failures, recovery required | three valid failures, PAUSED | Implemented in pure V3 |
| Y | measured, exempt/deferred | observation-only | Preserved |
| Display | separate smoothing and overlay | frozen | Preserved |
| Runtime selector | V2 only | V2/V3 debug selector | Not admitted |
| Device gate | historical V2 Gate 1/2 | fresh V3 Gate after A/B | Not reached |

## Complexity comparison

The comparison counts canonical controller structure, not TypeScript cyclomatic complexity:

| Metric | V2 | V3 candidate |
| --- | ---: | ---: |
| Runtime state labels | 13 | 6 |
| Canonical timing gates | 12 | 6 |
| Canonical transition branch families | 15 | 8 |
| Dynamic arbitration rules | weighted rank + 1.25x dominance + X/Scale competition | 0 |
| Predictive STOP branches | corridor + prediction + braking | 0 |

V3 is structurally lower-complexity, but lower complexity alone cannot authorize runtime promotion without comparable action-effectiveness evidence.
