# 向风行｜Prototype Story A～F 完整故事与对照矩阵 V1.0

**Document ID：** `XFX_PROTOTYPE_STORY_A_TO_F_MASTER_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** Prototype Story / User Journey / State Coverage / Screen Reuse Matrix  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** Story 体系第一版完整基线；后续进入 Prototype Screen Registry / State Registry

> **Authority update (2026-08-31):** Story A-F and P01-P13 remain screen/story coverage, not the Product Master Flow. Product responsibility is governed by `82-product-master-flow-v2.md`; machine transitions remain governed by `packages/workflow/workflow-v1.json`.

---

# 0. 文档目的

本文件用于完整记录向风行第一阶段原型设计所需的 Story A～F。

六条 Story 不是六套独立产品，而是围绕同一条产品母路径，在不同条件下验证：

- 用户有没有明确 Target；
- 一个人还是两个人；
- 一台手机还是两台手机；
- 静态还是动态 Shot；
- 第一次是否成功；
- 现场是否容易拍；
- AI 是否真正具备摄影判断。

完整母路径始终保持：

```text
Reality / DesiredTarget
        ↓
RealityContext
        ↓
SelectedTarget
        ↓
ShotDirection
        ↓
Realtime Guidance
        ↓
Capture
        ↓
Capture QA
        ↓
AcceptedCapture
        ↓
Reality+
        ↓
User Fine Tune
        ↓
My Final Photo
        ↓
Final Action Hub
```

六条 Story 的目的，是把这条母路径放进真实使用环境中，逐步验证产品是否成立。

---

# 1. Story System 总览

| Story | 核心场景 | Target 来源 | 人数 | 设备 | Shot 类型 | 主要验证 |
|---|---|---|---:|---|---|---|
| **A** | 两个朋友到了好看的地方，但不知道怎么拍 | Reality First | 2 | 2台手机 | STATIC | AI能否从现实发现值得拍的 Target |
| **B** | 已经看到喜欢的效果，想在现实里实现 | Target First | 2 | 2台手机 | MOTION | AI能否把 DesiredTarget 适配成现实可执行方案 |
| **C** | 两个人拍照，但只想用一台手机 | Reality First | 2 | 1台手机 | STATIC | 单手机下双角色导演是否成立 |
| **D** | 一个人旅行，没有摄影者 | Reality First | 1 | 1台固定手机 | STATIC | AI能否先指导机位，再远程指导人物自拍 |
| **E** | 第一次没拍好 | 继承已有 Target | 1～2 | 任意 | 任意 | QA后能否精准恢复而不是全部重来 |
| **F** | 现场普通、杂乱、不好拍 | Reality First | 2 | 1台手机 | STATIC | AI是否真的懂机位、背景、光线和景别 |

六条 Story 分别回答：

```text
A
我不知道拍什么
→ AI 帮我发现

B
我知道想拍什么
→ AI 帮我实现

C
没有双手机
→ 产品仍然能拍

D
没有摄影者
→ 产品仍然能拍

E
第一次没拍好
→ 系统能聪明恢复

F
地方本身不好拍
→ AI 仍能做真正摄影判断
```

---

# 2. Story A｜Reality First × 双人双手机 × 静态 Shot

# 2.1 一句话定义

> **用户不知道拍什么，AI 从“今天的你 + 现在这里”中发现一个现实可执行的视觉目标，并通过双角色实时指导真正把它拍出来。**

---

# 2.2 故事背景

两位朋友旅行到雾湖 / 山谷。

- A：被拍摄者；
- B：摄影者；
- A 穿黑色时装；
- 两个人都不是专业摄影师；
- A 没有明确参考图；
- 她的真实诉求只是：“这里挺好看的，帮我拍几张。”

用户选择：

# AI 看看这里怎么拍

进入 Reality First。

---

# 2.3 Story A 要验证的能力

```text
Reality First
+
双角色
+
双手机 Shared Session
+
Target Discovery
+
Static ShotDirection
+
Realtime Guidance
+
Capture QA
+
Reality+
+
Fine Tune
+
Final
```

---

# 2.4 Story A 主场景

```text
Person:
黑色时装
长深色头发

Scene:
雾湖山谷

SelectedTarget:
冷雾湖畔

ShotType:
STATIC

