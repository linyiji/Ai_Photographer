# Semantic Scale Counterfactual Replay

Status: PASS_WITH_WARNING — diagnostic only.

Source: the latest 676 OPPO scalar rows. The old trace contains BodyMode, old filtered Scale, old uncertainty, and instruction events, but not shoulder width, head/torso component values, orientation, or V2 DistanceProxy. Missing fields are not fabricated.

## Reconstructable findings

- Previous Scale validity: 31/676.
- Exact previous primary reasons: 606 `UNCERTAINTY_TOO_HIGH`, 28 `REACQUISITION_BARRIER`, 10 `METRIC_FAMILY_UNAVAILABLE`, one `BODY_MODE_INCOMPATIBLE`, 31 `VALID`.
- `HEAD_SHOULDERS`: 462 rows. That classifier required a bilateral shoulder pair, so all 462 are legitimate V2 DistanceProxy candidates. Exact V2 values and orientation-gated validity cannot be reconstructed without component telemetry.
- Coarse events: 21 `MOVE_FARTHER`.
- In the first coarse sequence, events 2–9 occurred after the old head/shoulder Scale had begun decreasing from about `0.790` toward `0.47–0.50`. Eight repeat cues are therefore counterfactual suppression candidates while measured progress was positive.
- Event 10 occurred after a metric-family/BodyMode change to `THREE_QUARTER`; V2 would use a handoff instead of comparing it numerically with the old head/shoulder baseline.
- The second sequence's old Scale increased after `MOVE_FARTHER`, so it is not labeled as positive progress. Exact V2 `WRONG_DIRECTION` timing cannot be claimed because the new DistanceProxy is absent.

## Boundary

The replay proves the old spam pattern is observable and that at least eight repeats are suppressible where old scalar trend supports it. It does not claim a fresh device success rate, Scale Device Gate PASS, or Parent Gate 1 result.
