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

The engine is local and deterministic. It chooses one issue/action, applies 300 ms persistence and 1.25x dominance, blocks new ordinary output for 1200 ms, verifies only after stable motion, and enters READY after 600 ms stable satisfaction. Repeated failure stops locally; there is no escalation path.

The action basis is explicit: non-mirrored sensor image-right corresponds to the facing subject's physical left. Front-preview CSS mirroring is excluded from the calculation. Included presets explicitly exempt Y from readiness because no safe vertical action is authorized; strict Y remains measurable and reports deferred action mapping.

All required named replay fixtures exist. Browser replay visibly demonstrated MOVE_LEFT, WAITING silence, SUCCESS, next SCALE instruction after transition, READY, one HOLD event, and zero Provider/Backend/Luna/Upload.

## Phase C — P2 real device

```text
P2 Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P2 = NOT_YET_PASS
Status = READY_FOR_MANUAL_DEVICE_TEST
```

Three real-phone closed-loop trials remain required. Implementation/build/browser results do not substitute for physical direction, silence, oscillation, correction success, or time-to-target acceptance.

## Governance

CH-003 evidence is added locally; global CH-003 remains `IDENTIFIED / UNCHANGED`. Luna remains OFF. No merge, PR, main/develop write, rebase, or cherry-pick occurred.
