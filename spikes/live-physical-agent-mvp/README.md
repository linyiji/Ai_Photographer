# XFX Live Physical Agent — LIVE-P1 Perception State

This isolated Mobile Web spike preserves accepted LIVE-P0 and adds only:

```text
Camera -> bounded frame sampling -> MediaPipe Pose Landmarker -> Geometry
       -> EMA -> Velocity / Stability -> Structured Current State
       -> Debug HUD / Telemetry
```

Target, Difference/Delta, Priority, Guidance, movement instructions, WAITING, verification loops, Luna, Agent, Backend, Capture, QA, and Reality+ are excluded.

## Locked runtime and dependency

```text
Node 24.18.0; npm 11.6.2; Vite 8.2.2; TypeScript 5.9.3
@mediapipe/tasks-vision 1.0.1 (exact)
Pose Landmarker Lite float16 model version 1
```

The model is ignored and not redistributed. Acquire and verify it with:

```powershell
npm ci
npm run setup:model
```

Required model identity:

```text
Size = 5,777,746 bytes
SHA-256 = 59929E1D1EE95287735DDD833B19CF4AC46D29BC7AFDDBBF6753C459690D574A
```

`predev` and `prebuild` copy package WASM into ignored local runtime assets. Neither WASM nor model artifacts are committed.

## Automated desktop validation

```powershell
npm ci
npm run setup:model
npm ls --depth=0
npm test
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:5173/`. Camera and model remain lazy until user action. “初始化 Pose” starts the preferred Worker path. A bounded main-thread fallback is available and identified in the HUD. Invalid/missing model content produces `MODEL · MISSING / MODE · FAILED`. `?simulateUnsupported=1` preserves the controlled camera-capability path.

Desktop automation does not prove real-device Camera/CV acceptance.

## Runtime semantics

- One pose, VIDEO mode, no segmentation; candidate sampling is 8 Hz with at most one inference in flight.
- Busy samples are skipped, never queued.
- Geometry uses landmarks passing presence/visibility gates. Missing data stays `null`; no zero geometry is fabricated.
- Sensor geometry is non-mirrored. Front-preview mirroring is CSS-only.
- Center/bounds/scale/confidence, EMA, timestamp-normalized velocity, rolling stability, bounded loss hold, and reacquisition are transient.
- Reacquisition resets velocity history so stale motion is not invented.
- Frames, video, landmarks, and device identifiers are not stored/uploaded. Backend/Luna calls remain zero.
- Browser CPU/thermal APIs are unavailable; HUD states this and reports JS heap only when available.

The output is a partial provider-independent observation suitable for semantic mapping to M01 `FramePerception`; it does not claim `CurrentShotState` or `LiveShotRuntime` completeness.

## Manual phone validation

Use the accepted trusted HTTPS path:

```powershell
npm run dev
cloudflared tunnel --url http://localhost:5173
```

Open the valid `https://...trycloudflare.com` URL without bypassing certificate warnings. Complete `evidence/perception/manual-device-test-template.md`. Run Camera + Pose for at least 60 seconds and record preview/vision/state rates, inference latency, skipped work, geometry/velocity/stability/loss behavior, orientation, memory, and observable thermal/power risk. Never capture or commit real camera frames/video.

Until that phone run is recorded:

```text
Status = READY_FOR_MANUAL_DEVICE_TEST
Implementation Gate = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P1 Final Gate = NOT_YET_PASS
```

## Stop boundary

LIVE-P0 remains PASS. Stop at P1 manual-device readiness; do not merge, open a PR, or start the next task.
