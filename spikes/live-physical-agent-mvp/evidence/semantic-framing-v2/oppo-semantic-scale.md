# OPPO K11 Semantic Scale Device Gate

Status: ATTEMPT_1_FAIL / REVALIDATION_REQUIRED

Device: OPPO K11 / ColorOS 15 / Chrome Mobile. Use DEFAULT theme and enable `Semantic Debug`. Do not capture, save, or upload frames/video.

Before each scenario, select its `SCALE GATE` label and click `ARM 新试验`. After the scenario, click `下载标量 Trace` before starting another ARM. The file directly includes the scenario label, device/browser context, orientation/camera/mirror, performance snapshot, semantic/control rows, and zero-valued privacy/external counters.

## Labeled scenarios

| Scenario | Required action | Result |
| --- | --- | --- |
| S1 HEAD_SHOULDERS STATIC | hold still >=8 s | FAIL: proxy drift/saturation and 7 repeated farther cues |
| S2 HEAD_SHOULDERS MOVE FARTHER | deliberate small steps farther | FAIL: proxy moved toward/saturated at 1.0 |
| S3 MOVE CLOSER | from wider frame, deliberate steps closer | FAIL: proxy remained saturated near 1.0 |
| S4 UPPER_BODY PRECISION | hold stable, then one small farther and closer step | FAIL: only 1 stable UPPER_BODY precision row |
| S5 ARM INVARIANCE | torso still, move one arm outward/upward | FAIL: proxy saturated and 6 farther cues |
| S6 MODE TRANSITION | HEAD_SHOULDERS → UPPER_BODY or reverse | FAIL: no BodyMode transition observed |

Record for each scenario: BodyMode, compatibility, DistanceProxy validity/trend, precision Scale validity/reason, instruction count, coarse episode/outcome, and unexpected correction.

## Hard criteria

| Criterion | Required | Actual |
| --- | ---: | ---: |
| S1 DistanceProxy valid / stable-present rows | >=80% | 84/84 = 100% PASS |
| S4 UPPER_BODY precision Scale valid / stable-present rows | >=70% | 1/1 = 100%, INSUFFICIENT SAMPLE |
| deliberate closer/farther sign correctness | 100% | FAIL: S2 wrong sign/saturation; S3 saturation |
| arm-motion false Scale correction | 0 | FAIL: 6 farther cues in S5 |
| metric-switch false correction | 0 | NOT TESTED: S6 did not transition |
| repeated coarse instruction while improving | 0 | FAIL: repeated cues, including 7 in S1 |
| persistent BodyMode flicker | 0 | 0 PASS |

Performance: Preview >=24 fps; Vision actual >=6 Hz; inference p95 <=120 ms candidate; no backlog/freeze/black screen/crash.

Privacy/external: Raw Frame/Video Persistence 0; Raw Upload 0; Provider 0; Backend per-frame 0; Luna 0.

Gate result: MANUAL_REVIEW_REQUIRED / Attempt 1 FAIL. Parent OPPO Gate 1 must not resume until this gate passes.

## Startup revalidation defect

One device attempt reported `Pose model missing or invalid: expected 5777746 bytes, received 0`. The cached mobile `HEAD` response exposed no representation length and was falsely treated as a zero-byte model. The public model remained 5,777,746 bytes. The bounded correction treats zero/missing `HEAD` length as `UNKNOWN`, rejects only an explicit nonzero mismatch, and lets the real MediaPipe GET/init validate the asset. Automated regression and complete suite `210/210 PASS`; device revalidation is required.

## Device Attempt 1 — pre-fix diagnostic evidence

Date: 2026-08-26. Device context: OPPO K11 / ColorOS 15 / Chrome Mobile, portrait, front camera, mirrored preview, DEFAULT theme, `requestVideoFrameCallback`. All six downloads declare `raw_media=false`. User observation: **obvious device heating**; no visible freeze, black screen, or crash.

