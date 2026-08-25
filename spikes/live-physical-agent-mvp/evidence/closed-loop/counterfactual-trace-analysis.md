# Accepted-trace counterfactual analysis

Label: COUNTERFACTUAL_DIAGNOSTIC — not acceptance evidence

All 17 accepted historical terminal Episodes were retained. The replay found explicit
near-corridor entry in multiple failures and deadband entry in the four NO_EFFECT
OVERSHOOT Episodes. One audited historical WRONG_DIRECTION also entered/crossed the
target. These events make a bounded STOP decision observable before terminal settle.

The counterfactual policy would issue at most one STOP while commanded-axis motion is
correct and either current normalized error is <=1.5 or the 350 ms predicted motion
segment reaches/crosses that corridor. It would not alter the already recorded terminal
outcomes. It can estimate STOP timing and show that READY after a non-SUCCESS terminal
would be held in `SATISFIED_PENDING_CONFIRMATION`; it cannot predict whether the person
would obey a new cue.

Therefore:

- STOP timing observability: SUPPORTED
- Target crossing visibility: SUPPORTED
- READY blocking after non-SUCCESS: SUPPORTED
- Human response / new Correction Success: NOT PROVEN BY REPLAY
- Device acceptance: REQUIRED
