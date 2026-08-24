# 40｜Project Progress Governance

**Document ID:** `XFX_PROJECT_PROGRESS_GOVERNANCE_V1`  
**Status:** Accepted  
**Applies to:** Product / Frontend / Backend / AI / CV / Infrastructure / Prototype

---

# 1. 核心原则

向风行项目采用：

> **Milestone → Task → Gate → Evidence → Next Task**

进度不以“做了很多事情”判断，而以：

> **可验收的交付物是否通过 Gate**

判断。

禁止：

- 未通过当前 Gate 直接进入下一阶段；
- 把“代码写完”当成“任务完成”；
- 把 `SOURCE_REQUIRED` 当成 FAIL；
- 为了赶进度隐藏已知问题；
- Codex 自行扩大任务边界；
- 用口头状态代替 Git / Report / Evidence。

---

# 2. 状态模型

每个 Task 只能处于以下状态之一：

```text
NOT_STARTED
IN_PROGRESS
BLOCKED
READY_FOR_ACCEPTANCE
PASS
FAIL
SOURCE_REQUIRED
MANUAL_REVIEW_REQUIRED
DEFERRED
```

说明：

### NOT_STARTED
尚未执行。

### IN_PROGRESS
已开始，但未达到验收条件。

### BLOCKED
存在明确阻塞，当前无法继续。

### READY_FOR_ACCEPTANCE
实现已经完成，等待正式验收。

### PASS
满足当前 Task 的全部 Acceptance Criteria。

### FAIL
已有充分证据证明实现不符合要求。

### SOURCE_REQUIRED
缺少真实来源、配置、凭据、决策或文件，无法继续确认。

### MANUAL_REVIEW_REQUIRED
需要 Owner / 人工权威判断。

### DEFERRED
明确延后，不属于当前 Milestone 的阻塞项。

---

# 3. Progress Authority

项目进度权威来源优先级：

```text
1. project-status/PROJECT_STATUS.json
2. project-status/PROJECT_STATUS.md
3. Task Acceptance Report
4. Git Commit / Tag
5. Conversation / verbal notes
```

聊天记录不是正式 Project Progress Authority。

---

# 4. Milestone Gate

正式 Milestone：

## M00 — Project Baseline

目标：

- 产品文档入库
- 技术文档入库
- CURRENT Prototype 入库
- Story Assets 入库
- Git 本地仓库有效
- main / develop 有效

Gate：

```text
M00_BASELINE_LOCK
```

---

## M01 — Global Contracts

目标：

- PhotographySession V1
- WorkflowState V1
- AssetRef V1
- DomainEvent V1
- ErrorContract V1
- SelectedTarget V1
- ShotDirection V1
- CurrentShotState V1
- CaptureDecision V1
- RetakePlan V1

Gate：

```text
M01_CONTRACT_LOCK
```

要求：

- Schema 有版本
- 前后端命名统一
- Contract Test 通过
- 不依赖具体 Provider

---

## M02 — Application Skeleton

目标：

