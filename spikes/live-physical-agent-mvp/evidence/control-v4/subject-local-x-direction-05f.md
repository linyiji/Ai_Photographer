# 05F Subject-local X Direction Evidence

## Accepted source

Source trace: `live-p2-v4-v4_center_upper_body-1788169794318.json`; SHA-256 `F9A1D27707662530C663AC34E01E224083F084B1F1FF2E50585A21580F2A2488`; 756 scalar rows; `raw_media=false`.

The measurement/five-layer gate passed with warning: 449 rows were measurement-ready and target-gap-ready, and all 449 released `ACQUIRE_REQUIRED_BODY`.

## Old transformation chain

```text
current sensor X > target sensor X
-> x_relation TOO_HIGH
-> desired sensor delta NEGATIVE
-> MOVE_LEFT_SMALL
-> “向你自己的左侧移动”
-> fixed left arrow chosen from action name
```

The chain equated negative sensor movement with subject-local left and allowed the UI action name to choose the arrow. It contained neither shooting relation nor an explicit subject-local transform.

## 05E failure reconstruction

| Episode | Sensor X before | Target | Desired sign | Old action | Sensor X after | Delta | Outcome |
|---:|---:|---:|---|---|---:|---:|---|
| 1 | 0.609590 | 0.5 | NEGATIVE | MOVE_LEFT_SMALL | 0.685075 | +0.075485 | WRONG_DIRECTION |
| 3 | 0.636036 | 0.5 | NEGATIVE | MOVE_LEFT_SMALL | 0.741176 | +0.105140 | WRONG_DIRECTION |
| 7 | 0.633165 | 0.5 | NEGATIVE | MOVE_LEFT_SMALL | 0.765336 | +0.132171 | WRONG_DIRECTION |
| 9 | 0.606508 | 0.5 | NEGATIVE | MOVE_LEFT_SMALL | 0.730013 | +0.123505 | WRONG_DIRECTION |
| 10 | 0.731306 | 0.5 | NEGATIVE | MOVE_LEFT_SMALL | 0.793657 | +0.062351 | NO_EFFECT |
| 12 | 0.751344 | 0.5 | NEGATIVE | MOVE_LEFT_SMALL | 0.859619 | +0.108275 | NO_EFFECT |

Historical evidence is preserved as failure. It is not relabeled as success.

## New three-space authority

```text
SENSOR_X: canonical non-mirrored perception coordinate
DISPLAY_X: sensor coordinate after preview-only mirror projection
SUBJECT_LOCAL_PHYSICAL_X: photographed person's own left/right
```

`SubjectPhysicalDirectionMapperV01` is the only sensor-to-physical mapper. For a subject facing the camera:

```text
SUBJECT_LEFT  -> SENSOR_X POSITIVE
SUBJECT_RIGHT -> SENSOR_X NEGATIVE
```

Preview mirror never changes this physical result. It only projects the desired sensor sign to a screen-arrow sign. Ambiguous actor, unknown shooting relation or unknown camera facing returns `UNSUPPORTED` and emits no X instruction.

For the accepted failure case under a front mirrored preview:

```text
desired sensor NEGATIVE
-> SUBJECT_RIGHT
-> mirrored display POSITIVE
-> MOVE_RIGHT_SMALL
-> right screen arrow
-> primary / overlay / voice: 向你自己的右侧移动一小步，然后自然停下
```

## Automated/browser evidence

- Full Live suite: 281/281 PASS.
- TypeScript: PASS.
- Production build: PASS / 50 modules.
- Front mirrored/non-mirrored, rear, Subject actor, Camera Operator actor and ambiguous actor matrices: PASS.
- Double mirror inversion: 0.
- 05E X failure reconstruction: PASS.
- Browser route `?controlPolicy=V4&v4XDirectionGate=05F`: PASS.
- Browser result: desired sensor `NEGATIVE`, physical action `SUBJECT_RIGHT`, display sign `+1`, action `MOVE_RIGHT_SMALL`, consistent own-right copy.
- Scale action mapping, five-layer model, response gate and VERIFY: unchanged.

## Bounded labeled calibration path

Before device PASS, capture two non-control scalar traces with the front camera and the subject facing it:

1. Select `V4 · 标定人物自己的左侧`, start calibration recording, remain still until the UI reports that the baseline was acquired, deliberately move one step to the subject's own left, stop until `COMPLETE`, then download the trace.
2. Select `V4 · 标定人物自己的右侧`, repeat toward the subject's own right and wait for `COMPLETE` before downloading the trace.

Required: stable opposite sensor-X signs. Expected geometry is left = positive and right = negative, but device evidence remains `SOURCE_REQUIRED` until recorded.