主要动作:
面湖回眸
```

---

# 2.5 Story A 完整路径

```text
START
↓
AI 看看这里怎么拍
↓
朋友帮我拍
↓
让朋友加入
↓
建立 Shared Shooting Session
↓
Person Scan
↓
Scene Scan
↓
RealityContext
↓
AI 推荐 3 个 Target
↓
选择“冷雾湖畔”
↓
Shot Blueprint
↓
摄影者机位调整
↓
人物站位调整
↓
Pose / Gaze
↓
Capture Ready
↓
拍摄
↓
Capture QA
↓
Taste Review
↓
AcceptedCapture
↓
Reality+
↓
User Fine Tune
↓
My Final Photo
↓
Save / Share / Physical
```

---

# 2.6 Story A Storyboard

| Scene | Screen / State | 用户动作 | 系统响应 |
|---|---|---|---|
| A01 | Start | 点“AI看看这里怎么拍” | `EntryMode = REALITY_FIRST` |
| A02 | Shooting Relation | 朋友帮我拍 | 创建 Shooting Session |
| A03 | Join Session | B扫码加入 | 分配 Subject / Photographer |
| A04 | Person Scan | 看人物 | PersonContext Ready |
| A05 | Scene Scan | 看现场 | SceneContext Ready |
| A06 | Understanding | 等待 | RealityContext Ready |
| A07 | Target Select | 选“冷雾湖畔” | SelectedTarget |
| A08 | Shot Blueprint | 看双方站位 | ShotDirection Ready |
| A09 | Camera Position | B移动 | Camera Ready |
| A10 | Subject Position | A移动 | Subject Ready |
| A11 | Pose / Gaze | A面湖、回眸 | Pose Ready |
| A12 | Capture Ready | 保持 / 拍摄 | CaptureAsset |
| A13 | Capture QA | 喜欢 / 重拍 | AcceptedCapture |
| A14 | Reality+ | 等待 | RealityPlusAsset |
| A15 | Fine Tune | 用户最后微调 | AdjustmentRecipe |
| A16 | Final Photo | 确认 | MyFinalPhoto |
| A17 | Save | 保存 | Delivery |
| A18 | Share | 分享 | Growth |
| A19 | Physical | 冰箱贴预览 | ProductArtwork / Order |

---

# 2.7 Story A 的核心产品证明

## AI 能发现 Target

不是先让用户选风格，而是：

```text
Person
+
Scene
↓
Opportunity Detection
↓
Target Recommendation
```

## Shot Direction 不等于 Pose

优先：

```text
Camera Position
↓
Subject Position
↓
Framing
↓
Pose
↓
Gaze
```

## Shared Session

```text
One Target
Two Views
One AI Director
```

摄影者 Camera 为主要实时视觉源。

---

# 3. Story B｜Target First × 双人双手机 × 动态 Shot

# 3.1 一句话定义

> **用户负责说“我想拍成这个”，AI 负责回答“按照今天的你和现在这里，这个效果现实中应该怎么实现”。**

---

# 3.2 故事背景

用户提前看到一个喜欢的视觉结果：

# 欧式街头时装

可能来自：

- 首页“照这个效果拍”；
- 朋友分享的作品；
- “我也要拍这个”。

用户的真实诉求：

> **“我就想拍成这个。”**

---

# 3.3 Story B 要验证

```text
DesiredTarget
+
Reality
↓
Compatibility
↓
Target Adaptation
↓
ExecutableTarget
↓
SelectedTarget
```

同时验证：

- Target First；
- Share → 拍同款；
- Motion Shot；
- BOTH 协同；
- Capture Window。

---

# 3.4 Story B 主场景

```text
DesiredTarget:
欧式街头时装

Person:
黑色时装

Scene:
欧式建筑街区

Compatibility:
很适合

ShotType:
MOTION

Subject:
向摄影者走

Photographer:
缓慢后退
```

---

# 3.5 Story B 完整路径

```text
Shared Target / Theme
↓
我也要拍这个
↓
DesiredTarget
↓
朋友帮我拍
↓
Shared Session
↓
Person Scan
↓
Scene Scan
↓
Reality × DesiredTarget
↓
Compatibility
↓
Adaptation
↓
ExecutableTarget
↓
SelectedTarget
↓
Motion Shot Blueprint
↓
Camera Position
↓
Subject Start Position
↓
Shot Choreography
↓
BOTH Motion
↓
Capture Window
↓
Burst
↓
QA
↓
Taste Review
↓
Reality+
↓
Fine Tune
↓
Final
```

---

# 3.6 Story B Storyboard

| Scene | Screen / State | 用户动作 | 系统响应 |
|---|---|---|---|
| B01 | Target Detail | 点“我也要拍这个” | 建立 DesiredTarget |
| B02 | Target Locked | 确认效果 | `TARGET_FIRST` |
| B03 | Shooting Relation | 朋友帮我拍 | Session |
| B04 | Person Scan | 看人物 | Person × Target Match |
| B05 | Scene Scan | 看现场 | Scene × Target Match |
| B06 | Compatibility | 查看 | 适合 / 可调整 / 不适合 |
| B07 | Target Adaptation | 接受适配 | ExecutableTarget |
| B08 | Shot Blueprint | 看路径 | ShotDirection |
| B09 | Camera Position | 摄影者调整 | Camera Ready |
| B10 | Subject Position | 人物进入起点 | Subject Ready |
| B11 | Motion Ready | 准备走 | Choreography Ready |
| B12 | Live Motion | BOTH协同 | Realtime Control |
| B13 | Capture Window | 连拍 | CaptureAssets |
| B14 | AI Select / QA | 查看 | Technical Pass |
| B15 | Taste Review | 喜欢 / 修改 | Retake Router |
| B16 | Accepted Capture | 确认 | AcceptedCapture |
| B17 | Reality+ | 等待 | Target-aware Retouch |
| B18 | Fine Tune | 用户调整 | AdjustmentRecipe |
| B19 | Final | 保存 / 分享 / 实体 | MyFinalPhoto |

---

# 3.7 Story B 新增的核心对象

```text
DesiredTarget
CompatibilityResult
AdaptationPlan
ExecutableTarget
```

关系：

```text
DesiredTarget
+
RealityContext
↓
CompatibilityResult
↓
AdaptationPlan
↓
ExecutableTarget
↓
SelectedTarget
```

---

# 3.8 Compatibility 三档

## 很适合

直接执行。

## 可以拍，但需要调整

AI明确：

- 哪些保持；
- 哪些变化。

## 当前不太适合

给：

- AI适配现在这里；
- 换效果；
- 换位置。

原则：

> Target Adaptation ≠ Target Replacement

---

# 4. Story C｜Reality First × 双人单手机

# 4.1 一句话定义

> **只有一台手机时，摄影者手机同时承担 Camera、Realtime Vision、摄影者视觉指导和被拍摄者语音指导。**

---

# 4.2 Story C 背景

仍然使用：

- 两个人；
- 雾湖；
- Reality First；
- 冷雾湖畔；
- Static Shot。

唯一改变：

> 不要求朋友扫码。

---

# 4.3 DeviceMode

```text
DUAL_PERSON_SINGLE_DEVICE
```

设备关系：

```text
Subject
    ↑