- apps/client
- apps/lab
- apps/api
- packages/*
- 基础启动命令
- Mock Capability
- 基础 Workflow

Gate：

```text
M02_SKELETON_RUNNABLE
```

必须：

- Windows 可启动
- Web Lab 可启动
- Backend 可启动
- Mock Golden Flow 可跑

---

## M03 — Fast Feedback Lab

目标：

- FakeCamera
- Scenario Fixture
- State Injection
- Replay
- Debug Trace
- MOCK / CACHED / LIVE switch

Gate：

```text
M03_REPLAY_READY
```

---

## M04 — WeChat Camera/CV Spike

目标：

- Camera Open
- Frame Access
- Overlay
- Person Bounding Box
- FPS / CPU / Memory / Heat / Latency 数据

Gate：

```text
M04_CAMERA_FEASIBILITY
```

结果允许：

```text
PASS
PASS_WITH_LIMITATIONS
FAIL_NEEDS_NATIVE_PATH
```

---

## M05 — MVP Golden Flow

默认 Story：

```text
Reality First
+
Dual Person Single Device
+
Static
+
Basic Live Guidance
+
Capture QA
+
Partial Retake
```

Gate：

```text
M05_MVP_GOLDEN_FLOW
```

---

## M06 — Real Capability Replacement

逐个：

```text
Reality
Target
Shot
Live CV
QA
Reality+ Natural
```

每个 Capability 独立 Gate。

---

## M07 — Multi-platform Validation

包括：

- Windows
- Mac
- WeChat
- Douyin（后续）

Gate：

```text
M07_CROSS_PLATFORM_BASELINE
```

---

# 5. Task ID Rule

所有正式 Codex Task 必须有 ID。

格式：

```text
XFX_<DOMAIN>_<ACTION>_<NN>
```

例如：

```text
XFX_PROJECT_BOOTSTRAP_WINDOWS_01
XFX_GLOBAL_CONTRACTS_AND_SKELETON_01
XFX_WEB_LAB_REPLAY_01
XFX_WECHAT_CAMERA_CV_SPIKE_01
```

Task 不允许只有：

> “继续做一下前端”。

---

# 6. 每个 Task 必须包含

```text
TASK_ID
Owner
Scope
Inputs
Allowed Writes
Out of Scope
Acceptance Criteria
Evidence Required
Expected Git Commit
Blocking Conditions
Next Recommended Task
```

---

# 7. Definition of Done

一个 Task 只有同时满足以下条件才能 PASS：

```text
Implementation complete
+
Tests complete
+
Acceptance criteria complete
+
Evidence recorded
+
Report generated
+
Git status clean
+
No hidden blocker
```

如果代码完成但验收没跑：

```text
READY_FOR_ACCEPTANCE
```

不能写 PASS。

---

# 8. Git 与进度绑定

推荐：

### Task 开始

```text
feature/<task-short-name>
spike/<task-short-name>
```

### Task 完成

至少产生：

```text
Implementation Commit
Acceptance / Report Commit
```

必要时打 Tag：

```text
baseline-v0.3
m01-contract-lock
m02-skeleton-runnable
```

Tag 只在正式 Gate PASS 后创建。

---

# 9. Progress Report

每个正式 Task 结束后，Codex 必须生成：

```text
project-status/reports/<TASK_ID>.md
```

至少包含：

```text
Task
Status
Started
Completed
Changed Files
Tests
Acceptance Result
Known Issues
Deferred Items
Evidence
Git Commits
Next Task
```

---

# 10. Daily / Session Progress

每次较大的开发 Session 结束后更新：

```text
project-status/PROJECT_STATUS.md
project-status/PROJECT_STATUS.json
```

不要求每修改一个文件就更新。

---

# 11. Blocker Policy

Blocker 分四类：

```text
TECHNICAL
SOURCE_REQUIRED
PRODUCT_DECISION
ENVIRONMENT
```

例如：

```text
BLOCKER:
type: SOURCE_REQUIRED
item: GIT_REMOTE_URL
blocking_scope: REMOTE_BOOTSTRAP
does_not_block: LOCAL_BOOTSTRAP
```

必须明确：

> 阻塞什么，不阻塞什么。

---

# 12. Scope Creep Control

Codex 如果发现一个新问题：

### 当前 Task 必须解决
加入当前 Task。

### 非当前 Task 必须解决
记录：

```text
FOLLOW_UP_REQUIRED
```

### 后续优化
记录：

```text
DEFERRED
```

禁止顺手扩张成大规模重构。

---

# 13. Progress Metrics

项目管理至少跟踪：

```text
Milestone Completion
Task Pass Rate
Open Blockers
Regression Count
Scenario Pass Rate
Golden Flow Pass
Technical Debt
Known Risks
```

AI/CV 进入以后增加：

```text
Target Eval Pass Rate
Guidance Regression
QA Match Rate
Reality+ Identity Preservation
```

---

# 14. Owner Decision Gate

以下内容 Codex 不得自行决定：

- 产品主 Workflow 改动
- SelectedTarget / ShotDirection 合并
- Reality First 边界放宽
- 默认 Device Mode 改变
- Provider 锁定
- 云厂商核心架构改变
- 删除 CURRENT Baseline
- 大规模目录重构

必须：

```text
MANUAL_REVIEW_REQUIRED
```

---

# 15. 项目当前推荐推进链

```text
M00
Project Baseline
↓
TASK 00 Windows Bootstrap
↓
M00_BASELINE_LOCK

M01
Global Contracts
↓
Contract Acceptance
↓
M01_CONTRACT_LOCK

M02
Application Skeleton
↓
Runnable Acceptance
↓
M02_SKELETON_RUNNABLE

M03
Web Lab + Replay
↓
Replay Acceptance
↓
M03_REPLAY_READY

M04
WeChat Camera/CV Spike
↓
Feasibility Review
↓
M04_CAMERA_FEASIBILITY

M05
MVP Golden Flow
```

任何时候都可以看到：

> 当前在哪个 Milestone、当前 Task 是什么、为什么没进入下一阶段。