Then select `V4 · 05F 单次 Center X 复验` and run exactly one Center Upper Body X correction with Scale already in range. The dedicated mode automatically disarms after the first evaluated X Episode while retaining the scalar trace. The issued physical direction must produce a detected response and reduce absolute sensor target error. Full READY is not required. Multi-target testing remains stopped.

Privacy: provider 0, backend per-frame 0, Luna 0, raw upload 0.

## OPPO attempt and bounded instrumentation correction

Fresh OPPO K11 / front-camera traces received on 2026-08-31:

| Trace | SHA-256 | Disposition |
|---|---|---|
| `live-p2-v4-v4_x_calibrate_subject_left-1788174405728.json` | `FCB78E21FF71A64FEA18FC9BEE18BF7531CA1F3EBE88DF9BA3D7559961873F7B` | INVALID CALIBRATION: 260 rows, only 35 finite target-anchor samples; measurement was lost before a bounded baseline/settled endpoint existed |
| `live-p2-v4-v4_x_calibrate_subject_right-1788174436379.json` | `B793C89552B360FB1D2AE2BBD32FC922B31BB2A17DCCF8FF7B647FC75AA36756` | INVALID CALIBRATION: 155 rows, zero finite target-anchor samples |
| `live-p2-v4-v4_x_device_single_step-1788174470930.json` | `D45167EE48B79FC3690714D1BC73DDAE005B0E6AD9A177FD2DF6E713F51F3A27` | NOT AN X EPISODE: zero issued actions; passive READY was reached |
| `live-p2-v4-v4_x_device_single_step-1788174521931.json` | `E82B5D76EA0B49E07E654979DBF79D3F876ABC592C253D60E6504054E35263EE` | CENTER X DEVICE CORRECTION PASS: one `MOVE_LEFT_SMALL`; response detected; Sensor X about `0.353 -> 0.564`; absolute target error about `0.147 -> 0.064`; `IMPROVED`; wrong direction 0 |

The first calibration UI was a static recorder prompt, not a calibration state machine, so it could not tell the operator whether a baseline, movement or settled endpoint had actually been captured. The V4 trace also omitted `armed`, and the single-step mode returned to generic start copy after its intentional one-Episode auto-disarm. These instrumentation gaps caused the reported apparent stalls; they do not invalidate the successful single X Episode.

Implementation commit `8f9a6e4` adds `SubjectXCalibrationV01` with explicit `CAPTURE_BASELINE -> MOVE_LABELED_DIRECTION -> WAIT_FOR_SETTLE -> COMPLETE` phases. It requires target measurement readiness, fresh finite target anchor, a one-second stable baseline, at least `0.04` labeled Sensor-X displacement, and a 500 ms stable endpoint. The final trace records baseline, settled X, signed delta and sign. Trace rows now also include `armed`, `trial_id`, `ready_hold_elapsed_ms` and calibration state. Single-step ARM is immediately visible before the next observation, and auto-disarm presents a persistent completed-result message.

Fresh automation after this bounded correction: 284/284 PASS; TypeScript PASS; production build PASS / 51 modules; browser Smoke PASS for calibration `CAPTURE_BASELINE`, single-step `ARMED_WAITING_OBSERVATION`, and zero console warning/error.

At that instrumentation checkpoint, device status remained `MANUAL_REVIEW_REQUIRED` because both explicit calibration traces still needed repetition. The fresh evidence below supersedes that checkpoint for the left sign only. The Center X single-step correction portion is PASS. Target values, scale mapping, five-layer observation/gap, response gate and VERIFY logic are unchanged.

## Fresh OPPO evidence after phased calibration

Fresh scalar-only traces received on 2026-08-31:

| Trace | SHA-256 | Disposition |
|---|---|---|
| `live-p2-v4-v4_center_upper_body-1788176214273.json` | `20480D1A77FD8951FB1DDA6879E525D524F1461D7BB5FB2B19573FEFDED06E9C` | SUPPORTING RUNTIME EVIDENCE: 322 rows; 246 finite target X rows; 232 measurement-ready rows; 4/4 evaluated Episodes reached target; wrong direction 0; final `READY_LATCHED` |
| `live-p2-v4-v4_x_calibrate_subject_left-1788176269641.json` | `4236F0A32814FDF4974F929C36033223898C813FDD730B2EC0848D218536B847` | SUBJECT-OWN-LEFT CALIBRATION PASS: terminal `COMPLETE`; baseline Sensor X `0.569638`; settled Sensor X `0.648709`; signed delta `+0.079071`; sign `POSITIVE`; status `VALID` |
| `live-p2-v4-v4_x_calibrate_subject_right-1788176313539.json` | `769D40DC0D56F07D8C07424C62222521073D78C84B603515E629F8C71381C2DE` | INCOMPLETE: stopped in `MOVE_LABELED_DIRECTION`; baseline `0.213743`; no settled endpoint; sign `UNKNOWN`; target measurement not ready at export |
| `live-p2-v4-v4_x_device_single_step-1788176357584.json` | `C73D65AA911E3E1ECFB9D18F0BBE6337A3BBF7B39F80A98E76389D8D6ED4FDF7` | NOT AN X REVALIDATION: one `MOVE_CLOSER_SMALL` Scale Episode ended `NO_EFFECT`; it does not replace the previously accepted improved Center X Episode |

