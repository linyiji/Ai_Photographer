# 向风行｜Project Status

**Project Baseline:** V0.6 Complete  
**Current Product Prototype:** S01 V1.6.1  
**Current Milestone:** Product Master Flow V2 Global Rebaseline
**Current Task:** XFX_MAIN_PRODUCT_MASTER_FLOW_AND_CAPABILITY_AUTHORITY_REBASELINE_06

**Current Task Status:** PASS_WITH_WARNING

**Overall Project Status:** IN_PROGRESS
**Primary Environment:** Windows First

## Milestones

| Milestone | Status | Gate |
|---|---|---|
| M00 Project Baseline | PASS | M00_BASELINE_LOCK = PASS |
| M01 Global Contracts | PASS | M01_CONTRACT_LOCK = PASS |
| M02 Application Skeleton | PASS | M02_SKELETON_RUNNABLE = PASS; FULLSTACK_VERTICAL_SLICE = PASS |
| M03 Fast Feedback Lab | PASS | M03_REPLAY_READY = PASS |
| M04 Platform Adapter Integration Foundation | PASS | M04_PLATFORM_ADAPTER_FOUNDATION = PASS |
| M05 MVP Golden Flow | PASS | Implementation PASS; Real Device PASS; M05 Final Gate PASS |
| M06 Real Capability Replacement | PASS | Infrastructure PASS; Provider DEFERRED_BY_PRODUCT_DECISION |
| M07 Cross-platform | NOT_STARTED | M07_CROSS_PLATFORM_BASELINE |

## Product Master Flow V2 Rebaseline

```text
Product Flow V2: PASS
Five-stage user flow: PASS
Module responsibility map: PASS
Non-AI best-shot discovery: NO
Non-AI Shot Plan execution: YES
Scene Spatial role: REALITY_EVIDENCE_PROVIDER / PASS
Scene Spatial direct LiveTarget: FORBIDDEN
P3: NOT_STARTED
Live V3 device gate / runtime: FAIL / NOT_PROMOTED
Live V4 architecture target: DOCUMENTED / IMPLEMENTATION_NOT_STARTED
AI Director role: SHOT_PLAN_DECISION_OWNER
AI Director Port design: PASS / SPIKE_NOT_STARTED
Observation / Target / Control separation: PASS
Provider / Luna: 0 / 0
```

Canonical authority is now `docs/product-design/82-product-master-flow-v2.md`, `docs/architecture/83-capability-authority-and-contract-roadmap-v2.md`, `docs/architecture/84-live-observation-target-control-v4.md`, and `docs/project-management/45-product-program-roadmap-v2.md`. M01 machine states remain unchanged and support, rather than duplicate, the user-facing flow.

## Target Platform Rebaseline

```text
H5 = DEVELOPMENT_AND_ALGORITHM_HARNESS
H5_OPPO_NATIVE_STILL = PASS
H5_OPPO_CAPTURE_TRANSPORT = PASS
H5_OPPO_BACKEND_PERSISTENCE = PASS
H5_OPPO_COMPOSITION_FIDELITY = UNSUPPORTED
H5_OPPO_PRODUCT_CAMERA_PATH = UNSUPPORTED
OLD_FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
WECHAT_MINIPROGRAM = PRIMARY_PRODUCT_PLATFORM_CANDIDATE / UNVERIFIED
DOUYIN_MINIPROGRAM = SECONDARY_PRODUCT_PLATFORM_CANDIDATE / UNVERIFIED
HOME_V1 = STAGED_FOR_SUCCESSOR_MAIN
SCENE_SPATIAL_INTEGRATION = PASS_WITH_WARNING
LIVE_INTEGRATION = NOT_STARTED
FINE_TUNE = PRESERVED_FOR_PORTABILITY_REVIEW
PROVIDER = 0
LUNA = 0
PUBLIC_PRODUCTION_READY = NO
```

## Scene Spatial V0.2 Main Integration

