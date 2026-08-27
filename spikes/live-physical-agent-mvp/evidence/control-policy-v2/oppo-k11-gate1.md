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

## Gate 1 attempt 6 — labeled coverage, not yet accepted

- Four correctly labeled V2 downloads: one X, two Scale, and one Combined candidate. All use DEFAULT / center-medium / front mirrored / Worker and declare `raw_media=false`.
- X: coarse compatibility `MOVE_FARTHER`, then precision `MOVE_LEFT` Episode SUCCESS and READY from EPISODE_SUCCESS.
- Scale candidates: each performs only coarse compatibility `MOVE_FARTHER`, then passive READY; neither contains a Parent precision Scale Episode.
- Combined candidate: coarse compatibility `MOVE_FARTHER`, then one precision `MOVE_CLOSER` Episode SUCCESS. It contains no X Episode, so it does not cover combined X+Scale.
- READY: 4/4; post-READY observation 5.66–6.87 s; post-READY ordinary action 0. Trace action sequences contain no X or Scale direction alternation.
- Performance recovered versus Attempt 5: scenario-local cadence 6.28–7.01 Hz; cumulative Vision 6.815–6.870 Hz; Preview 29.0–30.1 fps; skipped-busy 4.5%–5.1%. Inference p50 is 78.9–83.8 ms, while p95 is 108.4–142.0 ms; two of four snapshots exceed the 120 ms candidate.
- User thermal observation: the phone becomes hot after sustained use. The user observed p95 commonly around 140 ms with later periods near 90 ms; VA and Preview remained acceptable. The lower instantaneous period is not substituted for the full-session risk.
- Privacy/external: Provider, Backend per-frame, Luna, and Raw Upload are all 0.
- Decision: NOT Gate 1 PASS. Combined X+Scale coverage and the four subjective hard-invariant assertions remain required. Thermal/p95 variability is retained as a warning and blocks escalation to a longer Gate 2 session until bounded revalidation.

Source fingerprints:

| Label | Filename | SHA-256 |
| --- | --- | --- |
| X | `live-p2-scale-gate1_x-1787734980126.json` | `7EC5C6859FAE3C3BF49447F53590E3A118F1D46596C49EC25FA8DC05C9FCA521` |
| Scale | `live-p2-scale-gate1_scale-1787735064276.json` | `BD2DDB10DA8BD2AD4525FCDAE3A43BC52E11A43A4E443D48B60C20F3908C1D33` |
| Combined | `live-p2-scale-gate1_combined-1787735097010.json` | `5B7B58BD94080E199ECF5EAA11BA44FE0C801BA0023390841C876FCA5426EEE4` |
| Scale | `live-p2-scale-gate1_scale-1787735126629.json` | `5167E2F38E254C9A0B32AB32D8189CBF52C7F88EB0CF081593DAEB4677B41B76` |

## Gate 1 attempt 7 — Scale/Combined supplements, not accepted

