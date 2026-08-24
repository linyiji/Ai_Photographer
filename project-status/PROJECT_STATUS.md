# 向风行｜Project Status

**Project Baseline:** V0.6 Complete  
**Current Product Prototype:** S01 V1.6.1  
**Current Milestone:** M01 — Global Contracts
**Current Task:** XFX_M01_GLOBAL_CONTRACTS_LOCK_MERGE_CLOSURE

**Current Task Status:** PASS

**Overall Project Status:** IN_PROGRESS
**Primary Environment:** Windows First

## Milestones

| Milestone | Status | Gate |
|---|---|---|
| M00 Project Baseline | PASS | M00_BASELINE_LOCK = PASS |
| M01 Global Contracts | PASS | M01_CONTRACT_LOCK = PASS |
| M02 Application Skeleton | NOT_STARTED | M02_SKELETON_RUNNABLE |
| M03 Fast Feedback Lab | NOT_STARTED | M03_REPLAY_READY |
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

## Environment Gaps

```text
Python: MISSING
Docker: MISSING
```

Python 与 Docker 只记录为 `ENVIRONMENT_GAP`；未自动安装，不影响 Environment L0 PASS。

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
Status: RUNNING_IN_SEPARATE_WORKTREE
Worktree: D:\Projects\_worktrees\Ai_Photographer-live
Branch: spike/live-physical-agent-mvp-v0.1
Admission Observed Head: 8e5ef051570a222424e428c1f8c5a95ebed7e46b
Integration: NOT_STARTED
```

该并行 Track 不属于 M01 Contract Lock；本 Task 未 checkout、reset、rebase、merge、delete、prune、导入或修改其 worktree/branch。

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

`project-status/CHALLENGES.json` 未修改。CH-003 保持 `IDENTIFIED`；M01 仅冻结语言和边界，没有验证 Camera Frame、CV FPS 或设备性能。CH-011 仍为 `SOLUTION_PROPOSED`，因为真实资产迁移和 M03 Manifest 驱动验收尚未发生。

```text
Challenges Addressed: Windows Bootstrap / repository integrity
Challenges Introduced: NONE
Challenges Reopened: NONE
```

## Next Recommended Task

```text
XFX_BACKEND_RUNTIME_L1_LOCK_01
```

Following Main Task:

```text
XFX_M02_FULLSTACK_VERTICAL_SLICE_01
```

这里只记录下一主流程顺序；本次不开始 Backend Runtime Lock 或 M02，不修改 `main`。Live Parallel Track 保持独立运行。