```text
Source Head: 68999dbc8c8332d789f7f74a094b2b02cd9cbae0
Integration: SELECTIVE_MIGRATION / PASS_WITH_WARNING
Module Decoupling: PASS
REAL / FAKE / REPLAY: PASS_WITH_WARNING / PASS / PASS
P1 View: PASS_WITH_WARNING / NON_BLOCKING PASS
P2 Geometry: PASS_WITH_WARNING / LATENCY_WARNING PRESERVED
Spatial Status Authority: BACKEND_ONLY
Request Failure != INSUFFICIENT: PASS
Backend / Frontend Tests: 121 / 121 PASS; 97 / 97 PASS
WeChat / H5 Build: PASS / PASS_WITH_WARNING
H5 Runtime Regression: PASS
Integrated WeChat Device Gate: MANUAL_REVIEW_REQUIRED
Raw Video / Frame Stream / Provider / Luna: 0 / 0 / 0 / 0
P3 / Live Integration / AI Director: NOT_STARTED / NOT_STARTED / NOT_STARTED
```

Scene Spatial is connected through `SceneSpatialPort` and replaceable adapters while solver/OpenCV/cache internals remain module-private. One Scene Scan produces immediately usable ViewEvidence and asynchronously requests optional SpatialEvidenceV02. PARTIAL, INSUFFICIENT, NOT_PRODUCED, and SUPERSEDED all preserve the view-only product path. The current WeChat build contains the composition/upload path and passes the bounded AppService compatibility scan, but no fresh phone-to-backend Scene Scan is claimed because the official Developer Tools CLI service port remains disabled. See `project-status/reports/XFX_MAIN_SCENE_SPATIAL_V02_SELECTIVE_INTEGRATION_05.md`.

H5 remains supported for UI, Workflow, backend, Replay, diagnostics, Scene/Live harnesses, Fine Tune and desktop QA. It is no longer product authority for OPPO Chrome Preview-to-Capture fidelity. Successor planning authority: `docs/platform/MINIPROGRAM_PRODUCT_PLATFORM_BASELINE_V01.md`.

## WeChat First Complete Product Candidate

```text
Source: feature/first-complete-non-ai-product-flow @ 62e9cacc37cfd5149c78e05860cbc56ab2f6e0d5
Branch: feature/wechat-miniprogram-first-complete-product-baseline
Implementation: PASS
Home V1 Import: PASS
WeChat Build: PASS
H5 Regression: PASS
TypeScript: PASS
Frontend Tests: 87 / 87 PASS
Backend Tests: 110 / 110 PASS
WeChat Developer Tools: NOT_AVAILABLE
WeChat Real Device Network: MANUAL_REVIEW_REQUIRED
WeChat Device Gate: MANUAL_REVIEW_REQUIRED
WeChat Product Baseline: NOT_YET_PASS
First Complete Non-AI Product Baseline: NOT_YET_PASS
Provider / Luna / Raw Video / Frame Stream: 0
```

Home/Works/Mine, three session entry modes, Context Reliability/Reconcile, WeChat Camera/capture/reference/upload/save/share adapters, and WeChat Fine Tune platform runtime are implemented. Build and mock-platform evidence cannot substitute for authorized WeChat Developer Tools and OPPO K11 evidence. Camera lifecycle, Preview-to-Capture fidelity, native Capture persistence, Fine Tune/local region, Final/My Works/Save/Share, and the full golden flow remain unexercised. Exact Owner steps: `project-status/evidence/wechat-miniprogram-first-complete/manual-gates.md`.

## M05 Real User Golden Flow

```text
Branch: feature/m05-real-user-golden-flow
Start Head: 46393ce0a37bb9e339933679438ff57f58c1e835
Implementation Gate: PASS
Real Device Gate: PASS
M05 Final Gate: PASS
INTERNAL_USER_GOLDEN_FLOW_READY: YES
Internal Demo: READY_WITH_DISCLOSURE
PUBLIC_PRODUCTION_READY: NO
Unconfirmed Still Upload: 0
Raw Video Upload: 0
M05 Replay Scenarios: 12 / 12 PASS
Backend Tests: 76 / 76 PASS
Frontend Tests: 11 / 11 PASS
TypeScript: PASS
H5 Build: PASS_WITH_WARNING
WeChat Build: PASS
Desktop E2E: PASS
Feature Acceptance Head: db8c51f07a81e2b9f06635627c650dc3f21f7dca
Develop Before Merge: 46393ce0a37bb9e339933679438ff57f58c1e835
Develop Merge Result: db8c51f07a81e2b9f06635627c650dc3f21f7dca
Auto FF Merge: PASS
```

