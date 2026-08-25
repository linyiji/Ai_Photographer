# GPT / Codex Handoff

**Baseline:** V0.6 Complete  
**Current Milestone:** M06 — PROVIDER DEFERRED / FRONTEND SIMPLIFICATION

**Current Task:** XFX_MAIN_M06_PROVIDER_DEFERRED_AND_FRONTEND_SIMPLIFICATION_01 — PASS_WITH_WARNING

## Project Context

向风行是 Reality First AI Photographer。

## Architecture Authority

- Golden Flow
- PhotographySession
- SelectedTarget = WHAT
- ShotDirection = HOW
- Local CV First
- Capability-based architecture
- Global Contract + Modular Capability
- AI Candidate → Validation → Accepted State

## Current Runtime

Windows TASK 00 已完成本地与远程 Bootstrap。

```text
Project Root: D:\Projects\Ai_Photographer
LOCAL_BOOTSTRAP: PASS
REMOTE_BOOTSTRAP: PASS
M00_BASELINE_LOCK: PASS
Remote: ssh://git@ssh.github.com:443/linyiji/Ai_Photographer.git
main: tracking origin/main
develop: tracking origin/develop
```

Remote transport history:

HTTPS Git transport failed in current network.

Resolved by switching repository remote transport to GitHub SSH over port 443.

Environment L0 is locked:

```text
XFX_ENV_L0_LOCK: PASS
Node Manager: fnm
Node: 24.18.0
npm: 11.6.2
Default JS Package Manager: npm
Authority: .node-version
New Shell Reproducibility: PASS
```

## Completed

