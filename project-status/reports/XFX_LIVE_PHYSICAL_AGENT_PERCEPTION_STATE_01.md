# XFX LIVE PHYSICAL AGENT PERCEPTION STATE 01

## Result

```text
Task = XFX_LIVE_PHYSICAL_AGENT_PERCEPTION_STATE_01
Branch = spike/live-physical-agent-mvp-v0.1
Start Commit = 5b4aba45065dc49d435e4790e807e9a5a4ad2d3c
Profile = REALTIME_CAMERA_CV
Mode = FRAME_PERCEPTION

LIVE-P0 = PASS
Implementation Gate = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P1 Final Gate = NOT_YET_PASS
Status = READY_FOR_MANUAL_DEVICE_TEST
```

## Delivered scope

The accepted P0 camera sandbox now feeds a bounded one-in-flight sampler into MediaPipe Pose Landmarker. Provider results are reduced to normalized one-subject geometry, then processed through EMA, timestamp-normalized velocity, rolling stability, loss persistence, and reacquisition reset. The UI displays only transient structured state and operational telemetry.

The preferred Worker execution path was initialized successfully in a desktop browser. A bounded visible main-thread fallback exists. A deterministic missing/invalid-model preflight was also verified. Camera permission remained unrequested during both model-only smoke paths.

Telemetry includes preview FPS, target/actual vision and state rates, inference current/p50/p95, scheduled/processed/skipped counts, confidence/presence, raw/filtered geometry, velocity, stability, measurement age, loss/reacquisition, valid landmarks, subject ratio, JS heap when available, and explicit CPU/thermal API unavailability. Raw upload, Backend, and Luna counters remain zero.

## Dependency and model governance

```text
@mediapipe/tasks-vision = 1.0.1 exact / package metadata Apache-2.0
Pose model = pose_landmarker_lite float16 v1
Model size = 5,777,746 bytes
Model SHA-256 = 59929E1D1EE95287735DDD833B19CF4AC46D29BC7AFDDBBF6753C459690D574A
Model binary committed = NO
```

The checked-in acquisition script retrieves only the pinned official URL and rejects size/hash mismatch. Because precise redistribution authorization for the model bundle was not established, the binary remains an ignored local artifact.

## Verification

The final reproducible chain covered fresh install, verified model setup, dependency tree, seven synthetic tests, typecheck, production build, and browser smoke. Browser checks covered initial lazy/no-permission state, real Worker initialization, deterministic missing-model failure, unsupported-camera rendering, HUD toggling, absence of movement/WAITING action text, and zero upload/backend/Luna display.

The following intermediate failures are retained in automated evidence: incorrect Windows Node test directory invocation, a strict floating-point assertion, module WASM selection in fallback, and Vite SPA HTML being accepted as HTTP-200 model content. Each received a bounded fix and was rerun.

## M01 and semantic boundary

M01 contracts at read-only commit `0dd2e3e5d44db45a45e1515bb36f6d6259e1712d` were semantic reference only. No rebase or cherry-pick occurred. This P1 output maps partially to provider-independent `FramePerception` subject/frame/confidence observations. It does not implement or fabricate `CurrentShotState`, `LiveShotRuntime`, Target, Difference/Delta, Readiness, Priority, Guidance, instruction, WAITING, or verification-loop state.

## Preserved risk and evidence

- P0 remains PASS on OPPO K11 / ColorOS 15.0 / Chrome Mobile.
- P0 preview ~29-30 fps and late/drop ~220/14 remain recorded; the late/drop value is not silently normalized.
- Two generic P0 Vite client events remain warning/unclassified.
- CPU and thermal telemetry are not exposed by the browser API; phone observation remains necessary.
- CH-003 remains `IDENTIFIED`. P1 has not yet supplied real-device CV latency, sustained rate, memory, or thermal/power evidence.
- Global project status and challenge registry are unchanged.

## Required next gate

Use `spikes/live-physical-agent-mvp/evidence/perception/manual-device-test-template.md` for at least 60 seconds of real-phone Camera + CV. Preview FPS alone cannot pass P1. This task stops here: no merge, PR, Target/Guidance work, or next task is started.
