# OPPO K11 Semantic Scale Device Gate

Status: READY_FOR_MANUAL_DEVICE_TEST

Device: OPPO K11 / ColorOS 15 / Chrome Mobile. Use DEFAULT theme and enable `Semantic Debug`. Do not capture, save, or upload frames/video.

Before each scenario, select its `SCALE GATE` label and click `ARM 新试验`. After the scenario, click `下载标量 Trace` before starting another ARM. The file directly includes the scenario label, device/browser context, orientation/camera/mirror, performance snapshot, semantic/control rows, and zero-valued privacy/external counters.

## Labeled scenarios

| Scenario | Required action | Result |
| --- | --- | --- |
| S1 HEAD_SHOULDERS STATIC | hold still >=8 s | PENDING |
| S2 HEAD_SHOULDERS MOVE FARTHER | deliberate small steps farther | PENDING |
| S3 MOVE CLOSER | from wider frame, deliberate steps closer | PENDING |
| S4 UPPER_BODY PRECISION | hold stable, then one small farther and closer step | PENDING |
| S5 ARM INVARIANCE | torso still, move one arm outward/upward | PENDING |
| S6 MODE TRANSITION | HEAD_SHOULDERS → UPPER_BODY or reverse | PENDING |

Record for each scenario: BodyMode, compatibility, DistanceProxy validity/trend, precision Scale validity/reason, instruction count, coarse episode/outcome, and unexpected correction.

## Hard criteria

| Criterion | Required | Actual |
| --- | ---: | ---: |
| S1 DistanceProxy valid / stable-present rows | >=80% | PENDING |
| S4 UPPER_BODY precision Scale valid / stable-present rows | >=70% | PENDING |
| deliberate closer/farther sign correctness | 100% | PENDING |
| arm-motion false Scale correction | 0 | PENDING |
| metric-switch false correction | 0 | PENDING |
| repeated coarse instruction while improving | 0 | PENDING |
| persistent BodyMode flicker | 0 | PENDING |

Performance: Preview >=24 fps; Vision actual >=6 Hz; inference p95 <=120 ms candidate; no backlog/freeze/black screen/crash.

Privacy/external: Raw Frame/Video Persistence 0; Raw Upload 0; Provider 0; Backend per-frame 0; Luna 0.

Gate result: MANUAL_REVIEW_REQUIRED. Parent OPPO Gate 1 must not resume until this gate passes.
