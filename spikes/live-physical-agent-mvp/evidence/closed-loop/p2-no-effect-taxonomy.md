# LIVE-P2 accepted episode trajectory taxonomy

Status: PASS  
Input: three complete accepted OPPO K11 scalar traces, 17 terminal Episodes  
Raw media: false

The deterministic analyzer is `scripts/analyze-scalar-traces.mjs`. It preserves every
terminal Episode and does not change its acceptance outcome or denominator.

## Accepted baseline

- SUCCESS: 3
- NO_EFFECT: 12
- WRONG_DIRECTION: 2
- Correction Success: 3 / 17 = 17.6%
- Diagnostic Action Compliance: 12 / 17 = 70.6%
- Axis Target Completion: 3 / 17 = 17.6%

## NO_EFFECT taxonomy

| Subtype | Count |
| --- | ---: |
| NO_MOTION | 0 |
| INSUFFICIENT_PROGRESS | 2 |
| OVERSHOOT | 4 |
| JITTER_OR_UNCERTAIN | 0 |
| AXIS_COUPLED | 0 |
| PREMATURE_SETTLE | 0 |
| LATE_RESPONSE | 3 |
| UNCLASSIFIED | 3 |
| Total | 12 |

Target entry/crossing is treated as stronger causal evidence than response latency.
Consequently, an Episode that responds late and subsequently passes through the useful
band is classified as OVERSHOOT, not LATE_RESPONSE. UNCLASSIFIED is retained where the
trace does not support a stronger claim.

## Wrong-direction audit

| Audit class | Count |
| --- | ---: |
| TRUE_WRONG_DIRECTION | 0 |
| TARGET_CROSS_OVERSHOOT | 1 |
| AXIS_COUPLING_ARTIFACT | 1 |
| MEASUREMENT_UNCERTAIN | 0 |

This audit is diagnostic only. The two historical terminal outcomes remain
WRONG_DIRECTION. No physical X mapping reversal was found.

## Causal finding

Four NO_EFFECT Episodes entered/crossed the target band and then left it before settle.
Together with one audited WRONG_DIRECTION that crossed the target, 5 of 14 historical
failures contain explicit target-cross/overshoot evidence. A non-directional braking cue
is therefore supported; relaxing the 80% gate or target tolerances is not.
