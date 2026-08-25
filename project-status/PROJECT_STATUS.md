# 向风行｜Project Status

**Project Baseline:** V0.6 Complete  
**Current Product Prototype:** S01 V1.6.1  
**Current Milestone:** M03 — Replay E2E Lab
**Current Task:** XFX_M03_REPLAY_E2E_LAB_01

**Current Task Status:** PASS

**Overall Project Status:** IN_PROGRESS
**Primary Environment:** Windows First

## Milestones

| Milestone | Status | Gate |
|---|---|---|
| M00 Project Baseline | PASS | M00_BASELINE_LOCK = PASS |
| M01 Global Contracts | PASS | M01_CONTRACT_LOCK = PASS |
| M02 Application Skeleton | PASS | M02_SKELETON_RUNNABLE = PASS; FULLSTACK_VERTICAL_SLICE = PASS |
| M03 Fast Feedback Lab | PASS | M03_REPLAY_READY = PASS |
| M04 WeChat Camera/CV Spike | NOT_STARTED | M04_CAMERA_FEASIBILITY |
| M05 MVP Golden Flow | NOT_STARTED | M05_MVP_GOLDEN_FLOW |
| M06 Real Capability Replacement | NOT_STARTED | Capability Gates |
| M07 Cross-platform | NOT_STARTED | M07_CROSS_PLATFORM_BASELINE |

## Windows Bootstrap Acceptance

```text
Local Bootstrap: PASS
Remote Bootstrap: PASS
Actual Project Path: D:\Projects\Ai_Photographer
Baseline Version: 0.6
Package Type: COMPLETE_BASELINE
Initial SHA256: PASS (76/76)
Secret Scan: ACCEPTABLE
Git Identity: VERIFIED_LOCAL
main: PASS — tracking origin/main
develop: PASS — tracking origin/develop
Baseline Commit: 5b8a655f9d297d902941e5cb9d7a40143c3580e4
Acceptance Commit: 7491546ac527e1a73734b1b3a07d35001fd9967f
```

GitHub `origin` 已切换为 `ssh://git@ssh.github.com:443/linyiji/Ai_Photographer.git`。`main` 与 `develop` 已推送并分别跟踪 `origin/main`、`origin/develop`。

历史说明：HTTPS Git transport failed in current network. Resolved by switching repository remote transport to GitHub SSH over port 443.

## Backend Runtime L1 and M02 Full-stack Foundation

```text
Python: 3.14.7 — LOCKED_L1
uv: 0.12.5 — LOCKED_L1
FastAPI: 0.141.1 — LOCKED_L1
Pydantic: 2.13.4 — LOCKED_L1
Uvicorn: 0.52.4 — LOCKED_L1
pytest: 9.1.1 — LOCKED_L1
SQLite: M02_DEVELOPMENT_ADAPTER
Production DB: NOT_LOCKED
M02_SKELETON_RUNNABLE: PASS
FULLSTACK_VERTICAL_SLICE: PASS
S01 Browser E2E / refresh readback: PASS
H5: PASS_WITH_WARNING (entrypoint size advisory)
WeChat: PASS
Docker: MISSING
```

Feature evidence commits `aa891f3`, `70f1193`, and `7514f9d` were pushed. The feature branch was strict-fast-forward merged into `develop` and pushed; no merge commit or history rewrite was used.

Python 由 `uv` 管理并通过 fresh/frozen reproduction；`PYTHON_MISSING` 已移除。Docker 仍为 `ENVIRONMENT_GAP`，本任务未安装或使用。M02 使用 SQLite，不锁定生产数据库。

## Environment L0 Lock

```text
XFX_ENV_L0_LOCK: PASS
Node Manager: fnm
fnm Windows Evidence: 1.39.0
Node: 24.18.0
npm: 11.6.2
Default JS Package Manager: npm
Node Authority: .node-version
Future JS Package Authority: package.json packageManager = npm@11.6.2
Future Lock File: package-lock.json
Current Shell Verification: PASS
New Shell Reproducibility: PASS
Work Branch: feature/environment-l0
```

