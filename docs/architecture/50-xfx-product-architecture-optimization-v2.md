# 向风行｜产品与技术架构优化建议 V2

**Document ID:** `XFX_PRODUCT_ARCHITECTURE_OPTIMIZATION_V2`  
**Baseline:** Project Baseline V0.5  
**Based on:** `AI Native Product Creation Framework V1` + 向风行既有 Golden Flow / Technical Architecture  
**Status:** Proposed Architecture Upgrade  
**Date:** 2026-08-24

> **Authority update (2026-08-31):** `83-capability-authority-and-contract-roadmap-v2.md` freezes current module ownership and the contract roadmap. Scene Spatial is evidence-only, Director owns Shot Plan decisions, Live is target execution, and Session stores domain state rather than algorithm runtime.

---

# 0. 结论

新 Framework **不会推翻向风行当前架构**。

它最有价值的作用是把当前：

```text
PhotographySession
+
Workflow
+
Contracts
+
Capability Modules
+
Platform / Model Gateway
+
Project Status / Challenges / Lab
```

进一步升级为更完整的：

```text
PRODUCT DOMAIN PLANE
+
RUNTIME / CAPABILITY PLANE
+
AUTHORITY / CONTROL PLANE
+
EVIDENCE / EVALUATION PLANE
+
INFRASTRUCTURE / ADAPTER PLANE
```

也就是说：

> 原架构解决“系统怎么运行”。

新 Framework 补强：

> “系统为什么这样设计、谁拥有决定权、AI 输出何时才能进入正式状态、并行开发如何不破坏架构、怎样证明这一版真的完成”。

因此建议采用：

> **保留现有产品主流程，增强 Architecture Authority、AI Candidate Gate、Version Scope、Evidence、Checkpoint、Handoff 和 Golden Flow Closeout。**

---

# 1. 当前向风行架构没有必要改变的部分

以下继续作为产品核心 Authority：

## 1.1 产品主流程

```text
ENTRY
↓
SHOOTING RELATION / DEVICE MODE
↓
REALITY UNDERSTANDING
↓
TARGET SELECTION / ADAPTATION
↓
SHOT DIRECTION
↓
REALTIME SHOT CONTROL
↓
CAPTURE
↓
CAPTURE QA / RETAKE ROUTER
↓
REALITY+
↓
OPTIONAL USER FINE TUNE
↓
MY FINAL PHOTO
↓
FINAL ACTION HUB
```

不建议退化为一个更短但丢失产品边界的：

```text
Understand → Target → Guide → Capture → Enhance
```

短流程可以用于对外说明，不能替代内部 Workflow。

---

## 1.2 SelectedTarget / ShotDirection 边界

继续冻结：

```text
SelectedTarget = WHAT
ShotDirection = HOW
```

这是当前架构里非常正确的领域边界。

---

## 1.3 PhotographySession

继续作为核心 Domain Aggregate。

它负责：

> 一次真实摄影 Session 的业务状态和资产 Lineage。

不应该变成 God Object，也不应该承载所有算法实现。

---

## 1.4 Capability-based，而不是 Agent-count-based

继续保持：

```text
Reality
Target
Shot
Live
Capture
QA
Enhancement
Final
```

作为稳定 Capability。

Teacher / Assistant 可以作为用户感知 Agent Persona，但不是底层系统边界。

---

## 1.5 Local CV First

继续保持：

```text
Camera 30 FPS
↓
Lightweight Local CV
↓
FramePerception
↓
LiveShotRuntime / CurrentShotState
↓
Guidance Engine
```

强模型：

> Event Driven，而不是每帧调用。

---

# 2. Framework 带来的第一项架构升级：增加 Authority Plane

当前向风行已经有：

```text
Global Contract
Workflow
Session
Project Status
Challenge Registry
```

但这些还可以进一步明确为一个：

# AUTHORITY / CONTROL PLANE

它回答：

> “系统里谁才是真相？”