Camera is primary and device import remains the controlled fallback. The user-operated OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.7204.168 trusted-HTTPS gate passed permission timing, rear/front switching, lifecycle, still capture, local retake, confirmation, import, rotation, explicit backend resume, Final, My Works, download, and share/fallback. A selected still remains local until `使用这张`; retake before confirmation does not call the server or advance Workflow. Per-candidate confirmation produced exactly one upload and one workflow commit. The H5 Camera matrix is promoted only for this tested scope; WeChat remains unverified. Production mode remains blocked while deterministic fake intelligence is selected.

Retained acceptance warnings: the existing H5 302 KiB size advisory; reload/final-open latency not separately timed; Share supported-vs-fallback branch not separately identified; and two controlled HTTP 409 responses during rapid repeated UI actions with request-level root cause unclassified. SQLite proves no duplicate event, revision, current CaptureAsset, or confirmation key, and the user observed no visible error.

## M06 Governed Real Capability Admission

```text
Branch: feature/m06-real-capability-wave
Start Head: 24b28b9107af2c7c99bd9eb4215f6190e68f241e
Status: PASS_PHASE1_PROVIDER_DEFERRED
Implementation Gate: PASS
Real Provider Gate: DEFERRED_BY_PRODUCT_DECISION
QA Promotion Gate: DEFERRED
M06 Infrastructure Gate: PASS
Provider / Model: NOT_CONFIGURED
QA Canonical Adapter: FAKE_INTERNAL_ONLY
QA Fixture Shadow: PASS
Shadow State Mutation: 0
Controlled Evaluation: 22 / 22 PASS
Backend / Frontend Tests: 94 / 94 PASS; 11 / 11 PASS
TypeScript / H5 / WeChat: PASS / PASS_WITH_WARNING / PASS
Browser Real-QA Flow: NOT_RUN
Real Provider Calls: 0
M03 Deterministic Provider Calls: 0
PUBLIC_PRODUCTION_READY: NO
Auto FF Merge: PASS / 0b5501eb46d495f934b8fa8ad63c5034b7953050
```

Main-owned provider-neutral Gateway, Prompt/Model Registry, execution provenance, Capture QA Candidate validation, fault normalization, M03 AI Lab modes, and controlled evaluation harness are implemented. Fixture metrics are 100% schema-valid/disposition/must-detect with zero invented facts and zero retake false negatives, but they prove harness behavior only. No real QA was run or promoted. After the owner deferred the provider, this infrastructure was strict-fast-forward merged to `develop` at `0b5501eb46d495f934b8fa8ad63c5034b7953050`.

Admission remains honest: QA is `ADMISSION_READY`; Reality is `BLOCKED_INPUT_CONTRACT`; Target is `BLOCKED_PROVIDER`; Shot is `BLOCKED_INPUT_CONTRACT`; Live, Reality+, and Fine Tune are `BLOCKED_PARALLEL_TRACK`. M01, Workflow, Platform Catalog, normal product UI, main, and protected parallel worktrees remain unchanged.

### M06 Phase-1 Owner Decision

The earlier `READY_FOR_PROVIDER_ACCEPTANCE` evidence remains preserved. For the Phase-1 non-AI complete product, the owner subsequently selected:

```text
Real Provider: DEFERRED_BY_PRODUCT_DECISION
M06 Infrastructure Gate: PASS
QA Selected: FAKE_INTERNAL_ONLY
QA Provider Infrastructure: READY_FOR_FUTURE_ADMISSION
Provider Calls: 0
PUBLIC_PRODUCTION_READY: NO
```

