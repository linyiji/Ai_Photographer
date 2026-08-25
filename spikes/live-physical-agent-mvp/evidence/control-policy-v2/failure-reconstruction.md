# LIVE-P2 Control Policy V2 Failure Reconstruction

Date: 2026-08-25

Status: PHASE A PASS

The accepted eight scalar-only traces were reconstructed in chronological filename order as Trials A–H. They contain exactly 59 terminal Episodes: 20 SUCCESS, 31 NO_EFFECT, and 8 WRONG_DIRECTION. The accepted starting result remains 33.9%; this document does not reinterpret it as a new result.

## Trace limitations and authority

The v1 trace records target/current/delta, action, axis, timestamps, outcome, velocity, visual state, and scalar visual metrics. It does not record `measurement_age_ms` at issuance, camera facing, or preview mirror state. Those fields are therefore `UNKNOWN_NOT_RECORDED_IN_V1`, never inferred. Coordinate authority remains `SENSOR_NORMALIZED_NON_MIRRORED`; camera mirror is presentation-only. The user's observed wrong physical directions remain accepted failure evidence even though they cannot be joined to a specific facing/mirror row in v1.

Trace hashes remain those recorded in `evidence/visual-servo/oppo-k11.md`; no trace or historical evidence was rewritten.

## Causal summary

- 8/8 WRONG accounted for: 5 `DELAYED_HUMAN_RESPONSE`, 2 `USER_MOVED_OPPOSITE`, 1 `UNCLASSIFIED` after an initial improvement followed by reversal.
- No Episode provides evidence for `SIGN_MAPPING_ERROR` or `PREVIEW_MIRROR_MAPPING_ERROR`; v1 lacks facing/mirror telemetry, so this is not a claim that the user-observed wrong cue was false.
- 6/6 post-READY ordinary events occur in Trials A and F. Both began inside target. PASSIVE_CONFIRMATION emitted runtime READY while TrialState remained ARMED; later target exit legally fell through to ordinary issuance in V1.
- 9 overshoot-like NO_EFFECT Episodes entered/crossed the commanded-axis deadband during the response window but did not finish as AXIS_TARGET_SUCCESS.
- 30 Episodes participate in consecutive X/Scale axis-switch pairs. Sixteen switch pairs exist; twelve occur within 600 ms of the preceding terminal result, showing replanning from nearly the same response tail rather than a fresh semantic epoch.
- Target entry/exit churn from the accepted sample remains 46/38.

## Episode-level causal table

Shared unavailable fields for every row: issued measurement age, camera facing, and preview mirror. `READY before/after` refers to a READY runtime row before issuance or between terminal evaluation and the next ordinary event.

