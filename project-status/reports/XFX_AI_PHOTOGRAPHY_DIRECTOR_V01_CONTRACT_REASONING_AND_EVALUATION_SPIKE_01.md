# XFX AI Photography Director V0.1 Contract, Reasoning, and Evaluation Spike 01

## Result

```text
TASK_RESULT = PASS_WITH_WARNING
DIRECTOR_STANDALONE = PASS
PHOTOGRAPHY_DIRECTOR_INPUT_V01 = PASS
SHOT_PLAN_CANDIDATE_V01 = PASS
LIVE_TARGET_BLUEPRINT_V01 = PASS
LEVEL1_WITHOUT_SPATIAL = PASS
PARTIAL_SPATIAL = PASS
INSUFFICIENT_SPATIAL = PASS
CANDIDATE_GOVERNANCE = PASS
P3_BOUNDARY = PASS
PROVIDER_NEUTRAL = PASS
AI_PROVIDER_GATE = NOT_EXERCISED
MAIN_INTEGRATION = NOT_STARTED
```

`PASS_WITH_WARNING` is required because the evidence is controlled and deterministic, no external AI provider was authorized or exercised, and subjective human review remains pending. This spike does not claim real AI photography quality.

## Scope and ownership

The spike implements a private `app.photography_director` capability, three versioned JSON schemas, a controlled fixture matrix, fake/replay adapters, deterministic validation/evaluation, and focused regression tests. It does not import or mutate Main API composition, Scene Spatial state, Live runtime, `PhotographySession`, or `WorkflowState`.

The future composition seam is:

```text
Main request/event owner
  → PhotographyDirectorService
  → PhotographyDirectorPort
  → configured FAKE / REPLAY / future AI adapter
  → DirectorResult<ShotPlanCandidateV01[]>
  → explicit validation and user-selection policy
  → future selected-plan-to-Live projection
```

No Main integration was started in this branch.

## Input contract

`PhotographyDirectorInputV01` is strict (`additionalProperties = false`) and bounds:

- subject reference and controlled/captured evidence kind;
- subject profile: clothing, dominant/secondary colors, accessories, visible styling, pose-feasibility notes, and evidence refs;
- scene type, accepted usable visual elements, complexity, and evidence refs;
- one to eight View candidates and one to sixteen normalized composition anchors;
- lighting type/direction/intensity/risks/evidence refs;
- optional Spatial evidence with `PARTIAL | INSUFFICIENT | USABLE` quality;
- user intent and optional reference-image usage.

Cross-field validation requires unique View refs and requires every composition anchor to reference an accepted View. Identity, age precision, and unrelated body judgments have no contract fields and are rejected as unknown input.

## Output contracts

`ShotPlanCandidateV01` contains concept, View ref, semantic framing, body visibility, normalized image-plane placement, pose, camera direction/approximate height, lighting use, subject fit, scene elements, rationale, feasibility, warnings, provenance, and a `LiveTargetBlueprintV01`.

Candidate governance is structural:

```text
disposition = CANDIDATE
selection_status = NOT_SELECTED
```

`LiveTargetBlueprintV01` contains required body parts, scale target concept, primary semantic anchor, normalized x/y, tolerances, secondary constraints, pose constraints, and camera constraints. The hard P3 values are:

```text
metric_distance = UNSPECIFIED
physical_standpoint = NOT_ASSERTED
physical_safety = NOT_ASSESSED
```

It contains no Live controller epochs, timers, movement instructions, controller error fields, or observation state.

## Reasoning and prompt specification

The normative adapter instructions are recorded in `docs/ai/85-photography-director-v01-spike.md`. They require evidence-only reasoning, meaningful concept diversity, explicit uncertainty, machine-readable target projection, no automatic selection, and no P3 claims. Provider selection remains a composition-root concern.

## Fixture matrix

| Case | Subject | Scene | Light | Spatial | Intent |
|---|---|---|---|---|---|
| `simple-side-light-level1-no-spatial` | deep-red long coat | simple stone path | strong side light | absent | cinematic place-led |
| `complex-flat-light-partial-spatial` | blue layered streetwear | complex market | flat light | partial/non-metric | casual lifestyle |
| `simple-backlight-insufficient-spatial` | cream knit | simple lakeside | backlight risk | insufficient | quiet emotional |
| `complex-mixed-light-usable-spatial` | green patterned dress | moderate gallery arcade | mixed light | usable/non-metric | graphic editorial |

