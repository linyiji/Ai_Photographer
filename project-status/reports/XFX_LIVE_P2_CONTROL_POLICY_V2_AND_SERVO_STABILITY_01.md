# XFX_LIVE_P2_CONTROL_POLICY_V2_AND_SERVO_STABILITY_01

Status: READY_FOR_MANUAL_DEVICE_TEST

Start Head: `44e7914e3df7f778c1f0d4d6c127ddbb8048bef4`

## SEMANTIC_FRAMING_MEASUREMENT_AMENDMENT

Amendment start head: `62207ffaf00c542002a6bdd3bbe4911469b853ef`

- Admission: PASS; same Parent Task, worktree, branch, and linear published history.
- Body visibility classifier: IMPLEMENTED for HEAD_ONLY, HEAD_SHOULDERS, UPPER_BODY, THREE_QUARTER, FULL_BODY, and PARTIAL_OR_AMBIGUOUS.
- BodyMode hysteresis: 400 ms; controlled static 5 s flicker 0; single-frame knee/ankle changes do not promote/demote.
- Semantic X: confidence-aware shoulder/hip torso fusion; raw Pose min/max is not used for live precision X.
- Semantic scale: four mode-specific robust metric families; raw Pose height is not the only precision scale.
- Measurement uncertainty: precision X/scale suppression implemented and counted separately; target tolerance unchanged.
- Two-stage control: incompatible BodyMode emits separately counted coarse framing guidance; compatible stable mode enters existing precision servo.
- ControlEpoch: snapshots BodyMode, scale metric family, and scale baseline. Metric-family loss cannot silently remove an Episode from the denominator.
- Target calibration: spike-local `SEMANTIC_VISIBLE_OCCUPANCY_EQUIVALENT`; existing target values/tolerances and `AXIS_TARGET_SUCCESS` unchanged.
- Filter A/B: EMA jitter/step90 `0.001496803 / 750 ms`; One Euro `0.000941642 / 625 ms`; One Euro selected as device candidate.
- Cadence: 8/10/12 Hz bounded scheduler candidates automated PASS; default remains 8 Hz until fresh OPPO A/B.
- Coordinate audit: automated PASS; visible cover crop is separated from sensor control and mirrored display coordinates.
- Debug: optional BodyMode/metric/uncertainty/torso-anchor overlay; raw box explicitly labeled `DEBUG POSE EXTENT`.
- Automated semantic fixtures: 31/31 PASS. Complete suite: 193/193 PASS. Typecheck PASS. Build PASS / 27 modules.
- Provider / Backend per-frame / Luna / Raw Upload: 0 / 0 / 0 / 0.

Semantic Measurement Device Gate: READY_FOR_MANUAL_DEVICE_TEST. Parent OPPO Gate 1 is paused and must not resume until the dedicated OPPO semantic gate passes.

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
- Display: elapsed-time smoothing with bounded prediction; meaningful-motion latency avoids near-rest distance/speed instability. Post-fix device p50/p95/max pending.
- Target Visual: one guide frame plus one stabilized subject corner box; text preserved; grid OFF.
- DEFAULT: PASS; LINE_DOG: IMPLEMENTED_CANDIDATE; semantic diff 0.
- Target/deadband/success semantics: unchanged.

## Verification

- Automated Tests: 162/162 PASS, including stale camera-request, ended-track ownership, DISARMED zero-output, and near-rest display-latency regressions.
- Typecheck: PASS
- Production Build: PASS / 22 modules. The bundled environment lacks `npm.cmd`, so the package's equivalent prebuild/typecheck/Vite steps were executed directly.
- Browser Replay: PASS; READY_LATCHED, ordinary/STOP/HOLD/success 1/1/1/1, synthetic display p50/p95/max 0/3/3 ms, console warning/error 0/0.
- Counterfactual: 6/6 post-READY actions structurally blocked; 0/8 historical WRONG claimed as proven prevented due V1 telemetry limits; presentation hysteresis reduces 20 transition flickers in offline replay without changing control satisfaction.
- Provider / Backend / Luna / Raw Upload: 0/0/0/0

## Remaining gates

OPPO Gate 1: MANUAL_REVIEW_REQUIRED / 3 fresh trials

Gate 1 attempt 1 found a bounded front-switch defect before acceptance sampling: the stopped rear track's asynchronous `ended` event could close the newly active front stream. A request-sequence and stream-ownership fix is implemented and automated PASS; OPPO revalidation remains required.

Gate 1 attempt 2 found stale primary copy after Camera readiness and an incomplete DISARMED engine gate. Camera/model/trial states now render separately, and DISARMED cannot emit ordinary guidance or passive READY. OPPO revalidation remains required.

Gate 1 attempt 3 supplied five valid V2 traces with 5 READY trials and 45 terminal Episodes. SUCCESS/NO_EFFECT/WRONG_DIRECTION was 16/23/6, or 35.6%; ordinary actions were 9.0 per trial. Post-READY ordinary actions, direction-sign mismatches, and active-Episode axis switches were all zero. Fresh control age p50/p95/max was 91.6/121.8/235.3 ms; display latency was 91.6/248.1/893.4 ms. Required subjective assertions were not supplied. This pre-fix sample is not Gate 1 PASS and is not eligible for Gate 2.

The bounded response preserves target/deadband/success semantics: action copy now requests continuous movement until STOP, remains readable for 1100 ms, and display latency is calculated only for meaningful motion. V2 rows now include trial state and READY source. Automated verification passes; fresh OPPO revalidation is required.

OPPO Gate 2: NOT_STARTED; only after Gate 1 PASS. Requires >=10 fresh trials and >=30 naturally produced terminal Episodes.

Correction Success remains `>=80%`. Attempt 3 is fresh V2 diagnostic evidence but is pre-fix and non-passing; LIVE-P2 is therefore not re-evaluated and no PASS is claimed.

LIVE-P1: PASS

P2 Implementation: PASS

P2 Real Device Gate: MANUAL_REVIEW_REQUIRED

LIVE-P2 Final Gate: NOT_YET_REEVALUATED

CH-003: IDENTIFIED / UNCHANGED

Main / Develop / Fine Tune / AI Visual: UNTOUCHED

Next: complete OPPO K11 Gate 1 in this same task. Do not start Luna or another task.
