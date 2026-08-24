# 向风行｜AI Photographer 主流程、技术架构与实施难点研究报告 V1.0

**Document ID：** `XFX_AI_PHOTOGRAPHER_PRODUCT_TECH_RESEARCH_V1`  
**项目：** 向风行 / AI Photographer / AI Visual Director  
**文档类型：** 产品研究 + 技术架构 + 技术选型 + MVP实施 + 风险分析  
**版本：** V1.0  
**日期：** 2026-08-24  
**状态：** 第一版研发基线；模型、云厂商具体版本与报价在正式实施前需再次核验

---

# 0. 报告摘要

向风行当前已经从“AI 拍照辅助 / AI 修图”的初步想法，收敛为一套相对完整的：

> **Reality First AI Photography System**

它的核心不是替用户重新生成一张漂亮照片，而是：

> **先理解真实人物与真实现场，设计一个现实中可执行的拍摄 Target，再把专业摄影师的判断转化为普通用户可以执行的一步一步现场指导，帮助用户真正把照片拍好；拍摄完成后再通过 QA、Reality+ 和用户 Fine Tune 完成交付。**

正式主流程建议冻结为：

```text
ENTRY
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

系统架构则不再基于“多个 GPT 串联”，而建议正式采用：

```text
PhotographySession
+
Workflow Engine
+
Versioned Data Contracts
+
Replaceable Capability Modules
+
Model / CV Gateway
+
Client Adapters
```

MVP 实施策略建议采用：

> **Skeleton First：先让整条 Workflow 永远可运行，再把 Mock Capability 一个一个替换成真实能力。**

第一阶段最值得验证的默认用户故事是：

> **Reality First + 双人单手机 + 静态拍摄 + Capture QA + 精准 Retake**

对应此前 Story C + Story E + Story A 的 Target Discovery 能力。

---

# 1. 产品定义

## 1.1 产品要解决的问题

普通用户在真实环境中拍照时，最常见的困难并不是：

> “相机不会按快门。”

而是：

- 不知道这里到底适合拍什么；
- 不知道人物应该站哪里；
- 不知道摄影者应该站哪里；
- 不知道人物应该占画面多少；
- 不知道当前背景是不是太乱；
- 不知道该用全身、半身还是近景；
- 不知道 Pose 是否适合当前穿搭和环境；
- 不知道刚才那张到底有没有拍到；
- 不知道哪些问题应该重拍，哪些可以后期修。

因此向风行真正解决的是：

# Photography Decision Making

而不是单纯：

# Camera Operation

---

## 1.2 产品一句话定义

> **向风行先看懂“今天的你”和“现在这里”，再告诉你们“这张值得拍成什么、人物站哪里、拍摄者站哪里、现在下一步该怎么调整”，直到真正拍到一张可用照片。**

---

# 2. 产品核心原则

## 2.1 Reality First

AI 必须以真实人物、真实场景、真实天气和当前空间条件为基础。

默认禁止：

- 偷偷换人物；
- 偷偷换穿搭；
- 阴天默认改蓝天；
- 上午默认改夕阳；
- 换地点；
- 改成现实中不存在的地标；
- 为了 Target 强迫用户进入危险区域。

产品应优先：

```text
真实摄影改善
>
生成式重构
```

---

## 2.2 Capture Causality

必须成立：

```text
Better Capture
↓
Better Final Result
```

不能长期变成：

```text
Bad Capture
↓
AI全部重生成
↓
Same Final Result
```

否则前面的 Target、ShotDirection 和 Live Guidance 全部失去产品价值。

---

## 2.3 AI Owns Expertise, User Owns Taste

AI负责：

- 专业判断；
- 默认方案；
- Scene诊断；
- Target推荐；
- Shot规划；
- 是否达到 Capture Gate；
- Photo QA；
- Repair / Retake建议。

用户负责：

- 最终选择哪个 Target；
- 是否喜欢照片；
- 最后一公里审美；
- 是否进入更强创作。

---

## 2.4 One Screen, One Decision

用户端不暴露系统全部复杂度。

例如后台可能同时知道：

```text
subject_position_error
subject_scale_error
camera_angle_error
pose_error
gaze_error
```

前台一次只说：

> **往右一点。**

---

# 3. 产品主流程

---

# STEP 01｜ENTRY

目标：

> 决定用户从 Reality 还是已有 Target 开始。

两个核心入口：

### Reality First

> AI看看这里怎么拍。

适合：

> “我不知道这里怎么拍。”

### Target First

> 照这个效果拍。

适合：

> “我已经知道想拍成什么。”

输出：

```text
EntryMode
```

例如：

```yaml
entry_mode: REALITY_FIRST
```

或：

```yaml
entry_mode: TARGET_FIRST
desired_target_id: ...
```

---

# STEP 02｜SHOOTING RELATION / DEVICE MODE

用户只需要表达：

> 谁帮我拍？

然后系统再确定设备关系。

正式建议只支持三个 Device Mode：

```text
DUAL_PERSON_DUAL_DEVICE
DUAL_PERSON_SINGLE_DEVICE
SOLO_FIXED_CAMERA
```

其中 MVP 默认优先：

# DUAL_PERSON_SINGLE_DEVICE

原因：

- 摩擦最低；
- 不要求朋友扫码；
- 不依赖双端同步；
- 摄影者手机本身就是主 Camera；
- AI 可以通过屏幕指导摄影者，通过语音指导被拍摄者。

双手机作为 Enhanced Mode。

---

# STEP 03｜REALITY UNDERSTANDING

默认不再要求：

> 上传人物图 + 上传场景图。

而是进入 Camera Session 后通过：

```text
Person Key Frame
+
Scene Key Frame / Short Scan
```

建立：

```text
PersonContext
SceneContext
SpatialContext
SafetyContext
```

组合成：

# RealityContext

---

## 3.1 PersonContext

至少包含：

```yaml
person_context:
  subject_count:
  outfit:
  dominant_colors:
  hair:
  current_pose:
  body_orientation:
  visibility:
  identity_anchor:
```

重点是：

> 视觉状态，而不是评价人物美丑。

---

## 3.2 SceneContext

至少包含：

```yaml
scene_context:
  scene_type:
  visual_anchors:
  visual_noise:
  available_backgrounds:
  lighting:
  horizon:
  leading_lines:
  depth:
```

---

## 3.3 SpatialContext

用于回答：

> 人能站哪里，摄影者能站哪里。

例如：

```yaml
spatial_context:
  subject_candidate_zones:
  camera_candidate_zones:
  movement_paths:
  occlusion_zones:
```

---

## 3.4 SafetyContext

Safety属于 Hard Constraint。

例如：

```yaml
safety_context:
  forbidden_zones:
  road_risk:
  water_edge_risk:
  unstable_surface:
```

后面任何 Target / ShotDirection 都不能绕过 Safety。

---

# STEP 04｜TARGET SELECTION / ADAPTATION

这一层只回答：

# WHAT

即：

> 最后应该拍成一张什么画面。

---

## 4.1 Reality First

```text
RealityContext
↓
Visual Opportunity Detection
↓
Target Candidates
↓
Feasibility Filter
↓
Safety Filter
↓
Top 3
```

用户选择一个：

# SelectedTarget

---

## 4.2 Target First

输入：

```text
DesiredTarget
+
RealityContext
```

系统输出：

```text
CompatibilityResult
↓
AdaptationPlan
↓
ExecutableTarget
↓
SelectedTarget
```

兼容性建议三档：

```text
GOOD_FIT
ADAPTABLE
NOT_SUITABLE
```

用户端显示：

- 很适合；
- 可以拍，但需要调整；
- 当前不太适合。

---

# 4.3 SelectedTarget 与 ShotDirection 必须分开

这是整个数据设计的关键。

## SelectedTarget = WHAT

例如：

```yaml
selected_target:
  subject_region:
  subject_scale:
  framing:
  background_anchors:
  visual_relationship:
  body_orientation:
  gaze:
  mood:
  realism_constraints:
```

它描述：

> “最终画面长什么样。”

---

# STEP 05｜SHOT DIRECTION

这一层回答：

# HOW

例如：

```yaml
shot_direction:
  subject_anchor:
  camera_anchor:

  camera:
    distance:
    height:
    angle:
    lens:

  action:
    pose:
    gaze:
    subject_movement:
    camera_movement:

  execution_order:

  tolerance:

  safety_constraints:

  success_criteria:
```

它描述：

> “现实里两个人到底怎么把这个 Target 拍出来。”

---

# 5.1 为什么不能把 Target 和 ShotDirection 混起来

如果一个超级 `TargetBlueprint` 同时包含：

```text
人物右三分之一
Camera胸口高度
摄影者右前方
Zoom 1.2x
Pose
```

那么以后：

- Target复用；
- Target First；
- 重新规划机位；
- Retake Router；
- Scene变化；

都会变得很难维护。

因此必须继续保持：

```text
SelectedTarget
= Visual Contract

ShotDirection
= Execution Contract
```

---

# STEP 06｜REALTIME SHOT CONTROL

这是产品技术难度最高的部分。

系统需要持续回答：

> 当前现实距离 ShotDirection 还差什么？

核心结构：

```text
ShotDirection
        VS
