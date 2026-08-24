# AI Native Product Creation Framework

## AI 原生产品创建与交付框架 V1

## 1. 文档定位

本框架用于指导一个新的 AI 产品从想法进入真实产品设计、工程建设、测试验收、发布和长期迭代。

它不是：

- 单纯的 PRD 模板；
- 单纯的 Vibe Coding Prompt；
- 单纯的技术架构规范；
- 单纯的 AI Agent / Skill 设计方法；
- 单纯的测试和发布 SOP。

它解决的是一个更上层的问题：

> **当我们准备创建一个新的 AI 产品时，应该按照什么顺序理解业务、设计产品、定义 AI、设计系统、组织建设、验收结果，并保证项目可以持续被 AI 和人类共同维护。**

整个框架遵循一个核心原则：

> **前置统一 → 并行建设 → 串行收口**

---

# 2. AI 项目的核心设计思想

传统产品往往从：

需求 → PRD → UI → 开发

开始。

AI Native 产品不应直接这样进入开发。

更合理的顺序是：

**真实业务**
↓
**业务对象与业务流程**
↓
**产品能力模型**
↓
**AI / 非 AI 能力边界**
↓
**产品与技术架构**
↓
**数据、权限、状态与契约**
↓
**版本范围**
↓
**模块建设**
↓
**Golden Flow**
↓
**真实 Runtime 验收**
↓
**Release Candidate**
↓
**发布**

因此整个体系强调四件事情：

### 2.1 Business First

不要先问：

> AI 可以做什么？

先问：

> 用户实际在完成什么工作？

从真实业务反推产品能力。

---

### 2.2 Architecture First

不能让 AI Coding 从单个页面、单个需求不断向外生长系统。

在进入大量开发前，需要先定义：

- 产品模块；
- 系统模块；
- 数据模型；
- 模块依赖；
- 权限边界；
- 状态机；
- 输入输出 Contract；
- Runtime 拓扑。

---

### 2.3 Version First

任何阶段都必须明确：

> **这一版究竟准备完成什么？**

把：

- Future；
- P2；
- Nice to Have；
- 实验能力；
- 当前版本；

严格分开。

防止 AI 不断自动扩大 Scope。

---

### 2.4 Evidence Driven

AI 项目不能以：

> “代码写完了”

作为完成标准。

完成必须能够被证明。

例如：

- Test；
- Runtime；
- Database；
- UI；
- API；
- Log；
- Trace；
- Screenshot；
- Golden Flow；
- Human Acceptance。

最终形成：

> **Claim → Evidence**

而不是：

> Claim → 相信 AI。

---

# 3. AI 产品创建的完整生命周期

建议整个新项目统一划分为以下阶段。

---

# Stage 0：Project Definition

首先回答：

## 为什么存在这个产品？

需要明确：

### Problem

用户当前存在什么真实问题？

### User

谁真正使用？

### Scenario

在什么场景使用？

### Current Workflow

现在没有这个产品时，用户怎么完成任务？

### Pain Point

真正昂贵、重复、困难、容易出错的环节是什么？

### Product Value

产品准备改变哪一部分？

### AI Value

为什么这里需要 AI？

AI 是：

- 核心生产力；
- 辅助判断；
- 信息整理；
- 内容生成；
- 自动执行；
- 决策支持；

还是实际上根本不应该由 AI 完成？

### Business Boundary

明确：

**做什么 / 不做什么。**

### Success Metric

项目成功如何判断？

---

# Stage 1：Business Reality Modeling

这是整个项目最重要的阶段之一。

采用：

> **自下而上理解真实业务**

不要先设计页面。

首先拆真实业务。

至少需要明确：

## Role

有哪些业务角色？

## Task

每个角色完成什么任务？

## Object

业务围绕什么对象展开？

例如：

- Company；
- Project；
- Contract；
- Document；
- Customer；
- Research Object；
- Order；
- Case。

## Data

任务需要什么数据？

数据从哪里产生？

## Rule

有哪些业务规则？

## State

对象经历哪些状态？

## Exception

正常流程之外有什么异常？

## Decision

哪些地方需要做判断？

## Output

用户最终需要得到什么？

最终形成：

> Role → Task → Object → Data → Rule → State → Decision → Output

这一步完成后，才开始真正设计产品。

---

# Stage 2：Product Capability Modeling

基于真实业务反推出产品能力。

这一阶段回答：

> 为了支持上述业务，产品必须具备哪些能力？

形成：

## Product Object Model

定义核心业务对象。

## Capability Map

