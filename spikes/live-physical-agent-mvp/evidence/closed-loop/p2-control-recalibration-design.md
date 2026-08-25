# LIVE-P2 Control Policy Recalibration Design

## Diagnosis

Historical FAIL evidence is preserved unchanged (SHA-256 `5CFDE1115FA17DB9F398A76AADF70F34ECA149C125C9463AD5CDE7906D80D745`). The old controller counted HOLD as an instruction, started time-to-target on the first state frame, lacked episode identity, and classified from a single stable observation. Those mechanisms explain the contradictory `0.7 s / 8 instructions` telemetry and ambiguous terminal denominator.

## Trustworthy semantics

- A trial is explicitly `ARMED`; it becomes `RUNNING` only when the first ordinary ActionEpisode is emitted outside deadband.
- `time_to_target_ms = ready_at - first_instruction_at`. Initialization, target loading, and already-satisfied frames do not arm timing.
- `ordinary_instruction_count` increments once per new ordinary ActionEpisode. HOLD is recorded only in `hold_count`.
- Each episode has one identity and at most one terminal outcome: SUCCESS, NO_EFFECT, or WRONG_DIRECTION. IMPROVING is intermediate only.
- Correction success is exactly `SUCCESS / (SUCCESS + NO_EFFECT + WRONG_DIRECTION)`.

## Verification policy

Signed Delta is `target-current`; preview mirroring is excluded. Each episode records baseline/current/best signed Delta and normalized error, motion, crossing, deadband entry, settle, outcome, retry, and warnings. A 900 ms response grace prevents premature no-effect. Verification uses a timestamp-based 375 ms settled window over P1 filtered state. Entering deadband is SUCCESS; crossing outside opposite deadband is diagnostic overshoot mapped to NO_EFFECT, never false WRONG_DIRECTION; persistent movement away without crossing is WRONG_DIRECTION.

## Candidate changes

| Parameter | Old | New | Evidence |
| --- | ---: | ---: | --- |
| action response grace | implicit one gap | 900 ms | delayed-user-response / no-motion |
| settled verification window | single frame | 375 ms | jitter-only / improve-then-regress-before-settle |
| minimum meaningful movement | implicit | 0.18 normalized | delayed-user-response / jitter-only |

No target tolerance, `>=80%` gate, instruction gap, dominance ratio, or CV threshold was weakened.

READY remains blocked while an episode is non-terminal. HOLD is one-shot and excluded. Repeated local failure remains local recovery; Luna stays OFF.