CurrentShotState
        ↓
Difference Vector
        ↓
Priority Engine
        ↓
Instruction Stabilizer
        ↓
Next Best Instruction
```

---

# 6.1 实时分析不等于实时调用大模型

正式建议：

```text
Camera Stream
约30 FPS
↓
Lightweight Frame Processor
5～10 FPS
↓
FramePerception
↓
CurrentShotState
2～5 Hz
↓
Guidance Engine
↓
Instruction only on meaningful state change
```

VLM / 强 AI只在：

- 初始理解；
- Target规划；
- ShotDirection生成；
- Reality显著变化；
- 连续失败；
- Replan；

时调用。

---

# 6.2 FramePerception 与 CurrentShotState

建议正式拆开。

## FramePerception

当前帧直接观察：

```yaml
frame_perception:
  person_bbox:
  person_scale:
  pose_keypoints:
  head_pose:
  face_visibility:
  face_brightness:
  horizon:
  blur:
```

---

## CurrentShotState

是 Session 级状态：

```yaml
current_shot_state:
  subject_position:
  subject_scale:
  body_orientation:
  pose_state:
  gaze_state:

  framing:
  background_state:

  camera_motion:
  stability:

  active_role:
  active_phase:
  current_instruction:

  ready:
    safety:
    camera:
    subject:
    framing:
    pose:
    gaze:
```

---

# 6.3 Guidance Priority

建议继续保持：

```text
P0 Safety
↓
P1 Camera Position
↓
P2 Subject Position
↓
P3 Framing / Scale
↓
P4 Body Orientation
↓
P5 Major Pose
↓
P6 Gaze
↓
P7 Micro Adjustment
↓
P8 Capture Timing
```

高优先级问题未解决：

> 不处理低优先级问题。

---

# 6.4 One Active Role

普通 Static Shot：

> 一个时刻主要只让一个角色动。

例如：

```text
摄影者：
往右一点

人物：
先保持
```

完成后：

```text
摄影者：
保持

人物：
往湖边一步
```

动态 Shot 才允许：

# BOTH

例如：

```text
人物往前走
+
摄影者缓慢后退
```

---

# STEP 07｜CAPTURE READINESS / CAPTURE

建议同时维护：

## Capture Readiness Score

用于内部：

- Debug；
- 排序；
- Analytics；
- 算法评估。

---

## Capture Readiness Gate

用于真正判断是否可以拍。

例如：

```text
Safety PASS
Subject Position PASS
Framing PASS
Major Pose PASS
Stability PASS
```

Hard Gate 通过以后：

```text
CAPTURE_READY
```

不能简单：

> 平均分 > 85 就拍。

---

# STEP 08｜PHOTO QA / RETAKE ROUTER

拍完以后首先做 QA。

不是：

> 直接修图。

系统判断：

```text
技术上有没有拍到
+
Target有没有成立
+
问题能不能修
```

建议 CaptureDecision：

```text
ACCEPT
ACCEPT_WITH_REPAIR
RETAKE_MICRO
RETAKE_POSE
RETAKE_FRAMING
RETAKE_POSITION
REPLAN
```

用户端不显示专业枚举。

---

# 8.1 Retake Router

关键原则：

# Preserve What Is Already Right

例如：

```text
Camera ✓
Subject Position ✓
Framing ✓
Pose ✓
Gaze ✕
```

系统应该：

> “位置不用动，这次回头慢一点。”

而不是从头开始。

建议数据对象：

```yaml
retake_plan:
  reason:
  route_to:

  preserve:
  unlock:

  instruction:
  attempt:
  requires_replan:
```

---

# STEP 09｜REALITY+

Photo QA通过以后才进入：

# Reality+

定义：

> 真实照片的专业最佳版本。

---

## 9.1 Reality+ Natural

适合默认。

包括：

- Exposure；
- White Balance；
- Skin Tone；
- Dynamic Range；
- Noise；
- Sharpness；
- 轻量 Crop；
- 小范围背景整理。

---

## 9.2 Reality+ Polished

仍保持真实事实。

可以进一步：

- Target-aware color grading；
- 主体/背景层次；
- 小干扰物；
- 轻局部光影；
- 更完整画面关系。

---

## 9.3 Stylized 不应该无限塞进 Reality+

如果开始：

- 换天气；
- 明显重构背景；
- 大量新增元素；
- 强重新设计光线；

应该进入：

```text
Creative+
/
AI Artwork
```

---

# STEP 10｜OPTIONAL USER FINE TUNE

Reality+ 完成以后：

用户可以：

### 就这样

直接进入 Final。

或：

### 微调一下

进入：

```text
整体
人物
背景
局部
```

这层默认采用：

# Deterministic / Parametric Editing

而不是再次调用生成模型。

原则：

> **AI负责做到专业，用户负责调成自己喜欢。**

---

# STEP 11｜MY FINAL PHOTO

资产关系：

```text
OriginalCapture
↓
AcceptedCapture
↓
RealityPlusAsset
↓
AdjustmentRecipe
↓
MyFinalPhoto
```

每一层都应该保存 Lineage。

不静默覆盖上一层。

---

# STEP 12｜FINAL ACTION HUB

一级入口长期保持：

```text
保存高清图
分享
做成实物
更多玩法
```

系统自动：

> 保存到我的作品。

后链路包括：

```text
ShareAsset
ProductArtwork
CreativeArtwork
WorksLibrary
Order
```

---

# 4. 软件系统架构

建议正式架构：

```text
                     CLIENTS
          ┌───────────┼───────────┐
        WeChat      Douyin      Native
          └───────────┼───────────┘
                      ↓
                 Client Adapter
                      ↓
              Photography API
                      ↓
              PhotographySession
                      ↓
                Workflow Engine
                      ↓

  ┌───────────────────┼────────────────────┐
  │                   │                    │
  ▼                   ▼                    ▼

Understanding      Teacher Layer       Assistant Layer
Capabilities       Target / Shot       QA / Post
                      │
                      ▼
               Realtime Control
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
     Frame Processor       Guidance Engine
           │                     │
           └──── CurrentShotState┘
                      ↓
                   Capture
                      ↓
               Post Production
```

模型统一经过：

```text
Model / CV Gateway
```

---

# 5. PhotographySession

PhotographySession 应成为整个产品最核心的 Domain Aggregate。

建议：

```yaml
PhotographySession:

  session_id:
  user_id:
  status:
  workflow_version:

  entry:
    entry_mode:
    desired_target:

  device:
    shooting_relation:
    device_mode:
    participants:

  reality:
    person_context:
    scene_context:
    spatial_context:
    safety_context:

  planning:
    compatibility_result:
    adaptation_plan:
    selected_target:
    shot_direction:

  live:
    current_shot_state:
    guidance_history:
    ready_state:

  capture:
    captures:
    capture_decision:
    retake_plan:
    attempt_state:

  post:
    accepted_capture:
    reality_plus_asset:
    adjustment_recipe:
    final_photo:

  derivatives:
    share_assets:
    creative_assets:
    product_artworks:
```

---

# 6. Workflow Engine

不建议第一版直接引入复杂分布式 Workflow 平台。

MVP 可以采用：

# Explicit Application State Machine

例如：

```text
SESSION_CREATED
↓
REALITY_CAPTURE
↓
REALITY_READY
↓
TARGET_READY
↓
SHOT_DIRECTION_READY
↓
LIVE_GUIDANCE
↓
CAPTURE_READY
↓
CAPTURED
↓
QA
├─ RETAKE → LIVE_GUIDANCE
└─ ACCEPT
     ↓
REALITY_PLUS
↓
OPTIONAL_FINE_TUNE
↓
FINAL_READY
```

每一次 Transition：

- 验证前置条件；
- 记录时间；
- 记录状态来源；
- 写入 Audit/Event。

后续复杂度显著增加时，再评估 Temporal / 工作流引擎。

---

# 7. Data Contract

模块之间禁止依赖长自然语言。

推荐：

# Pydantic / JSON Schema Versioned Contract

例如 Target：

```yaml
schema_version: 1

subject:
  target_region:
    x: 0.67
    tolerance: 0.06

  target_scale:
    value: 0.46
    tolerance: 0.07

visual:
  framing: FULL_BODY
  gaze: LEFT_FAR
