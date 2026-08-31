# OPPO V3 Prospective Human-Step Device Gate

Date: `2026-08-31`

Task: `XFX_LIVE_P2_V3_OPPO_PROSPECTIVE_HUMAN_STEP_DEVICE_GATE_04`

Status: `FAIL / HUMAN-RESPONSE CAUSALITY REGRESSION`

## Device and runtime

- Device: OPPO K11
- OS: ColorOS 15 (previously user-confirmed device baseline); exported UA reports Android 10 compatibility token
- Browser: Chrome Mobile 138
- Orientation: portrait
- Camera: front
- Preview mirror: mirrored
- Control policy: V3
- Scheduler: requestVideoFrameCallback
- Raw media: none

## Preserved A0 diagnostic

Source: `live-p2-v3-v3_framing_only-1788144437948.json`

SHA-256: `4B1644BBE09FFFB1B13ED543AF8581B35D3CE353609222BAD4894DEC7FD1F653`

This first trace is preserved as an invalid diagnostic because one of three ordinary actions was INVALIDATED. It nevertheless reached READY after two valid TARGET_REACHED actions. Post-READY ordinary output was zero. Session duration was 92.0 s; Preview/Vision/State were 30.0/6.97/6.97 Hz; inference p50/p95 80.6/121.7 ms.

The user's observation that READY remains after leaving position is not classified as a regression. READY is intentionally latched as the completed-trial result, and the accepted hard invariant requires subject movement after READY not to reopen ordinary guidance in the same armed trial. The product wording may remain confusing, but no presentation or READY rule is changed in this device evidence task.

## A1 clean-replacement attempt

Source: `live-p2-v3-v3_framing_only-1788145329028.json`

SHA-256: `73DA0599CE38C259707766115C063BBAF48605EC3E7ED3C332FED1A49D9288FD`

User observation: `指示指令和判断都不准确`.

This replacement is not a valid FRAMING_ONLY trial and fails the device gate:

- duration: 198.5 s;
- ordinary actions: 35;
- evaluated actions: 34;
- active incomplete action at export: 1;
- valid evaluated actions: 26;
- TARGET_REACHED / IMPROVED / NO_EFFECT / WRONG_DIRECTION / INVALIDATED: `3 / 1 / 22 / 0 / 8`;
- Action Effectiveness: `4/26 = 15.38%`;
- Target Reach Rate: `3/26 = 11.54%`;
- movement observed: 12 evaluated Episodes;
- no movement observed: 22 evaluated Episodes;
- pause count: 5;
- FRAMING / ALIGN_X Episodes: `31 / 4`;
- READY: false;
- corrections/time to READY: not reached.

Performance: Preview 29.8 FPS; Vision/State 7.13/7.13 Hz; inference p50/p95 88.2/118.6 ms; Skipped Busy 22. Thermal was not supplied by the browser and remains UNKNOWN. Subject loss/reacquire was 1/1. Provider, Backend per-frame, Luna, and Raw upload were all zero.

## Proven causal failure

The replacement exposes a human-response causality regression:

1. `HumanSettleDetectorV01` permits an Episode to settle after the 900 ms response grace plus stable window even when no user movement is detected.
2. Such an Episode becomes NO_EFFECT, or can become TARGET_REACHED from relation drift.
3. The corrected retry barrier accepts any newer fresh stable measurement and creates a new ControlEpoch.
4. Therefore the UI can issue repeated new instructions without evidence that the user acted on the previous instruction.

The result is not stale `lastEpisode` copy: each repeat is a technically new ControlEpoch. It is nevertheless causally stale from the human protocol because `ONE ACTION -> ONE HUMAN STEP -> SETTLE -> REOBSERVE -> NEXT ACTION` did not occur.

Concrete evidence:

- 22 of 34 evaluated Episodes had `movement_started_at = null`.
- Episode 16 recorded TARGET_REACHED with `movement_started_at = null`.
- Three consecutive no-response NO_EFFECT actions repeatedly triggered PAUSED/resume cycles.
- The exported trace ended with Episode 35 still ISSUED and READY false.

This is sufficient to reject FRAMING_ONLY and stop the four-scenario gate. It does not establish a deterministic physical direction sign inversion because the trace cannot prove the user's exact compliant physical motion for every cue. Therefore `WRONG_PHYSICAL_DIRECTION` is not claimed as zero or greater than zero.

## Framing semantic risk

`FRAMING_RELATION_SEMANTIC_RISK = WARNING`.

The trace shows volatile transitions among TOO_CLOSE, IN_RANGE, and TOO_FAR, but every issued distance action still matches the current encoded relation (`TOO_CLOSE -> MOVE_FARTHER_SMALL`, `TOO_FAR -> MOVE_CLOSER_SMALL`). Fresh evidence proves human-response/retry causality failure, not a deterministic relation-to-action sign inversion. Measurement thresholds and semantic framing are not modified in this evidence step.

## Gate disposition

- FRAMING_ONLY: FAIL
- X_ONLY: NOT_REACHED
- COMBINED: NOT_REACHED
- ALREADY_SATISFIED: NOT_REACHED
- V3 Experimental Device Gate: FAIL
- V3 Production Runtime: NOT_PROMOTED
- V3 Production Candidate: REQUIRES_REVISION
- V3 Gate 2: NOT_DEFINED

No B-D testing should continue under this implementation because the first required scenario has already failed and the allowed clean replacement is exhausted.

## Regression integrity

No implementation source changed in this evidence task. The unchanged implementation still passes `237/237` automated tests, TypeScript, and production build (`36 modules`). V3 deterministic browser BOTH_BAD reaches READY, V2 remains the default and its ready-after-success replay reaches READY, and browser console errors are zero. These synthetic passes do not override the real-device failure.
