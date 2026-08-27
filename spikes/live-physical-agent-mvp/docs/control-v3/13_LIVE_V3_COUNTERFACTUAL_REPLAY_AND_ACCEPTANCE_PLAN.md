# LIVE V3 Counterfactual Replay and Acceptance Plan

Status: Phase A executed; Promotion Gate FAIL; Phase B/C not reached.

## Replay classification

- `EXACT_COUNTERFACTUAL`: semantic state stream, freshness, causal rows, and V3 direction are reconstructable from the scalar evidence.
- `STRUCTURAL_ONLY`: stage order and possible actions can be inspected, but semantic or intervention/settle evidence is insufficient for an effectiveness claim.
- `NOT_RECONSTRUCTABLE`: the source or required causal state is absent.

Historical human movement was generated under V2 continuous-motion/STOP cues. A structurally plausible V3 step outcome is not automatically treated as an exact V3 human response. Missing settle evidence is never fabricated.

## Executed sources

The analyzer consumed Attempt 3 (5), Attempt 5 (4), Attempt 6 (4), Attempt 7 (2), Semantic Scale Attempt 1 (6), Semantic Scale Attempt 2 (6), nine existing synthetic trajectories, and the Attempt 8 availability record. Attempt 8 has no fresh device Trace and is `NOT_RECONSTRUCTABLE`.

Result: 37 records = 7 exact state streams, 29 structural-only, 1 not reconstructable. Exact records with valid terminal outcomes for both V2 and V3: 0.

## Promotion decision

| Requirement | Result |
| --- | --- |
| WRONG_DIRECTION regression = 0 | PASS on exact reconstructable state streams |
| Post-READY regression = 0 | PASS |
| V3 effectiveness >= V2 | FAIL / SOURCE_REQUIRED; no exact effectiveness comparator |
| V3 reversal opportunity <= V2 | PASS on exact state streams |
| V3 complexity lower | PASS |
| BOTH_BAD = FRAMING then ALIGN_X | PASS in deterministic automated replay |

Overall Promotion Gate: `FAIL`. `V3_DESIGN=REQUIRES_REVISION`. Debug Runtime A/B, Trace V3 runtime extension, browser V2/V3 comparison, and OPPO V3 Gate are not authorized.

## Required evidence to revise

Create a controlled scalar-only step protocol after revising authority or supplying new source: one cue, immutable start snapshot, one physical step, natural stop, newer comparable settled measurement, and explicit outcome. At least three comparable records must cover framing, X, and both-bad sequential handoff. Only then recompute V2/V3 effectiveness and consider Phase B.

The future candidate device gates remain unchanged from the task: wrong direction 0, post-READY ordinary 0, action effectiveness >=80%, trial READY >=80%, obvious oscillation 0, and median precision corrections to READY <=3. They are not evaluated in this run.