```

Guidance UI再翻译：

> 往右一点。

这样未来替换：

- VLM；
- LLM；
- CV；
- 规则；
- Provider；

都不会破坏下游 Contract。

---

# 8. 推荐技术选型

以下为第一版研发建议，不代表唯一方案。

---

# 8.1 Client

目标平台：

```text
微信小程序
抖音小程序
后续 Native App
```

建议：

## 普通业务 UI

可以使用：

```text
TypeScript
+
Taro / Shared UI Layer
```

共享：

- 登录后的业务页面；
- Target；
- QA；
- Fine Tune；
- Final Hub；
- Works。

---

## Camera / Realtime 部分

必须预留：

# Platform Adapter

例如：

```text
WeChatCameraAdapter
DouyinCameraAdapter
NativeCameraAdapter
```

原因：

- Camera Frame API差异；
- Canvas / WASM能力差异；
- 性能限制；
- 权限差异；
- 保存/相册能力差异。

不要强行要求：

> 全部实时相机能力100%跨平台共用。

---

# 8.2 Client-side Vision

MVP 首先尝试：

```text
Lightweight CV
+
Platform Camera Frames
+
WASM / Canvas / Native-like APIs
```

能力优先级：

### P0

- Person Bounding Box；
- Subject Scale；
- Face Visibility；
- Basic Blur；
- Basic Brightness；
- Device Motion / IMU。

### P1

- Pose Keypoints；
- Head Pose；
- Body Orientation；
- Background Anchor Tracking。

### P2

- 更复杂 Composition Understanding；
- Scene Geometry；
- Advanced Pose Matching。

---

# 8.3 Backend

推荐：

# Python + FastAPI

原因：

- AI / CV生态友好；
- Pydantic非常适合 Data Contract；
- Async API适合模型调用；
- 迭代快。

---

# 8.4 Relational Database

推荐：

# PostgreSQL

存储：

- Session；
- State；
- Contract；
- Target；
- ShotDirection；
- QA；
- Asset metadata；
- Orders；
- Audit。

不建议把核心 Session 只放 Redis。

---

# 8.5 Redis

用于：

- Hot Session；
- Shared Shooting Session Sync；
- Temporary State；
- Rate Limit；
- Task Queue；
- Short-lived Event。

---

# 8.6 Object Storage

中国大陆优先：

# OSS / S3-compatible abstraction

保存：

- Person Anchor；
- Scene Key Frames；
- CaptureAsset；
- RealityPlus；
- Final；
- ProductArtwork。

业务代码建议通过：

```text
ObjectStorageAdapter
```

避免核心逻辑绑定厂商。

---

# 8.7 Realtime Sync

双手机 Shared Session：

推荐：

```text
WebSocket
+
Redis Pub/Sub / Stream
```

MVP 不建议引入 Kafka。

典型数据：

```text
ROLE_CHANGED
CAMERA_READY
SUBJECT_READY
CURRENT_INSTRUCTION
CAPTURE_READY
CAPTURE_COMPLETED
```

---

# 8.8 Background Jobs

适用于：

- VLM分析；
- Reality+；
- Artwork；
- Product Render；
- Async QA。

建议：

```text
Redis-backed Task Queue
+
Worker
```

第一版可选择：

- Celery；
- Dramatiq；
- RQ；

核心架构只定义：

# Job Queue Contract

不与具体库绑定。

---

# 8.9 Model Gateway

必须存在统一：

# ModelGateway

接口例如：

```text
understand_image()
reason()
create_target_preview()
edit_image()
generate_artwork()
```

第一版中国大陆部署可以优先接入国内 Provider。

但 Domain Layer 不直接依赖：

> 某一个模型名。

Provider-specific 逻辑全部在 Gateway Adapter。

---

# 9. 模型能力拆分建议

不以“5个GPT”作为系统边界。

建议 Capability：

```text
PersonUnderstandingCapability
SceneUnderstandingCapability
TargetPlanningCapability
ShotPlanningCapability
FramePerceptionCapability
GuidanceCapability
PhotoQACapability
RealityEnhancementCapability
CreativeArtworkCapability
```

Teacher / Assistant 更适合作为：

# Product-facing Agent Persona

而不是：

# Domain Module Boundary

---

# 10. MVP实施策略

正式推荐：

# Skeleton First

---

# Phase 0｜Interactive Prototype

当前 HTML Prototype 已经承担：

- Workflow验证；
- State验证；
- UX验证；
- Story验证。

---

# Phase 1｜Software Skeleton

必须真做：

```text
Camera
Session
Workflow
Data Contract
Capture
Asset Store
Navigation
Basic API
```

能力可以先 Mock：

```text
Understanding
Target
Guidance
QA
Reality+
```

---

# Phase 2｜MVP Default Story

优先：

# Story C + Story E

即：

```text
Reality First
+
双人单手机
+
Static
+
Basic Live Guidance
+
QA / Partial Retake
```

---

# Phase 3｜Target Discovery Real

把：

```text
Mock Target
↓
Real Reality Understanding
+
TargetPlanning
```

---

# Phase 4｜Basic Realtime Vision

实现：

- Person位置；
- Scale；
- Face；
- Framing；
- Ready；
- 一步一指令。

---

# Phase 5｜Photo QA

实现：

```text
Accept
Repair
Retake Micro
Retake Framing
```

---

# Phase 6｜Reality+

先做：

# Natural

再做：

# Polished

---

# Phase 7｜Advanced Stories

逐步增加：

```text
A Dual Device
B Target First / Motion
D Solo
F Difficult Scene
```

---

# 11. REAL / MOCK / LATER矩阵

| 能力 | MVP Skeleton | MVP Validation | 后续 |
|---|---|---|---|
| Camera | **REAL** | REAL | REAL |
| Capture | **REAL** | REAL | REAL |
| PhotographySession | **REAL** | REAL | REAL |
| Workflow | **REAL** | REAL | REAL |
| Data Contract | **REAL** | REAL | REAL |
| Object Storage | REAL | REAL | REAL |
| Person Understanding | MOCK | **REAL基础版** | Advanced |
| Scene Understanding | MOCK | REAL基础版 | Advanced |
| Target Recommendation | MOCK | REAL | Advanced |
| ShotDirection | MOCK | REAL基础 | Advanced |
| Live Guidance | MOCK State | REAL基础 | Advanced |
| Pose Keypoints | MOCK | 可选基础 | Advanced |
| QA | MOCK | REAL基础 | Advanced |
| Reality+ | MOCK | Natural | Polished |
| Fine Tune | REAL UI | REAL | REAL |
| Dual Device | LATER | P1 | Advanced |
| Motion Shot | LATER | P1 | Advanced |
| Solo | LATER/简化 | P1 | Advanced |
| Difficult Scene | MOCK | P1 | Advanced |

---

# 12. 核心技术难点

---

# 12.1 难点一：Target 真的“可拍”

风险：

大模型很容易提出：

> 很漂亮但现实做不到的画面。

例如：

- 场景里没有可站位置；
- 需要极端机位；
- 实际背景无法保留；
- 天气不支持；
- 人物/摄影者空间不足。

解决：

```text
Target Candidate
↓
Reality Feasibility Check
↓
Safety Check
↓
ShotDirection Feasibility
```

Target不能只做审美 Ranking。

---

# 12.2 难点二：Target Visualization 会误导用户

生成 Target Preview 时最大的风险：

> 生成图偷偷改变现实。

例如：

- 换天气；
- 换地点；
- 改人物；
- 改衣服。

解决：

Target Visualization需要：

```text
Person Anchor
+
Scene Anchor
+
Reality Fact Lock
+
SelectedTarget
```

并明确标注：

> “目标预览，不是最终成片。”

---

# 12.3 难点三：Mini Program实时CV性能

实时摄影是最大工程风险之一。

小程序环境可能面临：

- Camera帧访问限制；
- JS性能；
- WASM限制；
- 模型包体；
- 内存；
- 手机发热；
- Android碎片化。

必须在正式开发前做：

# Technical Spike

至少真实测：

```text
Camera Frame FPS
Person Detection FPS
Pose FPS
Canvas Render Cost
CPU / Memory
Android低端机
iPhone中端机
```

如果小程序无法满足：

> 高级实时CV

应保留 Native App 升级路径。

---

# 12.4 难点四：实时指令振荡

例如：

```text
左一点
右一点
左一点
```

用户会马上失去信任。

解决：

- Tolerance Zone；
- Dead Zone；
- Hysteresis；
- Error Persistence；
- Instruction Cooldown；
- Ready Lock。

建议：

```text
Error持续500～800ms
↓
发Instruction
↓
锁定1～2秒
↓
重新判断
```

---

# 12.5 难点五：人体与Camera坐标语言

摄影者可以理解：

> 人物往画面左一点。

被拍摄者不一定知道：

> 画面左是哪边。

因此 Subject Guidance 优先：

# Scene-relative Language

例如：

> 往湖边一步。

> 靠近栏杆一点。

其次：

> 往你的右手边。

避免：

> 屏幕左边。

---

# 12.6 难点六：双角色协调

双人双手机如果：

> 两个手机同时说话，

体验会非常差。

解决：

# One Active Speaker

默认：

- Subject Device → Voice；
- Photographer Device → Visual + Haptic。

---

# 12.7 难点七：QA误判

AI可能：

> 认为照片很好，但用户不喜欢。

或者：

> 认为要重拍，但用户很喜欢这个表情。

必须把：

```text
Technical QA
和
Taste QA
```

分开。

---

# 12.8 难点八：Retake不能把用户送回起点

Retake Router需要可靠维护：

```text
ShotLockState
AttemptState
RetakePlan
```

否则系统很容易：

> 一失败就把整个 Live Session重置。

---

# 12.9 难点九：Reality+毁图

如果一张95分照片为了：

> “脸亮一点”

重新调用生成式AI整图编辑，

可能：

- 五官变化；
- 衣物变化；
- 发丝变化；
- 背景变化。

因此：

```text
Parametric Adjustment
→ Deterministic