## Frontend Interaction Simplification

```text
Branch: feature/frontend-interaction-simplification
M06 Accepted Develop Head: 0b5501eb46d495f934b8fa8ad63c5034b7953050
Status: PASS_WITH_WARNING
User-visible Stages: START / SHOOT / REVIEW / FINAL
Backend Invariance: PASS
Frontend Tests: 20 / 20 PASS
Backend Tests: 94 / 94 PASS
Desktop H5 E2E: PASS
App-to-Camera Decisions: 2
Confirm-to-Final Additional Decisions: 0
Provider Calls: 0
PUBLIC_PRODUCTION_READY: NO
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE: NOT_YET_PASS
```

The only warning is the existing H5 302 KiB entrypoint advisory. Fine Tune remains a governed unavailable placeholder and is not integrated by this task.

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

`project-status/CHALLENGES.json` 未修改。CH-003 保持 `IDENTIFIED`；M04 不验证 Camera Frame、CV FPS 或微信真机性能。CH-011 仍为 `SOLUTION_PROPOSED`：受控本地真实资产路径已建立，但 Golden Asset 的完整迁移与生产对象存储均未发生。

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

## M04 Platform Adapter Integration Foundation

```text
M04_PLATFORM_ADAPTER_FOUNDATION: PASS
PlatformAdapterRegistry / availability / provenance: PASS
Replacement states: FAKE / REAL / EXPERIMENTAL / UNAVAILABLE
H5 Network: PASS
H5 Haptic / Share: PASS_WITH_WARNING
H5 Album: PARTIAL
WeChat adapter foundation: PASS
WeChat real device: UNVERIFIED_REAL_DEVICE
Development local storage: PASS
Multipart JPEG/PNG/WebP upload: PASS (20 MiB maximum)
SHA256 metadata / safe download / readback: PASS
Path traversal / absolute path / UNC / wrong MIME / zero / oversize: BLOCKED
Real binary Capture path: PASS
H5 still Camera implementation: PASS
H5 Camera real device: UNVERIFIED_REAL_DEVICE
Final download: PASS
Final share: PASS_WITH_WARNING
Platform Lab profiles: 8
Platform scenarios: 12 / PASS
Backend tests: 70 PASS
Frontend platform tests: 5 PASS
M04 binary browser E2E: PASS
Production Object Storage: NOT_LOCKED
Production DB: NOT_LOCKED
```

真实浏览器证据覆盖实际文件选择、HTTP multipart `201`、稳定 `local-asset://` identity、Capture→Reality+→Final lineage、最终下载、Web Share、刷新回读及局部重拍。默认 Lab 关闭；Lab 构建显示平台 Profile/Adapter provenance，`STORAGE_FAILURE` 被确定性分类为 `UNSUPPORTED`，M03 Replay 仍为 `MATCH`。初次 H5 上传暴露 Taro `uploadFile` 对 browser File 的兼容问题，已限定为 H5 `FormData` 修复；多 Session 复验暴露旧全局资产/候选主键冲突，已无损迁移为 Session-scoped composite key 并加入回归。

M01 Contracts、Platform Catalog、M02/M03 行为均保持；Fake Live 继续选中。没有 Provider、真实 Live/CV/Voice/Agent/Reality+、支付、外部 Auth 或生产基础设施。

Feature commits `4c49388`, `2ee655d`, `95df89a` 已推送，并从 `68afacb` strict-fast-forward 合入及推送至 `develop`；没有 merge commit、rebase、cherry-pick 或历史改写。

```text
Challenges Addressed: Windows Bootstrap / repository integrity
Challenges Introduced: NONE
Challenges Reopened: NONE
```

## Next Recommended Task

```text
XFX_MAIN_WECHAT_MINIPROGRAM_FIRST_COMPLETE_PRODUCT_BASELINE_01
```

这里只记录下一任务；本次不开始 WeChat Mini Program successor baseline，不修改 `main`。Scene Spatial、Live 与 Fine Tune 边界保持独立，CH-003 仍为 `IDENTIFIED / UNCHANGED`。