AI Voice
    │
Photographer Phone
    ├─ Camera
    ├─ CV
    ├─ Photographer UI
    └─ Shared Shot State
```

---

# 4.4 Story C 完整路径

```text
START
↓
AI看看这里怎么拍
↓
朋友帮我拍
↓
只用这台手机
↓
把手机交给摄影者
↓
Person Scan
↓
Scene Scan
↓
RealityContext
↓
Target Select
↓
Shot Blueprint
↓
摄影者屏幕 Guidance
+
人物语音 Guidance
↓
Capture
↓
给她看看
↓
Taste Review
↓
Reality+
↓
手机回到 Subject
↓
Fine Tune
↓
Final
```

---

# 4.5 Story C Storyboard

| Scene | State | 谁操作 | 系统响应 |
|---|---|---|---|
| C01 | Start | A | Reality First |
| C02 | Shooting Relation | A | 朋友帮我拍 |
| C03 | Device Mode | A | 只用这台手机 |
| C04 | Device Handoff | A→B | B成为 Device Authority |
| C05 | Person Scan | B | PersonContext |
| C06 | Scene Scan | B | RealityContext |
| C07 | Target Select | A+B | SelectedTarget |
| C08 | Shot Blueprint | A+B | ShotDirection |
| C09 | Camera Position | B | 屏幕指导B，语音让A保持 |
| C10 | Subject Position | A | 语音指导A，屏幕让B保持 |
| C11 | Pose / Gaze | A | Voice Choreography |
| C12 | Capture | B | Countdown / Burst |
| C13 | AI Select | 系统 | 最佳照片 |
| C14 | Show Subject | A+B | “给她看看” |
| C15 | Taste Review | A | 喜欢 / 重拍 |
| C16 | Reality+ | 系统 | 自动精修 |
| C17 | Fine Tune | A | 最后一公里 |
| C18 | Final Hub | A | 保存 / 分享 / 实物 |

---

# 4.6 Story C 新增关键状态

- Device Mode；
- Device Handoff；
- Single Device Output Policy；
- Subject Voice Channel；
- Repeat Instruction；
- Show Subject；
- Return Device。

---

# 4.7 Story C 的战略意义

Story C 可能证明：

> **双手机不是 MVP 前置条件。**

因此未来可能：

```text
单手机双人
= Default

双手机 Shared Session
= Enhanced Mode
```

---

# 5. Story D｜Solo × Fixed Camera

# 5.1 一句话定义

> **一个人拍照时，AI 先指导用户把 Camera Anchor 放对并锁定，再切换成远程 Subject Voice Guidance。**

---

# 5.2 Story D 背景

用户一个人旅行：

- 无摄影者；
- 有小支架 / 安全固定位置；
- Reality First；
- 静态全身旅行照。

---

# 5.3 DeviceMode

```text
SOLO_FIXED_CAMERA
```

---

# 5.4 Story D 核心状态

```text
CAMERA SETUP MODE
用户拿手机
↓
Ghost Subject
↓
Camera Guidance
↓
CAMERA_READY
↓
CAMERA_LOCKED

↓

SUBJECT MODE
用户进入画面
↓
Voice Guidance
↓
Auto Capture
↓
Remote Quick QA
```

---

# 5.5 Story D 完整路径

```text
START
↓
AI看看这里怎么拍
↓
我自己拍
↓
确认可固定手机
↓
Person Scan
↓
Scene Scan
↓
RealityContext
↓
Target Select
↓
Solo Blueprint
↓
Ghost Subject
↓
Camera Setup
↓
Camera Lock
↓
用户进入画面
↓
Subject Position
↓
Pose / Gaze
↓
Auto Countdown / Burst
↓
Quick QA
↓
“拍好了，可以回来看看”
↓
Taste Review
↓
Reality+
↓
Fine Tune
↓
Final
```

---

# 5.6 Story D Storyboard

| Scene | State | 用户动作 | 系统响应 |
|---|---|---|---|
| D01 | Start | Reality First | 进入 |
| D02 | Shooting Relation | 我自己拍 | Solo |
| D03 | Fixed Camera Check | 支架/安全位置 | `SOLO_FIXED_CAMERA` |
| D04 | Person Scan | 提供人物参考 | PersonContext |
| D05 | Scene Scan | 扫现场 | RealityContext |
| D06 | Target Select | 选 Target | SelectedTarget |
| D07 | Solo Blueprint | 看手机/人物位置 | ShotDirection |
| D08 | Camera Setup | 拿手机移动 | Scene Anchor Guidance |
| D09 | Ghost Framing | 对齐背景 | Camera Ready |
| D10 | Camera Lock | 固定手机 | Anchor Locked |
| D11 | Walk Into Frame | 走入画面 | Subject Detection |
| D12 | Subject Position | 听语音调整 | Subject Ready |
| D13 | Pose / Gaze | 听语音动作 | Pose Ready |
| D14 | Capture Ready | 保持 | Auto Burst |
| D15 | Quick QA | 人还在远处 | Pass / Immediate Retake |
| D16 | Return Review | 回来看片 | Taste |
| D17 | Accepted Capture | 喜欢 | AcceptedCapture |
| D18 | Reality+ | 系统 | RealityPlus |
| D19 | Fine Tune | 用户 | AdjustmentRecipe |
| D20 | Final | 用户 | Final Hub |

---

# 5.7 Story D 新增对象

```text
FixedCameraState

