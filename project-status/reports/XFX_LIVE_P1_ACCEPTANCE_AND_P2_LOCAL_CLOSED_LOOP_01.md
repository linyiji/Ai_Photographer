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

## Phase B / C

P2 implementation and acceptance results will be appended by the same governed task. Phase A PASS authorizes automatic continuation; it does not pre-authorize Luna or any forbidden later layer.
