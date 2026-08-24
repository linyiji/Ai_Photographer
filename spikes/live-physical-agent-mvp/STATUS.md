# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_PHYSICAL_AGENT_P0_MANUAL_DEVICE_ACCEPTANCE_01
Profile = REALTIME_CAMERA_CV
Mode = CAMERA_PIPELINE
Scope = LIVE-P0 Camera Sandbox only
Base Commit = ced35fa17931935b921a1937a32d269e46ebf8ff
Implementation Commit = 8e5ef051570a222424e428c1f8c5a95ebed7e46b

Implementation Gate = PASS
Automated Desktop Validation = PASS
Real Device Gate = PASS
LIVE-P0 Final Gate = PASS
Task Disposition = PASS

Accepted Device = OPPO K11 / ColorOS 15.0 / Chrome Mobile
Preview FPS = ~29–30 / PASS
Frame Scheduler = requestVideoFrameCallback / PASS
Late / Drop Estimate = ~220 / 14 / OBSERVED_WITH_WARNING
Visible Stalls or Persistent Black Screen = NONE
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

## Real-device acceptance

OPPO K11 on ColorOS 15.0 with Chrome Mobile passed HTTPS camera permission, front and rear preview, bidirectional repeated switching, front-preview mirroring, Sensor/Preview/User-Action coordinate sanity, portrait/landscape rotation, at least 60 seconds of approximately 29–30 fps preview, no visible freeze/black screen, and stop→start camera restart. Detailed evidence is in `evidence/camera/manual-device-test-oppo-k11.md`.

The approximate late/drop observation (`220 / 14`) is retained with warning. It does not block P0 because preview remained near 30 fps and no visible stall was observed. Exact Chrome version was not recorded.

## Stop boundary

LIVE-P0 is accepted on the tested real device. CH-003 remains `IDENTIFIED`: CV inference, inference latency, CPU/memory, thermal/power and mini-program feasibility were not tested. LIVE-P1 is not started by this Task.