CAMERA_NOT_READY
CAMERA_READY
CAMERA_LOCKED
```

以及：

```text
SoloPhase

CAMERA_SETUP
SUBJECT_ENTRY
SUBJECT_GUIDANCE
AUTO_CAPTURE
REMOTE_QA
RETURN_REVIEW
```

---

# 5.8 Story D MVP 技术边界

不要求：

- 精确AR；
- SLAM；
- 米级距离。

只需要：

- Background Anchor；
- Ghost Subject Zone；
- Camera左右/高低；
- Stability；
- Person Bounding Box；
- Subject Scale；
- Body Orientation；
- Auto Burst；
- Quick QA。

---

# 6. Story E｜Capture Failure × Recovery

# 6.1 一句话定义

> **第一次没拍好时，AI 不把所有状态清零，而是识别失败原因、保留已经做对的部分，只回退到最必要的阶段。**

---

# 6.2 Story E 定位

Story E不是一种新的 Shooting Mode。

它是：

# Recovery Layer

可以横跨：

- A；
- B；
- C；
- D；
- F。

主原型建议基于 Story C：

> 双人单手机 + 雾湖 + Static。

---

# 6.3 核心原则

# Preserve What Is Already Right

已经做对的状态：

> 不让用户重新做。

---

# 6.4 主失败 Case

第一次 Capture：

```text
Camera Position      PASS
Subject Position     PASS
Framing              PASS
Major Pose           PASS
Gaze                 FAIL
Motion Blur          FAIL
```

系统不说：

> 重新拍摄。

而是：

> **位置和机位都很好，不用动。刚才回头有点快，我们只重新拍一次回眸。**

---

# 6.5 ShotLockState

```yaml
ShotLockState:

  target: LOCKED
  camera_position: LOCKED
  subject_position: LOCKED
  framing: LOCKED
  major_pose: LOCKED

  gaze: UNLOCKED
  capture_timing: UNLOCKED
```

---

# 6.6 Story E 主路径

```text
Capture #1
↓
Quick QA
↓
Partial Failure
↓
RetakePlan
↓
锁住正确 State
↓
回 Gaze Guidance
↓
只重做回眸
↓
Capture #2
↓
QA PASS
↓
Taste Review
↓
AcceptedCapture
```

---

# 6.7 Story E Storyboard

| Scene | State | 用户动作 | 系统响应 |
|---|---|---|---|
| E01 | Capture Complete | 第一次拍摄 | QA |
| E02 | Multi-Capture Review | 等待 | 找最好的一张 |
| E03 | Partial Failure | 查看 | “只重做回眸” |
| E04 | Retake Plan | 再来一次 | 保留正确State |
| E05 | Recovery Live | 慢慢回头 | 只指导Gaze |
| E06 | Capture #2 | 再拍 | New Capture |
| E07 | QA Pass | 查看 | 拍到了 |
| E08 | Taste Review | 喜欢 | AcceptedCapture |
| E09 | Reality+ | 后续 | 正常合流 |

---

# 6.8 Recovery Case Matrix

| Case | 问题 | 决策 | 保留 | 回退 |
|---|---|---|---|---|
| E1 | 脸稍暗 | ACCEPT_WITH_REPAIR | 全部 | 不重拍 |
| E2 | 闭眼 / 表情 / Gaze | RETAKE_MICRO | 机位/位置/构图/Pose | Gaze/Micro |
| E3 | Pose错误 | RETAKE_POSE | 机位/位置/Framing | Pose |
| E4 | 人物太大 | RETAKE_FRAMING | Target/人物大位置 | Framing |
| E5 | 人物位置不对 | RETAKE_POSITION | Camera/Target | Position |
| E6 | 背景突然被挡 | REPLAN | Person/Target尽量保留 | ShotDirection |
| E7 | AI说好但用户不喜欢 | TASTE_ROUTER | Technical State | 按Taste原因 |
| E8 | 连续3次失败 | SIMPLIFY | Reality/Target | Backup Shot |

---

# 6.9 CaptureDecision 建议扩展

```text
ACCEPT
ACCEPT_WITH_REPAIR
RETAKE_MICRO
RETAKE_POSE
RETAKE_FRAMING
RETAKE_POSITION
REPLAN
```

---

# 6.10 RetakePlan

```yaml
RetakePlan:

  reason:
  route_to:

  preserve:
  unlock:

  instruction:
  requires_replan:
  attempt:
```

---

# 6.11 Taste 与 Technical 必须分离

Technical Failure：

> AI判断专业问题。

Taste Failure：

> 用户自己不喜欢。

Taste Escalation：

```text
第一次
Micro Retake

第二次
Pose Change

