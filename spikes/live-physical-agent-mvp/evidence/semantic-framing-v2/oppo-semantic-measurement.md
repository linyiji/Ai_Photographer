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

### Post-fix scalar evidence set 1

User-supplied on 2026-08-26; scalar-only files were analyzed in place and were not copied into the repository.

| File | SHA-256 | Rows / sequence | Duration |
| --- | --- | --- | ---: |
| `live-p2-scalar-trace-1787711908330.json` | `93DABA5E971B35289325B52D2F06AD190749FE07FB36DCA920F267F2671BC5FB` | 342 / 1–342 | 50.73 s |
| `live-p2-scalar-trace-1787711942383.json` | `98AB2AC93D02BAB666A1CC7081EF505325DBA6F010A99C24FC88BF2B397B3B2D` | 186 / 351–536 | 31.20 s |
| `live-p2-scalar-trace-1787711965323.json` | `37B48267CE6D83F4BC9FD07F7B46D0E42C20511AA12C317599A87F4294528437` | 148 / 556–703 | 20.19 s |

- All files: `xfx-live-p2-scalar-trace-v2`, `raw_media=false`; no frame/video or landmarks were persisted.
- The first perception row occurred at page-performance timestamp `18,265 ms`. This proves the post-fix cold session reached model inference in about 18.3 seconds; the previous `>60 s` startup failure did not reproduce.
- The three exports are one continuous browser session, not a cold-start plus cached-reload pair. Cached reload confirmation remains pending.
- Static opening segment: 315/342 classified rows were `HEAD_SHOULDERS`, with BodyMode flicker count 0 across 50.73 seconds. One later intentional/unknown movement session reached cumulative transition count 7 and flicker count 1.
- Across 676 rows, precision X was valid in 473; precision Scale was valid in only 31. The latter is not enough to pass the multi-mode Scale/anchor scenarios.
- The armed portion produced 21 coarse `MOVE_FARTHER` events but only one denominator Episode, terminal `NO_EFFECT`. This is consistent with two-stage coarse framing separation and is not claimed as precision correction success.
- No READY occurred. These traces cannot be used as Parent OPPO Gate 1 or Correction Success evidence.

Evidence decision: cold-start correction `PASS`; cached-reload `PENDING`; Semantic Measurement Device Gate remains `MANUAL_REVIEW_REQUIRED` because labeled scenarios B–H, cadence telemetry, and cached reload are not yet supplied.
