# OPPO V4 attempt 01 — trace analysis

Source: `live-p2-v4-v4_left_third_upper_body-1788159128743.json`

SHA-256: `78721C171E06B69BD5260E97D4273B9DCF336FA41EF9E683CACB8C776D6D09AE`

The source is scalar-only and was analyzed in place; no camera frame/video was copied or committed.

## Trace truth

- Scenario: `V4_LEFT_THIRD_UPPER_BODY` (not Center).
- Rows: 214.
- Target: `LEFT_THIRD_UPPER_BODY`.
- Subject lock: 214/214 `LOCKED`.
- Body summary: 214/214 `HEAD_SHOULDERS`.
- Resolver stage: 214/214 `ACQUIRE_REQUIRED_BODY`.
- Missing regions: 214/214 `UPPER_TORSO,HIPS`.
- X/scale relations: 214/214 `UNKNOWN / UNKNOWN` because the required observation basis was incomplete.
- Ordinary actions: 0.
- READY rows: 0.
- Raw upload / backend per-frame / provider / Luna: 0 / 0 / 0 / 0.

This trace did not enter VERIFY and cannot prove a VERIFY stall. It correctly blocked target-relative control on incomplete required-body evidence, but the acquisition presentation and the old debug/box overlay made the state look stuck or contradictory.

## Performance observation

- Preview FPS: 29.8.
- Vision/State Hz: 6.75 / 6.75 against an 8 Hz target.
- Inference p50/p95: 88.6 / 162 ms.
- Scheduled/processed/skipped busy: 1111 / 1038 / 72.

Preview continuity is good. Vision cadence and p95 are warnings for continued device testing, not a reason to fabricate control PASS.

## Bounded correction

- Acquisition copy continues to name the missing required regions.
- V4 debug overlays are forcibly hidden.
- Misleading conventional Target/acceptable rectangles are hidden.
- Green subject box is stabilized and shown only after lock plus required-body satisfaction.
- VERIFY exposes progress and uses bounded stability hysteresis without changing Target or deadband.

Device Gate remains `MANUAL_REVIEW_REQUIRED`; a fresh Center trace and repeat Left/Right traces are required.