例如：

Product
├── Object
├── Workflow
├── Data
├── AI
├── Collaboration
├── Result
├── Administration
└── Governance

## Module Map

把 Capability 进一步拆成稳定模块。

## Core User Flow

定义用户完成核心任务的完整路径。

不要按照页面设计产品。

应该按照：

> **Object + Capability + Workflow**

设计产品。

页面只是能力的呈现方式。

---

# Stage 3：AI Capability Design

这是 AI Native 产品区别于传统产品的重要阶段。

不要简单写：

> “这里调用大模型。”

每个 AI 能力都需要回答：

## AI Task

AI 到底完成什么任务？

## Input

输入是什么？

## Context

AI 可以看到什么上下文？

## Authority

AI 有什么权限？

## Skill

使用什么 Skill / Capability？

## Model

需要什么类型的模型？

## Tool

是否需要调用 Tool？

## Output

输出是什么结构？

## Evidence

输出如何证明？

## Uncertainty

不确定性如何表达？

## Human Gate

什么时候必须人工确认？

## Failure

失败后怎么办？

推荐逻辑：

**User Input**
→ **Authorized Context**
→ **Identity / Permission / Scene Validation**
→ **Input Safety**
→ **Skill**
→ **Model Gateway**
→ **Provider / Model**
→ **Output Safety**
→ **Candidate Result**
→ **Evidence / Source**
→ **Human Review**
→ **Structured Artifact**
→ **Business Result**

核心原则：

> **AI 输出首先是 Candidate，而不是 System Truth。**

只有经过规则、Evidence 或 Human Gate 后，才进入正式业务状态。

---

# Stage 4：Product & Technical Architecture

完成产品模型后，再进行自上而下架构设计。

即：

> **自下而上理解业务，自上而下设计系统。**

至少定义：

## Product Architecture

模块以及模块关系。

## Frontend Architecture

页面、组件、状态管理、交互边界。

## Backend Architecture

Domain、Service、API、Job。

## Data Architecture

Database、Storage、Cache、Vector / Index 等。

## Identity & Permission

Auth、Role、Permission、Tenant、RLS。

## AI Architecture

Gateway、Skill、Model、Tool、Eval、Safety。

## Runtime Architecture

真实运行链路。

例如：

**Git / Worktree / Commit**
→ **Application**
→ **Build / Runtime**
→ **Deployment / Environment**
→ **Auth / Permission**
→ **Database / Storage**
→ **Model Gateway**
→ **Skill**
→ **Provider / Model**

同时横跨：

- Safety；
- Evidence；
- Logs；
- Trace；
- Human Review；
- Compliance。

---

# Stage 5：Contract & Authority

在开始大规模并行 Coding 前，需要完成一次：

> **Architecture Freeze / Contract Freeze**

这里冻结的不是所有实现细节。

冻结的是各模块之间的边界。

包括：

## Data Contract

数据结构。

## API Contract

接口。

## State Contract

状态机。

## Permission Contract

权限。

## Event Contract

事件。

## AI Contract

AI 输入输出结构。

## Module Contract

模块对外暴露什么能力。

## Ownership

哪个模块负责什么。

这样才能做到真正的：

> **并行开发而不互相破坏。**

---

# Stage 6：Version & Stage Planning

进入开发前明确：

## Current Version

这一版本完成什么？

## Included

本期包含。

## Excluded

本期不包含。

## Dependencies

依赖。

## Stage

项目拆成哪些阶段。

例如：

Stage 01
Foundation

Stage 02
Core Object

Stage 03
Data

Stage 04
AI

Stage 05
Result

Stage 06
Golden Flow

Stage 07
Release Candidate

每个 Stage 必须定义：

- Goal；
- Scope；
- Input；
- Output；
- Dependencies；
- Acceptance；
- Evidence；
- Exit Gate。

---

# Stage 7：Parallel Construction

完成前置统一后，进入：

> **并行建设**

可以并行建设：

- Frontend；
- Backend；
- Database；
- AI Skill；
- Model Gateway；
- Test；
- AI Eval；
- Observability；
- Documentation。

关键不是“大家一起开发”。

而是：

> **在 Contract 已经锁定的情况下并行。**

避免：

Frontend 自己猜 API；

Backend 自己改 State；

AI 自己定义新的数据结构；

Database 自己改变业务语义。

---

# Stage 8：Serial Golden Flow Closeout

模块分别完成并不意味着产品完成。

必须重新进入：

> **串行收口**

按照真实业务流程逐步验证。

例如：

