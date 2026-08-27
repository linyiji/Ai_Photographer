# V3 Counterfactual Replay Evidence

Date: 2026-08-27

Command: compile the full test graph, then run `node scripts/analyze-control-v3.mjs <scalar-evidence-directory>`.

```text
Source records = 37
EXACT_COUNTERFACTUAL = 7
STRUCTURAL_ONLY = 29
NOT_RECONSTRUCTABLE = 1
Exact effectiveness comparator records = 0
V2 Action Effectiveness = NOT COMPUTABLE
V3 Action Effectiveness = NOT COMPUTABLE
Exact-stream V2/V3 Wrong Direction = 0 / 0
Exact-stream V2/V3 Post-READY Ordinary = 0 / 0
Exact-stream V3 reversal opportunity = 0
V3 STOP = 0 by architecture
Controller complexity = V3 LOWER
Both-bad deterministic order = FRAMING -> ALIGN_X
Promotion Gate = FAIL / SOURCE_REQUIRED
```

The seven exact records reconstruct state streams but contain no record with valid terminal-effectiveness observations for both policies. The Semantic Scale records primarily validate measurement/coarse behavior, while historical V2 device trials either lack admitted semantic state or reflect continuous-until-STOP intervention. Comparing their raw percentages as if they were V3 step responses would fabricate causal evidence.

Automated V3 tests prove deterministic structure, noise-safe IMPROVED, WRONG_DIRECTION, INVALIDATED exclusion, PAUSED, READY latch, zero post-READY output, and no predictive STOP. They do not replace real human step-response evidence.

No raw media was read or committed. Provider, Backend per-frame, Luna, and Raw Upload remain zero.