建议包括：

```text
Architecture Authority
Product Workflow Authority
Contract Authority
State Authority
Asset Authority
Version Authority
Environment Authority
Model / Skill Authority
Release Authority
```

例如：

```text
Product Workflow Authority
→ docs/product-design/10-golden-flow-v1.0.md

Project Progress Authority
→ project-status/PROJECT_STATUS.json

Challenge Authority
→ project-status/CHALLENGES.json

Asset Authority
→ AssetManifest

API Contract Authority
→ OpenAPI / Pydantic Schema

Runtime Authority
→ Deployment / Environment Record
```

这可以减少：

> 文档说一套、代码一套、Runtime 又一套。

---

# 3. 第二项升级：AI Output = Candidate，不直接成为 Truth

Framework 中最值得吸收的一条是：

> **AI 输出首先是 Candidate，而不是 System Truth。**

这非常适合向风行。

当前每个 AI Capability 建议统一变成：

```text
Input
↓
Authorized Context
↓
AI Capability
↓
Candidate
↓
Validation / Gate
↓
Accepted Domain Object
```

---

## 3.1 Reality Understanding

不要：

```text
VLM Output
→ RealityContext
```

而是：

```text
VLM Observation Candidate
↓
Schema Validation
↓
Reality Fact / Safety Validation
↓
RealityContext
```

---

## 3.2 Target

不要：

```text
LLM
→ SelectedTarget
```

而是：

```text
TargetCandidate[]
↓
Reality Feasibility
↓
Safety
↓
ShotDirection Feasibility
↓
Ranking
↓
User Selection
↓
SelectedTarget
```

---

## 3.3 Photo QA

不要：

```text
VLM
→ Retake
```

而是：

```text
QACandidate
↓
Technical Rules
↓
Target / Capture Evidence
↓
CaptureDecision
```

用户 Taste 继续独立。

---

## 3.4 Reality+

生成式/编辑模型输出：

```text
EnhancementCandidate
```

经过：

```text
Identity Check
Reality Fact Check
Visual QA
```

才成为：

```text
RealityPlusAsset
```

这会让 Reality First 从“产品口号”真正进入系统架构。

---

# 4. 第三项升级：Architecture Freeze / Contract Freeze

我们之前已经有：

```text
Global Definition First
Modular Delivery Second
```

Framework 把这一点进一步强化成：

# Architecture Freeze / Contract Freeze

建议 M01 不只做 Schema。

而是完成一次正式：

```text
M01_ARCHITECTURE_AND_CONTRACT_LOCK
```

冻结：

- Domain Objects
- Module Ownership
- Workflow State
- Data Contract
- API Contract
- Event Contract
- AI Contract
- Platform Contract
- Asset Contract
- Error Contract

冻结不代表以后永远不能改。

而是：

> 改动必须通过显式 Architecture Change，而不是某个模块开发过程中顺手改变。

---

# 5. 第四项升级：Version First

当前 Project Baseline 已经有版本号，但“当前开发版本 Scope”还可以更明确。

建议增加：

# CURRENT_VERSION_SCOPE

至少包含：

```yaml
version:
  id:
  objective:

included:
excluded:

dependencies:

runtime_targets:

acceptance:
exit_gate:
```

例如第一 MVP：

```text
Included
- Reality First
- 双人单手机
- Static
- Basic Composition Guidance
- Capture
- QA
- Partial Retake

Excluded
- Dual Device
- Motion
- Solo Advanced
- Full Creative+
- Commerce production
```

这样 Codex 不会因为看到文档里有全部 Story A-F：

> 就误认为当前版本全部都要开发。

---

# 6. 第五项升级：产品模块与页面彻底解耦

Framework 强调：

> Object + Capability + Workflow

而不是：

> Page-first Design。

这与向风行现在方向一致，建议进一步冻结。

正式 Product Capability Map：

