# OPPO CENTER_UPPER_BODY revalidation 05C

Source trace: `live-p2-v4-v4_center_upper_body-1788163637473.json`

- Source path: `D:\微信\xwechat_files\wxid_9gc8u6c4q8db22_d67e\msg\file\2026-08\live-p2-v4-v4_center_upper_body-1788163637473.json`
- SHA-256: `1CBCBC4202D3C8858D02B0D321537F0464C5CE1EED6CC13D038A5B7C15C5E692`
- Bytes: `2187855`
- Rows: `427`
- Duration: `72.67 s`
- Scalar-only / raw media: `true / false`

## Gate result

`TASK_RESULT = FAIL`

The resolver did not exhibit the narrow `measurement_ready=true` plus `ACQUIRE_REQUIRED_BODY` false-deadlock condition (`0` rows). Instead, target measurement readiness could never become true because upper-body measurements were over-invalidated by a global lower-edge crop signal.

## Trace facts

- Subject lock: `LOCKED` for 427/427 rows.
- Resolver: `ACQUIRE_REQUIRED_BODY` for 427/427 rows.
- Measurement ready: false for 427/427 rows.
- Coverage summary: `HEAD_SHOULDERS` 178, `UPPER_BODY` 222, `THREE_QUARTER` 27.
- Hip classification: `LOW_CONFIDENCE` 176, `UNILATERAL_PARTIAL` 2, `EDGE_CROPPED` 249.
- Upper torso: `DERIVED` 249 rows.
- `HEAD_TO_HIP / TORSO_CENTER`: `MARGINAL/MARGINAL` 178 rows; `INVALID/INVALID` 249 rows.
- Blocking: `HEAD_TO_HIP_INVALID + TORSO_CENTER_INVALID + REAL_BOTTOM_CROP` 249 rows.
- Actions / READY: `0 / 0`.
- Downstream stage: not reached.

The strongest counterexample contains 27 `THREE_QUARTER` rows with two visible hip points, hip confidence up to 0.984 and hip center Y around 0.846, yet all 27 rows classify both upper-body measurements INVALID because `REAL_BOTTOM_CROP` is present. Current scale and torso X are finite in these rows, proving that the head/hip span and torso anchor geometry existed.

## Defect classification

`UPPER_BODY_MEASUREMENT_INVALIDATED_BY_LOWER_BODY_CROP_SCOPE`

The semantic crop signal describes a lower-body boundary (for example knees present while ankles are outside the view). The V4 observation projection applies that global bottom-crop bit to the hip basis and to `HEAD_TO_HIP/TORSO_CENTER` readiness. For an Upper Body target, lower body below already valid bilateral hips must not automatically invalidate the head-to-hip span.

This also drives the persistent coverage presentation asking the user to move farther back. The user cannot resolve the state reliably because moving far enough to expose more lower body keeps shifting the lower crop boundary.

## Performance / privacy

- Preview FPS: 29.6.
- Vision / State Hz: 6.55 / 6.55.
- Inference p50/p95: 82.7 / 147.4 ms.
- Scheduled / processed / skipped busy: 507 / 476 / 32 (6.31%).
- Provider / backend per-frame / Luna / raw upload: 0 / 0 / 0 / 0.

No runtime change is authorized in 05C. Evidence is preserved and the task stops with `V4_DEVICE_PROGRAM = REQUIRES_REVISION`.
