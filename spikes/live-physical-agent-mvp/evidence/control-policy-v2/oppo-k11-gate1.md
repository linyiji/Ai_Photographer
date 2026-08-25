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
