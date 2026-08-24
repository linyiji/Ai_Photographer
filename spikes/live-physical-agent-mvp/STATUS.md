# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_PHYSICAL_AGENT_PERCEPTION_STATE_01
Profile = REALTIME_CAMERA_CV
Mode = FRAME_PERCEPTION
Scope = LIVE-P1 bounded perception/state only
Task Start Commit = 5b4aba45065dc49d435e4790e807e9a5a4ad2d3c

LIVE-P0 = PASS
Implementation Gate = PASS
Automated Tests = PASS
Typecheck = PASS
Build = PASS
Browser Smoke = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P1 Final Gate = NOT_YET_PASS
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

## Remaining gate and stop

No phone Camera + CV run occurred. Preview FPS cannot substitute for vision rate/inference latency. LIVE-P1 is not PASS. The next permitted checkpoint is manual P1 device acceptance only; do not begin later semantics.
