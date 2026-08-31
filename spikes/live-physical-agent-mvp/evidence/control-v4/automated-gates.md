# V4 automated gates

Date: 2026-08-31 (Asia/Shanghai)

## Results

- Full automated suite: PASS — 250/250.
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

## Privacy and hot path

Scalar trace contains target/current values, constraints, causal timestamps and counters only. Camera frame storage, landmark export, raw video upload, backend per-frame calls, Provider and Luna are all zero.

Runtime note: bundled Node is v24.19.0 while the repository pins v24.18.0; compilation, tests and build pass. This is a tooling-version warning, not a runtime semantic relaxation.