| Scenario | Rows / dominant mode | Preview fps | Vision / State Hz | Inference p50 / p95 ms | Distance / precision evidence |
| --- | --- | ---: | ---: | ---: | --- |
| S1 | 137 / HEAD_SHOULDERS | 29.8 | 4.157 / 4.157 | 148.3 / 279.7 | Distance 84/84; proxy 0.9974→0.9739; mixed velocity |
| S2 | 135 / HEAD_SHOULDERS→UPPER_BODY | 28.8 | 4.234 / 4.234 | 145.9 / 268.6 | Distance 117/117; UPPER precision 64/64; proxy 0.9784→~1.0 |
| S3 | 134 / HEAD_SHOULDERS | 29.2 | 4.361 / 4.361 | 139.2 / 265.7 | Distance 28/28; proxy remained near 1.0 |
| S4 | 73 / mostly HEAD_SHOULDERS | 30.0 | 4.380 / 4.380 | 136.6 / 281.3 | only 1 stable UPPER_BODY precision row; proxy near 1.0 |
| S5 | 123 / HEAD_SHOULDERS | 26.3 | 4.335 / 4.335 | 137.8 / 301.1 | Distance 40/40; proxy near 1.0 |
| S6 | 124 / HEAD_SHOULDERS | 29.3 | 4.333 / 4.333 | 131.8 / 304.1 | Distance 39/41; no requested mode transition |

Performance decision: Preview fps passes `>=24`; every scenario fails Vision `>=6 Hz`; every p95 fails the `<=120 ms` candidate; obvious heat is a device risk. No backlog-induced visible freeze, black screen, or crash was observed. This performance result alone prevents a gate PASS.

Functional decision: FAIL. Distance/precision values were capped at `1.0`, destroying the closer/farther sign at close framing, and terminal coarse episodes reopened automatically, producing repeated corrections. S4 and S6 also did not provide sufficient requested scenario coverage. Persistent BodyMode flicker was zero.

Source fingerprints (files remain outside the repository; no camera frame/video is committed):

| Scenario | Filename | SHA-256 |
| --- | --- | --- |
| S1 | `live-p2-scale-s1_head_shoulders_static-1787715770018.json` | `0EBE4C92B03E46D5C93EECF07A586746CB04C21DAB951973C8E6EF291D468DCD` |
| S2 | `live-p2-scale-s2_head_shoulders_move_farther-1787715808677.json` | `A08287E6F20ACEBB8F65BC0A436BB91FAD4C3C9C6FEF5B8717340A18B34EA1DA` |
| S3 | `live-p2-scale-s3_move_closer-1787715828576.json` | `77353AD977888227DDB1300C92936C5739E4AE1C237473A063C9BCBDED799EAE` |
| S4 | `live-p2-scale-s4_upper_body_precision-1787715851022.json` | `972055E3EB3BD03BADF8AC5BF31C68FFB7641EDCA40DAB65152A6C436D4E956E` |
| S5 | `live-p2-scale-s5_arm_motion_invariance-1787715881078.json` | `E24077A6713C66D212D36596FE0B827FCCE36AA794DC86C6470517282DD8167A` |
| S6 | `live-p2-scale-s6_body_mode_transition-1787715910236.json` | `1363E9654AAC14967895F5C8ABD68905A42ECAC8067AD30CD2B627F6218970CD` |

## Bounded response after Attempt 1

- Preserve the continuous DistanceProxy and precision Scale above `1.0`; only uncertainty remains bounded.
- Do not automatically reissue the same coarse action after a terminal episode. Re-ARM or an actual coarse-action change is required.
- Enforce a fresh-state handoff when BodyMode becomes target-compatible, including when the preceding coarse episode was already terminal.
- Export explicit `provider_calls=0` in telemetry.
- Automated regression: `211/211 PASS`; TypeScript PASS; production build PASS / 29 modules.

Fresh, cooled-device S1–S6 evidence is required. Attempt 1 is retained as pre-fix FAIL evidence and cannot be reused as a passing result.
