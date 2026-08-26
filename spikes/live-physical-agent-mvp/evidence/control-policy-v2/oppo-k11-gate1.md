# OPPO K11 Control Policy V2 Gate 1

Status: PENDING MANUAL DEVICE TEST

Device: OPPO K11 / ColorOS 15 / Chrome Mobile

Required three fresh trials must verify before Gate 2:

- Wrong physical direction: 0
- Post-READY ordinary action: 0
- Obvious X/Scale oscillation: 0
- Persistent subject-box instability: 0
- Target frame understandable with one short text cue
- DEFAULT theme; grid OFF; Luna/Provider/Backend/Upload 0

No prior 59-Episode sample may fill this gate.

## Bounded defect attempt 1

- Observation: switching rear to front on OPPO K11 produced an error/blank preview before a Gate 1 trial could be accepted.
- Reproduction: start rear camera, then tap front/rear switch.
- Root cause: stopping the old rear track asynchronously fired its `ended` listener after the new front stream became active. The listener tested only whether any stream existed, so it could stop the new stream.
- Bounded fix: camera request sequence plus stream ownership guard. A stale request releases only its own acquired stream; an ended track may stop the session only when its owner stream is still active.
- Automated regression: 3/3 camera-session tests PASS; complete suite 159/159 PASS; typecheck/build PASS.
- Device revalidation: PENDING on the refreshed HTTPS build.

## Bounded defect attempt 2

- Observation: Camera preview started, but the primary guidance overlay remained at the pre-camera `IDLE / 启动相机后开始本机引导` copy.
- Cause: Camera readiness, model readiness, and explicit Trial arm state were not presented separately; additionally, `DISARMED` was not enforced as a zero-instruction engine gate.
- Bounded fix: `DISARMED` now cannot issue an ordinary action or passive READY. The overlay reports model loading/error/ready and explicitly requests `ARM 新试验` after the model is ready.
- Automated regression: 2 new lifecycle tests; full suite 161/161 PASS; typecheck/build PASS.
- Device revalidation: PENDING.

## Gate 1 attempt 3 — pre-fix sample

- Evidence: 5 valid V2 traces, 5 READY trials, 45 terminal Episodes.
- SUCCESS / NO_EFFECT / WRONG_DIRECTION: 16 / 23 / 6; Correction Success 35.6%.
- Objective invariants: post-READY ordinary 0, direction-sign mismatch 0, active-Episode axis switch 0.
- Fresh control age p50/p95/max: 91.6/121.8/235.3 ms.
- Display latency p50/p95/max: 91.6/248.1/893.4 ms; maximum exceeds the candidate bound.
- Subjective wrong-direction, oscillation, box-stability, and target-clarity assertions were not supplied.
- Decision: NOT Gate 1 PASS and NOT eligible for Gate 2. Full analysis: `oppo-k11-gate1-attempt3-analysis.md`.
- Bounded response: continuous-movement microcopy with explicit STOP cue, 1100 ms readability, meaningful-motion latency calculation, and READY-source telemetry. Target/deadband/success semantics remain unchanged.
- Device revalidation: REQUIRED on the post-fix build.

## Bounded defect attempt 4

- Observation: after the one anti-spam coarse instruction ended in incompatible `HEAD_SHOULDERS`, the UI persisted `正在确认可见身体范围` and hid the required physical action and the condition for reaching X precision.
- Bounded fix: retain the one-event anti-spam lifecycle while persistently presenting explicit farther/closer action copy and explaining that left/right adjustment follows compatible framing. Target, deadband, success semantics, and instruction counters are unchanged.
- Automated regression: complete suite 212/212 PASS; typecheck/build PASS.

## Gate 1 attempt 5 — post-copy-fix, not accepted

- Four V2 downloads were supplied. Their scenario selector remained `S1_HEAD_SHOULDERS_STATIC`, so actual causal instruction events—not filenames—were used to classify them.
- Functional evidence: one trace contains `MOVE_RIGHT ×2`; the remaining traces contain Scale/coarse `MOVE_FARTHER` or passive confirmation. All 4 reach READY, retain 5.56–7.46 seconds after READY, and emit zero post-READY ordinary action. No trace alternates physical X or Scale direction.
- Coverage failure: no trace contains both an X and a Scale precision correction, so the required Combined trial is missing.
- Performance failure: scenario-local row cadence is 3.79–5.04 Hz, below the 6 Hz minimum. Inference p50/p95 is 126.6–171.1 / 261.4–377.5 ms. Skipped-busy ratio is 35.6%–45.8%, with 28–126 stale-suppressed rows per trace. Preview remains 27.2–30.0 fps.
- Privacy/external: Provider, Backend per-frame, Luna, and Raw Upload are all 0.
- Subjective wrong-physical-direction and persistent-box-instability assertions were not supplied.
- Decision: NOT Gate 1 PASS and NOT eligible for Gate 2. The same device previously sustained 6.95–7.21 Hz and warmed p95 86.9–108.0 ms on the same inference implementation, while the intervening change was presentation-only; preserve this as an environmental/session performance failure and re-run from a single fresh browser tab before any inference/control change.

Source fingerprints:

| Trial ID | Filename | SHA-256 |
| ---: | --- | --- |
| 1 | `live-p2-scale-s1_head_shoulders_static-1787733677278.json` | `C883F55721C2BD26737FEC5640F07EA35C5872A0016923E8599B5212849DF5F9` |
| 3 | `live-p2-scale-s1_head_shoulders_static-1787733740587.json` | `BD4B0E8383D8C900B87DCC85AAEE82869FB176BBD689EA7F54E0B65F6717663B` |
| 4 | `live-p2-scale-s1_head_shoulders_static-1787733762195.json` | `AAE00929BA0CE38D3AEB88103D87C3B6828FC721FA935B5A7E6B59FC0BAECEB6` |
| 8 | `live-p2-scale-s1_head_shoulders_static-178773389.json` | `BEE5E19FA6D91FE3A3745B20562A0BE3DD86D1539DB7AF6E23A0C59E1C504759` |