第三次
Shot / Target Change
```

---

# 7. Story F｜Difficult Scene × Scene Strategy

# 7.1 一句话定义

> **当场景本身普通、杂乱时，AI 首先判断机位、背景、光线和景别，而不是直接给人物推荐 Pose。**

---

# 7.2 故事背景

普通城市街道：

- 树；
- 车辆；
- 帐篷；
- 广告牌；
- 行人；
- 杂乱建筑。

用户第一反应：

> “这里好像没什么好拍的。”

---

# 7.3 Story F 核心证明

```text
当前画面不好
≠
这里不能拍
```

AI需要判断：

> 是场景不行，还是当前 Camera Viewpoint 不行。

---

# 7.4 Scene Diagnosis

例如：

```text
Visual Noise        HIGH
Red Tent            HIGH DISTRACTION
Cars                MEDIUM
Billboard            HIGH
Tree Shade          GOOD
Tree Background      GOOD
Road Perspective     MEDIUM
Face Light           可改善
```

---

# 7.5 Story F 核心策略

# Environment First when Environment is the Problem

优先：

```text
Camera Viewpoint
↓
Subject Position
↓
Framing
↓
Pose
```

---

# 7.6 Story F 完整路径

```text
START
↓
Reality First
↓
双人单手机
↓
Person Scan
↓
Scene Scan
↓
Scene Diagnosis
↓
“能拍，但当前方向比较乱”
↓
Target:
城市绿荫街拍
↓
ShotDirection
↓
Viewpoint Search
↓
摄影者往左
↓
摄影者靠近
↓
背景杂物减少
↓
人物进入树荫
↓
光线改善
↓
Framing
↓
简单 Pose
↓
Capture
↓
QA
↓
Reality+
↓
Fine Tune
↓
Final
```

---

# 7.7 Story F Storyboard

| Scene | State | 用户动作 | 系统响应 |
|---|---|---|---|
| F01 | Start | AI看看这里怎么拍 | Reality First |
| F02 | Shooting Relation | 双人单手机 | Photographer Authority |
| F03 | Person Scan | 拍人物 | PersonContext |
| F04 | Scene Scan | 扫街道 | Scene Diagnosis |
| F05 | Scene Opportunity | 查看 | “能拍，但当前方向较乱” |
| F06 | Target Select | 城市绿荫街拍 | SelectedTarget |
| F07 | Shot Blueprint | 看 | Camera Priority |
| F08 | Viewpoint Search | 摄影者往左 | Clutter下降 |
| F09 | Framing Search | 摄影者靠近 | Subject Scale↑ |
| F10 | Subject Position | 人物进树荫 | Lighting改善 |
| F11 | Framing Lock | 摄影者微调 | Composition Ready |
| F12 | Pose | 轻微侧身 | Pose Ready |
| F13 | Capture | 拍 | CaptureAssets |
| F14 | QA | 看 | Technical Pass |
| F15 | Reality+ | 等待 | 小范围环境整理 |
| F16 | Fine Tune | 调 | AdjustmentRecipe |
| F17 | Final | 保存/分享/实体 | MyFinalPhoto |

---

# 7.8 Story F 新增 Scene 字段

```text
VisualNoiseScore
BackgroundAnchorQuality
OcclusionScore
LightingQuality
ViewpointOpportunity
FramingOpportunity
PrimarySceneProblem
```

例如：

```yaml
PrimarySceneProblem:
  type: BACKGROUND_CLUTTER
  severity: HIGH
```

---

# 7.9 SceneInterventionStrategy

```yaml
SceneInterventionStrategy:

  primary_problem:
    BACKGROUND_CLUTTER

  first_action:
    MOVE_CAMERA_LEFT

  secondary_action:
    MOVE_CAMERA_CLOSER

  subject_zone:
    TREE_SHADE

  target_strategy:
    TIGHTER_FRAMING
