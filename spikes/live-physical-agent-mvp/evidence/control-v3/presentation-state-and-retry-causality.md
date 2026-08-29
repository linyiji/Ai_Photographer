# V3 Presentation State and Retry Causality Evidence

Date: `2026-08-29`

Baseline: `9d0e648e589be42bbcd4131f278c05152b778f7c`

## Corrected defects

- `EVALUATED` is no longer interpreted as a current user-action state.
- Sticky last Outcome and last action no longer drive primary or overlay copy.
- Main instruction and visual overlay derive from the same pure presentation projection.
- Normal copy contains zero raw internal Outcome enums.
- NO_EFFECT retry is possible from newer stable evidence without uncommanded motion.
- WRONG_DIRECTION retry recomputes direction from the current Relation.
- FRAMING completion presents a bounded transition to horizontal confirmation.
- VERIFY presents `位置合适，请保持片刻` until the unchanged 600 ms READY hold completes.
- Recovered measurement is derived from current truth rather than historical INVALIDATED.

## Automated evidence

The complete Live suite passes `237/237`. V3-specific deterministic tests cover all eleven presentation states, sticky history, NO_EFFECT retry, WRONG_DIRECTION retry, new ControlEpoch causality, combined FRAMING-to-ALIGN_X order, INVALIDATED recovery, VERIFY/READY, PAUSED, internal-enum suppression, and post-READY output.

TypeScript: `PASS`.

Production Build: `PASS / 36 modules`.

## Browser evidence

Local production-preview browser smoke passed these required V3 routes with browser-gate marker `PASS` and zero console errors:

- FRAMING_ONLY_BAD
- X_ONLY_BAD
- BOTH_BAD
- NO_EFFECT
- WRONG_DIRECTION
- INVALIDATED_RECOVERY
- ALREADY_SATISFIED
- POST_READY_MOVEMENT

Observed terminal copy:

- successful routes: `好，就这里` / `READY`;
- NO_EFFECT and WRONG_DIRECTION: `正在确认这次调整`, with no raw Outcome enum;
- INVALIDATED_RECOVERY: current freshly derived framing action, with no stale INVALIDATED copy.

V2 default browser replay `ready-after-success`: `READY · TRUE`, zero console errors, Provider/Backend/Luna/Upload `0/0/0/0`.

## Framing relation semantic risk

`FRAMING_RELATION_SEMANTIC_RISK = WARNING`.

The mapping `TOO_TIGHT -> TOO_CLOSE -> MOVE_FARTHER` and `TOO_WIDE -> TOO_FAR -> MOVE_CLOSER` is internally consistent with the existing target profiles, V2 coarse controller, instruction copy, automated semantic fixtures, and previous accepted semantic-scale evidence. No sign inversion was found.

Risk remains because coarse BodyMode compatibility is categorical and does not independently cross-check DistanceProxy sign, crop topology, and orientation uncertainty before assigning the relation. Current evidence does not prove this is a defect, and this bounded task does not modify measurement semantics. Fresh OPPO evidence must continue to observe framing direction accuracy.

## Privacy and boundaries

- Provider: `0`
- Backend per-frame: `0`
- Luna: `0`
- Raw upload: `0`
- Main/develop integration: not started
- Saved camera frames: `0`