- Product Design Baseline
- Golden Flow
- Story A-F
- Technical Architecture Research
- S01 Prototype V1.6.1
- Progress Governance
- Challenge Governance
- Project Control Center Prototype
- Framework Integration Proposal
- Windows local repository Bootstrap
- GitHub Remote Bootstrap through SSH over port 443
- Baseline Commit `5b8a655f9d297d902941e5cb9d7a40143c3580e4`
- Acceptance Commit `7491546ac527e1a73734b1b3a07d35001fd9967f`
- Environment L0 toolchain lock and cross-platform matrix
- Frontend Runtime Compatibility Spike: Taro 4.2.1 + React 18.3.1 + TypeScript 5.9.3 validated as an L1 Candidate
- WeChat and H5 compiler pipelines with shared runtime probe
- Frontend Compatibility Spike strict-fast-forward merged and pushed to `develop` at `fe92d5af50ff3b0decd9196c79f71445a73e2ca9`
- XFX Codex Execution Standard V1 canonicalized with 11 Profiles and 6 Templates
- Governance commit `c32846397898c1b792741e1614f65ae13598ecb6` strict-fast-forward merged into `develop`
- XFX Codex Execution Standard V1 promoted from `ACTIVE_CANDIDATE` to `ACTIVE`
- Frontend Runtime L1 promotion Gate passed through fresh lock-file reproduction, dependency validation, TypeScript, WeChat, and H5 builds
- Frontend Runtime L1 commit `5436f188184c718e2fe527369d749f8ef071043c` strict-fast-forward merged and pushed to `develop`
- M01 Global Contracts V1 frozen as 21 language-neutral JSON Schema 2020-12 contracts
- Workflow V1 frozen with 11 stages, legal transitions, all QA decisions, and partial-retake preservation semantics
- Candidate governance, persistent/ephemeral State Authority, Domain Event catalog, Error Contract, asset lineage, evaluation, and 11 platform capability contracts frozen
- Backend Runtime L1 locked at Python 3.14.7, uv 0.12.5, FastAPI 0.141.1, Pydantic 2.13.4, Uvicorn 0.52.4, and pytest 9.1.1
- M02 Taro P01–P13 product shell, FastAPI capability seams, SQLite persistence, domain events, asset lineage, deterministic S01 fixture, idempotency, and partial-retake flow
- S01 real browser network flow reached FINAL; refresh read back revision 11, 3 assets, and 12 events from SQLite
- H5 and WeChat builds passed; H5 retained a non-blocking entrypoint-size advisory
- Feature evidence through `7514f9d1d40c0d8508a67b2a84cc695f64c1056a` strict-fast-forward merged and pushed to `develop`
- M03 Replay/E2E Lab: versioned 12-scenario matrix, governed replay engine, 3 checkpoint resumes, typed fault injection, traces, semantic diff, deterministic evaluation, isolated SQLite, and H5 Dev Lab
- M03 backend regression: 33 tests PASS; multi-run unexpected semantic diff = 0; normal S01 and Lab browser E2E PASS
- Lab is disabled by default and blocked in production; its H5 page is isolated in a 61412-byte lazy chunk while entry increased only 181 bytes
- M03 feature head `a4a36d0eebf110545cd4d5e1569f24d43dfde129` strict-fast-forward merged and pushed to `develop`
- M04 governed PlatformAdapterRegistry with H5/WeChat/Test profiles, availability, support levels, provenance, normalized errors, and FAKE/REAL/EXPERIMENTAL/UNAVAILABLE selection
- Real development binary path: bounded multipart JPEG/PNG/WebP upload, SHA256 metadata, stable local storage ref, safe read/download, real Capture action, Final download/share, and Session-scoped asset lineage
- M04 Lab platform extension: 8 deterministic profiles and 12 adapter scenarios; M03 deterministic Replay remains MATCH
- M04 validation: 70 backend tests and 5 frontend platform tests PASS; H5 binary browser E2E, refresh/readback, partial retake, Lab E2E, TypeScript, H5 and WeChat builds PASS (H5 retained size warning)
- M04 feature head `95df89afd1834397d27ab552273d13195eb3901d` strict-fast-forward merged and pushed to `develop`; remote feature evidence retained
- M05 real user Golden Flow implementation and automated gate: backend 76/76, frontend 11/11, TypeScript, H5/WeChat builds, M05 Replay 12/12, deterministic regressions, Production fake-AI gate, and desktop E2E PASS
- M05 OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.7204.168 user-operated trusted-HTTPS gate PASS: permission timing, rear/front/switch, close/reopen, still/local retake, import, rotation, exactly-once confirmation, explicit backend resume, Final, My Works, download, and share/fallback
- Mobile acceptance API topology bounded fix `73c8782bca4600288c18526c7eefcb8f8366091c`; ephemeral tunnel origins remained build-only and no real user media was committed
- M05 feature acceptance head `db8c51f07a81e2b9f06635627c650dc3f21f7dca` strict-fast-forward merged from `46393ce0a37bb9e339933679438ff57f58c1e835` into `develop` and pushed; `main` and protected parallel worktrees remained unchanged
- M06 provider-neutral AI Capability Gateway, versioned Prompt/Model Registry, non-secret execution records, bounded retry/error normalization, Capture QA Candidate adapter, mandatory shadow invariant, 22-case controlled evaluator, and M03 AI Lab modes implemented on `feature/m06-real-capability-wave`
- M06 fixture QA evaluation PASS: schema 100%, disposition 100%, critical must-detect 100%, invented reality facts 0, retake false negatives 0; Shadow Session mutation 0 and normal Replay provider calls 0
- No explicit provider/model/credential configuration was present in the original M06 run; its `READY_FOR_PROVIDER_ACCEPTANCE` report remains historical evidence
- A later explicit owner decision defers the real provider for the Phase-1 non-AI complete product; M06 infrastructure is accepted, QA remains `FAKE_INTERNAL_ONLY`, and provider calls remain zero
- Frontend interaction is simplified to START/SHOOT/REVIEW/FINAL with persisted preferences, Session-only overrides, Quick Settings, explicit Resume, conditional fallback, preserved local confirmation, and legal backend-action auto advance
- Simplification validation: Backend 94/94, Frontend 20/20, TypeScript PASS, H5 PASS_WITH_WARNING, WeChat PASS, Desktop E2E PASS, console errors 0, backend invariance PASS

