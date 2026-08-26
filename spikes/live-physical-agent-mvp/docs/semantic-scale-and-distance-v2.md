# Semantic Scale and Framing Distance V2

This spike separates two questions that the previous implementation forced into one number:

1. `DistanceProxyMeasurement`: is the same person moving nearer or farther?
2. Precision Scale: is the current target-specific framing size satisfied?

Neither uses wrists, elbows, a single knee, or a single ankle as distance authority. Raw Pose min/max height remains debug-only.

## Distance proxy

The source ladder is:

1. `TORSO_COMPOSITE`: shoulder width plus shoulder-center–hip-center length.
2. `HEAD_SHOULDER_COMPOSITE`: shoulder width plus head-to-shoulder extent when hips are unavailable.
3. `SHOULDER_WIDTH`: reliable bilateral shoulders alone.

`HEAD_SHOULDERS` therefore has a continuous proxy without hips. The proxy is One Euro filtered with `minCutoff=0.35`, `beta=4`, `dCutoff=1`; the higher response beta is local to distance and does not alter the admitted X/precision Scale filter.

For the controlled small-step sequence, EMA jitter/step90/settle-2% was `0.000786 / 750 / 1250 ms`; selected Distance One Euro was `0.000505 / 500 / 1250 ms`. Sign latency was 125 ms for both.

## Orientation

`TorsoOrientationEstimate` is `FRONTAL_OR_NEAR_FRONTAL`, `OBLIQUE`, or `SIDEWAYS_OR_UNCERTAIN`. It uses bilateral shoulder depth asymmetry when available and shoulder-width/torso-length shape corroboration. Strongly sideways evidence invalidates a shoulder-led proxy instead of applying an unproven cosine correction. Oblique evidence increases uncertainty.

## Precision metric families

| BodyMode | Metric | Required semantic authority |
| --- | --- | --- |
| HEAD_SHOULDERS | `HEAD_SHOULDERS_SCALE` | reliable shoulder pair; head extent is optional corroboration |
| UPPER_BODY | `UPPER_BODY_SCALE` | shoulder width + torso length |
| THREE_QUARTER | `THREE_QUARTER_SCALE` | torso length + hip-to-knee extent; shoulder width corroborates |
| FULL_BODY | `FULL_BODY_SCALE` | robust head-to-lower-body extent + shoulder corroboration |

Missing hips do not invalidate `HEAD_SHOULDERS_SCALE`; missing ankles do not invalidate `THREE_QUARTER_SCALE`; wrist outliers never control any family.

## Uncertainty V2

Scalar components are independently recorded:

- landmark confidence;
- normalized component disagreement;
- orientation ambiguity;
- crop ambiguity;
- temporal variance.

The bounded aggregate weights are `0.35 / 0.15 / 0.30 / 0.10 / 0.10`. Precision validity requires aggregate uncertainty `<=0.45`. This replaces the old opaque addition of absolute, differently normalized component disagreement and temporal variance; landmark thresholds are unchanged.

## Compatibility and calibration

| Target | TOO_TIGHT | COMPATIBLE | TOO_WIDE |
| --- | --- | --- | --- |
| center-medium / left-composition | HEAD_ONLY, HEAD_SHOULDERS | UPPER_BODY, THREE_QUARTER | FULL_BODY |
| center-close | HEAD_ONLY | HEAD_SHOULDERS, UPPER_BODY | THREE_QUARTER, FULL_BODY |

`PARTIAL_OR_AMBIGUOUS` is `UNCERTAIN` for all profiles.

Spike-local precision calibration is deterministic:

| Target | Mode / metric | target / tolerance |
| --- | --- | --- |
| center-medium, left-composition | UPPER_BODY / UPPER_BODY_SCALE | 0.52 / 0.07 |
| center-medium, left-composition | THREE_QUARTER / THREE_QUARTER_SCALE | 0.64 / 0.07 |
| center-close | HEAD_SHOULDERS / HEAD_SHOULDERS_SCALE | 0.43 / 0.07 |
| center-close | UPPER_BODY / UPPER_BODY_SCALE | 0.62 / 0.07 |

The tolerance is not widened from the existing Scale tolerance. These are spike-local device candidates, not global M01 calibration. Unsupported target/mode/metric pairs remain missing rather than comparing against legacy raw-pose height.

## Privacy and boundaries

Trace V2 adds only scalar proxy, uncertainty, compatibility, episode, progression, and handoff fields. Raw frame/video persistence, raw upload, Provider, Backend per-frame, and Luna remain zero. Parent `AXIS_TARGET_SUCCESS` and its denominator are unchanged.