```text
Photography
├── Session
├── Reality
├── Target
├── Shot Planning
├── Live Control
├── Capture
├── QA / Retake
├── Enhancement
├── Fine Tune
├── Final Asset
├── Sharing
├── Commerce
└── Governance
```

而：

```text
P01 ~ P13
```

只是当前 Mobile UX Presentation。

因此未来：

```text
WeChat
Douyin
Native
Web Lab
```

可以拥有不同 Screen Layout，但共用同一 Product Capability / Contract。

---

# 7. 第六项升级：把系统正式分成五个 Plane

建议向风行 V2 Architecture：

```text
┌──────────────────────────────────────────────┐
│ 1. PRODUCT DOMAIN PLANE                      │
│ PhotographySession / Target / Shot / Asset   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ 2. RUNTIME / CAPABILITY PLANE                │
│ Reality / Target / Shot / Live / QA / Post   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ 3. AUTHORITY / CONTROL PLANE                 │
│ Workflow / Contract / Version / Permission   │
│ Asset Authority / Model Policy / Stage Gate  │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ 4. EVIDENCE / EVALUATION PLANE               │
│ Test / Replay / AI Eval / Trace / Challenge  │
│ Golden Flow / Acceptance / Checkpoint        │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ 5. INFRASTRUCTURE / ADAPTER PLANE            │
│ Client Adapter / Model Gateway / Storage     │
│ DB / Redis / Queue / WebSocket / Cloud       │
└──────────────────────────────────────────────┘
```

关键变化：

> Evidence / Evaluation 不再只是“测试工具”，而成为正式 Architecture Plane。

这非常适合 AI Photographer，因为很多能力不能通过代码存在来证明，只能通过：

```text
Replay
Scenario
Runtime
Image Comparison
Device Benchmark
Human Acceptance
```

证明。

---

# 8. 第七项升级：前端增加 Local Runtime Authority

摄影实时链路存在一个特殊点：

后端：

```text
PhotographySession
```

是持久化 Session Authority。

但实时摄影不能等待 Server。

所以正式区分：

## Persistent Authority

```text
Server PhotographySession
```

负责：

- Workflow Stage
- SelectedTarget
- ShotDirection
- AcceptedCapture
- QA Decision
- Asset Lineage
- Final

## Ephemeral Runtime Authority

```text
Frontend LiveShotRuntime
```

负责：

- FramePerception
- IMU
- Instant Difference
- Instruction Stabilizer
- Local Ready State

同步规则：

```text
Realtime transient state
→ Local

Meaningful State Transition
→ Event / Snapshot → Server
```

这样避免前后端争夺“谁是真相”。

---

# 9. 第八项升级：Parallel Build 前必须完成 Contract Lock

Framework 的：

> 前置统一 → 并行建设 → 串行收口

非常适合我们。

建议开发节奏明确成：

```text
PHASE A
前置统一
↓
Architecture / Contract Lock

PHASE B
并行建设
↓
Frontend
Backend
AI Capability
Web Lab
Test / Eval
Observability

PHASE C
串行收口
↓
真实 Golden Flow
↓
Runtime Acceptance
```

这比：

> 一个模块做完再做另一个

更快。

也比：

> 所有模块自由并行

更安全。

---

# 10. 第九项升级：Golden Flow 进入正式 Release Gate

当前 Golden Flow 主要是 MVP 产品验收。

建议升级为：

```text
Module Pass
≠
Product Pass
```

正式必须：

```text
Module Verification
↓
Integration
↓
Golden Flow
↓
Human Acceptance
↓
RC Freeze
↓
Independent Acceptance
↓
Runtime Certification
```

MVP 阶段不需要一开始就建设重型 Release Pipeline。

但结构上必须预留。

---

# 11. 第十项升级：Checkpoint System

建议 Codex 正式任务增加三种 Checkpoint：

## PRE_WRITE_CHECKPOINT

在写代码之前记录：

```text
Authority
Current State
Scope
Risk
Planned Changes
```

