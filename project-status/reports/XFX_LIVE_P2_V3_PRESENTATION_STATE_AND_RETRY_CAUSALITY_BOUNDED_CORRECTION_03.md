# XFX_LIVE_P2_V3_PRESENTATION_STATE_AND_RETRY_CAUSALITY_BOUNDED_CORRECTION_03

Status: `MANUAL_REVIEW_REQUIRED / IMPLEMENTATION_AND_BROWSER_PASS`

Date: `2026-08-29`

Parent: `XFX_LIVE_P2_V3_EXPERIMENTAL_RUNTIME_AND_PROSPECTIVE_STEP_EVIDENCE_02`

Admission: branch `spike/live-physical-agent-mvp-v0.1`; actual linear published start `9d0e648e589be42bbcd4131f278c05152b778f7c`; local/remote ahead-behind `0/0`; only the preserved D1-D7 audit report was untracked. No reset, rebase, force push, develop merge, Main integration, or new branch occurred.

## Result

The bounded presentation defect and retry-causality defect are corrected without redesigning V3 measurement or control architecture.

- Added pure one-way `LivePresentationStateV01` with 11 explicit presentation states.
- Primary instruction and visual overlay now consume the same presentation projection.
- Added explicit active action, retry candidate, last historical action, retry pending, READY hold, active Episode, and current evaluation-event semantics.
- Removed direct normal-user rendering of Episode Outcome enums.
- Historical Episode action and Outcome remain available only for HUD, Trace, evidence, and metrics.
- Retry barrier now blocks only reuse of the settled state. A strictly newer, fresh, stable, non-invalid state may create the next ControlEpoch.
- NO_EFFECT no longer waits for spontaneous motion.
- WRONG_DIRECTION recomputes the current relation and does not derive direction from the previous action.
- Framing-first order, Target, Deadband, READY 600 ms, settle semantics, thresholds, and one-small-step principle are unchanged.

## Verification

- Complete automated Live suite: `237/237 PASS`.
- TypeScript: `PASS`.
- Production Build: `PASS / 36 modules`.
- V3 deterministic browser set: `11/11 PASS`.
- Required real browser routes: `8/8 PASS`, zero console errors.
- BOTH_BAD: FRAMING then ALIGN_X then READY.
- NO_EFFECT/WRONG_DIRECTION: no internal enum in primary or overlay copy.
- INVALIDATED_RECOVERY: no stale INVALIDATED copy or stale prior action.
- POST_READY: READY retained; ordinary output remains zero.
- V2 default browser replay: `READY · TRUE`, zero console errors.
- Provider / Backend per-frame / Luna / Raw upload: `0 / 0 / 0 / 0`.

## Measurement semantic audit

`FRAMING_RELATION_SEMANTIC_RISK = WARNING`.

The compatibility direction mapping is internally consistent and no sign inversion was found. A warning remains because categorical BodyMode compatibility is not an independent cross-check of DistanceProxy sign, crop, and orientation. This task did not alter semantic measurement.

## Gate disposition

Implementation, automated regression, build, and browser gates pass. The fresh OPPO FRAMING_ONLY, X_ONLY, COMBINED, and ALREADY_SATISFIED device evidence required by the parent task has not yet been collected after this correction. Therefore V3 experimental device gate remains `MANUAL_REVIEW_REQUIRED`; V3 is not promoted.

No next task, old V2 Gate 2, Luna, Provider, Backend, or Main integration was started.