## M01 Contract Authority

```text
M01_CONTRACT_LOCK: PASS
Branch: feature/m01-global-contracts-lock
Start Head: 4eeb5f0ebf532dae81df0cd84f834d4ac92f6459
Source Commit: f80edf68d3de046c76fdcf30ce60c91393904369
Merge Closure: PASS
Merged To: develop
Canonical Contracts: packages/contracts/catalog.json
Schemas: packages/contracts/schemas/*.schema.json
Workflow: packages/workflow/workflow-v1.json
Platform Catalog: packages/platform/catalog.json
Mandatory Coverage: 21/21
Unresolved Local References: 0
Duplicate Active Contract Authority: 0
Production Skeleton Created: 0
```

Frozen semantics: `AI_OUTPUT_DEFAULT_STATE = CANDIDATE`; Candidate is not accepted truth; `SelectedTarget = WHAT`; `ShotDirection = HOW`; `PhotographySession != LiveShotRuntime`. The backend persists meaningful accepted state and events, never the per-frame hot path. Future language/runtime types are projections of JSON Schema, not new Authority.

## Frontend Runtime L1 Authority

```text
XFX_FRONTEND_RUNTIME_L1_LOCK: PASS
Taro: 4.2.1 — LOCKED_L1
React: 18.3.1 — LOCKED_L1
ReactDOM: 18.3.1 — LOCKED_L1
TypeScript: 5.9.3 — LOCKED_L1
Webpack: 5.91.0 — VERIFIED BUILD COMPANION
React 19.2.6: FAIL — negative evidence preserved
Authority: docs/environment/63-frontend-runtime-l1-lock.md
Merge Closure: PASS
Merged To: develop
```

## Independent Live Parallel Track

```text
Status: LIVE_P0_PASS_EVIDENCE_INGESTED
Worktree: D:\Projects\_worktrees\Ai_Photographer-live
Branch: spike/live-physical-agent-mvp-v0.1
Evidence Commit: 5b4aba45065dc49d435e4790e807e9a5a4ad2d3c
Closure Read-only Observed Head: c439e7877ca64f87b7c5bc32667f5b7cd1e78961
Real Device Gate: PASS — OPPO K11 / ColorOS 15 / Chrome Mobile
Warnings: Late / Drop ~= 220 / 14; Vite Script Error x2 / ROOT_CAUSE_UNCLASSIFIED
LIVE-P1: NOT_STARTED
Integration: NOT_STARTED
Merge Closure Action: UNTOUCHED
```

Live evidence remains an independent experimental track and advanced independently while M02 ran. Future integration must start from then-current `develop`; this task did not update, merge, or rewrite the Live branch.

## M04 Platform Integration Authority

```text
Platform Matrix: docs/platform/70-platform-capability-matrix-v1.0.md
Integration Governance: docs/architecture/71-real-capability-integration-governance-v1.0.md
Platform Catalog Authority: packages/platform/catalog.json / PRESERVED
Local Storage Adapter: DEVELOPMENT_LOCAL_STORAGE_ADAPTER
Production Object Storage: NOT_LOCKED
H5 Camera Real Device: PASS / TESTED_SCOPE_OPPO_K11_CHROME_138
WeChat Real Device: UNVERIFIED_REAL_DEVICE
Fake Live Selected: PASS
M01 / M02 / M03: PRESERVED
```

M04 does not accept Live/CV, Voice, Agent, real Reality+, payment, external auth, or production infrastructure. Browser download is not called system-album save. WeChat compilation is not device acceptance. CH-003 remains `IDENTIFIED / UNCHANGED`.

## Governance Authority

