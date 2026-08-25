# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_P2_CONTROL_POLICY_RECALIBRATION_01
Profile = REALTIME_CAMERA_CV
Mode = GUIDANCE_CONTROL
Scope = LIVE-P1 acceptance + LIVE-P2 local closed loop
Task Start Commit = c439e7877ca64f87b7c5bc32667f5b7cd1e78961

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
P2 Recalibration Automated Tests = 47/47 PASS
P2 Typecheck / Build / Browser Replay = PASS / PASS / PASS
P2 Recalibration Implementation Gate = PASS
P2 Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P2 = FAIL
Status = READY_FOR_MANUAL_DEVICE_TEST

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

P2 local Target, Delta, Deadband, Priority, Persistence/Hysteresis, action library, WAITING, verification, and READY are implemented and pass deterministic automation. Two complete OPPO K11 attempts were retained. After the bounded premature-READY fix, the second three-trial attempt reached READY without oscillation but produced only `5/(5+4+1) = 50%` terminal correction success, below the required `>=80%`; therefore the real-device gate and LIVE-P2 are FAIL. LIVE-P1 remains PASS. Luna, Backend inference, Voice, Agent, Capture, QA, Reality+, and complex Pose remain forbidden.
