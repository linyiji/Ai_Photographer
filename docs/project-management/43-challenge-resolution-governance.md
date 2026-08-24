# 43｜Challenge Resolution Governance

**Document ID:** `XFX_CHALLENGE_RESOLUTION_GOVERNANCE_V1`  
**Status:** Accepted

---

# 1. 为什么需要独立的难点治理

在 AI Photographer 项目里：

> “已经知道怎么解决” ≠ “已经解决”。

例如：

```text
难点：
小程序实时 CV 性能

方案：
端侧轻量 CV + 低频强 AI
```

这里只能说明：

```text
SOLUTION_PROPOSED
```

只有经过真实微信设备测试并达到验收标准，才允许：

```text
RESOLVED
```

因此所有关键难点必须独立追踪。

---

# 2. Challenge 生命周期

统一状态：

```text
IDENTIFIED
↓
ANALYZING
↓
SOLUTION_PROPOSED
↓
IMPLEMENTING
↓
VALIDATING
↓
RESOLVED
```

旁路状态：

```text
BLOCKED
DEFERRED
REOPENED
```

禁止：

```text
SOLUTION_PROPOSED → RESOLVED
```

直接跳过实施和验证。

---

# 3. Challenge Contract

每个难点至少记录：

```yaml
challenge_id:
title:
category:
severity:
status:

detected_in:
blocking_milestones:

problem:
impact:
root_cause_hypothesis:

solution:
implementation_plan:
validation_plan:

acceptance_criteria:

owner:
related_tasks:
related_modules:
related_stories:

evidence:
known_limitations:

created_at:
updated_at:
resolved_at:
```

---

# 4. Severity

```text
P0 = Safety / Architecture / Data Integrity / Core Flow Blocker
P1 = MVP Core Value Blocker
P2 = Significant Quality / Cost / UX Risk
P3 = Improvement / Optimization
```

## Gate Policy

如果某 Milestone 存在未关闭：

```text
P0
```

且该 Challenge 明确 blocking 当前 Gate：

> Gate 不允许 PASS。

P1 是否阻塞 Gate：

> 由对应 Milestone Acceptance Criteria 决定。

P2/P3 可根据明确依据 DEFER，但必须留档。

---

# 5. Evidence First

Challenge 进入 RESOLVED 必须存在证据。

允许 Evidence：

- Automated Test
- Scenario Replay
- Device Benchmark
- Field Test
- QA Dataset Eval
- Screenshot / Prototype Evidence
- Commit
- Acceptance Report
- Performance Measurement

禁止只写：

> “已优化”。

---

# 6. Reopen

如果后续模型、平台、设备或 Workflow 改动导致问题再次出现：

```text
RESOLVED
↓
REOPENED
```

保留之前 Evidence 和解决历史。

不能删除旧记录重新创建一个无历史 Challenge。

---

# 7. 与 Task / Milestone 的关系

```text
Challenge
  ↓
Solution Task
  ↓
Implementation
  ↓
Validation Task
  ↓
Evidence
  ↓
Resolved
  ↓
Milestone Gate 可继续
```

Task Report 必须列：

```text
Challenges Addressed
Challenges Introduced
Challenges Reopened
```

---

# 8. 当前核心难点清单

## CH-001 Target 可执行性

风险：

AI 推荐漂亮但现实拍不出来的 Target。

当前方案：

```text
Target Candidate
→ Reality Feasibility Check
→ Safety Filter
→ ShotDirection Feasibility
```

当前状态：

```text
SOLUTION_PROPOSED
```

---

## CH-002 Target Preview Reality Drift

风险：

目标预览偷偷换天气、人物、服装或地点。

方案：

```text
Person Anchor
+
Scene Anchor
+
Reality Fact Lock
+
SelectedTarget
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-003 Mini Program Realtime CV Performance

风险：

微信/抖音小程序 Camera Frame、WASM、内存、发热不足以支撑实时摄影。

方案：

```text
M04 WeChat Camera/CV Technical Spike
```

状态：

```text
IDENTIFIED
```

未做真实设备测试前不能标 RESOLVED。

---

## CH-004 Guidance Oscillation

风险：

```text
左一点
右一点
左一点
```

方案：

- Tolerance Zone
- Dead Zone
- Hysteresis
- Persistence
- Cooldown
- Ready Lock

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-005 双角色指令协调

风险：

摄影者和被拍摄者同时移动或同时收到语音。

方案：

```text
One Active Role
One Active Speaker
```

动态 Shot 才允许 BOTH。

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-006 QA 与 Taste 冲突

风险：

Technical Pass 不等于用户喜欢。

方案：

```text
Technical QA
≠
Taste QA
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-007 Partial Retake State Preservation

风险：

某个动作失败导致整个拍摄从头重来。

方案：

```text
ShotLockState
RetakePlan
AttemptState
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-008 Reality+ Identity / Reality Drift

风险：

修脸、修光时生成模型改变脸、服装、背景或天气。

方案：

```text
Parametric First
Semantic Edit only when explicit
Identity Lock
Reality Fact Lock
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-009 Runtime Latency

风险：

每一个实时动作都等待云端模型。

方案：

```text
Local CV
+
State Engine
+
Event-driven Strong AI
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-010 Model / API Cost

风险：

MVP 调试和实时摄影反复调用高成本模型。

方案：

```text
MOCK
CACHED
LIVE
```

以及：

```text
Preview Low Cost
Final High Quality
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-011 Asset / Identity Version Control

风险：

图片变成：

```text
final.png
final2.png
final-new.png
```

且不知道页面使用哪一张。

方案：

```text
AssetRef
AssetManifest
Lineage
Version
Status
Checksum
```

状态：

```text
SOLUTION_PROPOSED
```

---

## CH-012 MVP Feedback Speed

风险：

每次改动都要真人、真机、重新外拍。

方案：

```text
Web Lab
Scenario Fixture
Session Replay
State Replay
Debug Trace
```

状态：

```text
SOLUTION_PROPOSED
```

---

# 9. Challenge Authority

正式数据：

```text
project-status/CHALLENGES.json
```

人类阅读：

```text
project-status/CHALLENGES.md
```

Lab 可视化：

```text
prototypes/project-control-center/
```

Git 保存历史。

---

# 10. 一句话规则

> **难点必须从“提出方案”推进到“有证据验证”，才能叫解决。**
