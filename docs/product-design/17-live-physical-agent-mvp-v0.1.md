# 向风行 / AI Photographer — Live Physical Agent MVP 技术与算法基线 V0.1

**Document ID:** `XFX_LIVE_PHYSICAL_AGENT_MVP_V0_1`  
**建议仓库路径:** `docs/product-design/17-live-physical-agent-mvp-v0.1.md`  
**状态:** `PLANNED / PARALLEL_SPIKE_INPUT`  
**来源:** 用户提供《AI Photographer — Live Physical Agent MVP 架构与算法设计》v0.1  
**适用范围:** Live 实时闭环；不包含 Capture、Photo QA、Reality+、Enhancement、支付、分享。

---

## 1. 定位

本模块不是完整 AI Photographer，也不是正式 Live Director 的全部实现。

它验证的是更底层的：

> **Perception-driven Physical Agent Runtime**

核心闭环：

```text
Phone Camera
→ Local Perception
→ Structured Current State
→ Target State
→ Delta
→ Priority
→ One Action
→ Human Action
→ Wait
→ Local Verification
→ Loop
```

只有本地无法可靠解决时：

```text
ESCALATE
→ Context Governor
→ Luna
→ Structured Action
```

核心原则：

```text
Camera Always On
Luna Mostly Sleeping

Local Measurement First
Semantic Escalation Only When Needed

One Issue
One Action
Wait
Verify
Then Continue
```

---

## 2. 与 AI Photographer Live Director 的关系

```text
Live Director
产品导演层
决定这一张照片现在应该让谁做什么
        │
        ▼
Photography Skill
摄影 Target / ShotDirection / Action Mapping
        │
        ▼
Physical Runtime
Observe / Compare / Prioritize / Act / Wait / Verify
        │
        ▼
Camera / Vision / Human Reality
```

### Live Director 负责

- PhotographySession 语义；
- SelectedTarget；
- ShotDirection；
- SUBJECT / PHOTOGRAPHER 角色协调；
- 摄影任务阶段；
- 必要时重新规划。

### Physical Runtime 负责

- Current State；
- Target State；
- Delta；
- Issue；
- Priority；
- Action；
- WAITING；
- Verification；
- READY。

Physical Runtime 不应直接认识：

```text
portrait
composition
look-back pose
cinematic mood
```

摄影专属语义通过：

```text
skills/photography/
```

适配。

---

## 3. MVP Scope

V0.1 固定：

```text
1 phone
1 fixed camera
1 person
1 target
1 active issue
1 active action
```

Target 第一版只需要：

```text
subject.present
subject.center_x
subject.center_y
subject.height_ratio
subject.stable
optional face_present
```

动作库只保留：

```text
MOVE_LEFT
MOVE_RIGHT
MOVE_CLOSER
MOVE_FARTHER
HOLD
```

第一版到：

```text
READY
```

即结束。

明确不做：

```text
Capture
Photo QA
Reality+
Enhancement
多人
复杂 Pose
复杂背景语义
完整摄影审美
微信/抖音正式接入
连续视频上传
Luna 固定频率轮询
```

---

## 4. Runtime Frequency Model

建议初始目标：

| Layer | Candidate Frequency | Role |
|---|---:|---|
| Camera Preview | ~30fps | 用户流畅预览 |
| Frame Scheduler | 8–15Hz | 控制进入视觉算法的帧 |
| Local Vision | 5–15Hz | Pose / 人体状态 |
| State Comparison | 5–10Hz | Current vs Target |
| Event Trigger | 5–10Hz | 本地介入 / Escalation |
| Luna | 常态 0Hz | 异常和语义歧义 |
| Human Instruction | ≥1.2s candidate | 人类理解和执行时间 |

这些均为：

```text
CANDIDATE_THRESHOLD
```

必须通过真机 Evidence 校准后才可升级 Authority。

---

## 5. Perception

V0.1 推荐：

```text
MediaPipe Pose Landmarker
```

输出 landmarks 后，通过 Geometry 得到：

```text
center_x
center_y
width_ratio
height_ratio
visibility
```

Tracking 第一版：

```text
dx = x[t] - x[t-1]
dy = y[t] - y[t-1]
ds = scale[t] - scale[t-1]
```

Temporal Filter 第一版：

```text
EMA
alpha candidate ~= 0.35
test range ~= 0.25–0.40
```

未来按 Evidence 再考虑：

```text
One Euro
Kalman
Optical Flow
MOT
```

---

## 6. Structured State

Runtime 只消费结构化状态，不直接消费业务层 raw image。

```json
{
  "timestamp_ms": 123456,
  "subject": {
    "present": true,
    "confidence": 0.94,
    "center_x": 0.43,
    "center_y": 0.51,
    "height_ratio": 0.58,
    "face_present": true,
    "velocity_x": 0.02,
    "velocity_y": 0.00,
    "velocity_scale": 0.01,
    "stable": false
  }
}
```

视觉实现未来从 MediaPipe 换成 ONNX / Native，不应改变 Physical Runtime Contract。

---

## 7. Coordinate Authority

必须区分：

```text
Sensor Coordinate
Preview Coordinate
User Action Coordinate
```

Camera Adapter 负责：

```text
front / rear
mirror / non-mirror
rotation
```

Physical Runtime 输出语义 Action：

```text
USER_MOVE_LEFT
USER_MOVE_RIGHT
```

而不是直接输出：

```text
x++
x--
```

避免前摄镜像造成错误指导。

---

## 8. Target / Delta / Deadband

Target Example：

```json
{
  "subject": {
    "center_x": 0.65,
    "center_y": 0.50,
    "height_ratio": 0.60
  },
  "tolerance": {
    "center_x": 0.05,
    "center_y": 0.06,
    "height_ratio": 0.08
  },
  "stable_ms": 600
}
```

