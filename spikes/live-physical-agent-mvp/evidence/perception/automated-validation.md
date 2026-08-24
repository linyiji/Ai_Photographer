# Automated Validation Evidence

## Environment and scope

```text
Branch = spike/live-physical-agent-mvp-v0.1
Start = 5b4aba45065dc49d435e4790e807e9a5a4ad2d3c
Profile = REALTIME_CAMERA_CV
Mode = FRAME_PERCEPTION
Phone Camera/CV run = NOT PERFORMED
```

## Passing checks

- Exact dependency install and top-level dependency tree.
- Model fetch/identity verification.
- Seven compiled Node tests covering bounded scheduler, geometry bounds/no-NaN, EMA, bidirectional timestamp-normalized velocity, scale, stability, temporary loss, reacquisition reset, and threshold jitter.
- TypeScript no-emit check.
- Vite production build.
- Desktop browser initial state: camera permission remained `PROMPT`, model `LAZY`, execution `UNINITIALIZED`, no initial error, no camera request.
- User-triggered model initialization: `MODEL · READY`, `MODE · WORKER`, `Pose Landmarker ready · Worker`, no alert; camera remained unrequested.
- Missing model negative path: `MODEL · MISSING`, `MODE · FAILED`, exact-size error, camera remained unrequested.
- Controlled unsupported-camera page and HUD hide/show paths rendered without Guidance action text.
- HUD reported raw upload/backend/Luna as `0 / 0 / 0`.

## Failures encountered and bounded fixes

1. The initial Node test script passed a directory to `node --test`; Windows resolved it as a missing module. The script now names the compiled test file explicitly.
2. A strict floating-point equality assertion saw `0.49999999999999994`; the geometry was correct. The test now uses a numeric tolerance.
3. Missing-model smoke reached the main-thread fallback, whose WASM loader was configured for module mode and raised `Cannot use import.meta outside a module`. The classic fallback now requests the classic loader; Worker remains the preferred verified mode.
4. A first model preflight accepted Vite's SPA fallback HTML as HTTP 200, after which MediaPipe reported an invalid zip. The preflight now requires exact model `Content-Length` (5,777,746 bytes), producing a deterministic missing/invalid state before initialization.
5. The final validation shell initially had no Node/npm on `PATH`. Applying the locked fnm environment exposed Node 24.18.0/npm 11.6.2; the complete chain then passed. This was an invocation-environment failure, not an implementation pass.

No failure was hidden or reclassified as device evidence.

## Historical warnings preserved

P0's OPPO K11 evidence remains authoritative: preview approximately 29-30 fps, late/drop approximately 220/14, and two generic Vite client error events with unclassified root cause. P1 automation does not erase or reinterpret those warnings.

```text
CH-003 Evidence = ADDED_IN_LIVE_SPIKE
Global CH-003 State = UNCHANGED / IDENTIFIED
```

## Gate

```text
Implementation Gate = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P1 Final Gate = NOT_YET_PASS
Status = READY_FOR_MANUAL_DEVICE_TEST
```