The left labeled calibration establishes `SUBJECT_LEFT -> SENSOR_X POSITIVE` on this device. The right sign remains `SOURCE_REQUIRED`; an opposite negative settled delta must be captured before the two-sign physical-direction Gate can pass. The incomplete right trace is not inferred or relabeled.

The new single-step file also shows that opening the general diagnostic surface can expose unrelated Scale preconditions before the intended X test. Commit `7dbe187` therefore performs a presentation-only reduction for the active 05F device gate: the default mobile view exposes only left calibration, right calibration and one Center X revalidation; legacy scenarios, full observation fields, controller internals, performance HUD and capability nodes remain in the DOM and reappear through `显示完整调试`. Scalar Trace capture remains complete. No target, scale, five-layer, response, VERIFY or direction semantics changed.

Fresh regression for the compact surface: 284/284 tests PASS; TypeScript PASS; production build PASS / 51 modules; mobile viewport browser Smoke PASS. Default compact selection is the remaining right calibration, all 22 scenario options remain in DOM, four legacy scenario groups are hidden by presentation only, full debug restores them, and browser console warning/error count is 0.

## X calibration readiness remediation

Task `XFX_LIVE_P2_V4_X_CALIBRATION_READINESS_AND_SUBJECT_LOCAL_DIRECTION_REMEDIATION_05F` accepts root cause `X_CALIBRATION_OVERCOUPLED_TO_FULL_PHOTOGRAPHY_TARGET_GATE` and implements the bounded correction in commit `a8fc8ef`.

The calibration Session no longer consumes `V4Snapshot` or reads `target_gap.ready`. It consumes target-independent `HumanObservationV02` through `XCalibrationRequirementV01`:

```text
Subject LOCKED
+ HEAD VALID
+ SHOULDERS BILATERAL_VALID
+ SHOULDER_CENTER finite/confidence >= 0.6
+ fresh
+ stable baseline
-> X_CALIBRATION_READY
```

Explicit non-requirements are serialized as `photography_target_gap_required=false`, `hips_required=false`, and `scale_required=false`. The observation anchor is `SHOULDER_CENTER.x` in normalized non-mirrored Sensor coordinates. Movement may make `stable=false`; after a valid stable baseline the Session still observes fresh structural shoulder motion, then requires a stable `STILL` endpoint before completion.

Trace calibration state records `calibration_action_id`, `subject_local_label`, `sensor_x_before`, `sensor_x_after`, `sensor_delta_x`, `sensor_delta_sign`, `response_observed`, `settled`, the complete readiness object and `calibration_anchor=SHOULDER_CENTER`. No raw media or landmarks are exported.

The normal `CENTER_UPPER_BODY` photography Target is unchanged: `HEAD_TO_HIP`, `TORSO_CENTER`, hips, target Scale, TargetObservationGap, response gate and VERIFY remain authoritative for the later product X correction. `HEAD_SHOULDERS` is documented separately as head plus bilateral shoulders with hips not required; no final head-and-shoulders Scale metric or new production Target is introduced.

Automated regression after remediation: 287/287 PASS. Required cases pass: head + bilateral shoulders with hips missing and `HEAD_TO_HIP=INVALID` is calibration-ready; an invalid shoulder center is not ready; normal `CENTER_UPPER_BODY` with hips missing remains `ACQUIRE_REQUIRED_BODY`; calibration Trace proves target-gap false while X-calibration-ready is true. TypeScript PASS; production build PASS / 52 modules. Mobile browser Smoke confirms explicit “向你自己的左边/右边” calibration wording, no calibration dependency copy mentioning hips, `TORSO_CENTER`, `HEAD_TO_HIP` or Scale, and zero console warning/error.

Device result remains `MANUAL_REVIEW_REQUIRED`. The historical labeled left trace remains evidence of a positive Sensor-X sign, and the earlier Center X correction remains error-reducing with wrong direction 0. The new shoulder-center runtime still requires a fresh LEFT trace and a fresh RIGHT trace that both detect response, settle and produce opposite signs, followed by one Center X product correction. No physical mapper inversion is made before that fresh opposite-sign gate.
