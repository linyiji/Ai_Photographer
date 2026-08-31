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

1. Select `V4 · 标定人物自己的左侧`, start calibration recording, remain still for 2 seconds, deliberately move one step to the subject's own left, stop, then download the trace.
2. Select `V4 · 标定人物自己的右侧`, repeat toward the subject's own right and download the trace.

Required: stable opposite sensor-X signs. Expected geometry is left = positive and right = negative, but device evidence remains `SOURCE_REQUIRED` until recorded.

Then run exactly one Center Upper Body X correction with Scale already in range. The issued physical direction must produce a detected response and reduce absolute sensor target error. Full READY is not required. Multi-target testing remains stopped.

Privacy: provider 0, backend per-frame 0, Luna 0, raw upload 0.
