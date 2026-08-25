# Correction Success semantics audit

Status: MATCH

## Result

- CURRENT_IMPLEMENTATION_MEANING: `AXIS_TARGET_SUCCESS`
- AUTHORITY_INTENDED_MEANING: `AXIS_TARGET_SUCCESS`
- Audit: `MATCH`

The implementation counts SUCCESS when the issued Episode's controlled axis settles in
its deadband, including the already documented bounded settle allowance after entering
the deadband. Existing product Authority defines verification against convergence to the
Target and the recalibration Authority defines SUCCESS as settling in the deadband (or
entering it and remaining acceptably close after settle).

`ACTION_COMPLIANCE` answers a different question: whether the person made meaningful,
useful motion in the commanded direction. It is now reported separately as a diagnostic.
It does not replace SUCCESS and does not enter the original hard gate.

`FULL_TARGET_SUCCESS` is also distinct: other axes may remain unsatisfied after an issued
axis Episode. Global issue selection may continue only after that Episode terminates.

## Metric contract retained

- Correction Success Rate = SUCCESS / (SUCCESS + NO_EFFECT + WRONG_DIRECTION)
- Axis Target Completion Rate uses the same per-axis completion event and is reported
  explicitly.
- Action Compliance Rate is diagnostic only.
- Required device gate remains Correction Success >=80%.
- Historical 50% and 17.6% results remain unchanged.