| Trial | Ep | Action | Axis | Issued at | Δ issue | Outcome | Reason | Response | Entry/Exit | READY before/after | Next |
|---|---:|---|---|---:|---:|---|---|---|---|---|---|
| A | 1 | MOVE_FARTHER | SCALE | 53336.7 | -0.083 | SUCCESS | AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 1/1 | true/false | MOVE_RIGHT |
| A | 2 | MOVE_RIGHT | X_POSITION | 56089.6 | -0.063 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | true/false | MOVE_RIGHT |
| A | 3 | MOVE_RIGHT | X_POSITION | 57807.8 | -0.077 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/0 | true/true | — |
| B | 1 | MOVE_FARTHER | SCALE | 75724.4 | -0.110 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_FARTHER |
| B | 2 | MOVE_FARTHER | SCALE | 76992.4 | -0.137 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_FARTHER |
| B | 3 | MOVE_FARTHER | SCALE | 78710.5 | -0.133 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | TOWARD_TARGET | 3/3 | false/false | MOVE_FARTHER |
| B | 4 | MOVE_FARTHER | SCALE | 83781.8 | -0.105 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_FARTHER |
| B | 5 | MOVE_FARTHER | SCALE | 88969.9 | -0.130 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | AWAY_FROM_TARGET | 2/2 | false/false | MOVE_RIGHT |
| B | 6 | MOVE_RIGHT | X_POSITION | 91872.4 | -0.056 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| B | 7 | MOVE_RIGHT | X_POSITION | 93590.6 | -0.050 | SUCCESS | AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 2/2 | false/false | MOVE_RIGHT |
| B | 8 | MOVE_RIGHT | X_POSITION | 95292.3 | -0.057 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| B | 9 | MOVE_RIGHT | X_POSITION | 97027.1 | -0.064 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| B | 10 | MOVE_RIGHT | X_POSITION | 98595.0 | -0.065 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| B | 11 | MOVE_RIGHT | X_POSITION | 100213.2 | -0.061 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | NO_MEANINGFUL_RESPONSE | 2/1 | false/true | — |
| C | 1 | MOVE_FARTHER | SCALE | 113458.5 | -0.086 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/1 | false/false | MOVE_RIGHT |
| C | 2 | MOVE_RIGHT | X_POSITION | 115777.1 | -0.060 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | NO_MEANINGFUL_RESPONSE | 1/1 | false/false | MOVE_LEFT |
| C | 3 | MOVE_LEFT | X_POSITION | 117979.0 | 0.222 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_LEFT |
| C | 4 | MOVE_LEFT | X_POSITION | 121181.8 | 0.259 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 0/0 | false/false | MOVE_FARTHER |
| C | 5 | MOVE_FARTHER | SCALE | 123917.6 | -0.119 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_FARTHER |
| C | 6 | MOVE_FARTHER | SCALE | 125669.2 | -0.135 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_FARTHER |
| C | 7 | MOVE_FARTHER | SCALE | 127404.2 | -0.145 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/0 | false/true | — |
| D | 1 | MOVE_CLOSER | SCALE | 146422.7 | 0.073 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 2/2 | false/false | MOVE_CLOSER |
| D | 2 | MOVE_CLOSER | SCALE | 150259.8 | 0.072 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/1 | false/false | MOVE_RIGHT |
| D | 3 | MOVE_RIGHT | X_POSITION | 153863.4 | -0.083 | SUCCESS | AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_FARTHER |
| D | 4 | MOVE_FARTHER | SCALE | 155648.7 | -0.179 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_FARTHER |
| D | 5 | MOVE_FARTHER | SCALE | 157317.0 | -0.178 | SUCCESS | AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 1/0 | false/true | — |
| E | 1 | MOVE_RIGHT | X_POSITION | 184710.6 | -0.071 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/1 | false/false | MOVE_FARTHER |
| E | 2 | MOVE_FARTHER | SCALE | 188164.2 | -0.154 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_FARTHER |
| E | 3 | MOVE_FARTHER | SCALE | 189799.3 | -0.150 | SUCCESS | AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 2/2 | false/false | MOVE_RIGHT |
| E | 4 | MOVE_RIGHT | X_POSITION | 195155.0 | -0.053 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/0 | false/true | — |
| F | 1 | MOVE_LEFT | X_POSITION | 208051.4 | 0.267 | SUCCESS | AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | true/false | MOVE_FARTHER |
| F | 2 | MOVE_FARTHER | SCALE | 214941.5 | -0.166 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | true/false | MOVE_FARTHER |
| F | 3 | MOVE_FARTHER | SCALE | 216593.0 | -0.120 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 3/2 | true/true | — |
| G | 1 | MOVE_FARTHER | SCALE | 226186.3 | -0.150 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_FARTHER |
| G | 2 | MOVE_FARTHER | SCALE | 227821.1 | -0.136 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | TOWARD_TARGET | 1/1 | false/false | MOVE_RIGHT |
| G | 3 | MOVE_RIGHT | X_POSITION | 233727.0 | -0.151 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | TOWARD_TARGET | 0/0 | false/false | MOVE_RIGHT |
| G | 4 | MOVE_RIGHT | X_POSITION | 236346.2 | -0.086 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | TOWARD_TARGET | 1/0 | false/true | — |
| H | 1 | MOVE_CLOSER | SCALE | 250477.8 | 0.196 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | TOWARD_THEN_AWAY | 0/0 | false/false | MOVE_CLOSER |
| H | 2 | MOVE_CLOSER | SCALE | 255516.6 | 0.140 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 3 | MOVE_RIGHT | X_POSITION | 257652.3 | -0.077 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | TOWARD_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 4 | MOVE_RIGHT | X_POSITION | 258853.5 | -0.064 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/1 | false/false | MOVE_CLOSER |
| H | 5 | MOVE_CLOSER | SCALE | 260505.2 | 0.078 | SUCCESS | AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| H | 6 | MOVE_RIGHT | X_POSITION | 262157.0 | -0.061 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 7 | MOVE_RIGHT | X_POSITION | 263808.6 | -0.060 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 8 | MOVE_RIGHT | X_POSITION | 265493.8 | -0.092 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | TOWARD_TARGET | 2/2 | false/false | MOVE_RIGHT |
| H | 9 | MOVE_RIGHT | X_POSITION | 268313.3 | -0.083 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| H | 10 | MOVE_RIGHT | X_POSITION | 271266.4 | -0.068 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 11 | MOVE_RIGHT | X_POSITION | 272918.1 | -0.087 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| H | 12 | MOVE_RIGHT | X_POSITION | 274569.7 | -0.072 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_RIGHT |
| H | 13 | MOVE_RIGHT | X_POSITION | 276254.7 | -0.077 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | TOWARD_TARGET | 8/8 | false/false | MOVE_FARTHER |
| H | 14 | MOVE_FARTHER | SCALE | 304333.7 | -0.122 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_FARTHER |
| H | 15 | MOVE_FARTHER | SCALE | 305568.3 | -0.147 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | TOWARD_TARGET | 0/0 | false/false | MOVE_FARTHER |
| H | 16 | MOVE_FARTHER | SCALE | 306852.8 | -0.114 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 0/0 | false/false | MOVE_FARTHER |
| H | 17 | MOVE_FARTHER | SCALE | 308504.5 | -0.104 | NO_EFFECT | OVERSHOOT_LIKE_RESPONSE_WINDOW | NO_MEANINGFUL_RESPONSE | 1/1 | false/false | MOVE_RIGHT |
| H | 18 | MOVE_RIGHT | X_POSITION | 315261.4 | -0.058 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 19 | MOVE_RIGHT | X_POSITION | 316879.5 | -0.078 | WRONG_DIRECTION | COMMANDED_AXIS_ERROR_INCREASED | AWAY_FROM_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 20 | MOVE_RIGHT | X_POSITION | 318548.0 | -0.100 | NO_EFFECT | NO_AXIS_TARGET_SUCCESS | TOWARD_TARGET | 0/0 | false/false | MOVE_RIGHT |
| H | 21 | MOVE_RIGHT | X_POSITION | 320199.7 | -0.070 | SUCCESS | AXIS_TARGET_SUCCESS | TOWARD_TARGET | 1/1 | false/false | MOVE_CLOSER |
| H | 22 | MOVE_CLOSER | SCALE | 321417.6 | 0.074 | SUCCESS | AXIS_TARGET_SUCCESS | NO_MEANINGFUL_RESPONSE | 1/0 | false/true | — |