Normalized Error：

```text
abs(target - current) / tolerance
```

Deadband：

```text
abs(delta) <= tolerance
→ SATISFIED
```

Physical Runtime 不追求数学绝对等于。

---

## 9. Priority / Hysteresis

V0.1：

```text
priority_score = weight × normalized_error
```

一次只处理：

```text
highest priority issue
```

Persistence Candidate：

```text
~300ms
```

Dominance Candidate：

```text
new_score > current_score × 1.25
```

目的是防止问题反复切换。

---

## 10. State Machine

```text
IDLE
↓
SEARCHING
↓
SUBJECT_LOCKED
↓
ANALYZING
↓
INSTRUCTING
↓
WAITING
↓
VERIFYING
├─ SUCCESS → ANALYZING
├─ IMPROVING → WAITING
├─ RETRY → ANALYZING
└─ UNCERTAIN / REPEATED_FAILURE → ESCALATE
                                      ↓
                                     Luna
                                      ↓
                                   WAITING

ALL TARGETS SATISFIED
+
STABLE
↓
READY
```

---

## 11. WAITING 是核心体验能力

系统发出：

```text
往右一点
```

后立即进入：

```text
WAITING
```

WAITING 时：

```text
Camera continues
Vision continues
State continues
Delta continues
Normal instruction emission stops
```

如果：

```text
error is decreasing
```

表示用户正在正确执行：

```text
SYSTEM REMAINS SILENT
```

系统只在动作稳定结束后重新 Verify。

Live V0.1 的核心 UX 指标是：

```text
不轰炸
不抖动
不反复改口
知道什么时候闭嘴
知道什么时候自动验证
```

---

## 12. Verification

记录：

```text
previous_error
current_error
```

分类候选：

```text
within tolerance → SUCCESS
error reduction >= candidate threshold → IMPROVING
little change → NO_EFFECT
error grows → WRONG_DIRECTION
```

核心原则：

> Physical Agent 的有效性由现实世界是否向 Target 收敛衡量，而不是由 AI 文案是否合理衡量。

---

## 13. Luna Escalation

Luna 常态关闭。

仅允许候选触发：

```text
Repeated Failure
Wrong Direction
Low Confidence
Unknown State
```

Context Governor 最小输入：

```text
Target Snapshot
Current State
Delta
Last Action
Recent Events
optional 1 low-res keyframe
```

Luna 返回结构化 Action，不发送连续 raw video。

---

## 14. Thread Model

```text
MAIN THREAD
├─ Camera Preview
├─ HUD
├─ Instruction
└─ Session UI

WORKER
├─ Frame Processing
├─ Vision Inference
├─ Temporal Filter
├─ State Extraction
└─ optional Runtime Calculation
```

原则：

> Vision 推理不能阻塞 Camera Preview。

---

## 15. Parallel Spike Runtime

第一阶段推荐：

```text
Mobile Web / PWA
Vite
TypeScript
getUserMedia()
requestVideoFrameCallback()
Web Worker
MediaPipe Tasks Vision
Pure TypeScript Physical Runtime
```

成熟后再接 WeChat / Douyin Adapter。

---

## 16. Development Gates

### LIVE-P0 — Camera Sandbox
- 手机打开；
- Camera permission；
- Preview ≥25fps candidate；
- 前后摄切换；
- mirror/coordinate/action direction 正确。

### LIVE-P1 — Perception / State
```text
Camera → Scheduler → Worker → Pose → Filter → Structured State
```
只观察 State，不指导。

### LIVE-P2 — Local Closed Loop
```text
LUNA = OFF
Target → Delta → Priority → Action → WAITING → Human → Verification → READY
```

### LIVE-P3 — Luna Escalation
只开放异常事件，记录 calls/tokens/latency/reason_code。

### LIVE-P4 — Device Performance
覆盖新旧 iPhone 与高中端 Android，验证 adaptive vision frequency。

---

## 17. Core Acceptance Candidate

```text
Camera Preview          >=25fps
Vision                  >=5Hz
Local State Latency     target <100ms
Instruction Gap         >=900ms
Recommended Gap         ~1200ms
READY Stable            >=600ms
Local Decision Ratio    >=80%
Correction Success      >=80%
Luna Calls              <=10 / 3min
Time To Target          target <60s
Obvious Oscillation     =0
Raw Video Upload        =0
```

全部仍是 V0.1 Candidate Gate，真机数据可以合法修正阈值，但必须保留历史 Evidence。

---

## 18. Integration Boundary

只有：

```text
LIVE-P0 PASS
LIVE-P1 PASS
LIVE-P2 PASS
LIVE-P3 PASS
LIVE-P4 PASS
```

才产生：

```text
LIVE_PHYSICAL_AGENT_CORE_ACCEPTANCE
```

随后通过：

```text
XFX_LIVE_PHYSICAL_AGENT_INTEGRATION_01
```

从当时最新 `develop` 选择性提取已接受设计与实现。

禁止直接把整个 Spike 分支 merge 成 Production implementation。

---

## 19. Future Production Candidate

如果 Spike 证明 Physical Runtime 无摄影语义依赖：

```text
packages/physical-runtime/
```

成为候选。

摄影规则：

```text
packages/photography-core/live/photography-skill/
```

V0.1 不提前锁定。

---

## 20. V0.1 Success Definition

真正成功不是：

```text
MediaPipe detects a person
```

而是：

```text
Reality
→ Local Perception
→ Current State
→ Target Delta
→ One Correct Intervention
→ Human Action
→ System Stays Silent During Improvement
→ Stable
→ Verification
→ Reality Converges
→ READY
```
