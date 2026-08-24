# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_PHYSICAL_AGENT_MVP_SPIKE_01
Profile = REALTIME_CAMERA_CV
Mode = CAMERA_PIPELINE
Scope = LIVE-P0 Camera Sandbox only
Base Commit = ced35fa17931935b921a1937a32d269e46ebf8ff

Implementation Gate = PASS
Automated Desktop Validation = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P0 Final Gate = NOT_YET_PASS
Task Disposition = READY_FOR_MANUAL_DEVICE_TEST

Preview FPS = NOT_TESTED_ON_REAL_DEVICE
Raw Video Upload = 0
CH-003 = UNCHANGED / IDENTIFIED
Global Project Status = UNCHANGED
Challenge Registry = UNCHANGED
```

## Completed in this task

- Isolated Live worktree and spike branch from the fixed common checkpoint.
- Byte-preserved admission of the two external Live documents.
- User-triggered real browser camera request with start/stop lifecycle.
- Front/rear facing preference, active-facing readback, switching control and single-camera fallback.
- Explicit Sensor / Preview / User-Action coordinate labels and front-preview-only mirroring.
- Debug HUD with preview dimensions, estimated FPS, late/drop estimate, elapsed time and scheduler mode.
- `requestVideoFrameCallback` scheduling with throttled `requestAnimationFrame` fallback.
- Capability display without frame capture, persistent identifiers, secrets or raw video upload.
- Documented trusted HTTPS tunnel path for manual phone testing.
- Fresh lockfile install, dependency tree, TypeScript, build and browser smoke validation.

## Deliberately not completed

No real phone was operated in this task. Front/rear camera hardware behavior, switch behavior, orientation, mirror/action-direction sanity and the `>=25fps` candidate threshold remain manual evidence requirements. No P1 work is authorized or started.