Environment L0 只复用 AtlasAnalyse 已验证且与产品 Runtime 无强绑定的工具链。未创建空 `package.json`，未采用 pnpm，未锁定 Taro/React/TypeScript/Python/Backend/Camera/CV。

## Frontend Runtime Compatibility Spike

```text
XFX_FRONTEND_RUNTIME_COMPATIBILITY_SPIKE: PASS
Taro: 4.2.1 — L1_CANDIDATE
React: 18.3.1 — L1_CANDIDATE
TypeScript: 5.9.3 — L1_CANDIDATE
React 19.2.6: FAIL — Taro React peer constraint requires React ^18
WeChat Build: PASS
H5 Build: PASS
Node 24 Compatibility: PASS_WITH_WARNING
Work Branch: spike/frontend-runtime-compatibility
```

这些版本尚未成为 Final Lock；正式 Authority 由下一 Gate 决定。未开始生产 Frontend、Camera/CV、Backend 或 M01。

Spike Commit `fe92d5af50ff3b0decd9196c79f71445a73e2ca9` 已通过 strict fast-forward 合入并推送至 `develop`。`XFX_FRONTEND_RUNTIME_COMPATIBILITY_SPIKE_MERGE_CLOSURE = PASS`。

## Frontend Runtime L1 Lock

```text
XFX_FRONTEND_RUNTIME_L1_LOCK: PASS
Taro: 4.2.1 — LOCKED_L1
React: 18.3.1 — LOCKED_L1
ReactDOM: 18.3.1 — LOCKED_L1
TypeScript: 5.9.3 — LOCKED_L1
Webpack Build Companion: 5.91.0 — VERIFIED
Fresh npm Reproduction: PASS
Dependency Tree: PASS
TypeScript Validation: PASS_WITH_DOCUMENTED_BOUNDARY
WeChat Build: PASS
H5 Build: PASS_WITH_WARNING
React 19.2.6: FAIL — NEGATIVE_EVIDENCE_PRESERVED
Work Branch: feature/frontend-runtime-l1-lock
Source Commit: 5436f188184c718e2fe527369d749f8ef071043c
Merge Closure: PASS
Merged To: develop
```

本 Gate 只提升已验证 Candidate；未搜索新版本、未创建正式应用 Skeleton、未开始 M01 或 Live Physical Agent。

## Independent Live Parallel Track

```text
Status: LIVE_P0_PASS_EVIDENCE_INGESTED
Worktree: D:\Projects\_worktrees\Ai_Photographer-live
Branch: spike/live-physical-agent-mvp-v0.1
Evidence Commit: 5b4aba45065dc49d435e4790e807e9a5a4ad2d3c
Closure Read-only Observed Head: c439e7877ca64f87b7c5bc32667f5b7cd1e78961 (independent parallel advancement)
Real Device Gate: PASS — OPPO K11 / ColorOS 15 / Chrome Mobile
Warnings: Late / Drop ~= 220 / 14; Vite Script Error x2, ROOT_CAUSE_UNCLASSIFIED
LIVE-P1: NOT_STARTED
Integration: NOT_STARTED
```

该并行 Track 在本任务期间独立前进；本 Task 未 checkout、reset、rebase、merge、delete、prune、导入或修改其 worktree/branch。

## M01 Global Contracts Lock

```text
XFX_M01_GLOBAL_CONTRACTS_LOCK_01: PASS
M01_CONTRACT_LOCK: PASS
Canonical Representation: JSON Schema 2020-12
Contract Catalog: PASS
Mandatory Contract Coverage: 21/21
Unique Schema Identity: PASS
Unresolved Local References: 0
Workflow V1: PASS
Workflow Transition Validation: PASS
Candidate Governance: PASS
State Authority Matrix: PASS
Domain Event Catalog: PASS
Error Contract: PASS
Platform Contract Catalog: PASS
Duplicate Active Contract Authority: 0
Production Skeleton Created: 0
Work Branch: feature/m01-global-contracts-lock
Source Commit: f80edf68d3de046c76fdcf30ce60c91393904369
Merge Closure: PASS
Merged To: develop
```

