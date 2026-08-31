# XFX Main Product Master Flow and Capability Authority Rebaseline 06

## Decision

`PASS_WITH_WARNING`. The supplied Product Master Flow package is adopted as current product/responsibility authority and reconciled with M01 contracts, the locked machine workflow and already accepted Scene Spatial Main integration. This task changes documentation/design metadata only: no Live V4 runtime, AI provider, Scene Spatial algorithm, P3 or production release implementation was created.

The warning is bounded to future Source Required evidence: Live V4 contract/runtime and device gates, AI Director fixtures/spike/provider evaluation, P3 Affordance evidence for physical stand-point claims, and the existing integrated WeChat real-device Scene Spatial gate.

## Old vs new product flow

Legacy detailed flow:

```text
ENTRY → SHOOTING RELATION / DEVICE MODE → REALITY UNDERSTANDING
→ TARGET SELECTION / ADAPTATION → SHOT DIRECTION → REALTIME SHOT CONTROL
→ CAPTURE → CAPTURE QA / RETAKE ROUTER → REALITY+
→ OPTIONAL USER FINE TUNE → MY FINAL PHOTO → FINAL ACTION HUB
```

New user-level authority:

```text
REALITY_CAPTURE
→ AI_PHOTOGRAPHY_DIRECTOR
→ LIVE_SHOOTING
→ AI_PHOTO_QA + REALITY_PLUS
→ USER_FINE_TUNE
→ MY_FINAL_PHOTO
```

The legacy detail is retained as machine/screen support, not deleted. The new five-stage meaning freezes responsibility and avoids presenting machine states as the user journey.

## Responsibility and Non-AI scope changes

| Area | Previous ambiguity | Rebased authority |
|---|---|---|
| Scene Spatial | anchors/geometry could be read as shot or placement choice | reality evidence provider only |
| AI Director | Target and Shot planning were split across legacy modules without one decision owner | Shot Plan decision owner |
| Live | fixed center/BodyMode heuristics could be read as photographic authority | selected target execution controller only |
| Non-AI Phase 1 | could be read as autonomous best-shot discovery | deterministic Shot Plan execution only |
| Reality+ | broad enhancement language could imply a synthetic viewpoint | preserve capture causality; material angle/pose defects retake |

```text
NON_AI_BEST_SHOT_DISCOVERY = NO
NON_AI_SHOT_PLAN_EXECUTION = YES
```

## Scene Spatial authority

P0 remains accepted, P1 accepted with warning and non-blocking, and P2 accepted with latency warning. `SpatialEvidenceV02` remains accepted reality evidence. The Geometry algorithm gate is closed/unchanged and P3 is not started.

`CompositionAnchorCandidate = IMAGE_PLANE_ONLY`; it is not `SubjectPlacementCandidate`. `SpatialEvidenceV02 != ShotDirection`, and Scene Spatial direct `LiveTarget` creation is forbidden. The already integrated Main boundary remains `SceneSpatialPort` with REAL/FAKE/REPLAY adapters and view-only failure degradation.

## Live disposition and architecture target

```text
V3_EXPERIMENTAL_DEVICE_GATE = FAIL
V3_PRODUCTION_RUNTIME = NOT_PROMOTED
V3_PRODUCTION_CANDIDATE = REQUIRES_REVISION
MAIN_INTEGRATION = NOT_STARTED
```

The target is `Subject Lock → Body Visibility Graph → Semantic Anchor Set → HumanObservationV02`, compared with `LiveTargetV02`, then `Constraint Resolver → Human Step Servo`.

Observation describes current reality; Target describes the selected plan; Control compares them. Fixed center `x=0.5`, `BodyMode → TOO_CLOSE/TOO_FAR` and universal best distance are deprecated as Control Authority.

The V3 causal defect is recorded as no movement followed by grace expiry and an evaluable outcome/new epoch. Future invariant is `NO_RESPONSE → NO_ACTION_OUTCOME → NO_NEW_CONTROLEPOCH`.

## AI Photography Director

`PhotographyDirectorPort` is documented as a provider-neutral `propose(PhotographyDirectorInputV01) → DirectorResult<ShotPlanCandidateV01[]>` boundary with conceptual FAKE/REPLAY/AI providers. It supports Level 1 inputs without optional SpatialEvidence and returns approximately three candidates. Candidate validation/selection remains mandatory.

No external provider was contacted:

```text
PROVIDER = 0
LUNA = 0
```

## M01 contract mapping

| Concept | Mapping |
|---|---|
| SubjectReferenceAsset | EXTEND |
| SubjectProfileCandidate | NEW |
| LightingEvidence | EXTEND |
| PhotographyDirectorInputV01 | NEW |
| ShotPlanCandidateV01 | EXTEND |
| SelectedShotPlanV01 | EXTEND |
| LiveTargetBlueprintV01 | NEW |
| SubjectLockObservationV01 | DEFER |
| BodyVisibilityGraphV01 | DEFER |
| SemanticAnchorSetV01 | DEFER |
| HumanObservationV02 | DEFER |
| LiveTargetV02 | DEFER |
| LiveConstraintStateV01 | DEFER |

