# LIVE V3 Counterfactual Replay and Acceptance Plan

Status: Structural Replay Gate `PASS`; historical Effectiveness Gate `SOURCE_REQUIRED`; Experimental Runtime Admission `PASS`.

The previous `Promotion Gate FAIL` is preserved as a historical result. Its effectiveness prerequisite is now `SUPERSEDED_AS_INVALID_PREREQUISITE`: historical V2 responses cannot stand in for prospective V3 human-step responses, and their absence cannot reject the architecture. Counterfactual replay authority is limited to structural safety, causal determinism, and regression prevention.

## Replay classification

- `EXACT_COUNTERFACTUAL`: semantic state stream, freshness, causal rows, and V3 direction are reconstructable from the scalar evidence.
- `STRUCTURAL_ONLY`: stage order and possible actions can be inspected, but semantic or intervention/settle evidence is insufficient for an effectiveness claim.
- `NOT_RECONSTRUCTABLE`: the source or required causal state is absent.

Historical human movement was generated under V2 continuous-motion/STOP cues. A structurally plausible V3 step outcome is not automatically treated as an exact V3 human response. Missing settle evidence is never fabricated.

## Executed sources

The analyzer consumed Attempt 3 (5), Attempt 5 (4), Attempt 6 (4), Attempt 7 (2), Semantic Scale Attempt 1 (6), Semantic Scale Attempt 2 (6), nine existing synthetic trajectories, and the Attempt 8 availability record. Attempt 8 has no fresh device Trace and is `NOT_RECONSTRUCTABLE`.

Result: 37 records = 7 exact state streams, 29 structural-only, 1 not reconstructable. Exact records with valid terminal outcomes for both V2 and V3: 0.

## Historical promotion decision and corrected role

| Requirement | Result |
| --- | --- |
| WRONG_DIRECTION regression = 0 | PASS on exact reconstructable state streams |
| Post-READY regression = 0 | PASS |
| V3 effectiveness >= V2 | FAIL / SOURCE_REQUIRED; no exact effectiveness comparator |
| V3 reversal opportunity <= V2 | PASS on exact state streams |
| V3 complexity lower | PASS |
| BOTH_BAD = FRAMING then ALIGN_X | PASS in deterministic automated replay |

Historical overall Promotion Gate: `FAIL / SOURCE_REQUIRED`; retained without deletion. Corrected decomposition: `V3_ARCHITECTURE_DESIGN=PASS`, `V3_PURE_CONTROLLER=PASS`, `V3_STRUCTURAL_REPLAY_GATE=PASS`, `V3_EFFECTIVENESS_EVIDENCE=SOURCE_REQUIRED`, and `V3_PRODUCTION_RUNTIME_PROMOTION=NOT_AUTHORIZED`.

`EXPERIMENTAL_RUNTIME_ADMISSION=PASS` authorizes an explicit, debug-only V3 runtime and prospective OPPO evidence. It does not authorize default V3, Main integration, or production promotion.

## Required evidence to revise

Create a controlled scalar-only prospective protocol: one cue, immutable start snapshot, one physical step, natural stop, newer comparable settled measurement, and explicit outcome. The first exploratory device gate covers framing-only, X-only, combined sequential handoff, and already-satisfied. Only fresh V3 intervention evidence may compute V3 effectiveness.

V3 Gate 2 remains `NOT_DEFINED`; V2 statistical thresholds are not inherited automatically.
