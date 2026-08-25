# XFX LIVE P2 OVERSHOOT AND READY CAUSALITY DIAGNOSTIC 01

```text
Status = FAIL
Start Head = c1d8497cf3a805d46576bfb49a0ab3b8fbcd613e
Historical 50% Evidence = PRESERVED
Historical 17.6% Evidence = PRESERVED

Episode Analyzer = PASS / 17 HISTORICAL EPISODES
NO_EFFECT Taxonomy = PASS
Historical NO_MOTION / INSUFFICIENT / OVERSHOOT / JITTER / AXIS_COUPLED = 0 / 2 / 4 / 0 / 0
Historical PREMATURE_SETTLE / LATE_RESPONSE / UNCLASSIFIED = 0 / 3 / 3
Wrong Direction Audit = PASS / TRUE WRONG 0

Correction Success Semantics = MATCH
Current Meaning = AXIS_TARGET_SUCCESS
Authority Intended Meaning = AXIS_TARGET_SUCCESS
Historical Action Compliance / Axis Completion / Correction Success = 70.6% / 17.6% / 17.6%

Human Servo Overshoot Evidence = PASS
Near-target Corridor / STOP_HERE / Predictive Braking = IMPLEMENTED / IMPLEMENTED / IMPLEMENTED
STOP Ordinary Instruction Count = 0
READY Pending Confirmation = PASS
Ready Sources = EPISODE_SUCCESS / PASSIVE_CONFIRMATION
Local Recovery = 1200 ms AUTO + MANUAL FALLBACK / METRICS AND EPISODE IDS PRESERVED

Automated Tests = 76/76 PASS
Typecheck / Build / Browser Replay = PASS / PASS / PASS

Fresh Device = OPPO K11 / ColorOS 15 / Chrome Mobile
Fresh Trials / Terminal Episodes = 5 / 54
Fresh SUCCESS / NO_EFFECT / WRONG_DIRECTION = 12 / 36 / 6
Fresh Correction Success = 22.2%
Required = >=80%
Fresh Action Compliance / Axis Completion = 42.6% / 22.2%
Fresh Overshoot / STOP Count = 8 / 13
Post-READY Ordinary = 0
Fresh Dominant Failure = JITTER_OR_UNCERTAIN 16
Preview / Vision / State / Inference = NOT TRANSCRIBED / NOT FABRICATED

Provider / Backend / Luna / Raw Upload = 0 / 0 / 0 / 0
LIVE-P1 = PASS
P2 Implementation = PASS
P2 Real Device Gate = FAIL
LIVE-P2 = FAIL
CH-003 = IDENTIFIED / UNCHANGED
Main / Fine Tune = UNTOUCHED / UNTOUCHED
```

The Authority audit retained the original per-axis target-completion meaning and the
unchanged >=80% hard gate. Accepted historical traces showed a causal braking problem,
so the bounded controller now emits at most one non-directional STOP cue near predicted
target entry and separates passive geometric confirmation from Episode SUCCESS.

The first post-change phone submission exposed a separate recovery UX defect: copy
suggested returning to center while the controller was fail-safe stopped, and manual
reset could restart Episode numbering inside an existing Trace. The bounded correction
adds an explicit continue action plus automatic stable recovery after 1200 ms, without
resetting metrics, Trace, or Episode IDs. Automation and browser replay cover both paths.

Five complete, non-overlapping post-fix scalar traces retained all 54 terminal Episodes.
Correction Success was 12/54 = 22.2%, so the device gate fails decisively. The dominant
NO_EFFECT class is measurement/jitter uncertainty rather than overshoot. No threshold,
denominator, or historical result was relaxed or rewritten. Luna remains OFF.

Next recommended task: a bounded LIVE-P2 measurement/settle uncertainty and late-response
diagnostic derived from the fresh subtype distribution. Do not start it automatically.
