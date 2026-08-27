# V3 Prospective Human-Step Evidence

Date: 2026-08-27

Status: `READY_FOR_OPPO_EXPLORATORY_GATE / DEVICE_SOURCE_REQUIRED`

## Admission and browser evidence

- V3 architecture design: PASS / EXPERIMENTAL
- Structural replay gate: PASS
- Counterfactual effectiveness gate: SUPERSEDED_AS_INVALID_PREREQUISITE
- Experimental runtime admission: PASS / DEBUG-ACCEPTANCE ONLY
- Default runtime after an ordinary load/reload: V2
- V3 selection: explicit `controlPolicy=V3` or session UI selection; not persisted
- Same accepted Perception/Semantic Measurement pipeline: PASS
- Automated suite: 229/229 PASS
- TypeScript: PASS
- Production build: PASS / 35 modules
- V2 browser replay: PASS / READY / zero console errors
- V3 deterministic browser scenarios: 10/10 PASS

| Scenario | Browser result |
| --- | --- |
| FRAMING_ONLY_BAD | FRAMING correction → VERIFY → READY_LATCHED |
| X_ONLY_BAD | ALIGN_X correction → VERIFY → READY_LATCHED |
| BOTH_BAD | FRAMING → ALIGN_X → VERIFY → READY_LATCHED |
| ALREADY_SATISFIED | VERIFY → READY_LATCHED; ordinary = 0 |
| NO_EFFECT | evaluated NO_EFFECT |
| WRONG_DIRECTION | evaluated WRONG_DIRECTION |
| MEASUREMENT_UNCERTAIN | ACQUIRE; ordinary = 0 |
| SUBJECT_LOST | INVALIDATED; ACQUIRE |
| REACQUIRE | reacquired measurement → TARGET_REACHED → VERIFY |
| POST_READY_MOVEMENT | READY_LATCHED retained; post-ready ordinary = 0 |

## Required OPPO protocol

For every ordinary V3 cue: perform **one small adjustment**, then naturally stop. Do not continue moving while waiting for another cue.

Collect four fresh scalar-only traces:

| Trial | Starting condition | Expected |
| --- | --- | --- |
| A FRAMING_ONLY | Framing OUT; X approximately IN | one distance step; settle; TARGET_REACHED or IMPROVED |
| B X_ONLY | Framing IN; X OUT | one left/right step; settle; TARGET_REACHED or IMPROVED |
| C COMBINED | Framing OUT; X OUT | framing steps first, then X steps, then VERIFY/READY |
| D ALREADY_SATISFIED | Framing IN; X IN; GOOD/FRESH | VERIFY → READY; ordinary actions 0 |

Hard invariants: wrong physical direction 0, post-READY ordinary 0, obvious oscillation 0, predictive STOP 0. Record Preview FPS, Vision Hz, State Hz, inference p50/p95, Skipped Busy, V3 controller latency, Time To Settle, and thermal.

## Current prospective result

FRAMING_ONLY, X_ONLY, COMBINED, and ALREADY_SATISFIED are `NOT_EXERCISED` on device. Action Effectiveness, Target Reach Rate, Trial READY Rate, Corrections To READY, Time To READY, Invalidated Rate, prospective V2/V3 comparison, and production-candidate decision are `NOT_COMPUTABLE / NOT_REACHED` until fresh device traces exist.

Privacy: Saved Camera Frames 0; Raw Video Upload 0; Backend Per-frame 0; Provider 0; Luna 0. Trace format is `xfx-live-p2-v3-human-step-trace-v1` and contains scalar episode causality only.