```

---

# 7.10 Difficult Scene 五类策略

1. **换摄影者位置**
2. **换人物位置**
3. **收紧景别**
4. **改变镜头 / 拍摄方向**
5. **承认当前 Target / Location 不适合**

困难场景 Escalation：

```text
换 Camera Viewpoint
↓
调整 Subject Position
↓
收紧 Framing
↓
降低 Target复杂度
↓
换 Target
↓
建议换 Location
```

---

# 8. A～F 总体定位对照矩阵

| Story | 用户起点 | Target来源 | 人数 | 手机 | 场景 | Shot | 核心能力 |
|---|---|---|---:|---:|---|---|---|
| A | 不知道拍什么 | Reality First | 2 | 2 | 优质 | Static | Target Discovery |
| B | 已有想拍效果 | Target First | 2 | 2 | 匹配Target | Motion | Compatibility / Adaptation |
| C | 不想扫码 | Reality First | 2 | 1 | 优质 | Static | Single-device Coordination |
| D | 没人帮拍 | Reality First | 1 | 1固定 | 优质 | Static | Solo Camera Lock |
| E | 第一次没拍好 | 继承 | 任意 | 任意 | 任意 | 任意 | Recovery / Retake Router |
| F | 场景本身不好拍 | Reality First | 2 | 1 | 困难 | Static | Scene Strategy |

---

# 9. 入口方式对照矩阵

| 维度 | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| 首页进入 | ✅ | ✅ | ✅ | ✅ | 继承Session | ✅ |
| Reality First | ✅ | — | ✅ | ✅ | 继承 | ✅ |
| Target First | — | ✅ | — | — | 可继承 | — |
| 分享拍同款 | — | 核心 | — | 可扩展 | — | — |
| 新建RealityContext | ✅ | ✅ | ✅ | ✅ | 通常❌ | ✅ |

实际只有两个主入口：

```text
Reality First
Target First
```

C / D / F 是不同 Shooting / Reality State。

E 是 Recovery Branch。

---

# 10. Shooting Mode 对照矩阵

| 能力 | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| Subject | ✅ | ✅ | ✅ | ✅本人 | 继承 | ✅ |
| 真人 Photographer | ✅ | ✅ | ✅ | ❌ | 继承 | ✅ |
| 双手机 | ✅ | ✅ | ❌ | ❌ | 任意 | ❌ |
| 单手机 | — | — | ✅ | ✅ | 任意 | ✅ |
| QR Join | ✅ | ✅ | ❌ | ❌ | — | ❌ |
| Subject独立Screen | ✅ | ✅ | ❌ | ❌ | 继承 | ❌ |
| Photographer Camera | ✅ | ✅ | ✅ | 固定手机 | 继承 | ✅ |

实际 DeviceMode 只需要：

```text
DUAL_PERSON_DUAL_DEVICE
DUAL_PERSON_SINGLE_DEVICE
SOLO_FIXED_CAMERA
```

E作用于前三种。

---

# 11. Target 形成方式矩阵

| 能力 | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| DesiredTarget | — | ✅ | — | — | 继承可能 | — |
| RealityContext | ✅ | ✅ | ✅ | ✅ | 已有 | ✅ |
| AI发现视觉机会 | ✅ | — | ✅ | ✅ | — | ✅困难模式 |
| Target 3选1 | ✅ | 通常❌ | ✅ | ✅ | — | ✅ |
| Compatibility | — | ✅ | — | — | 可触发 | 隐式 |
| Adaptation | — | ✅ | — | — | Replan可触发 | Scene Strategy可影响 |
| SelectedTarget | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |

---

# 12. ShotDirection 对照矩阵

| 维度 | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Subject Anchor | ✅ | ✅ | ✅ | ✅ | 尽量保留 | ✅ |
| Camera Anchor | ✅ | ✅ | ✅ | ✅且Lock | 尽量保留 | 核心 |
| Framing | ✅ | ✅ | ✅ | ✅ | 局部重算 | 核心 |
| Pose | ✅ | ✅ | ✅ | ✅ | 可重算 | 次要 |
| Gaze | ✅ | ✅ | ✅ | ✅ | 常见Retake | ✅ |
| Subject Path | — | ✅ | — | 可选 | 继承 | — |
| Camera Path | — | ✅ | — | — | 继承 | Viewpoint Search |
| Ghost Subject | — | — | — | 核心 | — | 可复用Ghost Zone |
| Camera Lock | — | — | — | 核心 | Lock逻辑复用 | Ready Lock |
| Scene Strategy | — | 普通 | 普通 | 部分 | Replan | 核心 |

同一个 `ShotDirection` Schema 足够支撑 A～F。

---

# 13. Realtime Guidance 对照矩阵

| 行为 | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| Photographer Active | ✅ | ✅ | ✅ | Camera Setup时用户本人 | 可能 | 核心 |
| Subject Active | ✅ | ✅ | ✅ | 核心 | 可能 | ✅ |
| BOTH | 少 | 核心 | 少 | ❌ | 继承ShotType | 少 |
| Subject Phone语音 | ✅ | ✅ | ❌ | ❌ | 继承 | ❌ |
| Photographer手机外放Subject指令 | — | — | ✅ | — | 可用 | ✅ |
| 固定手机远程语音 | — | — | — | 核心 | 可用 | — |
| Ghost Framing | 可选 | 可选 | ✅ | Ghost Subject核心 | 保留 | ✅ |
| Instruction Repeat | 可选 | 可选 | 手动 | 自动重要 | Recovery | 可选 |
| Ready Lock | ✅ | ✅ | ✅ | Camera Lock更强 | 核心 | 核心 |

---

# 14. Capture Mode 对照

| Story | Capture Mode | 逻辑 |
|---|---|---|
| A | STATIC_MANUAL | Ready → 3、2、1 → Capture |
| B | MOTION_BURST | Choreography → Capture Window → Burst |
| C | STATIC_MANUAL | Ready → 3、2、1 |
| D | SOLO_AUTO | Ready → Auto Countdown → Auto Burst |
| E | RETRY | 只重做必要 Capture State |
| F | STATIC_MANUAL | Scene Strategy Ready → Capture |

因此一个 Capture Component 支持：

```text
STATIC_MANUAL
MOTION_BURST
SOLO_AUTO
RETRY
```

即可。

---

# 15. QA / Recovery 对照矩阵

| 能力 | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| Technical QA | ✅ | ✅ | ✅ | ✅ | 核心 | ✅ |
| AI自动选片 | ✅ | ✅ | ✅ | 核心 | ✅ | ✅ |
| Taste Review | ✅ | ✅ | ✅ | ✅ | 核心 | ✅ |
| ACCEPT_WITH_REPAIR | ✅ | ✅ | ✅ | ✅ | 核心 | ✅ |
| Partial Retake | ✅ | ✅ | ✅ | ✅ | 核心 | ✅ |
| State Preservation | 隐式 | 隐式 | 隐式 | Camera Lock | 核心 | Ready Lock |
| Retake Router | ✅ | ✅ | ✅ | ✅ | 核心 | ✅ |
| Replan | 异常 | 异常 | 异常 | 异常 | 核心异常 | 困难升级 |

---

# 16. Scene Strategy 对照

| Strategy | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| 换 Camera Viewpoint | 普通 | 普通 | 普通 | Camera Setup | Recovery | 核心 |
| 换 Subject Position | ✅ | ✅ | ✅ | ✅ | Recovery | 核心 |
| 收紧 Framing | 可用 | 可用 | 可用 | 可用 | Recovery | 核心 |
| 降低背景占比 | Target决定 | Target决定 | Target决定 | Target决定 | 可重算 | 核心 |
| 换 Target | 可选 | Adaptation | 可选 | 可选 | Taste Escalation | 重要降级 |
| 换 Location | 极少 | 极少 | 极少 | 极少 | RealityChanged | 最终降级 |

---

# 17. Screen Component 复用矩阵

建议原型最终抽象成约 13 个核心 Screen Component：

| Screen Component | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| **P01 Start** | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **P02 Target Detail** | — | ✅ | — | — | — | — |
| **P03 Shooting Relation** | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **P04 Device Mode / Join** | Dual Join | Dual Join | Single | Solo | — | Single |
| **P05 Reality Scan** | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **P06 Target Decision** | Discover | Adapt | Discover | Discover | — | Scene-aware Discover |
| **P07 Shot Blueprint** | Static | Motion | Static | Solo | 继承 | Scene Strategy |
| **P08 Live Director** | Dual | Dual/BOTH | Single | Solo Voice | Recovery | Viewpoint Search |
| **P09 Capture** | Static | Motion | Static | Auto | Retry | Static |
| **P10 Capture Review** | ✅ | ✅ | ✅ | ✅ | 核心多状态 | ✅ |
| **P11 Reality+** | ✅ | ✅ | ✅ | ✅ | 合流 | ✅ |
| **P12 Fine Tune** | ✅ | ✅ | ✅ | ✅ | 合流 | ✅ |
| **P13 Final Hub** | ✅ | ✅ | ✅ | ✅ | 合流 | ✅ |

---

# 18. Story-specific 新增状态

| Story | 真正需要新增设计的状态 |
|---|---|
| **A** | Reality Discover、Static Dual-role |
| **B** | Target Detail、Compatibility、Adaptation、Motion/BOTH |
| **C** | Single Device、Device Handoff、Subject Voice、Show Subject |
| **D** | Fixed Camera Check、Ghost Subject、Camera Lock、Remote QA |
| **E** | Partial Failure、Retake Plan、Shot Lock、Escalation |
| **F** | Scene Diagnosis、Scene Opportunity、Viewpoint Search、Scene Strategy |

结论：

> 不应该为 A～F 分别重新画全套页面。

应该：

> **共用 Screen Component + Story-specific State。**

---

# 19. 数据对象覆盖矩阵

| Object | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| `EntryMode` | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |
| `DeviceMode` | Dual | Dual | Single | Solo Fixed | 继承 | Single |
| `DesiredTarget` | — | ✅ | — | — | 可继承 | — |
| `PersonContext` | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |
| `SceneContext` | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |
| `RealityContext` | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |
| `CompatibilityResult` | — | ✅ | — | — | 可用 | — |
| `AdaptationPlan` | — | ✅ | — | — | 可用 | Scene Strategy类似 |
| `SelectedTarget` | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |
| `ShotDirection` | ✅ | ✅ | ✅ | ✅ | 继承/更新 | ✅ |
| `SceneInterventionStrategy` | — | — | — | — | Replan可用 | ✅ |
| `CurrentShotState` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `FixedCameraState` | — | — | — | ✅ | 可继承 | — |
| `ShotLockState` | 隐式 | 隐式 | 隐式 | Camera Lock | ✅核心 | Ready Lock |
| `CaptureAsset` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `CaptureDecision` | ✅ | ✅ | ✅ | ✅ | ✅核心 | ✅ |
| `RetakePlan` | 可用 | 可用 | 可用 | 可用 | ✅核心 | 可用 |
| `AttemptState` | 可用 | 可用 | 可用 | 可用 | ✅核心 | 可用 |
| `TasteFeedback` | ✅ | ✅ | ✅ | ✅ | ✅核心 | ✅ |
| `AcceptedCapture` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `RealityPlusAsset` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `AdjustmentRecipe` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MyFinalPhoto` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# 20. AI / Algorithm 能力覆盖矩阵

