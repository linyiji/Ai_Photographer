# GPT / Codex Handoff

**Baseline:** V0.6 Complete  
**Current Milestone:** M04 — PASS

**Current Task:** XFX_M04_PLATFORM_ADAPTER_AND_REAL_CAPABILITY_INTEGRATION_FOUNDATION_01 — PASS

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
H5 Camera Real Device: UNVERIFIED_REAL_DEVICE
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

以：

```text
project-status/CHALLENGES.json
```

为权威。

## Next Task

Next Recommended Task:

```text
XFX_M05_REAL_ASSET_CAPTURE_AND_USER_GOLDEN_FLOW_01
```

不要自动执行下一任务。M01 Contract Authority 与 Frontend Runtime L1 保持不变。M04 只建立 real platform capability hosting foundation；真实 Camera/CV、AI Provider、Voice、Dual Device、Reality+、生产数据库和 Live 集成均未启动。Live worktree 未被触碰；CH-003 保持 `IDENTIFIED / UNCHANGED`。
