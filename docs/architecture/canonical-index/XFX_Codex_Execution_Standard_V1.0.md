# XFX Codex Execution Standard V1.0

## Metadata

```text
PROMPT_STANDARD=XFX_CODEX_EXECUTION_STANDARD_V1
VERSION=V1.0
STATUS=ACTIVE_CANDIDATE
AUTHORITY_LEVEL=EXECUTION_GOVERNANCE_CANDIDATE
PROJECT=AI_PHOTOGRAPHER
```

This is the single canonical entry for XFX Codex execution governance. It supplements, and never replaces, product, architecture, runtime, asset, environment, challenge, or release authorities.

Provenance: the execution pattern was generalized from `AtlasAnalyse_Codex_Execution_Standard_V1.0_Package`, which remains `REFERENCE_SOURCE`. No AtlasAnalyse product, business, database, provider, deployment, or runtime choice is inherited.

## Canonical model

```text
COMMON EXECUTION CORE
        +
TASK PROFILE
        +
TASK CONTRACT
```

```text
WHAT       = LOCKED
BOUNDARY   = LOCKED
ACCEPTANCE = LOCKED
HOW        = CODEX_DECIDES_WITHIN_SCOPE
```

The Common Core owns repeated execution discipline. A Profile owns domain-specific gates and context. A Task Contract contains only the current objective, boundary, authorities, deterministic acceptance, explicit authorization, checkpoint, and next task.

## Authority precedence

```text
Current explicit Task Contract
↓
AGENTS.md
↓
Current XFX canonical authority
↓
Current accepted project evidence
↓
Bootstrap proposal
↓
External reference source
```

An unresolved conflict is `BLOCKED_AUTHORITY_CONFLICT`. Governance must not modify Golden Flow, Product Prototype, Architecture Authority, or accepted runtime evidence to make a task easier.

## XFX product invariants

- Reality First and Capture Causality: better capture enables a better final result.
- AI owns expertise; the user owns taste.
- `SelectedTarget = WHAT`; `ShotDirection = HOW`.
- Realtime Guidance is not realtime large-model inference.
- AI plans sparsely; vision tracks continuously.
- Identity is conservative; environment is flexible only inside explicit Reality+ constraints.
- Reality+ preserves the same person, action, place, weather, and time feeling unless a separately authorized creative mode says otherwise.
- `AI_OUTPUT_DEFAULT_STATE = CANDIDATE`.

## Candidate governance

```text
CANDIDATE_RESULT != TASK_RESULT
CANDIDATE != AUTHORITY
SPIKE_PASS != VERSION_LOCK
```

Component validation states are `PASS`, `PASS_WITH_WARNING`, `FAIL`, `SOURCE_REQUIRED`, and `NOT_TESTED`. They do not replace the project Task Status enum.

Negative evidence must be retained with the tested candidate, changed variables, result, warnings, failure reason, replacement candidate, evidence, recommendation, and authority state. Compatibility diagnosis changes the minimum variables needed to preserve causality. When a task targets multiple runtimes, every named runtime must satisfy its acceptance gate.

The completed frontend spike is the canonical example: React 19.2.6 failed while the overall discovery task passed after React 18.3.1 satisfied both WeChat and H5 builds. Taro 4.2.1, React 18.3.1, and TypeScript 5.9.3 remain `L1_CANDIDATE`, not locked Authority.

## XFX authority dimensions

Every relevant task declares or inherits:

```text
RUNTIME_TARGET
DEVICE_AUTHORITY
ASSET_AUTHORITY
REPLAY_AUTHORITY
PROVIDER_AUTHORITY
DATABASE_AUTHORITY
PREVIEW_AUTHORITY
PRODUCTION_AUTHORITY
```

Dependencies never expand authority implicitly.

## Profiles

V1 profiles are:

```text
DOCUMENT_ENGINEERING
ENVIRONMENT_TOOLCHAIN
FRONTEND_RUNTIME_COMPATIBILITY
FE_VISUAL_PRODUCT
FULLSTACK_INTEGRATION
BACKEND_DATA_CHANGE
AI_RUNTIME_ENGINEERING
AI_EVAL_END_TO_END
REALTIME_CAMERA_CV
QA_CERTIFICATION
RELEASE_DEPLOYMENT
```

The minimal context for each profile is defined by `XFX_Codex_Profile_Context_Loading_Map_V1.0.md`.

## Validation separation

```text
MODEL_QUALITY_GATE
!= PRODUCT_FLOW_GATE
!= REAL_DEVICE_GATE
!= PHOTOGRAPHY_QUALITY_GATE
!= REALITY_PRESERVATION_GATE
```

Fixture success is not real-device success. Build success is not Camera/CV feasibility. Automated checks do not replace an explicitly required Product Owner visual review.

## Lifecycle and versioning

Documentation lifecycle is `DRAFT → ACTIVE → FROZEN → SUPERSEDED → ARCHIVE`. This V1 begins as `ACTIVE_CANDIDATE`. Compatible additions use V1.x; execution-contract-breaking changes use V2.0. Historical frozen semantics are never silently rewritten.

## Current runtime authority boundary

Node 24.18.0 and npm 11.6.2 are locked L0 Authority. Taro 4.2.1, React 18.3.1, and TypeScript 5.9.3 are evidence-backed L1 candidates only. React 19.2.6 is retained rejected-candidate evidence. Promotion belongs solely to `XFX_FRONTEND_RUNTIME_L1_LOCK_01`.

## Stop boundary

Execution stops when the current contract reaches `NEXT_TASK`. A completed compatibility spike does not start a production frontend; a Web Lab does not start Camera work; Preview does not authorize Production. Cross-role dependencies become handoffs, not silent scope expansion.