| 能力 | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| Person Understanding | ✅ | ✅ | ✅ | ✅ | 继承 | ✅ |
| Scene Understanding | ✅ | ✅ | ✅ | ✅ | 继承 | 增强 |
| Target Discovery | ✅ | — | ✅ | ✅ | — | 困难模式 |
| Target Compatibility | — | ✅ | — | — | 可用 | — |
| Target Adaptation | — | ✅ | — | — | 可用 | 可降级 |
| Shot Planning | ✅ | ✅ | ✅ | ✅ | 继承 | Scene Strategy增强 |
| Local Vision | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dual-role Coordination | ✅ | ✅ | ✅逻辑存在 | 通过时序替代 | ✅ | ✅ |
| Motion Choreography | — | ✅ | — | — | 继承 | — |
| Camera Lock | — | — | — | ✅ | 可用 | — |
| Retake Router | 可用 | 可用 | 可用 | 可用 | ✅核心 | 可用 |
| VLM Replan | 异常 | 异常 | 异常 | 异常 | 核心异常 | 困难升级 |
| Scene Strategy | 普通 | 普通 | 普通 | 部分 | Recovery | ✅核心 |
| Capture QA | ✅ | ✅ | ✅ | ✅ | 增强 | ✅ |
| Reality+ | ✅ | ✅ | ✅ | ✅ | 合流 | ✅ |

---

# 21. 原型优先级矩阵

| Priority | Story / State | 原因 |
|---|---|---|
| **P0** | Story A 主流程 | Reality First 基础母路径 |
| **P0** | Story C 单手机关键状态 | 很可能是真实 MVP 默认路径 |
| **P0** | Story E Partial Retake | 真实使用必然发生 |
| **P0** | Story B Compatibility | Target First 入口核心 |
| **P0** | Story D Camera Lock + Solo Voice | 单人模式核心 |
| **P1** | Story B Motion / BOTH | 高级拍摄价值 |
| **P1** | Story F Viewpoint Search | 强 Demo 价值 |
| **P1** | Story F Scene Escalation | AI可信度 |
| **P1** | Story E Taste Escalation | 审美反馈闭环 |
| **P2** | 复杂动态 Shot | 后续 |
| **P2** | AR / SLAM 精确定位 | 后续 |
| **P2** | 远程手势控制 | 后续 |

