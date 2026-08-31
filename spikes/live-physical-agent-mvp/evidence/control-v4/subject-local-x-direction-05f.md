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

Device status remains `MANUAL_REVIEW_REQUIRED` only because the two explicit left/right calibration traces must be repeated with the new completion state and must finish with stable opposite Sensor-X signs. The Center X single-step correction portion is PASS. Target values, scale mapping, five-layer observation/gap, response gate and VERIFY logic are unchanged.