Semantic Modification
→ Generative AI
```

---

# 12.10 难点十：身份一致性

Target Preview / Artwork如果需要生成：

> Person Identity漂移

是非常明显的问题。

必须建立：

# Identity Anchor

同时严格区分：

```text
Target Preview
Capture
Reality+
Artwork
```

不要让 Target Preview变成：

> 最终照片生成器。

---

# 12.11 难点十一：网络与模型延迟

真实拍摄现场用户对延迟极其敏感。

不能：

> 每挪一步等模型3秒。

目标：

### Local / deterministic guidance

尽量：

< 300ms 状态反馈。

### VLM

只用于：

- 初始；
- Replan；
- 异常。

---

# 12.12 难点十二：模型成本

最大成本不一定来自实时指导。

合理架构下实时指导主要是：

> 本地CV。

高成本来自：

- Target Preview生成；
- Reality+；
- Artwork；
- Video。

因此必须明确：

```text
Preview
Low Cost

Final
High Quality
```

---

# 12.13 难点十三：隐私与用户照片

照片属于高敏感个人视觉资产。

建议：

- 原始Camera Frame默认不全部上传；
- 上传关键帧；
- 明确存储目的；
- 可删除作品；
- 设置生命周期；
- 默认不用于专属训练；
- Model Provider通过Gateway控制数据策略；
- 日志禁止记录图片二进制 / 私密URL / Access Token。

---

# 12.14 难点十四：实体商品

Final Action Hub未来接：

- 照片打印；
- 冰箱贴。

会产生新的问题：

- Crop；
- DPI；
- 色域；
- 打印亮度；
- 模板；
- 订单；
- 物流；
- 品控。

必须通过：

# ProductArtwork

而不是直接修改 MyFinalPhoto。

---

# 13. 推荐服务端模块

第一阶段不建议微服务化。

可以采用：

# Modular Monolith

例如：

```text
app/
├── api/
├── session/
├── workflow/
├── reality/
├── target/
├── shot/
├── live/
├── capture/
├── qa/
├── enhancement/
├── assets/
├── final/
├── commerce/
└── gateway/
```

部署仍然可以：

> 一个 FastAPI Service + Worker。

后面确实需要时再拆。

---

# 14. 数据库核心表建议

至少：

```text
users
photography_sessions
session_participants

