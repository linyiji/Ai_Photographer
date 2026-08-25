# LIVE-P2 Real Device Attempt — OPPO K11 — Failing Evidence

This attempt is retained and is not a PASS.

```text
Device = OPPO K11 / ColorOS 15.0 / Chrome Mobile
Preview FPS = 30
Vision Hz = 8.0
State Hz = 6.4
Inference p50 / p95 = 80 / 99.3 ms
Visible stall / black screen / crash = NONE
Thermal = slight warming
```

User-observed UX checks were positive for one instruction at a time, no overwrite while moving correctly, automatic verification after stop, no obvious rapid X/Scale switch, one HOLD display, no READY while visibly moving, and no crash. However the authoritative counters contradicted a passing correction loop:

| Trial | Observed sequence | Instructions / Success | Improving / No Effect | Wrong / Oscillation | Time |
| --- | --- | ---: | ---: | ---: | ---: |
| A | right -> left -> HOLD | 8 / 0 | 1 / 1 | 2 / 0 | 0.7 s |
| B | closer -> farther -> HOLD | 8 / 0 | 1 / 3 | 3 / 0 | 19.2 s |
| C | left -> farther -> recovery -> right -> recovery -> HOLD | 13 / 1 | 1 / 3 | 3 / 0 | 7.6 s |

Excluding one final HOLD from each trial, correction success was `0/7`, `0/7`, and `1/12`, far below the candidate 80% gate. Trial A's 0.7 s time is incompatible with eight emissions and a 1200 ms gap.

Root cause: all-satisfied state could accumulate READY stability before an active WAITING correction had verified SUCCESS. Overshoot across the target could also be mislabeled WRONG_DIRECTION because only absolute error was compared. This attempt triggered a bounded same-root-cause fix and required revalidation.

## Post-fix revalidation

The same device completed three new trials after the bounded READY/overshoot fix:

| Trial | Observed sequence | Instructions / Success | Improving / No Effect | Wrong / Oscillation | Time | READY |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| A | left -> moving -> right -> HOLD | 8 / 2 | 0 / 1 | 0 / 0 | 0.7 s | YES |
| B | closer -> moving -> center -> right -> HOLD -> closer -> farther -> HOLD | 13 / 1 | 1 / 0 | 0 / 0 | 1.7 s | YES |
| C | left -> moving -> right -> right -> HOLD | 8 / 2 | 1 / 3 | 1 / 0 | 10.0 s | YES |

The fix removed the prior `READY with zero SUCCESS` result and eliminated obvious oscillation. Using terminal correction outcomes, aggregate correction success is `5 / (5 SUCCESS + 4 NO_EFFECT + 1 WRONG_DIRECTION) = 50%`. This is below the Authority candidate hard gate of `>=80% with enough correction events`. Trial A's retained `0.7 s` time also shows that current time-to-target telemetry can arm before the intended offset trial begins and is not trustworthy as trial-duration evidence.

This is a completed real-device FAIL, not a request for further ad-hoc tuning. The implementation/automation gate remains PASS and LIVE-P1 remains PASS.

```text
LIVE-P2 = FAIL
P2 Real Device Gate = FAIL
Aggregate Terminal Correction Success = 50% / REQUIRED >=80%
Provider / Backend / Luna / Upload = 0 / 0 / 0 / 0
```
