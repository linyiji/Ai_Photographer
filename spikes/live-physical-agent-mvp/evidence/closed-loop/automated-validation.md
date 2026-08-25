# LIVE-P2 Automated Validation

## Scope

Pure local deterministic control after accepted P1 structured state. No provider, Backend, Luna, voice, capture, or raw upload path exists.

## Test coverage

Fresh Node 24.18.0/npm 11.6.2 reproduction installed 19 packages with zero reported vulnerabilities. The exact dependency tree passed. The compiled suite passed `21/21` tests across P1 and P2. P2 checks all 15 required trajectories; finite Delta and explicit missing data; deadband; physical direction independent of preview mirroring; priority, persistence and hysteresis; one instruction; WAITING silence; verification outcomes; SEARCHING; stable READY; one-shot HOLD; READY blocked until active correction verification; overshoot not mislabeled as physical wrong direction; and deferred Y action mapping. Typecheck, production build, and `git diff --check` passed.

## Browser replay smoke

`left-to-target` visibly produced:

```text
INSTRUCTING / MOVE_LEFT / 往左一点 / instruction count 1
WAITING / no new instruction
SUCCESS / success count 1
READY / HOLD / 好，就这里 / instruction count 2
next frame READY / instruction count still 2 (no HOLD spam)
```

`x-and-scale-both-bad` visibly produced X first, then only after X SUCCESS emitted one SCALE action (`MOVE_CLOSER`). Replay declared `NO CAMERA / NO PROVIDER`; camera permission stayed unrequested. External counters were `Provider/Backend/Luna/Upload = 0/0/0/0`.

## Phone UX finding and bounded fix

The first P2 phone attempt reported that guidance was hard to see, the previous “move closer” copy appeared to linger, and analysis did not explain why left/right was not yet emitted. This was treated as a P2 UX defect, not acceptance. The bounded fix moved primary feedback to a lower-middle camera overlay, distinguishes X/Scale confirmation, removes old ordinary action copy during WAITING, and changes candidate persistence from 300 ms to the authorized 250 ms lower bound. Priority mathematics and the 1200 ms anti-spam gap remain unchanged.

The follow-up phone attempt showed that one-frame action visibility (~125 ms) was too brief and the example height target `0.60` required an impractically close view before X could win priority. It also exposed that local recovery had no obvious reset. The second bounded revision holds emitted copy for 700 ms without another emission, tunes natural-medium height to `0.35` (close preset `0.50`), and adds a local guidance reset. These are spike-local phone-derived Candidate values, not global Authority.

Because “please enter frame” persisted at a natural distance and P1 had already retained a low `0.317` subject ratio, visibility/presence candidates were lowered from `0.55` to the authorized range floor `0.50`. Worker geometry also stopped duplicating hard-coded `0.55` values and now uses the single spike config, matching fallback/test semantics.

The first complete three-trial phone counters then failed correction success and exposed premature READY: trials reported `8/0`, `8/0`, and `13/1` instructions/successes, with a physically impossible 0.7 s time after eight emissions. READY is now blocked until an active correction completes its WAITING gap and verifies SUCCESS; only then may the 600 ms ready-stable window start. Signed Delta is retained for verification so crossing the target without landing in deadband is NO_EFFECT/overshoot rather than a false physical WRONG_DIRECTION. Dedicated replay tests cover both regressions.

A final non-replay browser smoke initialized the real model as `MODEL READY / MODE WORKER`, left camera permission at PROMPT, rendered P2 IDLE, and raised no page alert.

## Failures retained

1. First compile found an unused internal candidate field. It was removed.
2. The first verification test showed target satisfaction bypassed `SUCCESS` because READY evaluation ran first. Ordering was corrected so active correction verification precedes READY timing.
3. A shell invocation continued to typecheck after the failed test, making the compound exit code misleading. Later validation stops on every nonzero npm exit.

During the earlier real P1 phone session, Vite relayed MediaPipe informational/warning console lines for XNNPACK delegate creation, feedback-tensor disabling, OpenGL error-checking status, and normalized-rect projection. They were not hidden; the phone showed no crash, freeze, black screen, or failed inference. No equivalent P2 phone claim is made yet.

```text
P2 Implementation Gate = PASS
P2 Real Device Gate = FAIL
LIVE-P2 = FAIL
```