person_contexts
scene_contexts
reality_contexts

desired_targets
selected_targets
shot_directions

shot_state_snapshots
guidance_events

capture_assets
capture_decisions
retake_plans

reality_plus_assets
adjustment_recipes
final_assets

creative_assets
product_artworks
orders
```

---

# 15. 事件 / Audit

强烈建议保存：

```text
SESSION_CREATED
REALITY_READY
TARGET_SELECTED
SHOT_DIRECTION_CREATED
GUIDANCE_SENT
CAMERA_READY
SUBJECT_READY
CAPTURE_READY
CAPTURED
QA_DECIDED
RETAKE_STARTED
REALITY_PLUS_COMPLETED
FINE_TUNE_COMPLETED
FINAL_READY
```

原因：

- Debug；
- 算法评估；
- 用户漏斗；
- 失败分析；
- 恢复Session；
- 版本兼容。

---

# 16. 版本管理

建议核心对象都记录：

```text
schema_version
workflow_version
capability_version
model_provider
model_name
model_version
prompt_version
```

这样以后升级模型时：

> 可以知道旧Session到底由什么产生。

---

# 17. 可观测性

第一版必须关注：

## Product Metrics

```text
SessionCompletionRate
TargetSelectionRate
TimeToTarget
TimeToCaptureReady
TimeToAcceptedCapture
AverageInstructions
RetakeRate
TasteAcceptanceRate
FineTuneUsage
SaveRate
ShareRate
PhysicalConversion
```

---

## Technical Metrics

```text
FrameProcessingFPS
GuidanceLatency
VLMResponseLatency
QAResponseLatency
RealityPlusLatency

WebSocketReconnectRate
UploadFailureRate
CrashRate

