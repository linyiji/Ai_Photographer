# OPPO K11 Semantic Measurement Device Gate

Status: READY_FOR_MANUAL_DEVICE_TEST

Device: OPPO K11 / ColorOS 15 / Chrome Mobile

Functional settings: DEFAULT theme, grid OFF. `Semantic Debug` may be enabled for this gate. Do not capture, save, or upload raw frames/video.

## Required scenarios

| Scenario | Expected BodyMode | Actual mode/transitions | Anchor/scale observation | PASS/FAIL |
| --- | --- | --- | --- | --- |
| A close head/shoulders | HEAD_SHOULDERS | PENDING | PENDING | PENDING |
| B upper body | UPPER_BODY | PENDING | PENDING | PENDING |
| C three-quarter where practical | THREE_QUARTER | PENDING | PENDING | PENDING |
| D full body where practical | FULL_BODY | PENDING | PENDING | PENDING |
| E static torso + arm extension | unchanged | PENDING | no false X/scale | PENDING |
| F brief lower-body crop | persistent then bounded transition | PENDING | no single-frame scale jump | PENDING |
| G deliberate torso left/right | stable sign | PENDING | torso, not wrist | PENDING |
| H deliberate closer/farther | mode-matched sign | PENDING | no metric-switch jump | PENDING |

Required assertions:

- static BodyMode persistent flicker = 0;
- false wrist-induced X corrections = 0;
- false limb-visibility-induced scale corrections = 0;
- incompatible mode uses coarse framing only;
- compatible stable mode starts precision servo;
- uncertain measurement suppresses ordinary instruction;
- raw Pose extent is clearly debug-only;
- Provider/Backend/Luna/Raw Upload = 0.

## Cadence A/B

| Target Hz | Actual Hz | Preview FPS | State Hz | Inference p50/p95 | Measurement age | Skipped busy | Heat/freeze |
| --- | ---: | ---: | ---: | --- | --- | ---: | --- |
| 8 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| 10 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| 12 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Selected target: PENDING DEVICE EVIDENCE.

Gate result: PENDING. Parent OPPO Gate 1 must not resume until this gate passes.

## Startup blocker and bounded correction

An OPPO attempt on 2026-08-26 reported model loading still incomplete after more than 60 seconds. This is a device-gate blocker, not an accepted measurement run.

- Public cold-path audit: Pose model `5,777,746` bytes; SIMD WASM `11,756,954` bytes. Desktop tunnel timings were approximately `4.27 s` and `3.26 s`; the Quick Tunnel responses were `CF-Cache-Status: DYNAMIC` and `Cache-Control: no-cache` before the correction.
- Root amplification: Worker initialization timed out at 45 seconds and then started a bounded main-thread fallback, repeating initialization/download work on a slow mobile path.
- Bounded correction: one 120-second Worker attempt; timeout is terminal and explicitly does not restart the model/WASM download; WASM/model stages are visible; local runtime assets receive a one-day browser cache header with stale revalidation.
- Regression: complete automated suite `194/194 PASS`; typecheck PASS; production build PASS / 28 modules.

Required revalidation: cold start reaches `MODEL READY`, and a subsequent page reload uses the cached assets and reaches READY again. Until both are observed, this gate remains `READY_FOR_MANUAL_DEVICE_TEST`.