---

# 22. 从 MVP 角度重新看六条 Story

当前最可能形成 MVP Default 的组合：

```text
Story C
+
Story E
+
Story A 的 Target Discovery
```

即：

> **Reality First + 双人单手机 + 基础实时指导 + Capture QA + 精准重拍。**

这是：

- 摩擦最低；
- 工程范围较可控；
- 最容易真实验证摄影价值；

的一条主链。

---

# 23. 六条 Story 的用户覆盖范围

当前已经覆盖：

```text
不知道拍什么            ✅
知道自己想拍什么        ✅

两个人                  ✅
一个人                  ✅

一台手机                ✅
两台手机                ✅

静态照片                ✅
动态照片                ✅

优质场景                ✅
困难场景                ✅

第一次成功              ✅
第一次失败              ✅

技术问题                ✅
审美不满意              ✅
```

因此 Story 层面已经具有较完整覆盖。

---

# 24. A～F 三层 Story 架构

六条 Story 可以进一步归类：

# Layer 1｜Core Usage

```text
A Reality First / Dual Device
B Target First / Dual Device
C Reality First / Single Device
D Reality First / Solo Fixed
```

回答：

> 用户在不同使用条件下怎么完成拍摄。

---

# Layer 2｜Robustness

```text
E Recovery
```

回答：

> 事情没按计划发生怎么办。

---

# Layer 3｜Intelligence Proof

```text
F Difficult Scene
```

回答：

> AI到底有没有真正的摄影判断，而不只是姿势推荐。

---

# 25. Story 与异常 Case 的边界

A～F 完成以后，不建议继续无限增加 Story G/H/I。

例如以下情况：

- Camera权限未开；
- 网络断开；
- VLM分析失败；
- Subject离开画面；
- 手机被移动；
- 支架倒下；
- 夜景过暗；
- 人物被遮挡；
- 双手机断连；
- 保存失败；
- AI生成失败；
- 支付失败；
- 商品下单失败；

应该进入：

# Exception / Fallback Matrix

而不是新的完整 Story。

---

# 26. 最终 Story System

```text
                   XFX STORY SYSTEM


            ┌──── CORE USAGE ────┐

                  STORY A
               Reality First
               Dual Device

                  STORY B
                Target First
                Dual Device

                  STORY C
               Reality First
               Single Device

                  STORY D
               Reality First
                Solo Fixed

                      ↓

               STORY E
              RECOVERY LAYER

       Repair / Retake / Replan
       Technical / Taste Failure

                      ↓

               STORY F
          INTELLIGENCE PROOF

             Difficult Scene
             Viewpoint Search
             Scene Strategy
```

---

# 27. 对正式原型设计的直接结论

A～F 并不是六套页面。

真正的产品仍然只有一条母路径：

```text
Entry
↓
Reality / Target
↓
SelectedTarget
↓
ShotDirection
↓
Live Director
↓
Capture QA
↓
Reality+
↓
Fine Tune
↓
Final
```

Story 只改变：

- EntryMode；
- DeviceMode；
- Target来源；
- ShotType；
- ActiveRole；
- SceneQuality；
- Recovery State。

所以后续 Prototype 应正式切换到：

# Screen Registry + State Registry

而不是：

> Story A 原型、Story B 原型分别独立施工。

---

# 28. 建议下一阶段建立的 Prototype Screen Registry

初步核心 Screen：

```text
P01 START
P02 TARGET DETAIL
P03 SHOOTING RELATION
P04 DEVICE MODE / JOIN
P05 REALITY SCAN
P06 TARGET DECISION
P07 SHOT BLUEPRINT
P08 LIVE DIRECTOR
P09 CAPTURE
P10 CAPTURE REVIEW
P11 REALITY+
P12 FINE TUNE
P13 FINAL HUB
```

## P01-P13 rebaseline mapping

| Screen range | User-facing Product stage | Supporting machine states |
|---|---|---|
| P01-P05 | REALITY_CAPTURE | ENTRY / SHOOTING_RELATION_DEVICE_MODE / REALITY |
| P06-P07 | AI_PHOTOGRAPHY_DIRECTOR | TARGET / SHOT |
| P08-P09 | LIVE_SHOOTING | LIVE / CAPTURE |
| P10-P11 | AI_PHOTO_QA + REALITY_PLUS | QA / REALITY_PLUS, including partial-retake transitions |
| P12 | USER_FINE_TUNE | FINE_TUNE |
| P13 | MY_FINAL_PHOTO | FINAL / Final Action Hub |

This mapping does not rename machine states. In the deterministic Non-AI baseline, P06-P07 consume a preset Shot Plan; they do not claim autonomous best-shot discovery.

每个 Screen 再定义：

```text
Story A State
Story B State
Story C State
Story D State
Story E State
Story F State
```

这将成为后续正式绘制页面和可交互 HTML 原型的施工蓝图。

---

# 29. 当前最终结论

> ## **A～F 已经形成完整的 Story Coverage System。**

A / B 解决：

> “我要拍什么？”

C / D 解决：

> “谁来拍、用什么设备拍？”

E 解决：

> “没拍好怎么办？”

F 解决：

> “场景本身不好拍怎么办？”

六条 Story 加在一起，已经足够支撑第一阶段产品原型、状态机、PRD 和 MVP 收敛设计。

后续重点不再是继续增加 Story，而是：

> **把 Story 压缩成 Screen + State，并逐屏开始真正设计。**
