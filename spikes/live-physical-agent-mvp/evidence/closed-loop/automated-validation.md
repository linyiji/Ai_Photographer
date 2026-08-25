# LIVE-P2 Automated Validation

## Scope

Pure local deterministic control after accepted P1 structured state. No provider, Backend, Luna, voice, capture, or raw upload path exists.

## Test coverage

Fresh Node 24.18.0/npm 11.6.2 reproduction installed 19 packages with zero reported vulnerabilities. The exact dependency tree passed. The compiled suite passed `19/19` tests across P1 and P2. P2 checks all 15 required trajectories; finite Delta and explicit missing data; deadband; physical direction independent of preview mirroring; priority, persistence and hysteresis; one instruction; WAITING silence; verification outcomes; SEARCHING; stable READY; one-shot HOLD; and deferred Y action mapping. Typecheck, production build, and `git diff --check` passed.

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

A final non-replay browser smoke initialized the real model as `MODEL READY / MODE WORKER`, left camera permission at PROMPT, rendered P2 IDLE, and raised no page alert.

## Failures retained

1. First compile found an unused internal candidate field. It was removed.
2. The first verification test showed target satisfaction bypassed `SUCCESS` because READY evaluation ran first. Ordering was corrected so active correction verification precedes READY timing.
3. A shell invocation continued to typecheck after the failed test, making the compound exit code misleading. Later validation stops on every nonzero npm exit.

During the earlier real P1 phone session, Vite relayed MediaPipe informational/warning console lines for XNNPACK delegate creation, feedback-tensor disabling, OpenGL error-checking status, and normalized-rect projection. They were not hidden; the phone showed no crash, freeze, black screen, or failed inference. No equivalent P2 phone claim is made yet.

```text
P2 Implementation Gate = PASS
P2 Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P2 = NOT_YET_PASS
```
