# V4 body visibility / measurement readiness remediation 05A

Date: 2026-08-31 (Asia/Shanghai)

## Finding

The accepted OPPO trace stayed in `ACQUIRE_REQUIRED_BODY` because hip evidence was absent. During the audit, a separate deterministic defect was found: V4 requested `HEAD_CORE.pair_center`, but `HEAD_CORE` is a multi-landmark group and only two-point bilateral groups receive `pair_center`. Consequently, a real-device `HEAD_TO_HIP` span could remain invalid even after hips became visible.

## Bounded remediation

- Added a centroid to semantic landmark groups and use `HEAD_CORE_CENTROID` as the head anchor.
- Kept `UPPER_TORSO` derived from bilateral shoulders and hips; no direct torso marker exists or is required.
- Classified hip evidence as bilateral valid, unilateral partial, low confidence, edge cropped or unknown.
- Added runtime `MeasurementCapabilityV01` for target scale spans and torso center.
- Separated `coverage_satisfied` from `measurement_ready`.
- Kept real bottom crop as `NOT_READY`.
- Added scalar trace diagnostics without raw media.

## Deterministic gates

- Both shoulders + both hips: upper-body measurement READY.
- Derived torso with no direct torso marker: READY.
- One usable hip only: MARGINAL and precision control blocked.
- Hips at real bottom crop: INVALID / NOT_READY.
- Head + shoulders only: NOT_READY for `HEAD_TO_HIP`.
- Complete upper-body evidence: scale/anchor stages reachable.
- Automated regression: 257/257 PASS.
- TypeScript: PASS.
- Production build: PASS, 44 modules.
- Browser matrix: 6/6 PASS to `READY_LATCHED`, zero console warning/error.

## Invariants

Target values changed: NO. Fixed-center authority: REMOVED. BodyMode distance authority: REMOVED. Response gate and VERIFY logic: PRESERVED. Provider/backend-per-frame/Luna/raw upload: 0/0/0/0.

## Device status

Fresh `CENTER_UPPER_BODY` OPPO evidence is required. The first bounded revalidation only needs to prove that visible head, bilateral shoulders and bilateral hips produce `measurement_ready=true` and reach `ADJUST_SCALE`, `ALIGN_PRIMARY_ANCHOR` or later. Device result remains `MANUAL_REVIEW_REQUIRED` until that trace is supplied.
