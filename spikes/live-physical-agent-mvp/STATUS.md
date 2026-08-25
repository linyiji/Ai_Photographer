# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_P2_OVERSHOOT_AND_READY_CAUSALITY_DIAGNOSTIC_01
Profile = REALTIME_CAMERA_CV
Mode = GUIDANCE_CONTROL
Scope = LIVE-P1 acceptance + LIVE-P2 local closed loop
Task Start Commit = c1d8497cf3a805d46576bfb49a0ab3b8fbcd613e

LIVE-P0 = PASS
Implementation Gate = PASS
Automated Tests = PASS
Typecheck = PASS
Build = PASS
Browser Smoke = PASS
Real Device Gate = PASS
LIVE-P1 Final Gate = PASS
LIVE-P1 = PASS
P2 Implementation Gate = PASS
P2 Automated Tests = PASS
P2 Overshoot / READY Automated Tests = 76/76 PASS
P2 Typecheck / Build / Browser Replay = PASS / PASS / PASS
P2 Recalibration Implementation Gate = PASS
P2 Real Device Gate = FAIL
LIVE-P2 = FAIL
Status = FAIL
Correction Success Semantics = MATCH / AXIS_TARGET_SUCCESS
Fresh Accepted Trials / Episodes = 5 / 54
Fresh SUCCESS / NO_EFFECT / WRONG_DIRECTION = 12 / 36 / 6
Fresh Correction Success = 22.2% / REQUIRED >=80% / FAIL
Fresh Action Compliance / Axis Completion = 42.6% / 22.2%
STOP Count / Post-READY Ordinary = 13 / 0
Local Recovery = 1200 ms AUTO + MANUAL FALLBACK / PASS

Vision Package = @mediapipe/tasks-vision@1.0.1 / EXACT
Model = Pose Landmarker Lite float16 v1 / LOCAL IGNORED ASSET
Preferred Execution = WEB WORKER / BROWSER VERIFIED
Main-thread Fallback = IMPLEMENTED / NOT SELECTED IN SUCCESS SMOKE
Candidate Vision Rate = 8 Hz / BOUNDED / NO BACKLOG
Raw Frame or Video Persistence = 0
Raw Video Upload = 0
Backend Calls = 0
Luna Calls = 0

P0 Accepted Device = OPPO K11 / ColorOS 15.0 / Chrome Mobile
P0 Preview FPS = ~29-30 / PASS
P0 Late / Drop Estimate = ~220 / 14 / WARNING PRESERVED
P0 Generic Vite Client Error Events = 2 / WARNING PRESERVED / ROOT_CAUSE_UNCLASSIFIED
P1 Accepted Device = OPPO K11 / ColorOS 15.0 / Chrome Mobile
P1 Preview / Vision / State = ~29-30 fps / 8.0 Hz / 6.9 Hz
P1 Inference p50 / p95 = 68.8 / 97.4 ms
P1 Subject Ratio = 0.317 / WARNING PRESERVED
P1 Late / Drop = 918 / 29 / WARNING PRESERVED
CH-003 = UNCHANGED / IDENTIFIED
CH-003 Evidence = ADDED_IN_LIVE_SPIKE
Global Project Status = UNCHANGED
Challenge Registry = UNCHANGED
```

## Implemented P1 boundary

- Exact package and verified ignored model; user-triggered local initialization.
- Preferred Worker inference plus visible, bounded main-thread fallback.
- At-most-one-in-flight 8 Hz sampling and skip-without-backlog behavior.
- Gated one-subject geometry, EMA, normalized velocity, rolling stability, loss hold, and reacquisition reset.
- Provider-independent transient structured observation with nullable missing measurements.
- HUD telemetry for rates, inference latency, load/skip, geometry, confidence, loss/reacquisition, memory when available, and CPU/thermal API limitation.
- Synthetic tests for static position, motion, scale, loss, reacquisition, and threshold jitter.

## Contract boundary

Only M01 `FramePerception` observation semantics are mapped. Target, Difference/Delta, Readiness, Priority, Guidance, instruction, and full `CurrentShotState`/`LiveShotRuntime` are not fabricated. See `evidence/perception/m01-contract-mapping.md`.

## P1 real-device result

OPPO K11 real-device Camera + Pose passed the P1 hard gates, including Worker execution, performance, geometry trends, velocity, stability, bounded loss/reacquisition, and absence of visible freeze/black screen. Detailed text-only evidence is in `evidence/perception/manual-device-test-oppo-k11-p1.md`.

## Active phase

Trajectory taxonomy, STOP braking, READY causality, and bounded automatic/manual recovery pass 76/76 automation, typecheck, build, and browser replay. The complete post-fix OPPO K11 sample contains 54 terminal Episodes: 12 SUCCESS, 36 NO_EFFECT, and 6 WRONG_DIRECTION, or `22.2%`, below the unchanged `>=80%` gate. The dominant NO_EFFECT subtype is JITTER_OR_UNCERTAIN (16), followed by OVERSHOOT (8) and LATE_RESPONSE (7). P2 Real Device Gate and LIVE-P2 remain FAIL. The next evidence-derived task must diagnose measurement/settle uncertainty and late human response without lowering the gate. LIVE-P1 remains PASS; Luna and all excluded tracks remain OFF.