## POST_PHASE_CHECKPOINT

完成后：

```text
Actual Changes
Tests
Evidence
Remaining Issues
```

## PRE_NEXT_PHASE_CHECKPOINT

进入下一 Task 前：

```text
Previous Gate
Dependencies
Blockers
Next Permission
```

这些不需要制造大量长文档。

可以作为：

```text
Task Report
```

里的固定 section。

---

# 12. 第十一项升级：Bounded Autonomy

Codex 的自主权建议正式分级。

## 可自动

满足：

- 可逆
- 可测试
- 当前 Scope
- 非 Production
- 不改 Architecture Authority
- 不改权限模型
- 不涉及 Credential

## 必须停止

- Architecture Contract Change
- Production
- High-risk DB mutation
- Permission model
- Compliance
- Credentials
- Cross-user side effect
- Irreversible user data change

这会减少：

> 每一步都问人

和：

> Codex 顺手把系统改穿

两个极端。

---

# 13. 第十二项升级：Default Context / AGENTS.md

建议仓库根目录增加：

```text
AGENTS.md
```

让 Codex 每次进入项目首先知道：

```text
Project
Architecture Authority
Current Baseline
Current Milestone
Required Status Files
Forbidden Actions
Default Evidence
```

而不是每一个 Task 都重新复制十页项目历史。

建议 Context Chain：

```text
AGENTS.md
↓
Executor Role Card
↓
Project Status
↓
Architecture Authority
↓
Current Task
↓
Module Context (on demand)
```

---

# 14. 第十三项升级：GPT / Agent Handoff Artifact

换 Chat / Codex Session 时不应重新研究整个项目。

建议增加：

```text
project-status/GPT_HANDOFF.md
```

包含：

- Project Context
- Architecture Authority
- Current Stage
- Completed
- Current Runtime
- Decisions
- Failed Attempts
- Known Issues
- Deferred
- Next Task
- Evidence

更新频率：

> 每个 Milestone Gate 后，而不是每个 Commit。

---

# 15. Challenge Governance 与 Framework 的融合

当前：

```text
CHALLENGES.json
```

非常适合保留。

Framework 进一步说明：

```text
Problem
→ Solution Proposal
→ Implementation
→ Runtime Evidence
→ Acceptance
```

因此 Challenge 状态：

```text
IDENTIFIED
→ ANALYZING
→ SOLUTION_PROPOSED
→ IMPLEMENTING
→ VALIDATING
→ RESOLVED
```

继续有效。

建议每个 Challenge 增加：

```text
claim
evidence_required
runtime_environment
resolution_gate
```

这样：

> “我们已经想到了方案”

不会再被误判为：

> “这个技术难点已经解决”。

---

# 16. Asset Architecture 进一步优化

当前 AssetRef / Manifest 思路继续正确。

建议把 Asset 分成：

```text
SOURCE
CANDIDATE
ACCEPTED
DERIVED
FINAL
```

结合 AI Candidate 原则。

例如：

```text
S01-A01 SOURCE_SUBJECT_ANCHOR
S01-A02 SOURCE_SCENE_ANCHOR
S01-A03 CANDIDATE_TARGET_PREVIEW
S01-A06 ACCEPTED_CAPTURE
S01-A07 DERIVED_REALITY_PLUS
MyFinalPhoto FINAL
```

每个 Asset 有：

```text
producer
input lineage
policy
validation
status
version
checksum
```

这会让图片控制真正成为领域资产管理，而不是目录管理。

---

# 17. 推荐更新后的 Repository 结构

不需要推翻现有目录。

在当前基础上增量增加：

```text
AGENTS.md

docs/
  framework/
  architecture/
  execution/

project-status/
  PROJECT_STATUS.json
  CHALLENGES.json
  GPT_HANDOFF.md
  CURRENT_VERSION_SCOPE.md
  reports/

packages/
  contracts/
  workflow/
  authority/
  evaluation/
  photography-core/
  platform/
  scenario-fixtures/

apps/
  client/
  lab/
  api/
```

