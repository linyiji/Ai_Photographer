# XFX LIVE P1 ACCEPTANCE AND P2 LOCAL CLOSED LOOP 01

## Governed task

```text
Start Head = c439e7877ca64f87b7c5bc32667f5b7cd1e78961
Branch = spike/live-physical-agent-mvp-v0.1
Profile = REALTIME_CAMERA_CV
Mode = GUIDANCE_CONTROL
Execution = ACCELERATED_COMPOSITE_TASK
```

## Phase A — P1 real-device acceptance

```text
PHASE_A_P1_REAL_DEVICE = PASS
Device = OPPO K11 / ColorOS 15.0 / Chrome Mobile
Orientation / Camera = Portrait / Rear
Execution = WORKER
Preview FPS = ~29–30
Vision Hz = 8.0
State Hz = 6.9
Inference p50 / p95 = 68.8 / 97.4 ms
Geometry Direction = PASS
Velocity = PASS
Stable Detection = PASS
Loss / Reacquisition = PASS
Visible Stalls / Persistent Black Screen = NONE / NONE
LIVE-P1 = PASS
```

Warnings retained: subject ratio `0.317`, cumulative late/drop `918/29`, 3000 ms measurement age while absent, slight warming, exact Chrome version unavailable, and P0's two unclassified generic Vite events. None was converted into false latency or hidden.

The focused loss test changed counters from `0/0` to `1/1`, made subject/center explicitly absent, reacquired the subject, and produced no giant velocity spike. Raw upload, Backend, and Luna remained zero.

## Phase B — P2 implementation

```text
Target = PASS / 3 configurable presets
Delta / Deadband = PASS
Priority = PASS
Persistence / Hysteresis = PASS
Local Action Library = PASS
WAITING / Silence = PASS
Verification = PASS
READY / one-shot HOLD = PASS
Replay Tests = PASS
P2 Implementation Gate = PASS
```

The engine is local and deterministic. It chooses one issue/action, applies 250 ms persistence and 1.25x dominance, blocks new ordinary output for 1200 ms, verifies only after stable motion, and enters READY after 600 ms stable satisfaction. Repeated failure stops locally; there is no escalation path.

The first phone UX attempt found the instruction location and WAITING feedback unclear. A bounded fix added a lower-middle preview overlay, explicit X/Scale confirmation states, and silent WAITING/verification copy rather than retaining the prior ordinary instruction. This finding is not counted as P2 acceptance.

The next phone attempt exposed one-frame action visibility, an impractically close `0.60` natural-medium scale, and no obvious exit from local recovery. The bounded revision holds a single action copy for 700 ms without re-emission, tunes natural-medium scale to `0.35` and close scale to `0.50`, and adds explicit local reset. These changes were included in the subsequent device attempts.

Natural-distance `SUBJECT PRESENT=false` plus the retained P1 subject ratio warning justified changing spike visibility/presence candidates from `0.55` to `0.50`. Worker and fallback now consume the same explicit config. This remains within the authorized 0.5–0.6 candidate range.

The action basis is explicit: non-mirrored sensor image-right corresponds to the facing subject's physical left. Front-preview CSS mirroring is excluded from the calculation. Included presets explicitly exempt Y from readiness because no safe vertical action is authorized; strict Y remains measurable and reports deferred action mapping.

All required named replay fixtures exist. Browser replay visibly demonstrated MOVE_LEFT, WAITING silence, SUCCESS, next SCALE instruction after transition, READY, one HOLD event, and zero Provider/Backend/Luna/Upload.

## Phase C — P2 real device

```text
P2 Real Device Gate = FAIL
LIVE-P2 = FAIL
Status = FAIL
```

Two complete three-trial real-phone attempts were completed. Implementation/build/browser results did not substitute for physical direction, silence, oscillation, correction success, or time-to-target acceptance.

The first complete phone attempt failed the counter gates (`8/0`, `8/0`, `13/1` instructions/successes) despite reaching READY, proving premature readiness before verification. Wrong-direction counters were also inflated by target overshoot. The failing evidence and bounded fix are retained in `evidence/closed-loop/manual-device-attempt-oppo-k11-p2-failing.md`.

Post-fix OPPO K11 trials reported `8/2`, `13/1`, and `8/2` instructions/successes; terminal outcomes totaled 5 SUCCESS, 4 NO_EFFECT, and 1 WRONG_DIRECTION with zero oscillation. Aggregate correction success was therefore `5/(5+4+1) = 50%`, below the required `>=80%`. The fix prevented READY with zero success, but the real-device correction gate still failed. Trial A also retained an implausible `0.7 s` time-to-target because timing can arm before the intended offset trial. P2 Real Device Gate and LIVE-P2 are FAIL; LIVE-P1 remains PASS.

## Governance

CH-003 evidence is added locally; global CH-003 remains `IDENTIFIED / UNCHANGED`. Luna remains OFF. No merge, PR, main/develop write, rebase, or cherry-pick occurred.