User
→ Object
→ Data
→ Processing
→ AI
→ Review
→ Result
→ Export

形成：

# Golden Flow

Golden Flow 必须使用真实：

- UI；
- API；
- Auth；
- Permission；
- Database；
- Storage；
- Model；
- Runtime。

不能依赖大量 Mock 来证明产品已经完成。

---

# Stage 9：Testing & Acceptance

推荐形成多层验收机制。

## Local Verification

单模块验证。

## Integration Verification

模块之间集成。

## E1

本地 / 可控环境验证。

## E2

隔离非 Production Runtime 验证。

## Golden Flow

完整业务链路。

## Human Acceptance 01

第一次人工验收。

## Release Candidate Freeze

锁定 RC。

## Human Acceptance 02

基于冻结版本重新独立验收。

## Preview Certification

真实 Preview Runtime 验证。

## Production Authorization

Production 独立授权。

原则：

> 开发完成 ≠ Runtime 完成。

> Runtime 完成 ≠ 产品完成。

> 产品完成 ≠ 可以 Production。

---

# Stage 10：Release & Governance

发布前必须明确：

## Release Candidate

具体 Commit / Artifact / Migration。

## Runtime Identity

到底运行的是哪一个版本。

## Environment

Development / Test / Preview / Production。

## Database Authority

连接哪个数据库。

## Migration State

当前 Schema Authority。

## Permission State

实际权限。

## Model State

实际启用了哪个模型 / Skill。

## Rollback

失败如何回退。

Production 始终作为单独 Gate。

---

# 4. AI Coding Execution Framework

产品设计完成后，才进入 AI Coding 执行体系。

可以使用：

## GPT A — Planning

负责：

- 问题理解；
- 架构；
- Scope；
- 风险；
- Stage Planning。

## GPT B — Brief

负责把设计转换成：

> 可执行 Task Contract。

## GPT C / Codex — Execution

负责：

- Code；
- Test；
- Runtime Verification；
- Evidence；
- Checkpoint。

形成：

> **Planning → Brief → Execution**

而不是把一句自然语言直接丢给 Coding Agent。

---

# 5. Codex Prompt Profile

不同类型任务使用不同 Prompt Profile。

例如：

## Backend Profile

## Frontend Profile

## Database Profile

## AI Runtime Profile

## QA Profile

## AI Eval Profile

## Runtime Audit Profile

## Release Profile

每个 Profile 应预定义：

- Role；
- Authority；
- Allowed Actions；
- Forbidden Actions；
- Test Expectations；
- Evidence Requirements；
- Stop Gate。

这样不用在每一个 Prompt 重新解释整个项目规则。

---

# 6. Default Context

AI Executor 每次执行任务不应该重新理解整个项目。

推荐 Default Context：

**AGENTS.md**
↓
**Executor Role Card**
↓
**Project Context**
↓
**Architecture Authority**
↓
**Current Stage**
↓
**Task Handoff**

Module Context：

> 按需加载。

Historical Context：

> 仅需要时加载。

原则：

> **继承 Authority，而不是每次重新解释历史。**

---

# 7. Stage Traceability

每个 Stage 都应该留下结构化记录。

至少记录：

## Stage ID

## Goal

## Starting State

## Changes

## Decisions

## Tests

## Runtime Evidence

## Known Issues

## Deferred

## Final State

## Checkpoint

## Next Stage

形成：

> Requirement
> → Design
> → Code
> → Test
> → Runtime
> → Evidence
> → Acceptance

完整追踪链。

---

# 8. Checkpoint System

长项目不能只依赖聊天记录。

推荐固定三个关键 Checkpoint：

## PRE\_WRITE\_CHECKPOINT

开始修改前：

- 当前状态；
- Authority；
- Scope；
- Risk；
- Planned Changes。

## POST\_PHASE\_CHECKPOINT

阶段完成后：

- 实际修改；
- Test；
- Evidence；
- Remaining Issues。

## PRE\_NEXT\_PHASE\_CHECKPOINT

进入下一阶段前：

确认：

- Previous Stage 是否真正关闭；
- Dependencies 是否满足；
- 是否允许进入下一阶段。

---

# 9. Bounded Autonomy

AI Coding 不应该：

> 每一步都停下来问人。

也不能：

> 无限自主修改系统。

应该使用：

# Bounded Autonomy

在满足以下条件时允许 AI 自动处理：

- 可逆；
- 可审计；
- 同一 Root Cause；
- 非 Production；
- 非敏感权限；
- 不扩大 Scope；
- 不改变 Architecture Authority。

