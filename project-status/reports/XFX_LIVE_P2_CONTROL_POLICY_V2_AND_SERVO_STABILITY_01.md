# XFX_LIVE_P2_CONTROL_POLICY_V2_AND_SERVO_STABILITY_01

Status: READY_FOR_MANUAL_DEVICE_TEST

Start Head: `44e7914e3df7f778c1f0d4d6c127ddbb8048bef4`

## Starting evidence reconstruction

- Historical baseline: `33.9%`, 59 terminal Episodes, 20/31/8 SUCCESS/NO_EFFECT/WRONG_DIRECTION. It is not a V2 result.
- Failure Reconstruction: PASS
- Wrong Direction Audit: 8/8 accounted; 5 delayed response, 2 user opposite movement, 1 unclassified. V1 lacks camera/mirror/measurement-age telemetry, so no false-positive dismissal is made.
- Post-READY Audit: 6/6 reconstructed. Passive confirmation emitted READY without closing ARMED trial state.
- Overshoot-like: 9; X/Scale switch pairs: 16 involving 30 Episodes.

## Implementation

- READY Terminal Lifecycle: PASS; `EPISODE_SUCCESS` and `PASSIVE_CONFIRMATION` share `READY_LATCHED`; automated post-READY ordinary actions = 0.
- ControlEpoch: PASS; immutable target/measurement/camera/mirror/sign/state-version snapshot per ordinary instruction.
- Canonical Direction Transform: PASS; controller remains sensor non-mirrored; mirror changes display arrow only.
- Stale Guidance Suppression: PASS; measurement `<=180 ms`, decision `<=160 ms`, and reacquisition barrier.
- Axis Commitment: PASS; replan requires terminal plus a newer state version.
- ControlObservation / DisplayObservation: PASS; independent telemetry and semantics.
- Display: elapsed-time smoothing with bounded prediction; synthetic nominal max <=350 ms. Device p50/p95/max pending.
- Target Visual: one guide frame plus one stabilized subject corner box; text preserved; grid OFF.
- DEFAULT: PASS; LINE_DOG: IMPLEMENTED_CANDIDATE; semantic diff 0.
- Target/deadband/success semantics: unchanged.

## Verification

- Automated Tests: 159/159 PASS, including stale camera-request and ended-track ownership regressions.
- Typecheck: PASS
- Production Build: PASS / 22 modules. The bundled environment lacks `npm.cmd`, so the package's equivalent prebuild/typecheck/Vite steps were executed directly.
- Browser Replay: PASS; READY_LATCHED, ordinary/STOP/HOLD/success 1/1/1/1, synthetic display p50/p95/max 0/3/3 ms, console warning/error 0/0.
- Counterfactual: 6/6 post-READY actions structurally blocked; 0/8 historical WRONG claimed as proven prevented due V1 telemetry limits; presentation hysteresis reduces 20 transition flickers in offline replay without changing control satisfaction.
- Provider / Backend / Luna / Raw Upload: 0/0/0/0

## Remaining gates

OPPO Gate 1: MANUAL_REVIEW_REQUIRED / 3 fresh trials

Gate 1 attempt 1 found a bounded front-switch defect before acceptance sampling: the stopped rear track's asynchronous `ended` event could close the newly active front stream. A request-sequence and stream-ownership fix is implemented and automated PASS; OPPO revalidation remains required.

OPPO Gate 2: NOT_STARTED; only after Gate 1 PASS. Requires >=10 fresh trials and >=30 naturally produced terminal Episodes.

Correction Success remains `>=80%`. No fresh V2 phone result exists yet; LIVE-P2 is therefore not re-evaluated and no PASS is claimed.

LIVE-P1: PASS

P2 Implementation: PASS

P2 Real Device Gate: MANUAL_REVIEW_REQUIRED

LIVE-P2 Final Gate: NOT_YET_REEVALUATED

CH-003: IDENTIFIED / UNCHANGED

Main / Develop / Fine Tune / AI Visual: UNTOUCHED

Next: complete OPPO K11 Gate 1 in this same task. Do not start Luna or another task.
