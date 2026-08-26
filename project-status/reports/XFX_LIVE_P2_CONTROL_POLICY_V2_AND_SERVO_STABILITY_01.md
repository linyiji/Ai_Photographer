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
- Automated semantic baseline fixtures: 31/31 PASS. Current complete suite after Scale amendment: 208/208 PASS. Typecheck PASS. Build PASS / 29 modules.
- Provider / Backend per-frame / Luna / Raw Upload: 0 / 0 / 0 / 0.

Semantic Measurement Device Gate: READY_FOR_MANUAL_DEVICE_TEST. Parent OPPO Gate 1 is paused and must not resume until the dedicated OPPO semantic gate passes.

Fresh OPPO startup evidence reported model loading incomplete after more than 60 seconds. Audit found that the 45-second Worker timeout initiated a second main-thread fallback initialization, amplifying a slow Quick Tunnel cold download. A bounded same-task correction now performs one observable 120-second Worker attempt, does not redownload after timeout, and serves pinned model/WASM assets with browser caching. Automated suite `194/194`, typecheck, and production build / 28 modules pass; cold-start and cached-reload device confirmation are still required before the Semantic Measurement Device Gate can pass.

Post-fix scalar evidence set 1 contains 676 rows over three exports from one continuous session, with `raw_media=false`. First perception occurred at page timestamp about 18.3 seconds, so cold-start revalidation passes and the prior >60-second failure did not reproduce. The exports do not include a page reload, so cached-reload remains pending. The opening 50.73-second segment had 315/342 `HEAD_SHOULDERS` rows and zero BodyMode flicker; however precision Scale was valid in only 31/676 rows, labeled scenarios B–H and cadence telemetry are missing, and no READY occurred. This set is not Parent Gate 1 evidence; the Semantic Measurement Device Gate remains `MANUAL_REVIEW_REQUIRED`.

The user subsequently confirmed that the updated page reached usable Camera/Model startup within a few seconds after refresh. Cached reload therefore passes qualitatively (exact duration not supplied), and the startup sub-gate is PASS. This does not close the Semantic Measurement Device Gate or resume Parent OPPO Gate 1.

## SEMANTIC_SCALE_AND_FRAMING_DISTANCE_AMENDMENT

Start head: `fd337ca8cf3afadb6b006064a7f833d14d7aa1f6`.

- Scale validity audit: PASS; every one of 676 old rows classified. Primary reasons are 606 `UNCERTAINTY_TOO_HIGH`, 28 `REACQUISITION_BARRIER`, 10 `METRIC_FAMILY_UNAVAILABLE`, one `BODY_MODE_INCOMPATIBLE`, and 31 `VALID`.
- Root cause: 461/462 `HEAD_SHOULDERS` rows already had a metric but were rejected by the old opaque combination of absolute, differently normalized component disagreement plus temporal variance. Missing hips were not the cause.
- DistanceProxy: continuous shoulder-led near/far signal with torso/head corroboration; `HEAD_SHOULDERS` does not require hips. Wrist/elbow/knee/ankle outliers do not control it.
- Orientation: frontal/oblique/sideways-or-uncertain scalar estimate; strongly sideways evidence gates shoulder-only direction rather than using brittle compensation.
- Precision Scale V2: `HEAD_SHOULDERS_SCALE`, `UPPER_BODY_SCALE`, `THREE_QUARTER_SCALE`, `FULL_BODY_SCALE`; separate confidence/disagreement/orientation/crop/temporal uncertainty telemetry.
- Compatibility/calibration: exact per-target BodyMode mapping and deterministic spike-local metric targets. Existing Scale tolerance remains 0.07; Parent target/deadband/success semantics are not widened.
- Coarse framing: one separate `CoarseFramingEpisode` observes DistanceProxy and BodyMode progression, suppresses repeats while improving, and records SUCCESS/NO_EFFECT/WRONG_DIRECTION/MEASUREMENT_UNCERTAIN without entering the Parent denominator.
- Handoff: target compatibility terminates coarse control; a newer stable valid state is required before precision ControlEpoch. Old and new metric numeric values are never compared across the switch.
- Filter A/B: selected Distance One Euro (`0.35/4/1`) reduced controlled static jitter from 0.000786 to 0.000505 and small-step p90 from 750 to 500 ms without increasing 2% settle time (1250 ms).
- Counterfactual replay: PASS_WITH_WARNING. All 462 `HEAD_SHOULDERS` rows imply bilateral shoulder evidence and are proxy candidates; eight repeated cues in the first sequence occurred while the old scalar trend was already improving. Exact V2 values cannot be reconstructed from old traces.
- Automated tests before device Attempt 1: 210/210 PASS. TypeScript PASS. Production build PASS / 29 modules.
- Device evidence export: direct labeled S1–S6 JSON download includes device/orientation/camera/mirror/target/theme context and the final Preview/Vision/State/inference/frame/memory/privacy telemetry snapshot; no manual HUD transcription is required for those scalar fields.
- Provider / Backend per-frame / Luna / Raw Upload: 0 / 0 / 0 / 0.

