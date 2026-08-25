# Human-servo braking cue design

Status: IMPLEMENTED

## Evidence

The accepted 17-Episode sample contains four NO_EFFECT Episodes that entered/crossed
the useful band and then left it, plus one target-cross overshoot in the wrong-direction
audit. This is direct evidence that a single direction pulse followed by silence can let
useful human motion continue beyond the target.

## Bounded policy

- Existing axis deadband remains normalized error <=1.0.
- Braking corridor is normalized error <=1.5. This is deliberately only 0.5 tolerance
  wider than the unchanged target band.
- Prediction horizon is 350 ms using the existing timestamp-normalized filtered velocity.
- While motion is in the commanded direction, emit `STOP_HERE` when the current state is
  in the corridor, or the predicted segment reaches/crosses it.
- User copy: `好，停一下`.
- One STOP at most per ActionEpisode; the Episode remains the same and its original axis
  stays latched through verification.
- STOP is non-directional, is not HOLD, does not create a new ActionEpisode, and does not
  increment `ordinary_instruction_count` or the Correction Success denominator.

Telemetry includes corridor state, predicted delta, STOP timestamp/count, diagnostic
Action Compliance, Axis Completion, and NO_EFFECT subtype. `PARTIAL_PROGRESS` is retained
as a diagnostic concept through `INSUFFICIENT_PROGRESS`; it remains NO_EFFECT under the
unchanged Authority metric and may legally lead to a later same-direction refinement.

Counterfactual replay can identify when STOP would have fired, but cannot claim how a
person would have reacted. Only fresh device evidence can validate usability and effect.
