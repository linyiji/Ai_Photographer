# 向风行 AI Photographer

> Reality First AI Photography System

## 正式主流程

ENTRY → REALITY UNDERSTANDING → TARGET → SHOT DIRECTION → REALTIME SHOT CONTROL → CAPTURE → QA / RETAKE → REALITY+ → OPTIONAL FINE TUNE → FINAL ACTION HUB

## 工程原则

- Workflow 是骨架
- Session 是共享状态
- Contract 是模块语言
- Capability 是独立实现
- Global Definition First, Modular Delivery Second
- One Repository, Multiple Runtimes, Reproducible Environment

## 第一开发环境

Windows First，但 Windows 与 Mac 不建立两套项目。

Windows 完成第一版后 Push 到 Git；Mac 后续直接 clone 同一仓库。

## 仓库骨架

```text
apps/
  client/      # Taro/React/TS 产品端
  lab/         # Web Debug / Replay Lab
  api/         # FastAPI
packages/
  contracts/
  workflow/
  photography-core/
  platform/
  design-system/
  scenario-fixtures/
infrastructure/
  docker/
docs/
scripts/
```

先阅读 `docs/`，然后初始化 Git。

## 项目 Baseline 资料

本仓库初始化包同时包含：

- 已冻结的产品设计文档
- Story A–F
- Global Design Foundation
- 技术架构研究报告
- 当前最新 S01 V1.6.1 HTML 原型
- S01 主体 / 场景 / Target / Pose / Candidate / Reality+ 资产
- 后续 S02–S05 的真实场景源素材

详见：

`docs/PROJECT_BASELINE_INDEX.md`

当前 Prototype：

`prototypes/current/向风行_S01_风暴来临之前_CURRENT_V1.6.1.html`

## 项目进度权威

正式进度不以聊天记录为准。

优先读取：

```text
project-status/PROJECT_STATUS.json
project-status/PROJECT_STATUS.md
```

进度治理规则：

```text
docs/project-management/40-progress-governance.md
```

推进方式：

```text
Milestone
→ Task
→ Gate
→ Evidence
→ Next Task
```

任何 Task 未通过 Acceptance Gate，不进入下一 Milestone。


## 难点解决与进程图

关键难点权威：

```text
project-status/CHALLENGES.json
project-status/CHALLENGES.md
```

治理规则：

```text
docs/project-management/43-challenge-resolution-governance.md
```

可视化控制中心：

```text
prototypes/project-control-center/XFX_Project_Control_Center_V0.1.html
```

原则：

> 方案已定义 ≠ 难点已解决。只有实施 + 验证 + Evidence 完成后才允许 RESOLVED。


## AI Native Framework Integration

V0.5 在 V0.4 全量内容基础上新增：

```text
docs/framework/AI_Native_Product_Creation_Framework_V1_SOURCE.md
docs/architecture/50-xfx-product-architecture-optimization-v2.md
docs/project-management/44-framework-to-xfx-stage-mapping.md
AGENTS.md
project-status/CURRENT_VERSION_SCOPE.md
project-status/GPT_HANDOFF.md
```

原则：

> Framework 作为上层方法论，不覆盖已冻结的 Golden Flow 和现有 Product Baseline。

主要架构增强：

```text
AI Candidate Gate
Architecture / Contract Freeze
Version First
Authority Plane
Evidence / Evaluation Plane
Checkpoint
Bounded Autonomy
Handoff
```


## Complete Baseline V0.6

Windows 第一轮正式建仓请使用本 Complete Baseline。

最新 Codex TASK 00：

```text
docs/execution/XFX_CODEX_TASK_00_WINDOWS_PROJECT_BOOTSTRAP_CURRENT.md
```

包完整性：

```text
PACKAGE_INVENTORY.md
PACKAGE_CHECKSUMS.sha256
BASELINE_VERIFICATION_REPORT.md
```