Semantic Scale Device Gate: READY_FOR_MANUAL_DEVICE_TEST. Semantic Measurement Device Gate remains `MANUAL_REVIEW_REQUIRED`, and Parent OPPO Gate 1 remains paused until the Scale Device Gate passes.

A device revalidation then exposed a cached-mobile `HEAD` response with `Content-Length: 0`; the strict preflight falsely labeled the intact 5,777,746-byte model invalid. The bounded fix treats zero/missing HEAD length as unknown, still rejects explicit nonzero mismatches, and relies on the real model GET/MediaPipe initialization for final validation. Device revalidation remains required.

Fresh OPPO Scale Attempt 1 then completed labeled S1–S6 downloads with no raw media. Preview was 26.3–30.0 fps and no visible freeze, black screen, or crash occurred, but Vision Actual was only 4.157–4.380 Hz, inference p95 was 265.7–304.1 ms, and the user reported obvious device heating. Functionally, the exported scalar was capped near 1.0 in closer scenarios, farther/closer sign evidence was therefore invalid, coarse terminal episodes reopened into repeated cues, S4 had only one stable UPPER_BODY precision row, and S6 never transitioned BodyMode. Attempt 1 is retained as pre-fix FAIL evidence and cannot close the gate.

A bounded correction removes the value cap while keeping uncertainty bounded, prevents automatic same-action coarse reissue after a terminal outcome, adds the compatibility-transition fresh-state barrier even after a terminal coarse episode, and exports explicit zero provider calls. Complete automated verification is now `211/211 PASS`; TypeScript and production build / 29 modules pass. Fresh S1–S6 evidence on a cooled device is required. The Semantic Scale Device Gate remains `MANUAL_REVIEW_REQUIRED`, and Parent OPPO Gate 1 remains paused.

Post-fix OPPO Scale Attempt 2 supplies fresh labeled S1–S6 traces. S1 DistanceProxy validity is 54/59 stable-present rows (91.5%); S2 farther and S3 closer deliberate segments have correct signs without saturation; S4 stable UPPER_BODY precision Scale is valid 16/16 (100%) and shows both requested signs; S5 emits zero false near/far action in its stable UPPER_BODY arm window with 6.7% P10–P90 proxy spread; S6 performs real metric-family transitions with no instruction on a switch row and no persistent flicker. Every scenario has only one coarse instruction, and all privacy/external counters are zero. Scenario-local cadence is 6.95–7.21 Hz, Preview is 28.4–30.0 fps, and warmed cumulative inference p95 is 86.9–108.0 ms; S1 startup p95 127.6 ms and the cumulative session-Hz denominator remain warnings. Objective result is a PASS_WITH_WARNING candidate, but the Device Gate remains `MANUAL_REVIEW_REQUIRED` until the user confirms thermal state and absence/presence of visible freeze, black screen, or crash for this exact Attempt 2 session. Parent OPPO Gate 1 remains paused.

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

Next: complete the OPPO K11 Semantic Scale Device Gate in this same task. Resume Parent OPPO Gate 1 only after that sub-gate passes. Do not start Luna or another task.
