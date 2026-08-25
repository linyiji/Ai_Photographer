# OPPO K11 overshoot / READY causality revalidation

Status: FAIL / COMPLETE ACCEPTED SAMPLE RETAINED

Device: OPPO K11  
OS: ColorOS 15  
Browser: Chrome Mobile  
Raw media saved/uploaded: 0

## Required runtime telemetry

- Preview FPS: NOT TRANSCRIBED / NOT FABRICATED
- Vision Hz: NOT TRANSCRIBED / NOT FABRICATED
- State Hz: NOT TRANSCRIBED / NOT FABRICATED
- Inference p50/p95: NOT TRANSCRIBED / NOT FABRICATED
- Thermal: NOT TRANSCRIBED
- Visible stalls / black screen / crash: NOT TRANSCRIBED

## Complete accepted sample

- Trials: 5 complete, mutually non-overlapping scalar traces
- Terminal directional Episodes: 54 (required >=15)
- SUCCESS / NO_EFFECT / WRONG_DIRECTION: 12 / 36 / 6
- Correction Success: 12 / 54 = 22.2% (required >=80%) / FAIL
- Action Compliance / Axis Completion: 42.6% / 22.2%
- NO_EFFECT subtype distribution: NO_MOTION 0; INSUFFICIENT_PROGRESS 3;
  OVERSHOOT 8; JITTER_OR_UNCERTAIN 16; AXIS_COUPLED 0; PREMATURE_SETTLE 0;
  LATE_RESPONSE 7; UNCLASSIFIED 2
- STOP count: 13; ordinary directional count: 54; HOLD count: 5
- Wrong audit: TRUE_WRONG_DIRECTION 4; TARGET_CROSS_OVERSHOOT 0;
  AXIS_COUPLING_ARTIFACT 0; MEASUREMENT_UNCERTAIN 2
- READY source distribution: unavailable in scalar trace v1; one HOLD/READY per Trial
- Post-READY ordinary actions: 0
- Minimum observed ordinary instruction gap: 1201.4 ms / PASS
- Trial durations: 5.54 s; 17.30 s; 59.23 s; 56.75 s; 9.66 s

## Human-control observations

- MOVE understood: NOT TRANSCRIBED
- STOP_HERE understood: NOT TRANSCRIBED
- STOP too early / too late: PENDING
- STOP visibly reduced overshoot: PENDING
- Repeated same-direction corrections natural: PENDING
- STOP/MOVE ping-pong: PENDING
- Conflicting X/Scale cues: PENDING
- READY after obviously bad position: PENDING

The automatic local-recovery defect found during the first submitted sample was fixed:
stable input resumes after 1200 ms, manual resume remains available, and metrics/Episode
numbering are preserved. The two long accepted Trials contain recovery rows and continue
monotonically through Episode 23, proving the recovery path no longer traps the session.

Source hashes:

- `1787648572729`: `245704228A31244078AE4466951CC8C2835A113FB63FC21F236E2DB1C3AD81F9`
- `1787648598009`: `3E9F10B3B1A68D465488C618EA98B6C55050CC06D66C035589D5CBD3FB7B5586`
- `1787648667370`: `5A98E43CAA4439CA8A31F1FA08A069D5C8EF25E4B5C1346E674FF2C8D2B7F368`
- `1787648749260`: `D6CC721E593420F3B7C715D00F7DA68C0804A82AD67F6894E17A987D796F8587`
- `1787648807723`: `10D274EDC748C5B2AA9C1EE3147950E2AB7923E44295BD471286A408FE5C1BC1`

The raw scalar files remain outside Git and contain no raw media. The complete retained
sample misses the unchanged hard gate, so LIVE-P2 remains FAIL. Missing performance and
subjective observations cannot reverse that decision and are not fabricated.