必须停下来的 Gate：

- Production；
- Database 高风险操作；
- 权限模型改变；
- Compliance；
- Credential；
- 不可逆数据写入；
- Cross-user Side Effect；
- Architecture Contract Change。

---

# 10. Artifact-Driven Development

尽量减少：

> 聊天记录就是项目状态。

项目状态应该存在 Artifact 中。

推荐核心 Artifact：

## Product

- PRODUCT\_CONTEXT
- BUSINESS\_MODEL
- USER\_FLOW
- PRODUCT\_ARCHITECTURE
- MODULE\_MAP

## System

- SYSTEM\_ARCHITECTURE
- DATA\_MODEL
- PERMISSION\_MODEL
- STATE\_MACHINE
- API\_CONTRACT

## AI

- AI\_CAPABILITY\_MAP
- SKILL\_SPEC
- MODEL\_POLICY
- SAFETY\_POLICY
- HUMAN\_GATE
- AI\_EVAL

## Execution

- STAGE\_PLAN
- TASK\_HANDOFF
- PROMPT\_PROFILE
- CHECKPOINT

## QA

- TEST\_PLAN
- GOLDEN\_FLOW
- RUNTIME\_AUDIT
- EVIDENCE\_PACK

## Release

- RELEASE\_CANDIDATE
- RELEASE\_CHECKLIST
- ROLLBACK\_PLAN

---

# 11. GPT Handoff Package

项目不能因为换一个 Chat / GPT 就重新理解。

阶段结束后生成：

# GPT Handoff

包含：

### Project Context

项目是什么。

### Architecture Authority

当前架构真相。

### Current Stage

现在做到哪里。

### Completed

哪些已经完成。

### Current Runtime

当前真实 Runtime。

### Decisions

已经锁定的决策。

### Failed Attempts

重要失败路径。

### Known Issues

已知问题。

### Deferred

明确延后。

### Next Task

下一任务。

### Evidence

关键证据。

最终目标：

> **New GPT 可以直接继续，而不是重新研究项目。**

---

# 12. Product Design Decision Framework

以后设计任何 AI 产品功能时，可以统一问下面的问题。

## Business

这个功能解决谁的什么真实任务？

## Object

它作用于哪个业务对象？

## Workflow

处于业务流程哪一步？

## State

会改变什么状态？

## Data

读取什么、产生什么？

## Permission

谁可以做？

## AI

为什么需要 AI？

## AI Boundary

AI 可以决定什么？

不能决定什么？

## Evidence

AI 结果如何被证明？

## Human Gate

什么时候需要人工？

## Failure

失败怎么办？

## Contract

与其他模块如何通信？

## Version

是不是当前版本必须完成？

## Acceptance

怎么证明完成？

如果这些问题无法回答清楚：

> **不应该直接进入开发。**

---

# 13. 新 AI 项目的标准初始化流程

以后创建新产品，可以直接运行以下流程：

### STEP 01

Project Definition

### STEP 02

Business Reality Modeling

### STEP 03

Product Object Model

### STEP 04

Capability Map

### STEP 05

Core User Flow

### STEP 06

AI Capability Map

### STEP 07

Product Architecture

### STEP 08

Technical Architecture

### STEP 09

Data / Permission / State Model

### STEP 10

Module Contract

### STEP 11

Version Scope

### STEP 12

Stage Plan

### STEP 13

Prompt Profile / Executor Setup

### STEP 14

Parallel Construction

### STEP 15

Serial Golden Flow Closeout

### STEP 16

Runtime Acceptance

### STEP 17

Release Candidate

### STEP 18

Production Gate

---

# 14. Framework 核心公式

最终可以把整套方法论压缩成三个层次。

## 产品层

**真实业务 → Object → Workflow → Capability → AI Boundary**

解决：

> 应该做什么产品？

---

## 系统层

**Capability → Architecture → Data → Permission → State → Contract**

解决：

> 应该怎么构建这个产品？

---

## 执行层

**Stage → Profile → Build → Test → Golden Flow → Evidence → Handoff → Release**

解决：

> 怎么确保 AI 真正把这个产品做出来？

---

最终形成完整链路：

> **Business Reality**
> → **Product Model**
> → **AI Capability**
> → **Architecture**
> → **Contract**
> → **Version**
> → **Stage**
> → **Parallel Build**
> → **Golden Flow**
> → **Evidence**
> → **Release**
> → **Handoff**

这就是整个 AI Native Product Creation Framework 的核心。