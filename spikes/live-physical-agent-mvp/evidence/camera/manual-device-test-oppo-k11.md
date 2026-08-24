# LIVE-P0 Manual Device Test — OPPO K11

**Task:** `XFX_LIVE_PHYSICAL_AGENT_P0_MANUAL_DEVICE_ACCEPTANCE_01`

**Profile / Mode:** `REALTIME_CAMERA_CV / CAMERA_PIPELINE`

**Test date:** `2026-08-24`

**Evidence source:** User-operated real phone test through the temporary HTTPS Camera Sandbox URL. Results below are the user's direct observations; no desktop result is substituted for device evidence.

## Device and access

| Field | Observation | Result |
|---|---|---|
| Device class | Android mobile phone | RECORDED |
| Device model | OPPO K11 | RECORDED |
| OS | ColorOS 15.0 | RECORDED |
| Browser | Chrome Mobile, user reported latest release; exact version not recorded | PASS_WITH_WARNING |
| HTTPS access | Temporary `trycloudflare.com` HTTPS tunnel loaded the Camera Sandbox | PASS |
| Orientation at start | Portrait | PASS |
| Camera permission | User allowed camera permission; camera opened | PASS |

The temporary tunnel hostname is not retained as reusable infrastructure. No tunnel credential, certificate or key was committed.

## Camera paths and lifecycle

| Gate | Real-device observation | Result |
|---|---|---|
| Rear camera preview | Opened and displayed live preview | PASS |
| Rear → front | Switched without page crash or persistent black screen | PASS |
| Front camera preview | Opened and displayed live preview | PASS |
| Front → rear | Switched without page crash or persistent black screen | PASS |
| Repeated switching | Rear → front → rear → front completed | PASS |
| Stop → start | Camera stopped and restarted successfully | PASS |
| Permission denial path | Not repeated on the real device; automated unsupported/error evidence retained | NOT_RETESTED / NON_BLOCKING |

## Mirror and coordinate sanity

| Gate | Real-device observation | Result |
|---|---|---|
| Front preview mirror | Preview mirror behavior matched the UI expectation | PASS |
| Physical left/right movement | User moved to their own left and right under the front camera | PASS |
| Sensor Coordinate | Remained explicitly described as raw/non-mirrored | PASS |
| Preview Coordinate | Remained explicitly described as front-preview mirrored | PASS |
| User-Action Coordinate | Remained semantic with no P0 movement guidance emitted | PASS |
| Coordinate separation | Front-camera mirroring was not presented as a shared sensor/action coordinate | PASS |

P0 did not emit `MOVE_LEFT` or `MOVE_RIGHT`; this test validates only the coordinate foundation needed for future mapping.

## Orientation and performance

| Gate | Real-device observation | Result |
|---|---|---|
| Portrait | Preview and Debug HUD remained usable | PASS |
| Landscape | Rotation did not break Preview or Debug HUD | PASS |
| Return to portrait | Preview and Debug HUD remained usable | PASS |
| Continuous run | At least 60 seconds | PASS |
| Preview FPS | Approximately 29–30 fps | PASS |
| Candidate threshold | `>=25 fps` | PASS |
| Scheduler | `VIDEO FRAME CALLBACK` / `requestVideoFrameCallback` | PASS |
| Late / Drop estimate | Approximately `220 / 14` | OBSERVED_WITH_WARNING |
| Visible frame stalls | None observed | PASS |
| Persistent black screen | None observed | PASS |

The late/drop counters are approximate values read from the HUD after the real-device run. The late count is retained as a non-blocking observation because the measured preview stayed at approximately 29–30 fps and the user observed no visible freeze or black screen. It is not reclassified or discarded.

## Privacy and scope

```text
Raw Video Upload = 0
Saved real camera frames = 0
Committed real camera frames/video = 0
CV/ML inference = 0
P1 implementation = NOT_STARTED
```

The user confirmed the no-screenshot/no-recording/no-upload instruction for this acceptance run.

## Device disposition

```text
OPPO K11 Camera Permission = PASS
Front Camera = PASS
Rear Camera = PASS
Camera Switching = PASS
Mirror / Coordinate Foundation = PASS
Portrait / Landscape = PASS
60s Preview Performance = PASS
Camera Restart = PASS

LIVE-P0 = PASS
CH-003 = UNCHANGED / IDENTIFIED
```

This P0 evidence proves the Mobile Web camera foundation on one real OPPO K11 device. It does not test CV inference, inference latency, CPU/memory, thermal/power behavior, or mini-program Camera/WASM feasibility and therefore cannot resolve CH-003.
