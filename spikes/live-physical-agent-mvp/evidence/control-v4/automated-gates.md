# V4 automated gates

Date: 2026-08-31 (Asia/Shanghai)

## Results

- Full automated suite: PASS — 257/257.
- Phase A: PASS — subject lock acquire/lock/hold/lost/reacquire, body-region visibility, semantic anchors, bottom crop and non-mirrored coordinate basis.
- Phase B: PASS — center/left-third/right-third are target-relative; current x=0.33 is in range for target x=0.33.
- Phase C: PASS — the same observation yields different scale relations for different target scale contracts; no universal BodyMode/distance rule.
- Phase D: PASS — 899 ms, 901 ms, long no-response, late response, improvement, no effect, wrong direction, passive drift and invalidation.
- `NO_RESPONSE_OUTCOME=0`.
- `NO_RESPONSE_REISSUE=0`.
- `movement_started_at=null + TARGET_REACHED`: structurally prevented and regression-tested.
- V2 regression: PASS.
- V3 historical regression: PASS.
- TypeScript: PASS.
- Production build: PASS — Vite transformed 44 modules.
- Browser matrix: PASS — 6/6 deterministic V4 routes reached READY.
- V4 overlay smoke: PASS — semantic debug is disabled; MODE/BodyMode card, raw pose box, semantic anchor, conventional Target box and acceptable-zone box are not visible.
- Browser console: PASS — no runtime errors in the six-route replay.
- Measurement readiness remediation 05A: PASS — head centroid, derived torso, bilateral hip READY, unilateral hip MARGINAL, bottom crop NOT_READY, and coverage/measurement separation.

## Privacy and hot path

Scalar trace contains one row per fresh perception state with subject-lock state, named visible-body parts, crop warning, semantic current/target scalars, constraints, causal timestamps and counters. Camera frame storage, landmark export, raw video upload, backend per-frame calls, Provider and Luna are all zero.

Runtime note: bundled Node is v24.19.0 while the repository pins v24.18.0; compilation, tests and build pass. This is a tooling-version warning, not a runtime semantic relaxation.
