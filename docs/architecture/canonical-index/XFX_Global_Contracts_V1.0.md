# XFX Global Contracts V1.0

**Document ID:** `XFX_GLOBAL_CONTRACTS_V1`

**Status:** `LOCKED_M01`

**Machine Authority:** `packages/contracts/catalog.json` and its referenced JSON Schemas

## Scope

This Authority freezes the shared language used by future Client, Web Lab, Backend, AI/CV capabilities, evaluation, and platform adapters. It freezes semantics and data shape only; no application, backend, database, camera, CV, provider, or platform implementation is created by M01.

Canonical representation is JSON Schema 2020-12. Future TypeScript, Pydantic, OpenAPI, persistence, or runtime validators are projections and may not silently redefine the contracts.

## Contract catalog

| Domain | Canonical contracts |
|---|---|
| Control | PhotographySession, WorkflowState, DomainEvent, ErrorContract, CandidateEnvelope |
| Reality / Target / Shot | RealityContext, SelectedTarget, ShotDirection |
| Live | FramePerception, CurrentShotState, LiveShotRuntime |
| Capture / QA | CaptureAsset, CaptureDecision, RetakePlan |
| Post / Final | RealityPlusAsset, AdjustmentRecipe, MyFinalPhoto |
| Asset / Evaluation | AssetRef, AssetManifest, ScenarioManifest, EvaluationResult |

The catalog contains 21 top-level contracts. Each has one active name, version, unique schema identity, and one canonical file path.

## Version rule

- Schema versions use semantic versioning.
- Compatible optional additions require a minor version; clarifications that do not change shape require a patch version.
- Breaking meaning, required-field, enum-removal, or identity changes require a new major schema and an explicit contract revision task.
- No active duplicate schema may claim the same canonical name or identity.

## Candidate promotion rule

`AI_OUTPUT_DEFAULT_STATE = CANDIDATE`.

A Candidate is evidence-bearing proposed output, not persistent accepted workflow truth. Promotion requires an explicit gate:

| Candidate kind | Gate | Accepted state |
|---|---|---|
| REALITY_OBSERVATION | schema, fact, and safety validation | RealityContext |
| TARGET | reality feasibility, safety, ShotDirection feasibility, and user selection | SelectedTarget |
| QA | technical evidence and policy validation | CaptureDecision |
| ENHANCEMENT | identity, reality-fact, and visual QA | RealityPlusAsset |

The common CandidateEnvelope carries producer identity without credentials, confidence when meaningful, evidence references, payload, disposition, and promotion gate.

## Workflow semantics

`SelectedTarget = WHAT`; `ShotDirection = HOW`. Workflow stage, transition action, and accepted domain state are separate concepts. `packages/workflow/workflow-v1.json` defines the 11 stages and all legal transitions, including partial retake routes.

Technical QA is separate from user taste. The accepted QA vocabulary is `ACCEPT`, `ACCEPT_WITH_REPAIR`, `RETAKE_MICRO`, `RETAKE_POSE`, `RETAKE_FRAMING`, `RETAKE_POSITION`, and `REPLAN`.

## Persistent and ephemeral boundary

`PhotographySession != LiveShotRuntime`.

PhotographySession is a thin persistent aggregate of accepted business references and asset lineage. LiveShotRuntime is client/mobile ephemeral authority for per-frame observation, difference, instruction stabilization, and readiness. FramePerception and CurrentShotState are local high-frequency state; only meaningful transitions or bounded snapshots become events. The backend is never the per-frame hot path.

This preserves: **AI plans sparsely; vision tracks continuously.** Live contracts are provider and algorithm independent.

## Asset lineage

Stable `asset_id`, version, status, integrity, storage reference, producer, and source asset identities define lineage. The lifecycle is `SOURCE → CANDIDATE → ACCEPTED → DERIVED → FINAL`. Local absolute file paths and embedded image bytes are not canonical identity.

RealityPlusAsset keeps capture lineage and a Reality Fact Lock: same person, action, place, weather, and time feeling. AdjustmentRecipe is deterministic and cannot authorize semantic/generative edits. MyFinalPhoto references the selected final asset and full lineage.

## Platform contract rule

Shared capabilities depend on the language-neutral catalog in `packages/platform/catalog.json`. Platform implementations may differ, but shared contracts do not contain platform runtime calls, DOM-only APIs, or provider details.

## Non-goals

M01 does not create production applications, APIs, persistence, UI, Camera/CV, AI providers, Auth, Payment, or storage implementations. It does not integrate the independent Live spike and does not resolve CH-003.

## Projection rule

Future tasks may generate TypeScript types, Pydantic models, OpenAPI, database mappings, or runtime validators from this Authority. A projection must record the source schema identity/version, preserve nullability and enum semantics, and fail validation on drift. Projection code is never a second Authority.