其中：

```text
packages/authority
```

不是“大 Core”。

只承载：

- versioned authority definitions
- stage / gate contracts
- ownership metadata

`packages/evaluation`：

- eval schema
- result schema
- comparison / evidence contract

真正 Eval Runner 可在后续实现。

---

# 18. 对当前 Milestone 的优化

原 M00-M07 可以保留，不需要推倒。

建议增加 Framework Stage Mapping：

```text
M00 Project Baseline
≈ Framework Stage 0~2 + Artifact Baseline

M01 Global Contracts
≈ Stage 3~6 的 Architecture / Contract / Version Freeze

M02 Application Skeleton
≈ Stage 7 Parallel Construction Foundation

M03 Fast Feedback Lab
≈ Stage 7 Test / Eval / Observability Foundation

M04 Camera/CV Spike
≈ Architecture Risk Validation

M05 MVP Golden Flow
≈ Stage 8 Serial Golden Flow Closeout

M06 Real Capability
≈ Stage 7 / 8 iterative replacement

M07 Cross Platform
≈ Stage 9 Runtime Acceptance
```

所以：

> Framework 是更高层生命周期，M00-M07 是向风行当前实际执行计划。

两者不冲突。

---

# 19. 不建议照搬 Framework 的地方

为了避免过度工程化，下面内容当前不应重型化。

## 19.1 不要现在就建设复杂权限 / Tenant

向风行 MVP 不是企业 SaaS。

保持最小 Auth / Asset Ownership 即可。

## 19.2 不要现在就上复杂 Workflow 产品

当前 Explicit State Machine 足够。

## 19.3 不要一开始建设完整 E1/E2/Preview/Production 多环境体系

MVP 先有：

```text
LOCAL
DEV
DEVICE TEST
```

产品进入 RC 前再扩展。

## 19.4 不要为了 Artifact Driven 产生几十份重复文档

Authority 文档必须：

> 少、稳定、结构化。

不要把“文档治理”变成开发负担。

---

# 20. 优化后的核心架构公式

建议向风行以后统一采用：

## 产品

```text
Reality
→ Target
→ Shot
→ Live
→ Capture
→ QA
→ Reality+
→ Fine Tune
→ Final
```

## Domain

```text
PhotographySession
+
Versioned Domain Objects
+
Asset Lineage
```

## Control

```text
Workflow
+
Authority
+
Contract
+
Version
+
Gate
```

## AI

```text
Authorized Context
→ AI Candidate
→ Validation
→ Accepted Domain State
```

## Runtime

```text
Local Realtime
+
Server Persistent Session
```

## Delivery

```text
Architecture Freeze
→ Parallel Build
→ Serial Golden Flow
→ Evidence
→ Acceptance
```

## Governance

```text
Git
+
Project Status
+
Challenge Registry
+
Checkpoint
+
Handoff
```

---

# 21. 最终建议

当前架构无需重构推倒。

建议将 V0.5 定义成：

> **Architecture Governance Upgrade**

不是：

> New Product Architecture From Scratch。

最值得立即吸收的七项：

1. **AI Candidate → Validation → Accepted State**
2. **Architecture / Contract Freeze**
3. **Current Version Scope**
4. **Authority Plane**
5. **Evidence / Evaluation Plane**
6. **Checkpoint + Bounded Autonomy**
7. **AGENTS.md + Milestone Handoff**

这些会明显提高：

- Codex 可控性
- 并行开发效率
- AI 结果可靠性
- 版本边界
- 项目可继承性
- Runtime 验收能力

同时保留我们已经验证过的：

- Golden Flow
- Story A-F
- PhotographySession
- SelectedTarget / ShotDirection
- Local CV First
- Web Lab / Replay
- Challenge Registry
- Project Control Center

作为现有产品架构的核心。
