# Semantic Scale Validity Audit

Status: PASS — pre-amendment decision reconstructed for every one of 676 scalar rows.

Sources are the three user-supplied OPPO scalar exports recorded in `oppo-semantic-measurement.md`. The row-level audit is `scale-validity-audit.json`; raw media is absent and the source trace files were not copied into the repository.

## Primary reason

| Reason | Rows |
| --- | ---: |
| UNCERTAINTY_TOO_HIGH | 606 |
| VALID | 31 |
| REACQUISITION_BARRIER | 28 |
| METRIC_FAMILY_UNAVAILABLE | 10 |
| BODY_MODE_INCOMPATIBLE | 1 |

The dominant failure is not missing hips in `HEAD_SHOULDERS`. All 462 classified `HEAD_SHOULDERS` rows had a `HEAD_SHOULDER_SCALE`; 461 failed because the old combined uncertainty exceeded `0.16`, and only one passed.

The old uncertainty was opaque: absolute disagreement between differently normalized scale components was added directly to temporal variance. The trace does not contain the component values/confidences or separate temporal/orientation/crop terms, so the 606 rows cannot honestly be subdivided further. They remain `UNCERTAINTY_TOO_HIGH` rather than guessed as missing shoulder/head/crop failures.

## By BodyMode

| BodyMode | VALID | UNCERTAINTY_TOO_HIGH | METRIC_UNAVAILABLE | INCOMPATIBLE | REACQUISITION |
| --- | ---: | ---: | ---: | ---: | ---: |
| HEAD_SHOULDERS | 1 | 461 | 0 | 0 | 0 |
| UPPER_BODY | 23 | 88 | 3 | 0 | 0 |
| THREE_QUARTER | 7 | 57 | 7 | 0 | 0 |
| PARTIAL_OR_AMBIGUOUS | 0 | 0 | 0 | 1 | 0 |
| NO_SEMANTIC | 0 | 0 | 0 | 0 | 28 |

No `FULL_BODY` rows were present. Scenarios were not labeled in the old trace, so all 676 rows are explicitly grouped as `UNLABELED`; no scenario attribution is fabricated.

## Confidence, crop, and metric findings

- High BodyMode confidence did not solve validity: the `0.80–1.00` bucket contains 532 `UNCERTAINTY_TOO_HIGH` rows and only 20 valid rows.
- `HEAD_SHOULDER_SCALE` accounts for 461 invalid and one valid row.
- `TORSO_COMPOSITE_SCALE` accounts for 88 invalid and 23 valid rows.
- `THREE_QUARTER_COMPOSITE_SCALE` accounts for 57 invalid and seven valid rows.
- Crop states are retained row-by-row in the JSON. `NONE` still contains 173 high-uncertainty rows, proving crop alone is not the dominant explanation.

## Reconstruction boundary

The classification reproduces the actual old gate order: valid → measurement stale → incompatible mode → metric unavailable → uncertainty threshold → other. Body-mode stability, shoulder/head/hip absence, component disagreement, orientation ambiguity, and temporal variance were not separately serialized. Those reasons are therefore not asserted for old rows. The V2 implementation must add them as first-class scalar telemetry for fresh evidence.