AI Cost / Session
Storage / Session
```

---

# 18. MVP验收指标建议

第一阶段不要只问：

> “AI看起来聪不聪明？”

至少定义：

### Flow

> ≥ 80% 测试用户可以无人工解释跑通默认Story。

### Target

> 用户能理解AI想拍成什么。

### Guidance

> 平均每次Instruction只要求一个动作。

### Retake

> Partial Retake不会回到流程起点。

### Latency

> Live状态反馈接近实时。

### Reality+

> 用户多数情况下认为是“同一张真实照片变好”，而不是“重新生成了一个人”。

### Fine Tune

> 用户可以在几秒内完成明暗等最后调整。

---

# 19. 必做 Technical Spike

在正式投入大规模研发前，建议先做以下验证：

## Spike 01｜微信 Camera Frame

验证：

- 最大可用FPS；
- Frame尺寸；
- JS/WASM性能；
- Android兼容。

## Spike 02｜抖音 Camera能力

验证与微信差异。

## Spike 03｜On-device Person Detection

测试：

- FPS；
- 延迟；
- 发热；
- 内存。

## Spike 04｜Pose Model

验证是否可以在小程序中稳定运行。

## Spike 05｜Single Device Voice Guidance

测试：

> 摄影者拿手机时，被拍摄者是否能听清。

## Spike 06｜Dual Device WebSocket

验证：

- Join；
- Role State；
- Reconnect；
- 断网恢复。

## Spike 07｜Target Preview Identity

验证：

> 人物身份漂移率。

## Spike 08｜Reality+ Identity Preservation

验证：

> 自动精修是否会意外改脸。

---

# 20. 产品与技术优先级

## P0｜先证明核心价值

必须证明：

```text
AI知道这里怎么拍
+
用户真的能按照指导拍到更好的照片
```

所以第一版最重要：

- Target；
- Camera / Subject位置；
- Framing；
- Live Instruction；
- Capture QA。

---

## P1｜扩大覆盖

- Target First；
- Dual Device；
- Motion Shot；
- Solo；
- Difficult Scene；
- Advanced Pose。

---

## P2｜商业扩展

- AI Artwork；
- Video；
- 文旅；
- Print；
- Magnet；
- Photo Booth。

---

# 21. 最终推荐架构决策

当前阶段建议正式冻结：

## Product

```text
Reality First
+
Target First
```

双入口。

---

## Default Shooting Mode

```text
DUAL_PERSON_SINGLE_DEVICE
```

---

## Core Workflow

```text
Reality
→ Target
→ ShotDirection
→ Live
→ Capture
→ QA
→ Reality+
→ Optional Fine Tune
→ Final
```

---

## Domain

```text
PhotographySession
```

---

## Architecture

```text
Modular Monolith
+
Explicit Workflow State Machine
+
Versioned Contracts
+
Provider-neutral Gateway
```

---

## Backend

```text
FastAPI
PostgreSQL
Redis
Object Storage
Worker Queue
WebSocket
```

---

## Client

```text
Shared TypeScript UI
+
Platform Camera Adapters
```

Camera / CV部分允许平台特化。

---

## AI

```text
Capability-based
not Agent-count-based
```

---

## Realtime

```text
Local CV First
Strong AI Event-driven
```

---

## Post

```text
Reality+ Natural
→ Optional Fine Tune
→ Creative+ only when user explicitly enters creation
```

---

# 22. 当前最大未知项

目前真正需要通过研发实验回答，而不是继续纸面讨论的问题已经收敛到：

1. **小程序环境到底能承担多强的实时 CV？**
2. **基本位置 / Scale / Pose 检测准确度够不够让用户感觉“有用”？**
3. **Target Planning 是否真的能稳定给出“现实可拍”的方案？**
4. **实时 Guidance 需要达到怎样的准确率，才明显优于朋友随手拍？**
5. **用户是否愿意在普通拍照行为中启动这一套流程？**
6. **Reality+ 是否能够稳定守住人物身份与现实事实？**
7. **双人单手机是否已经足够形成明显产品价值？**

这些问题需要：

> Prototype + Technical Spike + 真人测试

共同回答。

---

# 23. 最终结论

当前产品已经不需要继续扩张“更多 Agent”。

接下来真正应该做的是：

```text
01
冻结 PhotographySession Schema

02
冻结 P01～P13 Workflow State

03
冻结核心 Data Contracts

04
搭 Software Skeleton

05
完成 Mini Program Camera / CV Technical Spike

06
以 Story C + E 建立第一个真实 MVP Golden Flow

07
逐步把 Mock Capability 替换成真实能力
```

产品层已经相对完整。

下一阶段的核心命题已经从：

> **“我们还应该设计什么？”**

转变为：

> # **“我们设计的这套 AI Photography Workflow，在真实手机、真实场景、真实普通用户手里，到底能不能稳定成立？”**

这才是接下来 MVP 最重要的研究问题。
