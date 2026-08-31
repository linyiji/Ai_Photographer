# 向风行｜Project Baseline Index V0.2

这个目录不是单纯的代码初始化包，而是项目第一版 **Single Source of Truth Baseline**。

Windows 建仓时建议将本目录内容作为第一次或前几次 Baseline Commit 纳入 Git。

---

## 1. Start Here

建议阅读顺序：

1. `README.md`
2. `docs/00-project-charter.md`
3. `docs/product-design/82-product-master-flow-v2.md`
4. `docs/architecture/83-capability-authority-and-contract-roadmap-v2.md`
5. `docs/architecture/84-live-observation-target-control-v4.md`
6. `docs/project-management/45-product-program-roadmap-v2.md`
7. `docs/product-design/10-golden-flow-v1.0.md`
8. `docs/product-design/15-story-a-f-master-v1.0.md`
9. `docs/product-design/16-global-design-foundation-v1.0.md`
10. `docs/research/20-product-tech-architecture-research-v1.0.md`
11. `docs/02-architecture-principles.md`
12. `docs/03-module-boundaries.md`
13. `docs/08-mvp-fast-feedback.md`
14. `docs/project-init/30-windows-first-project-init-v1.0.md`

---

## 2. Product Design Baseline

`docs/product-design/`

包含：

- Golden Flow
- Realtime Shot Control
- Reality+ Policy
- User Fine Tune
- Final Action Hub
- Story A–F
- Global Design Foundation
- Story A/B 历史参考

这些是产品与 UX 设计依据，不应被业务代码替代。

---

## 3. Technical / Research Baseline

`docs/research/`

当前包含：

- 主流程、技术架构、技术选型、MVP 与实施难点研究报告

工程原则：

```text
Workflow 是骨架
Session 是共享状态
Contract 是模块语言
Capability 是独立实现
```

以及：

```text
Global Definition First
Modular Delivery Second
```

---

## 4. Current Prototype

当前正式参考：

```text
prototypes/current/向风行_S01_风暴来临之前_CURRENT_V1.6.1.html
```

用途：

- 当前产品交互参考
- S01 Story 闭环
- P01–P13 页面/状态映射
- 摄影取景阶段图片化验证

Baseline 原型：

```text
prototypes/baseline/向风行_P01-P13_交互骨架_BASELINE_V1.1.html
```

用于比较当前版本和最初状态机。

**Prototype 是产品设计参考，不直接作为生产前端源码。**

---

## 5. Story Assets

### S01

`assets/story-s01/`

```text
S01-A01 Subject Anchor
S01-A02 Scene Anchor
S01-A03 Target Preview
S01-A04 Pose Guide A
S01-A05 Pose Guide B
S01-A06 Candidate Capture
S01-A07 Reality+ Final
```

### Future Story Source Library

`assets/story-library/`

保存同一主体 + 五个真实场景源素材：

1. Road
2. Fog Lake
3. Beach
4. European Street
5. City Street

后续 S02–S05 应从这里建立 Fixture，而不是重新寻找无关素材。

---

## 6. Repository Source-of-Truth Rule

建议 Git 中保留：

- Markdown 产品设计文档
- ADR
- 核心 Prototype HTML
- 小规模黄金测试素材
- Scenario Fixture
- Contract / Schema
- Source Code

大规模未来素材不应无限放 Git，应迁入 Object Storage，并在 Fixture 中用 Asset ID + Checksum 引用。

---

## 7. Version Rule

当前：

```text
Project Baseline: V0.6 Complete
Current Product Prototype: S01 V1.6.1
Product Master Flow: V2
Detailed Golden Flow: V1.0 (historical/detail authority)
Technical Research: V1.0
```

以后新版本不要直接删除旧版本，应：

- CURRENT 放当前有效版本
- BASELINE / archive 保存关键历史版本
- 文档顶部注明 Status


## 8. Progress Authority

项目进度统一见 `project-status/PROJECT_STATUS.md` 与 `PROJECT_STATUS.json`。任何 Codex 正式任务必须更新状态文件并生成 Task Report。


## 9. Challenge & Progress Visualization

难点状态由 `project-status/CHALLENGES.json` 管理。项目进程图见 `prototypes/project-control-center/XFX_Project_Control_Center_V0.1.html`。


## 10. AI Native Framework

Source:

`docs/framework/AI_Native_Product_Creation_Framework_V1_SOURCE.md`

向风行架构优化映射：

`docs/architecture/50-xfx-product-architecture-optimization-v2.md`

Framework 不替代现有 Milestone，而作为上层生命周期和工程治理参考。


## 11. Complete Baseline Integrity

最新执行任务：

`docs/execution/XFX_CODEX_TASK_00_WINDOWS_PROJECT_BOOTSTRAP_CURRENT.md`

完整性证明：

- `PACKAGE_INVENTORY.md`
- `PACKAGE_CHECKSUMS.sha256`
- `BASELINE_VERIFICATION_REPORT.md`
