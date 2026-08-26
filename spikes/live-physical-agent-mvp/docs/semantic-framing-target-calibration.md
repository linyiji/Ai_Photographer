# Semantic Framing Target Calibration

Status: spike-local deterministic calibration; not global M01 Authority.

The existing presets supply the local framing intent:

| Preset | Intent | Compatible BodyModes | Incompatible coarse behavior |
| --- | --- | --- | --- |
| `center-medium` | centered natural medium framing | `UPPER_BODY`, `THREE_QUARTER`, `FULL_BODY` | head-only/head-shoulders → farther |
| `left-composition` | left composition, natural medium framing | `UPPER_BODY`, `THREE_QUARTER`, `FULL_BODY` | head-only/head-shoulders → farther |
| `center-close` | centered close framing | `HEAD_SHOULDERS`, `UPPER_BODY` | three-quarter/full-body → closer |

Each metric produces a `SEMANTIC_VISIBLE_OCCUPANCY_EQUIVALENT`: robust anatomical spans are expressed in the same sensor-normalized visible-occupancy unit as the existing target `height_ratio`. Therefore the preset target values (`0.35`/`0.50`) and tolerance `0.07` remain unchanged.

Mode-specific coefficients are deterministic spike calibration, fixture-tested, and must be validated on OPPO K11 before acceptance. Incompatible modes are never precision-scored. Their coarse instruction count is recorded separately and never silently inserted into or removed from the `AXIS_TARGET_SUCCESS` denominator.
