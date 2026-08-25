# Automated overshoot and READY causality results

Status: PASS

- Focused tests: 76/76 PASS (previous 48 remain PASS)
- Typecheck: PASS
- Production build: PASS
- Browser replay: PASS
- Correction Success gate: unchanged at >=80%
- Provider / Backend / Luna / Raw Upload: 0 / 0 / 0 / 0

The 24 added deterministic human-servo fixtures cover correct settle, partial progress,
fast/slow overshoot, no/late/jitter motion, true wrong direction, axis coupling, one-shot
STOP accounting/hysteresis, READY pending/passive paths, HOLD separation, same-direction
refinement, crossing velocity, and issue switching only after Episode terminal.

Two further recovery tests prove that a stable subject automatically exits bounded local
recovery after 1200 ms, motion resets that countdown, and manual resume remains available
without resetting accepted metrics or Episode numbering.

Browser replay verified:

- `servo-stop-success`: one ordinary MOVE, one STOP, one SUCCESS, then one HOLD with
  `ready_source=EPISODE_SUCCESS` and no console warning/error.
- `servo-pending-to-ready`: historical WRONG remains WRONG and 0% Correction Success;
  READY occurs only after the longer stable window with
  `ready_source=PASSIVE_CONFIRMATION`.

Desktop automation and synthetic browser replay do not satisfy the real-device gate.
