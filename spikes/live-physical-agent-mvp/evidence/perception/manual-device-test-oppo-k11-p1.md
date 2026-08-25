# LIVE-P1 Real Device Acceptance — OPPO K11

```text
Date = 2026-08-25
Device = OPPO K11
OS = ColorOS 15.0
Browser = Chrome Mobile / exact version not recorded
Orientation = Portrait
Camera = Rear
HTTPS = trycloudflare.com quick tunnel / valid secure context
Duration = >=60 seconds (scheduled frame count indicates approximately 112 seconds)
MODEL = READY
MODE = WORKER
```

No screenshot, camera frame, or video was requested, saved, uploaded, or committed. Evidence consists only of user-reported HUD telemetry and functional observations.

## Performance

| Metric | Real-device observation | Gate |
| --- | --- | --- |
| Preview FPS | ~29–30 | PASS (`>=25`) |
| Vision target / actual | 8.0 / 8.0 Hz | PASS (`>=5`) |
| State output | 6.9 Hz | PASS |
| Inference current | ~55–69 ms | PASS |
| Inference p50 / p95 | 68.8 / 97.4 ms | PASS; p95 remains under candidate 100 ms target |
| Scheduled / processed | 898 / 888 | OBSERVED |
| Skipped busy | 17 | BOUNDED / NO BACKLOG OBSERVED |
| Subject detected ratio | 0.317 | PASS_WITH_WARNING; low aggregate ratio reflects test movement/loss and must be compared in later trials |
| Loss / reacquire | 25 / 25 during general run; focused test 0/0 -> 1/1 | PASS |
| Measurement age | 3000 ms while subject was absent | NOT INFERENCE LATENCY; explicit stale-measurement age |
| JS heap | 9.5 MB | OBSERVED |
| Late / drop | 918 / 29 | PASS_WITH_WARNING; increased cumulative observation retained |
| Thermal | Slight warming | PASS_WITH_WARNING; no sustained thermal test |

## Functional acceptance

- Static >=10 seconds: `stable=true` reached.
- Physical left/right: center-X trends opposed correctly and velocity-X sign changed correctly in the documented non-mirrored sensor basis.
- Closer/farther: height ratio increased/decreased correctly.
- Movement/stop: stable became false during motion and true after stopping.
- Focused loss/reacquisition: leaving frame produced `present=false` and absent center (`—`); returning produced `present=true`; counters changed from `0/0` to `1/1`.
- Reacquisition did not produce an abnormal giant velocity spike.
- No visible freeze, persistent black screen, or page crash during the run.

## Regression and privacy

P0 preview performance (~29–30 fps) was preserved. P0 historical late/drop (~220/14) and two unclassified Vite client events remain in the record. P1 late/drop is higher in cumulative count (`918/29`) and is retained as warning; no visible regression accompanied it.

```text
Raw Video Upload = 0
Saved/Committed Camera Frames = 0
Backend Calls = 0
Luna Calls = 0
LIVE-P1 = PASS
```
