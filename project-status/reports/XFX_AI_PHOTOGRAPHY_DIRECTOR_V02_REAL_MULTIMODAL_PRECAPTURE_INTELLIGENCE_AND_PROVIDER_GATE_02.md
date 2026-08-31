# XFX AI Photography Director V0.2 Real Multimodal Pre-Capture Intelligence and Provider Gate 02

## Result

```text
TASK_RESULT = MANUAL_REVIEW_REQUIRED

SUBJECT_UNDERSTANDING = PASS_WITH_WARNING
SCENE_UNDERSTANDING = PASS_WITH_WARNING
LIGHTING_UNDERSTANDING = PASS_WITH_WARNING

SUBJECT_PROFILE_CANDIDATE = PASS
SCENE_UNDERSTANDING_CANDIDATE = PASS
LIGHTING_EVIDENCE_CANDIDATE = PASS

DIRECTOR_REAL_PROVIDER = NOT_EXERCISED
SHOT_PLAN_CANDIDATES = PASS_WITH_WARNING
MEANINGFUL_THREE_PLAN_DIVERSITY = PASS_WITH_WARNING
SUBJECT_SCENE_CROSS_REASONING = PASS_WITH_WARNING
LIVE_TARGET_BLUEPRINT = PASS

LEVEL1_WITHOUT_SPATIAL = PASS
INSUFFICIENT_SPATIAL = PASS
P3_BOUNDARY = PASS

REALITY_FIDELITY = FAIL
EXECUTABILITY = PASS_WITH_WARNING
HUMAN_PHOTOGRAPHY_REVIEW = PENDING
PROVIDER_NEUTRAL = PASS

PROVIDER_MODEL = NOT_CONFIGURED
PROVIDER_IMAGE_INPUT = NO
PROVIDER_IMAGE_INPUT_COUNT = 0
PROVIDER_RAW_VIDEO = 0
PROVIDER_FRAME_STREAM = 0
PROVIDER_LATENCY = SOURCE_REQUIRED
PROVIDER_USAGE = SOURCE_REQUIRED
PROVIDER_COST = SOURCE_REQUIRED

AI_PROVIDER_GATE = MANUAL_REVIEW_REQUIRED
AI_DIRECTOR_PRODUCTION_CANDIDATE = REQUIRES_REVISION
POST_CAPTURE_AI = NOT_STARTED
MAIN_INTEGRATION = NOT_STARTED
```

`REALITY_FIDELITY = FAIL` means the required real-provider admission evidence is absent; it does not assert that a tested model hallucinated. No provider/model configuration or authorized credential was present, so the task's explicit stop gate prevented real execution. No quality, latency, usage, or cost evidence was fabricated.

## Accepted baseline and unchanged contracts

V0.1 remains accepted at `634a365537342023b7962010ab69088bf8859233`. `PhotographyDirectorInputV01`, `ShotPlanCandidateV01`, and `LiveTargetBlueprintV01` were not redesigned. V0.2 adds separate understanding-candidate contracts and an orchestration/provider boundary around the accepted Director seam.

Main, Live, Scene Spatial, `PhotographySession`, and `WorkflowState` remain untouched.

## Logical stage contracts

### Subject understanding

`SubjectProfileCandidateV01` separates `observed` from `photography_inferences`. Observed fields cover clothing categories, dominant/secondary colors, color relationship, visible accessories/styling, silhouette observations, pose-feasibility observations, confidence, and evidence refs. Each photography inference cites one or more observation IDs.

Controlled contract example—not provider evidence:

```text
OBSERVED: clothing = long red coat; dominant color = deep red
PHOTOGRAPHY_INFERENCE: saturated red may separate from a muted background
LINEAGE: inference → subject-obs-color
```

Identity, personality, precise age, beauty/attractiveness, ethnicity, health, and unrelated body ratings are rejected at the contract boundary.

### Scene understanding

`SceneUnderstandingCandidateV01` carries scene category, usable visual elements, complexity, visible foreground/background relationships, visual depth cues, distractions, per-View interpretations, evidence refs, and separately lineaged photography inferences.

Controlled contract example—not provider evidence:

```text
OBSERVED: stone wall borders a receding path
PHOTOGRAPHY_INFERENCE: the path can support an environmental composition
```

Safe stand point, walkability, ground support, and metric-distance claims are rejected.

### Lighting understanding

`LightingEvidenceCandidateV01` carries candidate direction, softness, flat/side/back/mixed pattern, face-shadow risk, clipping risk, background/subject brightness relation, bounded ambient appearance, confidence, and evidence refs.

Controlled contract example—not provider evidence:

```text
OBSERVED: hard side light from camera left; high face-shadow risk
PHOTOGRAPHY_INFERENCE: turn the face slightly toward the evidenced light to preserve detail
```

Unsupported sunset, golden-hour, blue-sky, rain, storm, or snow claims are rejected.

## Validated Director assembly

Only validated candidates are projected into `PhotographyDirectorInputV01`. Scene View interpretations must exactly cover the accepted View refs. Subject observations map to the V0.1 subject profile, scene observations map to accepted usable elements, and lighting observations map to bounded lighting evidence. Photography inferences remain separate and are not persisted as Reality facts.