```text
PROMPT_STANDARD: XFX_CODEX_EXECUTION_STANDARD_V1
Model: COMMON EXECUTION CORE + TASK PROFILE + TASK CONTRACT
Authority status: ACTIVE on develop
Source branch: governance/codex-execution-standard-v1
Source commit: c32846397898c1b792741e1614f65ae13598ecb6
Source provenance: AtlasAnalyse package = REFERENCE_SOURCE
Frontend L1 versions: LOCKED_L1
React 19.2.6: retained negative evidence (FAIL)
```

## Known Issues

## M05 Real Device Closure

```text
Branch: feature/m05-real-user-golden-flow
Acceptance Start Head: 803cbf563eea2eacb2f0ae15833b4c30db8f73f7
Device Test Head: 73c8782bca4600288c18526c7eefcb8f8366091c
Implementation Gate: PASS
Real Device Gate: PASS
M05 Final Gate: PASS
INTERNAL_USER_GOLDEN_FLOW_READY: YES
PUBLIC_PRODUCTION_READY: NO
Auto FF Merge: PASS
Develop Merge Result: db8c51f07a81e2b9f06635627c650dc3f21f7dca
Device: OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.7204.168
Checklist: docs/platform/72-h5-camera-and-capture-user-acceptance-v1.0.md
Evidence: project-status/evidence/m05/h5-real-device-oppo-k11.md
```

The user operated the phone; no phone behavior was inferred. Server evidence proves zero unconfirmed upload and exactly one upload/commit per confirmed local candidate. The accepted Session also exercised a governed QA micro-retake, producing a second separately authorized still after `RETAKE_MICRO_COMMITTED`. No raw video/frame stream, provider call, secret, tunnel hostname, or real test photo was committed. H5 Camera acceptance is limited to the named OPPO K11 scope; WeChat remains unverified, production DB/object storage remain unlocked, and `PUBLIC_PRODUCTION_READY` remains false.

## M06 AI Capability Admission

```text
Branch: feature/m06-real-capability-wave
Start Head: 24b28b9107af2c7c99bd9eb4215f6190e68f241e
Status: PASS_PHASE1_PROVIDER_DEFERRED
Implementation Gate: PASS
Real Provider Gate: DEFERRED_BY_PRODUCT_DECISION
QA Promotion Gate: DEFERRED
M06 Infrastructure Gate: PASS
Provider / Model / Credential: NOT_CONFIGURED
Canonical QA: FAKE_INTERNAL_ONLY
Fixture Shadow: PASS / Session mutation 0
Controlled Cases: 22 / PASS
Real Provider Calls: 0
Regression: Backend 94 / 94; Frontend 11 / 11; TypeScript PASS; H5 PASS_WITH_WARNING; WeChat PASS
Browser Real-QA Flow: NOT_RUN
PUBLIC_PRODUCTION_READY: NO
Merge: PASS / develop 0b5501eb46d495f934b8fa8ad63c5034b7953050
```

Authority: `docs/architecture/73-real-capability-admission-matrix-v1.0.md`, `docs/ai/74-ai-capability-gateway-v1.0.md`, and `docs/ai/75-capture-qa-real-adapter-v1.0.md`. QA may consume only an accepted uploaded CaptureAsset; unconfirmed still, raw video, and frame stream provider paths are blocked. Fixture metrics never substitute for real-model quality. Reality/Shot remain blocked by contract/input gaps, Target by provider absence, and Live/Reality+/Fine Tune by their parallel gates.

以：

```text
project-status/CHALLENGES.json
```

为权威。

## Next Task

Next Recommended Task:

```text
XFX_LOCAL_FINE_TUNE_INTEGRATION_01
```

不要自动执行下一任务。Real Provider 已按产品决定延期；下一步是受控 Local Fine Tune Integration。M01 Contract Authority、Workflow V1、Platform Catalog 与 Backend Session Authority 保持不变；Live/Fine Tune/AI Visual 并行 worktree 未触碰，CH-003 保持 `IDENTIFIED / UNCHANGED`。