M01 已冻结 `AI_OUTPUT_DEFAULT_STATE = CANDIDATE`、`SelectedTarget = WHAT`、`ShotDirection = HOW` 和 `PhotographySession != LiveShotRuntime`。持久化 Session 保存接受后的业务状态与资产 Lineage；高频 FramePerception、CurrentShotState 和 LiveShotRuntime 由客户端临时 Authority 管理，Backend 不进入逐帧热路径。

Schema、Workflow 与 Platform Catalog 均为语言中立的机器 Authority。未来 TypeScript、Pydantic、OpenAPI、数据库映射或 Runtime Validator 只能作为投影，不能成为冲突的第二 Authority。没有创建正式 App Skeleton、Backend、Camera/CV 或 Provider 实现。

## Codex Execution Governance

```text
XFX Codex Execution Standard V1: ACTIVE
Canonical Model: COMMON EXECUTION CORE + TASK PROFILE + TASK CONTRACT
Profiles: 11
Templates: 6
Governance Source Commit: c32846397898c1b792741e1614f65ae13598ecb6
Merged Target: develop
Governance Merge Closure: PASS
AtlasAnalyse Source Status: REFERENCE_SOURCE
Frontend Runtime L1: LOCKED_L1
```

治理标准保留 React 19.2.6 失败证据，并明确 `CANDIDATE_RESULT != TASK_RESULT`、`Candidate != Authority` 与 `SPIKE_PASS != VERSION_LOCK`。

## Challenge Status

`project-status/CHALLENGES.json` 未修改。CH-003 保持 `IDENTIFIED`；M03 不验证 Camera Frame、CV FPS 或设备性能。CH-011 仍为 `SOLUTION_PROPOSED`：Manifest 驱动回归实验室已建立，但真实资产迁移尚未发生。

## M03 Replay E2E Lab

```text
M03_REPLAY_READY: PASS
Replay modes: FROM_SCRATCH / FROM_CHECKPOINT / FAULT_INJECTED / DRY_EVALUATION
Scenario Manifest: V2
Scenario Matrix: 12 / PASS
Multi-run determinism: PASS
Unexpected semantic diff: 0
Checkpoint resumes: 3 / PASS
Fault injection / transaction rollback / idempotency mismatch: PASS
Trace / semantic diff / deterministic evaluation: PASS
Backend tests: 33 PASS
H5 Replay Lab browser E2E: PASS
Normal S01 browser regression: PASS
Lab default disabled: PASS
Production Lab block: PASS
H5 entry: 307633 → 307814 bytes
H5 Lab lazy page chunk: 61412 bytes
```

Replay 仍调用 M02 的 Session/Workflow/Capability/Persistence 路径；每次运行使用隔离 SQLite。没有 arbitrary SQL/file/code endpoint，没有 Provider 调用或真实媒体。M01、M02、main 与 Live worktree 保持不变，CH-003 仍为 `IDENTIFIED / UNCHANGED`。

Feature commits `7e3e5a8`, `36c971d`, `a4a36d0` 已推送，并 strict-fast-forward 合入及推送至 `develop`；没有 merge commit、rebase 或历史改写。

```text
Challenges Addressed: Windows Bootstrap / repository integrity
Challenges Introduced: NONE
Challenges Reopened: NONE
```

## Next Recommended Task

```text
XFX_M04_PLATFORM_ADAPTER_AND_REAL_CAPABILITY_INTEGRATION_FOUNDATION_01
```

这里只记录下一主流程任务；本次不开始 M03，不修改 `main`。Live Parallel Track 保持独立，CH-003 仍为 `IDENTIFIED / UNCHANGED`。