All four cases return exactly three validated candidates. `ABSENT`, `PARTIAL`, `INSUFFICIENT`, and `USABLE` Spatial states all retain a usable Director result.

## Candidate example

The Level 1 case produces these three meaningfully distinct alternatives:

| Concept | View | Framing / body | Anchor | Light use | Feasibility |
|---|---|---|---|---|---|
| Environmental subject-and-place portrait | `view-01-a` | full body, head through feet | body center `(0.42, 0.54)` | shape coat with side light; verify shadow | executable with bounded warnings |
| Active scene relationship | `view-01-b` | three-quarter, head through legs | torso center `(0.58, 0.52)` | retain side-light modeling | executable with bounded warnings |
| Restrained contextual portrait | `view-01-a` | close portrait, head and shoulders | eyes `(0.50, 0.42)` | use side light near face; verify shadow | executable with bounded warnings |

These are not left/center/right variants: framing, required body visibility, semantic anchor, pose constraints, scale concept, and scene relationship differ.

## Evaluation

The deterministic fixture evaluator uses a `0..5` scale. A `5` means all explicit fixture rules passed; it is not a claim of real-provider or human aesthetic quality.

| Dimension | Aggregate | Deterministic basis | Human review |
|---|---:|---|---|
| REALITY_FIDELITY | 5/5 | accepted View, anchor, scene element, evidence refs | not required for contract gate |
| SUBJECT_FIT | 5/5 | supplied clothing/colors and pose notes trace through output | PENDING |
| SCENE_FIT | 5/5 | only accepted usable scene elements are selected | PENDING |
| LIGHTING_USE | 5/5 | supplied light type and evidence ref are used; risks warn | PENDING |
| SHOT_DIVERSITY | 5/5 | three unique framing/scale/concept tuples | PENDING |
| EXECUTABILITY | 5/5 | semantic/image-plane target is complete; limitations explicit | not required for aesthetic judgment |
| LIVE_TARGET_COMPLETENESS | 5/5 | all required blueprint fields and constraints present | not required for contract gate |
| SAFETY | 5/5 | zero P3 claims; physical authority explicitly absent | not required |
| CONTRACT_VALIDITY | 5/5 | strict Pydantic and Draft 2020-12 fixture validation | not required |

Human-review questions ask whether subject styling is photographically flattering, scene use is coherent, lighting choices are convincing, and alternatives are qualitatively meaningful. Their status is `PENDING` and is the primary quality warning.

## Failure cases verified

- empty View list → `INVALID_INPUT`;
- unsupported subject field such as identity → `INVALID_INPUT`;
- anchor referencing an unknown View → `INVALID_INPUT`;
- exact coordinate, walkability, or physical-safety assertion → candidate rejection;
- non-candidate/selected disposition → candidate rejection;
- duplicate or semantically insufficient candidate set → set rejection;
- missing replay request → normalized `FAILED` result;
- candidate-to-blueprint body, scale, or anchor mismatch → schema/model rejection.

## P3 limitations

P3 remains `NOT_STARTED`. This spike cannot determine a safe stand point, walkability, ground authority, or metric camera distance. Even `USABLE` Spatial evidence remains non-metric in the controlled matrix and may only improve relative reasoning and traceability. Live must later decide how to reach a selected semantic target using its own accepted observation/control authority.

## Verification evidence

```text
FOCUSED_DIRECTOR_TESTS = 15 PASS
FULL_BACKEND_REGRESSION = 136 PASS
FIXTURE_EVALUATOR = PASS
FIXTURE_CASES = 4
CANDIDATES_EVALUATED = 12
EXTERNAL_PROVIDER_CALLS = 0
AUTOMATIC_SELECTIONS = 0
P3_FORBIDDEN_CLAIMS = 0
```

The legacy `scripts/validate-contracts.mjs` check is not green at the task base: it stops at `HomeContextV01` because nine pre-existing post-M01 schemas lack the script-required top-level `description`. The three Director schemas independently pass Draft 2020-12 checks and are exercised against all fixture inputs/outputs in the focused and full test suites. The unrelated baseline schemas were not modified.

## Git closure

```text
BASE_MAIN_HEAD = 4016aa111a862a03a3196cee4fa46127ffc76681
BRANCH = spike/ai-photography-director-v0.1
HEAD = REPORT_COMMIT_SELF
REMOTE_HEAD = VERIFY_AFTER_PUSH
AHEAD_BEHIND = VERIFY_AFTER_PUSH
WORKTREE = VERIFY_AFTER_COMMIT
```