- The labeled Scale supplement contains only coarse compatibility `MOVE_FARTHER`, followed by passive READY. It contains no Parent precision Scale Episode and therefore does not supply the required Scale correction trial.
- The labeled Combined supplement contains four precision X Episodes and no Scale Episode. It is an X-only trial, not a Combined X+Scale trial.
- X causal reconstruction: Episode 1 begins with Anchor X `0.390` and terminates `NO_EFFECT` after crossing to about `0.680`; Episodes 2 and 3 start near `0.670`, with Episode 3 issuing `STOP_HERE` near `0.509` before motion continues across to about `0.380`; Episode 4 starts near `0.380` and later reaches about `0.502`. The instruction sequence is `MOVE_LEFT -> MOVE_RIGHT -> MOVE_RIGHT -> MOVE_LEFT`, with the first three terminal outcomes `NO_EFFECT`.
- READY is `PASSIVE_CONFIRMATION`, not Episode success. Both traces emit zero post-READY ordinary action, but this does not establish Combined correction success or zero obvious oscillation.
- Scale stayed close to the target during X precision (`~0.442–0.538`), so no Scale issue was active. The initial `HEAD_SHOULDERS / TOO_TIGHT` coarse transition is not a precision Scale Episode.
- Performance: Scale trace cadence `6.69 Hz`, Preview `28.0 fps`, Vision/State `6.155 Hz`, inference p50/p95 `75.0/124.8 ms`, skipped-busy `3.4%`; Combined trace cadence `7.02 Hz`, Preview `29.8 fps`, Vision/State `6.627 Hz`, inference p50/p95 `81.7/111.3 ms`, skipped-busy `2.8%`. Combined performance passes the candidate; Scale p95 remains a small warning above 120 ms. The sustained-use thermal warning from Attempt 6 remains open.
- Privacy/external: both downloads declare `raw_media=false`; Provider, Backend per-frame, Luna, and Raw Upload are all 0.
- Decision: NOT Gate 1 PASS. Gate 2 remains blocked. No control threshold, Target, Deadband, or success semantic is changed from this evidence. A valid retry must begin in compatible UPPER_BODY framing with both X and Scale outside their unchanged precision targets before ARM, then avoid continuing past the visible STOP cue.

Source fingerprints:

| Label | Filename | SHA-256 |
| --- | --- | --- |
| Scale | `live-p2-scale-gate1_scale-1787736229109.json` | `885E0D8D18F0035C0EA4D476905155DC6FB02A2D7690479865CA5BE3B38EDB0E` |
| Combined | `live-p2-scale-gate1_combined-1787736320137.json` | `D1D3036546BB109F9F5085E6839143EF103E25D82A3F80BCAED63B1A4290EA47` |

## Gate 1 attempt 8 — acceptance harness ready, device evidence pending

- A debug-only Pre-ARM panel now evaluates X, Scale, and Combined starting coverage against the existing target, deadband, precision calibration, measurement validity, and stable compatible BodyMode. It does not tune controller semantics.
- Invalid Gate 1 ARM is prevented with an explicit inline failure reason beside the button; the button changes to `ARM 条件未满足`, the panel reports `ARM 已阻止`, and the Trial remains DISARMED. A valid ARM locks the Pre-ARM scalar snapshot into the downloaded trace.
- OPPO screenshots show two distinct states that must not be conflated: one frame has X `0.554 / TOO_RIGHT / VALID` while Scale is invalid, and another has X `0.599 / UNKNOWN / INVALID` plus invalid Scale. Both remain `HEAD_SHOULDERS`, so center-medium Gate 1 precision ARM is correctly blocked; a visible numeric anchor alone is not proof of a precision-valid X measurement.
- The harness now displays the authoritative X target band and the current BodyMode-specific semantic Scale target band. When no compatible semantic calibration exists it displays `需先进入 UPPER_BODY`, and the general Target HUD no longer mixes legacy `height_ratio=0.350` with a semantic Scale value such as `1.107` or `1.514`. Invalid measurements no longer receive a redundant range-failure message. The operator copy explicitly asks the user to step back, face the camera, and hold until `UPPER_BODY`; Target, Deadband, calibration, and acceptance semantics are unchanged.
- Trace export now reports expected/actual coverage, precision Episode/success counts, READY source, post-READY ordinary count, and per-STOP scalar causality: measurement version/epoch, X/Scale at STOP, first newer measurement, continued motion, settle time, maximum excursion, and opposite reissue age.
- Automated regression: 216/216 PASS. TypeScript PASS. Production build PASS / 30 modules.
- Browser Replay: READY / EPISODE_SUCCESS, ordinary/STOP/HOLD/success `1/1/1/1`, Provider/Backend/Luna/Upload `0/0/0/0`, console errors 0. Invalid ARM smoke remains DISARMED and shows the bounded failure reason.
- Real-device status: `MANUAL_REVIEW_REQUIRED`. No Attempt 8 X/Scale/Combined trace has yet been accepted, no overshoot classification is claimed, and Gate 2 remains blocked.