## WRONG classification rationale

`DELAYED_HUMAN_RESPONSE` is used only when the first scalar response large enough to exceed the unchanged meaningful-movement threshold begins more than 900 ms after issuance. `USER_MOVED_OPPOSITE` is used only for prompt, clearly measurable commanded-axis motion away from target. H/1 initially improved and then reversed before terminal evaluation; v1 lacks enough causal context to distinguish delayed continuation, stale cue, or user reversal, so it remains `UNCLASSIFIED`.

No classification hides any WRONG outcome or changes the AXIS_TARGET_SUCCESS denominator.

## Post-READY reconstruction

Trials A and F each emitted PASSIVE_CONFIRMATION READY before any ordinary Episode. Because V1 only set `trialState=READY` when the prior state was RUNNING, their TrialState remained ARMED. Target exit then emitted three ordinary actions per trial. The six events are preserved verbatim in `post-ready-audit.json`. This path is reproducible without UI involvement and is a controller state-machine defect.

## Oscillation participants

Consecutive cross-axis pairs occurred in A 1→2; B 5→6; C 1→2 and 4→5; D 2→3 and 3→4; E 1→2 and 3→4; F 1→2; G 2→3; H 2→3, 4→5, 5→6, 13→14, 17→18, and 21→22. The participating Episode keys total 30 after de-duplication. This does not assert that every switch was perceptually wrong; it defines the complete set requiring ControlEpoch/fresh-replan counterfactual evaluation.

## Gate

- 59/59 Episodes reconstructed: PASS.
- 8/8 WRONG classified or explicitly UNCLASSIFIED: PASS.
- 6/6 post-READY ordinary events reconstructed: PASS.
- 9/9 overshoot-like NO_EFFECT response windows reconstructed: PASS.
- READY lifecycle defect reproducible from controller semantics: PASS.
- Direction authority contradiction: NONE. Missing v1 device metadata is preserved as unknown and will be added to V2 traces.