The audit reuses `AssetRef`, `CandidateEnvelope`, `RealityContext`, `SelectedTarget`, `ShotDirection`, `FramePerception`, `CurrentShotState` and `LiveShotRuntime` where compatible. No equivalent contract was duplicated, and no locked M01 Schema was silently changed.

## Workflow and P01-P13 mapping

| Product stage | Machine states | P01-P13 support |
|---|---|---|
| REALITY_CAPTURE | ENTRY / SHOOTING_RELATION_DEVICE_MODE / REALITY | P01-P05 |
| AI_PHOTOGRAPHY_DIRECTOR | TARGET / SHOT | P06-P07 |
| LIVE_SHOOTING | LIVE / CAPTURE | P08-P09 |
| AI_PHOTO_QA + REALITY_PLUS | QA / REALITY_PLUS and retake edges | P10-P11 |
| USER_FINE_TUNE | FINE_TUNE | P12 |
| MY_FINAL_PHOTO | FINAL | P13 |

`packages/workflow/workflow-v1.json` remains the `LOCKED_M01` machine authority. The task adds explanatory mapping only and preserves all transition/retry semantics.

## Module isolation

The accepted architecture remains `Main Workflow / PhotographySession → Capability Port → replaceable Adapter → module implementation`. Communication is limited to versioned contracts, ports, adapters, DomainEvents and EvidenceRefs. Session stores domain state/lineage, never Scene solver state, Live CV runtime, provider objects or algorithm caches.

No source files under `D:\Projects\_worktrees\Ai_Photographer-scene-spatial` or `D:\Projects\_worktrees\Ai_Photographer-live` were mutated.

## Program roadmap

```text
GLOBAL REBASELINE
       ├─ LIVE V4 REBUILD
       ├─ SCENE SPATIAL → MAIN
       └─ AI DIRECTOR PARALLEL SPIKE
               ↓
       LIVE WECHAT + MAIN
               ↓
       NON-AI EXECUTABLE GOLDEN FLOW
               ↓
       AI MAIN INTEGRATION
```

Scene Spatial→Main is already `PASS_WITH_WARNING` and is retained as a satisfied prerequisite. Live V4 and AI Director spike remain not started. This task did not start child tasks.

## Input package reconciliation map

| Package document | Canonical repository destination / section |
|---|---|
| `00_README_AND_OWNER_DECISION_SUMMARY.md` | this report Decision; Product Flow V2 responsibility freeze |
| `01_PRODUCT_MASTER_FLOW_V2.md` | `docs/product-design/82-product-master-flow-v2.md` |
| `02_MODULE_RESPONSIBILITY_AND_DECOUPLING_V2.md` | `docs/architecture/83-capability-authority-and-contract-roadmap-v2.md` |
| `03_REALITY_CAPTURE_AND_SCENE_SPATIAL_ROLE_V2.md` | Product Flow V2 Reality Capture/Scene Spatial section; this report |
| `04_AI_PHOTOGRAPHY_DIRECTOR_V1.md` | Capability Authority V2 PhotographyDirectorPort section |
| `05_LIVE_HUMAN_OBSERVATION_TARGET_CONTROL_V4.md` | `docs/architecture/84-live-observation-target-control-v4.md` |
| `06_CAPTURE_QA_REALITY_PLUS_FINE_TUNE_V1.md` | Product Flow V2 post-capture authority section |
| `07_CONTRACT_EVENT_AND_STATE_MODEL_V2.md` | Capability Authority V2 contract audit, event and Session sections |
| `08_PROGRAM_PHASES_ROADMAP_AND_UPDATE_PLAN_V2.md` | `docs/project-management/45-product-program-roadmap-v2.md` |
| `09_CODEX_UPDATE_TASKS.md` | roadmap sequencing and this task report; no child task launched |

The package was adapted rather than copied wholesale so that current repository facts—especially completed Scene Spatial Main integration and locked M01 workflow/contracts—remain authoritative.

## Unresolved Source Required

- Live V4 schema/runtime semantics and independent browser/OPPO/WeChat evidence.
- AI Director controlled fixtures, candidate-quality evaluation and later provider admission.
- P3 Affordance evidence before exact safe physical stand-point claims.
- Fresh integrated WeChat phone-to-first-party-backend Scene Spatial evidence.
- Future contract catalog versioning for items marked NEW/DEFER.

## Validation scope

Only documentation/design metadata changed. Contract JSON Schemas and machine workflow JSON were not modified, so runtime evidence is not fabricated. Applicable validation consists of package integrity, JSON parsing, contract/workflow regression tests, documentation link/authority consistency checks and Git/source-worktree safety checks.

Results:

- input package SHA-256 manifest: 11/11 files PASS;
- `PROJECT_STATUS.json` and `workflow-v1.json` parse: PASS;
- all 32 cataloged JSON Schemas pass Draft 2020-12 meta-validation, identity uniqueness and catalog-ID matching;
- all 17 machine transitions reference declared states; initial/terminal states are valid;
- targeted M01 workflow, contract catalog and private-import isolation regression: 3/3 PASS;
- canonical document targets and required authority statements: PASS;
- `git diff --check`: PASS;
- Scene Spatial source worktree: clean at `68999dbc8c8332d789f7f74a094b2b02cd9cbae0`;
- Live source worktree: clean at `7798fa52634d01548961afae447b933620781b12`.
