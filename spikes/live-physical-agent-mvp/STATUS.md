# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_P2_VISUAL_SERVO_GUIDANCE_AND_PLAYFUL_OVERLAY_01
Profile = REALTIME_CAMERA_CV
Mode = GUIDANCE_CONTROL
Task Start Commit = 190806f5733949f44d0246abcf6fbf83fe977025

LIVE-P0 = PASS
LIVE-P1 = PASS
P2 Implementation Gate = PASS
Measurement Stabilization Automated = PASS
Measurement Stabilization Real Device = FAIL
Subject Tracking Lock = PASS_WITH_DEVICE_WARNING
Subject Box Real Device = FAIL
Target / Acceptable Zone Semantics = PASS
Target Zone Comprehension = FAIL
Direction Visual = FAIL
STOP Visual = IMPLEMENTED / DEVICE CONTROL GATE FAIL
READY Visual Lifecycle = FAIL
Visual Servo Modes = IMPLEMENTED
Theme Renderer = PASS
DEFAULT Theme = PASS
LINE_DOG = IMPLEMENTED_CANDIDATE
Theme Controller Semantic Diff = 0

Automated Tests = 123/123 PASS
Typecheck = PASS
Build = PASS / 21 MODULES
Browser Replay = PASS
Real Device = OPPO K11 / ColorOS 15 / Chrome Mobile
Fresh Trials / Terminal Episodes = 8 / 59
Fresh SUCCESS / NO_EFFECT / WRONG_DIRECTION = 20 / 31 / 8
Fresh Correction Success = 33.9% / REQUIRED >=80% / FAIL
Fresh Text-Dominant = 6/21 / 28.6%
Fresh Visual+Text = 14/38 / 36.8%
Fresh Action Compliance = 33/59 / 55.9%
Fresh Average Time To Target = 22.2 s
Fresh Ordinary Instructions Per Trial = 7.4
Fresh Overshoot-like / STOP = 9 / 19
Fresh Raw / Stabilized Jitter = 0.0244 / 0.0144
Fresh Visual Latency Mean / P95 / Max = 261 / 500 / 500 ms
Fresh Projection Age Mean / P95 / Max = 78 / 98 / 257 ms
Fresh Lock Loss / Reacquisition = 1 / 2
Fresh Target Entry / Exit = 46 / 38
Wrong Physical Direction = >0 USER-OBSERVED / FAIL
Post-READY Ordinary = 6 / FAIL
Obvious Oscillation = USER-OBSERVED / FAIL
Text Still Necessary = YES
Fresh Preview / Vision Target / Vision Actual / State = 29.3 FPS / 8.0 HZ / 6.9 HZ / 6.6 HZ
Fresh Inference p50 / p95 = 66 / 80.4 MS

P2 Real Device Gate = FAIL
LIVE-P2 = FAIL
Status = FAIL
Dominant Hypothesis = CONTROL_POLICY
Secondary Hypotheses = MEASUREMENT / VISUAL_COMPREHENSION

Raw Frame or Video Persistence = 0
Raw Video Upload = 0
Backend Calls = 0
Provider Calls = 0
Luna Calls = 0
Payment / Entitlement = NOT_IMPLEMENTED
CH-003 = IDENTIFIED / UNCHANGED
Main / Develop / Fine Tune / AI Visual = UNTOUCHED
```

## Fresh result

The new post-implementation OPPO K11 sample—not the historical 54-Episode / 22.2% baseline—contains 59 terminal Episodes and reaches only 33.9% correction success. Visual-plus-text improves the fresh text-dominant arm from 28.6% to 36.8%, but remains far below the unchanged 80% gate. The user reports an unstable subject box, an unclear target zone, erroneous directions, obvious oscillation, and continued dependence on text. Six ordinary instructions after READY are independently present in the scalar traces.

No further threshold tuning is performed. The next evidence-derived hypothesis is the controller lifecycle in which passive-confirmation READY can occur while a trial remains ARMED; later movement then creates new ordinary Episodes. Measurement lag and target-zone comprehension are secondary. Luna stays OFF and no next task starts automatically.
