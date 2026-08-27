# XFX_LIVE_P2_CONTROL_ARCHITECTURE_V3_HUMAN_STEP_SERVO_REDESIGN_01

Status: `FAIL / COUNTERFACTUAL_PROMOTION_GATE_NOT_MET`

Git Admission started clean at published `451d1b86308fc0fa5fa47f144ab055aaca39ea5d`, branch `spike/live-physical-agent-mvp-v0.1`, ahead/behind `0/0`. V2 and Attempt 3–8 provenance were preserved.

## Completed Phase A

- Added V3 design candidate, migration matrix, and replay/acceptance plan.
- Added `LiveMeasurementV3` as an adapter over accepted semantic measurement; no Camera/Pose/measurement duplication or redesign.
- Added pure `HumanStepServoV3` with ACQUIRE, FRAMING, ALIGN_X, VERIFY, PAUSED, READY_LATCHED.
- Removed dynamic axis priority and predictive STOP from the V3 candidate only; V2 remains unchanged.
- Added `HumanSettleDetectorV01`, immutable `ControlEpochV3`, terminal IMPROVED, explicit INVALIDATED, fixed framing-first order, one READY path, and scalar replay.
- Full automated suite: 225/225 PASS at the Phase A checkpoint.

## Replay result

Thirty-seven records were evaluated: Attempt 3/5/6/7, both Semantic Scale attempts, nine existing synthetic replays, and Attempt 8 availability. Classification is 7 exact state streams, 29 structural-only, and 1 not reconstructable. Attempt 8 is the missing source because no fresh device Trace exists.

The exact state streams show zero V3 wrong-direction regression, zero post-READY regression, zero reversal opportunity, lower structural complexity, and deterministic both-bad FRAMING-to-ALIGN_X order. However, exact records with valid terminal-effectiveness observations for both V2 and V3 are zero. V2/V3 Action Effectiveness is therefore `NOT_COMPUTABLE`, not a PASS. Historical continuous-until-STOP responses and measurement-gate traces cannot be relabeled as human-step outcomes.

Counterfactual Promotion Gate: FAIL. `V3_DESIGN_AUTHORITY=FAIL / REQUIRES_REVISION`. Phase B runtime selector, V3 runtime Trace, browser A/B, and Phase C OPPO V3 Gate were not started, exactly as required by the gate ordering.

## Preserved boundaries

LIVE-P0 PASS; LIVE-P1 PASS; Semantic Measurement and Semantic Scale preserved; V2 runtime regression pending final complete verification but no V2 runtime source was changed. Main integration, Luna, Provider, Backend, raw upload, old V2 Gate 2, and V3 Gate 2 remain not started.