Spatial evidence remains optional. The accepted V0.1 absent/partial/insufficient/usable regression continues to pass, including useful Level 1 and insufficient-Spatial candidate sets. V0.2 adds no metric or P3 authority.

## Provider adapter and normalization

The implemented boundary is:

```text
runtime provider configuration
  → MultimodalProviderTransport
  → MultimodalProviderResponse
  → JSON normalization
  → stage schema validation
  → V0.1 assembly
  → candidate schema/reality/P3/diversity validation
  → DirectorResult
```

Provider SDK types cannot enter domain contracts. Runtime configuration uses environment indirection for credentials and exposes only a safe projection. The replay transport stores structured outputs only; it has no media bytes or secrets. Because no real provider ran, there is no real sanitized replay recording yet.

## Subject × scene reasoning

The V0.2 business gate requires every candidate's subject-fit/rationale/lighting reasoning to use supplied clothing/color evidence and its accepted `scene_elements_used`. A generic independent summary fails with `DIRECTOR_CROSS_REASONING_INVALID`.

This gate is deterministically proven, but actual photographic cross-reasoning remains `PASS_WITH_WARNING` until real outputs and human review exist.

## Live target executability

All accepted candidate payloads still pass the V0.1 `LiveTargetBlueprintV01` consistency rules: body visibility, scale concept, semantic anchor, non-universal normalized x/y, tolerances, secondary constraints, pose constraints, and bounded camera constraints. Metric distance is `UNSPECIFIED`, physical stand point is `NOT_ASSERTED`, and physical safety is `NOT_ASSESSED`.

## Provider and privacy preflight

No recognized provider credential/configuration names were present. No credential value was read, stored, logged, or reported. No image was sent.

The intended per-case media budget is one authorized subject image for Stage A, one authorized scene image for Stage B, and zero images for Stage C. Safe telemetry excludes bytes and records only asset ref, MIME type, SHA-256, count, latency, usage, cost, and request identity where available.

```text
ACTUAL_PROVIDER_IMAGE_INPUT_COUNT = 0
ACTUAL_PROVIDER_RAW_VIDEO = 0
ACTUAL_PROVIDER_FRAME_STREAM = 0
ACTUAL_GEOMETRY_FRAME_SEQUENCE = 0
ACTUAL_SCENE_SPATIAL_PRIVATE_STATE = 0
```

## Evaluation set status

A six-combination planned matrix is recorded, but all cases are `NOT_RUN`. The repository inventory contains several scene assets and one black-outfit subject family. It does not meet the required clothing-color/style diversity. The apparent full-body product asset is a generated subject/scene composite, not a clean subject reference.

The real evaluation gate therefore requires additional explicitly approved full-body subject images and explicit provider-send authorization. Spatial partial/insufficient/usable cases also require accepted evidence paired to the evaluated scenes rather than invented labels.

## Human photography review

The eight-question rubric is stored under evidence, but zero real provider candidate sets exist to review.

```text
HUMAN_PHOTOGRAPHY_REVIEW = PENDING
```

No deterministic score was converted into a subjective photography score.

## Failure evidence

The deterministic harness passes these normalized cases without provider calls:

| Case | Normalized result |
|---|---|
| timeout | `DIRECTOR_PROVIDER_TIMEOUT` |
| malformed JSON | `DIRECTOR_PROVIDER_MALFORMED_JSON` |
| schema-invalid response | `DIRECTOR_PROVIDER_SCHEMA_INVALID` |
| one candidate | candidate-set validation failure |
| duplicate candidates | candidate-set validation failure |
| hallucinated View ref | reality validation failure |
| unknown anchor ref | reality validation failure |
| P3 claim | safety validation failure |
| missing Live target | contract validation failure |
| provider unavailable | normalized provider failure |
| unauthorized media | authority failure before transport |
| unknown understanding evidence ref | validation failure before Director assembly |
| missing cross-reasoning | business validation failure |

All errors conform to `ErrorContract` and contain no media bytes, credential, raw request, or raw provider output.

## Verification

```text
V02_FOCUSED_TESTS = 22 PASS
FULL_BACKEND_REGRESSION = 158 PASS
REAL_PROVIDER_CALLS = 0
REAL_PROVIDER_CANDIDATE_SETS = 0
HUMAN_REVIEWED_CANDIDATE_SETS = 0
```

Evidence: `project-status/evidence/ai-photography-director-v02/`.

## Required manual inputs

1. Authorize a concrete multimodal provider/model and configure its transport.
2. Supply the credential through the referenced environment variable or approved secret store.
3. Explicitly authorize the exact subject/scene assets that may be sent.
4. Add enough approved full-body subject images to cover clothing color/style variation.
5. Provide paired accepted Spatial evidence for partial/insufficient/usable cases if those cases are to be run.
6. Assign a human photography reviewer for the real candidate sets.

Until these inputs exist, `AI_DIRECTOR_PRODUCTION_CANDIDATE = REQUIRES_REVISION`.

## Git closure

```text
BASE_HEAD = 634a365537342023b7962010ab69088bf8859233
BRANCH = spike/ai-photography-director-v0.1
HEAD = REPORT_COMMIT_SELF
REMOTE_HEAD = VERIFY_AFTER_PUSH
AHEAD_BEHIND = VERIFY_AFTER_PUSH
WORKTREE = VERIFY_AFTER_COMMIT
```
