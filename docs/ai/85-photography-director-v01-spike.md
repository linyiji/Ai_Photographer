# Photography Director V0.1 Spike Specification

**Status:** `ISOLATED_CAPABILITY_SPIKE`
**Task:** `XFX_AI_PHOTOGRAPHY_DIRECTOR_V01_CONTRACT_REASONING_AND_EVALUATION_SPIKE_01`

## Authority and boundary

The Director owns `WHAT TO SHOOT`. It consumes accepted subject, scene, View, composition-anchor and lighting evidence, plus optional Spatial evidence and user intent. It returns non-authoritative Shot Plan candidates. It does not mutate Scene Spatial, Live, `PhotographySession`, `WorkflowState`, or any Main reducer.

```text
PhotographyDirectorInputV01
  → PhotographyDirectorPort
  → FAKE / REPLAY / future AI adapter
  → schema validation
  → reality consistency
  → feasibility scope check
  → P3/safety claim check
  → candidate set
  → explicit future user selection policy
```

Level 1 explicitly permits `spatial_evidence_optional = null`. `PARTIAL`, `INSUFFICIENT`, and `USABLE` are evidence quality states, not automatic Director request failures.

## Provider-neutral reasoning specification

A future AI adapter must produce structured JSON matching `ShotPlanCandidateV01`. The adapter prompt must communicate the following invariant instructions without provider-specific fields:

1. Use only supplied evidence. Every selected View and composition anchor must reference an input ID.
2. Describe clothing, colors, accessories, visible styling, and supplied pose-feasibility considerations only. Do not infer identity, ethnicity, precise age, attractiveness, health, or unrelated body judgments.
3. Use only `scene_understanding.usable_visual_elements`. Do not invent a physical stand point, walkability, metric distance, ground authority, or physical safety.
4. Produce approximately three meaningfully different concepts when evidence supports them. Prefer environmental full-body, three-quarter lifestyle, and closer emotional portrait alternatives over left/center/right variants.
5. For every candidate, project observable target semantics into `LiveTargetBlueprintV01`: required body parts, scale concept, semantic anchor, normalized image-plane target, tolerances, secondary constraints, pose constraints, and bounded camera constraints.
6. Keep `disposition = CANDIDATE` and `selection_status = NOT_SELECTED`. Never create selected domain state.
7. State uncertainty as warnings. Missing or insufficient Spatial evidence must preserve the Level 1 View path.
8. Use `metric_distance = UNSPECIFIED`, `physical_standpoint = NOT_ASSERTED`, and `physical_safety = NOT_ASSESSED` until future P3 authority exists.

## Deterministic fake/replay policy

The fake adapter is a controlled rule path, not simulated AI quality evidence. It deterministically emits three semantic alternatives and traceable constraints. The replay adapter returns a stored result by `request_id`, changes only provider provenance to `REPLAY`, and then passes through the same validation/governance service.

Provider choice is outside business contracts. There is no external SDK object, model name, token count, provider prompt syntax, or Live controller field in the contracts.

## Validation and rejection behavior

Input validation rejects unknown fields, missing Views, duplicate View IDs, unbounded normalized values, and anchors that reference an unknown View. Candidate validation rejects schema mismatches, unsupported View/anchor/scene references, P3 claims, selected disposition, blueprint/candidate mismatch, and insufficient set diversity.

Any rejected candidate causes the set status `VALIDATION_FAILED`; the service does not partially promote a set. Provider/replay exceptions return a normalized `FAILED` result. Neither path changes application state.

## Evaluation interpretation

The deterministic evaluator scores nine dimensions on a `0..5` scale. A five means the fixture output satisfied every explicit machine rule for that dimension. It does not mean a real AI model, real subject, or real scene achieved human-quality photography. Subject fit, scene fit, lighting use, and qualitative diversity therefore include explicit `PENDING` human-review questions.
