# 向风行 / AI Photographer — Live Parallel Track 开发与接入治理 V0.1

**Document ID:** `XFX_LIVE_PARALLEL_TRACK_GOVERNANCE_V0_1`  
**建议仓库路径:** `docs/project-management/45-live-parallel-track-governance-v0.1.md`  
**状态:** `PLANNED_NOT_STARTED`

---

## 1. Purpose

允许 Live Physical Agent 在不阻塞主产品路线的情况下提前验证。

原则：

```text
Parallel Experiment
!= Production Architecture

Spike Evidence
!= Production Code Authority
```

---

## 2. Common Starting Point

双轨共同起点：

```text
develop
ced35fa17931935b921a1937a32d269e46ebf8ff
```

该节点已包含：

```text
Environment L0 PASS
Frontend Runtime Compatibility Spike PASS
XFX Codex Execution Standard V1 ACTIVE
```

---

## 3. Track A — Main Product

```text
XFX_FRONTEND_RUNTIME_L1_LOCK_01
↓
XFX_M01_GLOBAL_CONTRACTS_LOCK_01
↓
M02 Application Skeleton
↓
M03 Fast Feedback Lab
↓
M04 WeChat Camera/CV
↓
M05 MVP Golden Flow
```

Live Spike 不允许提前改变 Track A 的 Contract Authority。

---

## 4. Track B — Live Physical Agent

Branch Candidate：

```text
spike/live-physical-agent-mvp-v0.1
```

建议独立 Git Worktree：

```text
D:\Projects\_worktrees\Ai_Photographer-live
```

```text
D:\Projects\Ai_Photographer
→ main product track

D:\Projects\_worktrees\Ai_Photographer-live
→ live physical agent spike
```

---

## 5. Spike Repository Location

实验代码候选：

```text
spikes/live-physical-agent-mvp/
```

不是：

```text
apps/client/
packages/photography-core/
```

V0.1 是技术与体验验证，不应反向冻结正式 Production Architecture。

---

## 6. Live Gate Sequence

```text
LIVE-P0 CAMERA_SANDBOX
↓
LIVE-P1 PERCEPTION_STATE
↓
LIVE-P2 LOCAL_CLOSED_LOOP
↓
LIVE-P3 LUNA_ESCALATION
↓
LIVE-P4 DEVICE_PERFORMANCE
↓
LIVE_PHYSICAL_AGENT_CORE_ACCEPTANCE
```

每个 Gate：

```text
Task
→ Evidence
→ Acceptance
→ Next Task
```

不得一次把 P0–P4 全部实现后再验收。

---

## 7. Independence Rules

Track B 可以：

- 创建 Spike-only types；
- 创建 Mock / Replay fixtures；
- 使用 Mobile Web / PWA；
- 使用 MediaPipe；
- 创建 telemetry；
- 做真机测试；
- 生成 Candidate Algorithm。

Track B 不可以：

- 修改 `main`；
- 静默修改 `develop`；
- 宣布正式 global contract；
- 修改主线 L1 Runtime Authority；
- 将 Spike type 宣布为 Production Contract；
- 将 MediaPipe 直接冻结成 M04 Production Authority；
- 直接实现正式 `apps/client`；
- 自动进入 Capture / QA / Reality+。

---

## 8. Evidence Ownership

Spike 应保存：

```text
spikes/live-physical-agent-mvp/evidence/
├── camera/
├── perception/
├── closed-loop/
├── luna/
└── device-matrix/
```

核心 Metrics：

```text
preview_fps
vision_hz
inference_ms_p50/p95
local_decisions
instructions
successful_corrections
failed_corrections
oscillation_count
luna_calls
luna_tokens
luna_latency
time_to_target
```

---

## 9. Candidate Governance

所有初始参数：

```text
EMA alpha
Persistence
Dominance
Instruction Gap
Stable Window
Verification Threshold
Vision Hz
Luna Budget
```

默认状态：

```text
CANDIDATE
```

只有 Evidence-backed Gate 可以升级。

失败参数和负面 Evidence 必须保留。

---

## 10. Integration Trigger

只有：

```text
LIVE_PHYSICAL_AGENT_CORE_ACCEPTANCE = PASS
```

才允许创建：

```text
XFX_LIVE_PHYSICAL_AGENT_INTEGRATION_01
```

Integration Branch：

```text
integration/live-physical-agent
```

必须从 integration-time 最新 `develop` 创建，而不是从旧 Spike branch 直接继续。

---

## 11. Integration Method

禁止：

```text
git merge spike/live-physical-agent-mvp-v0.1
→ production
```

正确：

```text
Spike Evidence
↓
Accepted Design Decisions
↓
Contract Mapping
↓
Selective Production Reimplementation / Extraction
↓
Integration Tests
↓
Product Gate
```

---

## 12. Production Placement Decision

Integration 时再决定：

### Option A

```text
packages/photography-core/live/
```

适用于 Runtime 仍有摄影语义。

### Option B

```text
packages/physical-runtime/
+
packages/photography-core/live/photography-skill/
```

适用于底层 Runtime 已证明完全通用。

V0.1 不提前锁定。

---

## 13. Conflict Rule

如果 Live Spike 与主线 Contract / Runtime Authority 冲突：

```text
Current develop Canonical Authority wins
```

Live 结果记录为：

```text
INTEGRATION_CONFLICT
```

由 Integration Task 解决。

Spike 不允许反向静默覆盖主线。

---

## 14. Stop Boundary

Live Track 当前只计划，不自动启动。

第一个 Live Task：

```text
XFX_LIVE_PHYSICAL_AGENT_MVP_SPIKE_01
```

但第一次执行只应覆盖：

```text
Worktree Bootstrap
+
LIVE-P0 Camera Sandbox
```

P0 PASS 后再创建 P1 Task。
