# XFX_LIVE_P2_V4_CENTER_UPPER_BODY_MEASUREMENT_DEVICE_REVALIDATION_05C

## Final disposition

| Field | Result |
|---|---|
| TASK_RESULT | FAIL |
| DEVICE | OPPO K11 / ColorOS 15 / Chrome Mobile 138 / front camera |
| TARGET | CENTER_UPPER_BODY |
| SUBJECT_LOCK | PASS — 427/427 LOCKED |
| OBSERVED_BODY_COVERAGE | HEAD_SHOULDERS → UPPER_BODY → THREE_QUARTER → UPPER_BODY → HEAD_SHOULDERS |
| HEAD_CORE_REDUCTION | CENTROID |
| HEAD_TO_HIP_DEVICE | FAIL — over-invalidated by lower-body bottom-crop scope |
| TORSO_CENTER_DEVICE | FAIL — same crop-scope defect |
| HIPS_EVIDENCE_DEVICE | PASS_WITH_WARNING — bilateral coordinates/high confidence observed but classified EDGE_CROPPED |
| MEASUREMENT_READY_OBSERVED | NO |
| ACQUIRE_REQUIRED_BODY_RELEASED | NO |
| DOWNSTREAM_STAGE_REACHED | NOT_REACHED |
| FALSE_REQUIRED_BODY_DEADLOCK | 0 — no row had measurement_ready=true; failure is earlier readiness classification |
| DEFAULT_FULL_BODY_REQUIREMENT | NO |
| BODY_COVERAGE_GUIDE_BEHAVIOR | FAIL — persistent farther-back guidance could not clear the wrongly scoped gate |
| TARGET_VALUES_CHANGED | NO |
| RESPONSE_GATE | UNCHANGED |
| VERIFY_LOGIC | UNCHANGED |
| CENTER_UPPER_BODY_DEVICE_REVALIDATION | FAIL |
| V4_DEVICE_PROGRAM | REQUIRES_REVISION |
| MAIN_INTEGRATION | NOT_STARTED |

## Provenance

- Current task head: `e634a0c7ca0804607a26cc227c13d2f4058907e5`.
- Runtime provenance: `ef7f6b52dd2ace562ce3e0e6c39ea856d6bda94c`.
- Trace: `live-p2-v4-v4_center_upper_body-1788163637473.json`.
- Trace SHA-256: `1CBCBC4202D3C8858D02B0D321537F0464C5CE1EED6CC13D038A5B7C15C5E692`.
- Trace rows / duration: `427 / 72.67 s`.

## Measurement and resolver sequence

1. `HEAD_SHOULDERS`: hips low confidence, both measurements MARGINAL.
2. Bilateral hip evidence appears; upper torso becomes DERIVED and finite scale/X are emitted.
3. The global bottom-crop flag classifies hips as EDGE_CROPPED and both upper-body measurements INVALID.
4. The observation reaches `UPPER_BODY` and later `THREE_QUARTER`, but readiness stays false.
5. Resolver remains `ACQUIRE_REQUIRED_BODY`; scale/X/VERIFY are never reached.

The 27 `THREE_QUARTER` rows are decisive: bilateral hip coordinates are present with high confidence, but lower-body crop below the hips invalidates the Upper Body target's `HEAD_TO_HIP` and `TORSO_CENTER` measurements.

## Performance

- Preview FPS: `29.6`.
- Vision Hz: `6.55`.
- Inference p50/p95: `82.7 / 147.4 ms`.
- Skipped busy: `32 / 507 = 6.31%`.
- Thermal: not reported in this attempt.

## Boundary

05C authorizes evidence classification only. No code, threshold, Target, tolerance, response or VERIFY change was made. Provider/backend-per-frame/Luna/raw upload remain `0/0/0/0`.
