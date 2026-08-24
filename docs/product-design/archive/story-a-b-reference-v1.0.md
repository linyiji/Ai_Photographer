# 向风行｜Prototype Story A / B 与复用对照矩阵 V1.0

**Document ID：** `XFX_PROTOTYPE_STORY_AB_MATRIX_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** 原型故事 / Storyboard / Screen Reuse Matrix  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 原型故事第一版基线；后续 Story C/D/E/F 在此基础上继续扩展

---

# 0. 文档目的

本文件汇总向风行第一阶段原型的两条核心 Golden Story：

- **Story A｜Reality First**
- **Story B｜Target First**

并进一步整理：

- 两条 Story 的业务差异；
- 页面复用关系；
- 新增页面 / 新增状态；
- 核心 Screen Component；
- 数据对象差异；
- 原型第一阶段必须重点表现的状态。

目标不是分别建设两套完整原型，而是：

> # **建立一套可复用的 Screen / State 系统，再由不同 Story 驱动不同数据与状态。**

---

# 1. Story A｜Reality First

## 1.1 故事定义

两位朋友旅行到雾湖 / 山谷类场景。

- A：被拍摄者；
- B：摄影者；
- A 穿黑色时装；
- 两个人都不懂专业摄影；
- A 没有明确参考图；
- 她只知道：“这个地方挺好看的，帮我拍几张。”

因此用户从：

# AI 看看这里怎么拍

进入。

---

# 2. Story A 核心目标

Story A 验证：

> **AI 能不能从 Reality 出发，理解人物与现场，再主动发现“这里值得拍成什么”。**

核心路径：

```text
Reality First
↓
Person
+
Scene
↓
RealityContext
↓
Target Recommendation
↓
SelectedTarget
↓
ShotDirection
↓
Realtime Guidance
↓
Capture QA
↓
Reality+
↓
Fine Tune
↓
My Final Photo
↓
Final Action Hub
```

---

# 3. Story A 主场景

建议：

```text
人物：
黑色时装 / 长深色头发

现场：
雾湖山谷

AI 首推 Target：
冷雾湖畔

Shot Type：
STATIC

主要动作：
面湖回眸
```

这一故事适合验证：

- Reality First；
- 双角色；
- Shared Shooting Session；
- 静态 Shot；
- Camera / Subject 分阶段调整；
- Capture QA；
- Reality+；
- User Fine Tune；
- Final / 冰箱贴。

---

# 4. Story A Storyboard

| Scene | Screen / State | 用户核心动作 | 系统核心响应 |
|---|---|---|---|
| A01 | Start | 点击“AI看看这里怎么拍” | `EntryMode = REALITY_FIRST` |
| A02 | Shooting Relation | 朋友帮我拍 | 建立 Shooting Session |
| A03 | Join Session | 朋友扫码 | 分配 Subject / Photographer |
| A04 | Person Scan | 看人物 | PersonContext Ready |
| A05 | Scene Scan | 看现场 | SceneContext Ready |
| A06 | Understanding | 等待 | RealityContext Ready |
| A07 | Target Select | 选择“冷雾湖畔” | SelectedTarget |
| A08 | Shot Blueprint | 看双方站位 | ShotDirection Ready |
| A09 | Camera Position | 摄影者移动 | Camera Ready |
| A10 | Subject Position | 人物移动 | Subject Ready |
| A11 | Pose / Gaze | 人物面湖、回眸 | Pose Ready |
| A12 | Capture Ready | 保持 / 拍摄 | CaptureAsset |
| A13 | Capture QA | 喜欢 / 重拍 | AcceptedCapture |
| A14 | Reality+ | 等待 | RealityPlusAsset |
| A15 | Fine Tune | 整体 / 人物 / 背景 / 局部 | AdjustmentRecipe |
| A16 | Final Photo | 确认正式成片 | MyFinalPhoto |
| A17 | Save | 保存 | Delivery Complete |
| A18 | Share | 分享 | ShareAsset / Growth |
| A19 | Physical | 冰箱贴预览 | ProductArtwork / Order |

---

# 5. Story A 的体验重点

## 5.1 AI 帮用户发现 Target

用户不是从 Theme Library 开始，而是：

```text
Person
+
Scene
↓
AI发现视觉机会
```

推荐约 3 个 Target：

- AI 首推；
- 更自然；
- 更有感觉。

---

## 5.2 Shot Direction 不等于 Pose

先解决：

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

不是一上来告诉用户：

> “摆这个姿势。”

---

## 5.3 Shared Shooting Session

双手机模式下：

```text
One Target
Two Views
One AI Director
```

摄影者 Camera 是主要实时视觉源。

Subject Phone 主要作为：

> AI 摄影耳返。

---

# 6. Story B｜Target First

## 6.1 故事定义

用户提前看到一个喜欢的视觉结果：

# 欧式街头时装

她的诉求不是：

> “这里怎么拍？”

而是：

> **“我就想拍成这个。”**

因此从：

- 首页“照这个效果拍”；或
- 别人分享作品中的“我也要拍这个”

进入。

---

# 7. Story B 核心目标

Story B 验证：

> **AI 能不能把一个已有 DesiredTarget，与当前 Person / Scene 结合，转换成现实可执行的 ExecutableTarget。**

核心路径：

```text
DesiredTarget
+
Current Reality
↓
Target × Reality Compatibility
↓
Target Adaptation
↓
ExecutableTarget
↓
SelectedTarget
↓
ShotDirection
↓
后续与 Story A 合流
```

---

# 8. Story B 主场景

建议：

```text
DesiredTarget：
欧式街头时装

人物：
黑色时装 / 长深色头发

现实现场：
欧式建筑街区

Compatibility：
很适合

Shot Type：
MOTION

动作：
向摄影者走来

Camera：
摄影者缓慢后退
```

这一 Story 主要验证：

- Target First；
- 拍同款流量承接；
- Compatibility；
- Target Adaptation；
- Motion Shot；
- BOTH 协同；
- Capture Window；
- Target Propagation Loop。

---

# 9. Story B Storyboard

| Scene | Screen / State | 用户操作 | 系统响应 |
|---|---|---|---|
| B01 | Shared Target Detail | 点击“我也要拍这个” | 建立 `DesiredTarget` |
| B02 | Target Locked | 确认此效果 | `EntryMode = TARGET_FIRST` |
| B03 | Shooting Relation | 朋友帮我拍 | 建立 Session |
| B04 | Person Scan | 拍当前人物 | Person × Target Match |
| B05 | Scene Scan | 扫当前环境 | Scene × Target Match |
| B06 | Compatibility | 查看可实现性 | 很适合 / 可调整 / 不适合 |
| B07 | Target Adaptation | 接受适配版本 | `ExecutableTarget` |
| B08 | Shot Blueprint | 查看双方站位 / 路径 | `ShotDirection` |
| B09 | Camera Position | 摄影者调整 | Camera Ready |
| B10 | Subject Position | 人物进入起点 | Subject Ready |
| B11 | Motion Ready | 准备走路 | Choreography Ready |
| B12 | Live Motion | 两人同时协同 | Realtime Control |
| B13 | Capture Window | 连拍 | CaptureAssets |
| B14 | AI Select / QA | 看最佳图 | Technical Pass |
| B15 | Taste Review | 喜欢 / 修改 | Retake Router |
| B16 | Accepted Capture | 用户确认 | AcceptedCapture |
| B17 | Reality+ | 自动精修 | Target-aware Retouch |
| B18 | Fine Tune | 用户最后调整 | AdjustmentRecipe |
| B19 | Final | 保存 / 分享 / 实体 | MyFinalPhoto |

---

# 10. Story B 的关键新增对象

相对于 Story A：

```text
DesiredTarget
↓
CompatibilityResult
↓
AdaptationPlan
↓
ExecutableTarget
↓
SelectedTarget
```

新增对象：

## DesiredTarget

用户原始想要的目标。

## CompatibilityResult

当前 Reality 能否实现。

## AdaptationPlan

哪些保留，哪些调整。

## ExecutableTarget

在当前 Reality 中真正可执行的版本。

---

# 11. Compatibility 三档状态

## 很适合

```text
这里很适合这个效果 ✓
```

直接形成 ExecutableTarget。

## 可以拍，但需要调整

例如：

- 光线不一致；
- 人太多；
- 当前机位不适合。

AI 明确告诉用户：

> “可以拍，我会调整机位 / 区域 / 构图。”

## 当前不太适合

禁止用一个“82%匹配”硬装可行。

应该提供：

- AI 适配现在这里；
- 换一个效果；
- 换个位置。

---

# 12. Target Adaptation 原则

Adaptation 不是 Target Replacement。

例如：

```text
DesiredTarget：
海岛清透大片

Reality：
普通城市街道
```

AI 可以：

> 保留人物感、动作与色彩方向，改成“城市夏日版”。

用户决定是否接受。

---

# 13. Story A / B 核心差异

| 维度 | Story A | Story B |
|---|---|---|
| 用户起点 | 不知道拍什么 | 已经知道想拍什么 |
| Entry | AI看看这里怎么拍 | 照这个效果拍 / 拍同款 |
| 第一核心对象 | Reality | DesiredTarget |
| AI任务 | 发现视觉机会 | 判断并适配目标 |
| STEP 03 | 推荐 Target | Compatibility + Adaptation |
| Target 来源 | AI 推荐 | 用户 / 分享 / 模板 |
| ShotDirection 后 | 共用 | 共用 |
| 主场景 | 雾湖 | 欧式街区 |
| Shot Type | STATIC | MOTION |
| 主要价值 | 发现 | 实现 |
| 增长意义 | 创造可分享作品 | 承接 Target 传播流量 |

---

# 14. 原型复用等级

定义：

| 标记 | 含义 | 原型处理 |
|---|---|---|
| **R0** | 页面与逻辑基本完全共用 | 同一 Screen |
| **R1** | UI共用，只换文案 / 图片 / 数据 | 同 Screen + Data State |
| **R2** | 页面骨架共用，但交互 / 状态明显不同 | 同 Component + State |
| **N** | Story B 新能力 | 新 Screen / 关键 State |

---

# 15. Story A × Story B 原型对照矩阵

| Flow阶段 | Story A｜Reality First | Story B｜Target First | 复用 | 原型设计结论 |
|---|---|---|---|---|
| 进入来源 | 主动打开向风行 | 主动打开 / 分享“拍同款” | R2 | 分享入口需要新增 State |
| Start | AI看看这里怎么拍 | 照这个效果拍 | R0 | 同一 Start Screen |
| Target Detail Before Session | 无 | DesiredTarget Detail | N | B 必须新增 |
| Shooting Relation | 朋友 / 自己 | 朋友 / 自己 | R0 | 完全共用 |
| Join Session | 扫码加入 | 扫码加入 | R0 | 完全共用 |
| Person Scan | 看人物适合怎么拍 | 看人物如何适配 Target | R1 | Camera UI 共用 |
| Person Analysis | Person → Target推荐 | Person × DesiredTarget | R2 | 分析目标不同 |
| Scene Scan | 看这里适合怎么拍 | 看这里能不能拍成这个 | R1 | Camera UI 共用 |
| Scene Analysis | Scene Opportunity | Scene × Target Compatibility | R2 | 底层任务不同 |
| Reality Processing | RealityContext | RealityContext + DesiredTarget | R1 | Processing UI 共用 |
| Target阶段 | AI推荐3个 | 已有 DesiredTarget | R2 | 最大结构分叉 |
| Target Candidate Select | 需要 | 不需要 | A独有 | B跳过 |
| Compatibility | 不需要 | 很适合 / 可调整 / 不适合 | N | B核心新增 |
| 保留 / 调整说明 | 无 | 保留什么、改什么 | N | 并入 Compatibility |
| Target Adaptation | 无 | DesiredTarget → ExecutableTarget | N | 可与 Compatibility 同屏 |
| SelectedTarget Ready | 用户选推荐Target | 用户确认适配Target | R2 | 最终对象统一 |
| Shot Blueprint | 雾湖静态站位 | 欧街动态路径 | R1 | 同 Component |
| Shot Type | STATIC | MOTION | R2 | State不同 |
| Camera Position | 右移 / 后退 | 偏透视线 / 保持距离 | R1 | Live UI共用 |
| Subject Position | 湖岸偏左 | 动态起点 | R1 | Guidance共用 |
| 双方 Ready | 👤✓ 📱✓ | 👤✓ 📱✓ | R0 | 共用 |
| Action Ready | 面湖回眸 | 准备慢走 | R2 | Static / Motion |
| Action Choreography | 站姿 + 回眸 | 走路 + 视线变化 | R1 | 同一Choreography组件 |
| Live Guidance | 单Active Role | 部分阶段 BOTH | R2 | 控制逻辑不同 |
| Subject View | AI耳返 | AI耳返 | R1 | 文案/动作不同 |
| Photographer View | 机位保持 | 协同后退 | R2 | Motion增加移动提示 |
| Capture Ready | 静态Ready | Capture Window | R2 | 状态不同 |
| Capture | 3、2、1 | 现在，连拍 | R2 | 同一 Capture Component |
| Capture Assets | 2～3张 | 3～5张 | R1 | 数量可配置 |
| AI Select / QA | 构图/Pose/Gaze | Motion/Gaze/Blur | R1 | QA字段动态配置 |
| Taste Review | 喜欢 / 再拍 | 喜欢 / 再拍 | R0 | 完全共用 |
| Retake Router | Pose/Gaze/Framing | Motion Start/Framing/Gaze | R2 | 路由目标不同 |
| Accepted Capture | AcceptedCapture | AcceptedCapture | R0 | 从此完全合流 |
| Reality+ | 冷雾湖畔 | 欧式街头时装 | R1 | Target-aware数据不同 |
| Fine Tune | 整体/人物/背景/局部 | 同 | R0 | 共用 |
| Final Photo | 冷雾湖畔成片 | 欧式街头成片 | R1 | Asset不同 |
| 保存 | 保存高清图 | 同 | R0 | 共用 |
| 分享 | 分享 / 拍同款 | 分享 / 继续传播Target | R0 | 共用 |
| 做成实物 | 打印 / 冰箱贴 | 同 | R0 | 共用 |
| 更多玩法 | Video/Poster/Artwork | 同 | R0 | 共用 |
| 作品库 | Visual Asset | Visual Asset | R0 | 共用 |

---

# 16. Story B 真正新增的 Screen / State

相对于 Story A，真正新增内容很少：

| 新增内容 | 必要性 | 说明 |
|---|---:|---|
| **Shared Target Detail** | 必须 | 分享“我也要拍这个”进入 |
| **Target Compatibility** | 必须 | 判断当前 Reality 是否可执行 |
| **Target Adaptation** | 必须有逻辑 | 可并入 Compatibility 同屏 |
| **Not Suitable State** | 必须预制 | 证明 AI 不会硬套 Target |
| **Motion Shot State** | 必须 | Blueprint / Live / Capture 支持动态 |

结论：

> **Story B 不需要重新设计一整套原型。**

主要是 Story A 基础 Screen 上增加新 State。

---

# 17. 两条 Story 的结构关系

```text
                    START
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼

     STORY A                  STORY B
  REALITY FIRST             TARGET FIRST

     看人物                  DesiredTarget
       ↓                        ↓
     看现场                  看人物
       ↓                        ↓
RealityContext                看现场
       ↓                        ↓
AI 推荐 Target          Reality × Target
       ↓                        ↓
用户选 Target            Compatibility
       │                        ↓
       │                 Target Adaptation
       │                        ↓
       │                 ExecutableTarget
       │                        │
       └──────────┬─────────────┘
                  ▼

           SelectedTarget

                  ↓
           ShotDirection
                  ↓
       Realtime Guidance
                  ↓
              Capture
                  ↓
                 QA
                  ↓
          AcceptedCapture
                  ↓
             Reality+
                  ↓
             Fine Tune
                  ↓
          My Final Photo
                  ↓
         Final Action Hub
```

---

# 18. 原型应该抽象成 Screen Component，而不是 Story 页面

建议第一阶段建立约 12 个核心 Screen Component：

| Screen Component | Story A | Story B | 主要状态 |
|---|---:|---:|---|
| **Start Screen** | ✅ | ✅ | Reality First / Target First |
| **Target Detail** | 可选 | ✅ | Library / Shared Target |
| **Shooting Relation** | ✅ | ✅ | Friend / Solo |
| **Reality Scan** | ✅ | ✅ | Person / Scene |
| **Target Decision** | ✅ | ✅ | Discover / Compatibility / Adaptation |
| **Shot Blueprint** | ✅ | ✅ | Static / Motion |
| **Live Director** | ✅ | ✅ | Subject / Photographer / Both |
| **Capture** | ✅ | ✅ | Countdown / Burst |
| **Capture Review** | ✅ | ✅ | Accept / Repair / Retake / Taste |
| **Reality+** | ✅ | ✅ | Target-aware Processing |
| **Fine Tune** | ✅ | ✅ | All / Person / Background / Local |
| **Final Hub** | ✅ | ✅ | Save / Share / Physical / Creative |

---

# 19. Target Decision Component

同一个组件支持：

## Discover Mode｜Story A

```text
这里最适合这样拍

Target A
Target B
Target C

[ 就拍这个 ]
```

## Adapt Mode｜Story B

```text
你想拍这个
↓
当前现实

很适合 ✓

保留：
动作 / 风格

调整：
光线 / 机位 / 背景

[ 按这个方案拍 ]
```

---

# 20. Shot Blueprint Component

## STATIC

重点显示：

- Subject Anchor；
- Camera Anchor。

## MOTION

在同一骨架上增加：

- Subject Path；
- Camera Path；
- Timing。

无需两套页面。

---

# 21. Live Director Component

统一支持：

```text
ACTIVE_ROLE = SUBJECT
ACTIVE_ROLE = PHOTOGRAPHER
ACTIVE_ROLE = BOTH
```

因此 Story A / B 只是 Control State 不同。

---

# 22. Capture Component

## Static Mode

```text
READY
↓
3
2
1
↓
Capture
```

## Motion Mode

```text
Motion Active
↓
Capture Window
↓
现在，连拍
```

---

# 23. QA Component

## Static Dimensions

- Composition；
- Pose；
- Gaze；
- Exposure；
- Blur。

## Motion Dimensions

- Composition；
- Motion Pose；
- Gaze；
- Motion Blur；
- Subject Scale Stability。

用户端始终保持三类判断：

```text
拍到了
能修
建议重拍
```

---

# 24. Story A / B 数据对象矩阵

| Object | Story A | Story B |
|---|---:|---:|
| `EntryMode` | REALITY_FIRST | TARGET_FIRST |
| `DesiredTarget` | — | ✅ |
| `PersonContext` | ✅ | ✅ |
| `SceneContext` | ✅ | ✅ |
| `RealityContext` | ✅ | ✅ |
| `CompatibilityResult` | — | ✅ |
| `AdaptationPlan` | — | ✅ |
| `ExecutableTarget` | AI推荐后形成 | DesiredTarget适配后形成 |
| `SelectedTarget` | ✅ | ✅ |
| `ShotDirection` | ✅ | ✅ |
| `ShotType` | STATIC | MOTION |
| `CurrentShotState` | ✅ | ✅ |
| `CaptureAsset` | ✅ | ✅ |
| `CaptureDecision` | ✅ | ✅ |
| `AcceptedCapture` | ✅ | ✅ |
| `RealityPlusAsset` | ✅ | ✅ |
| `AdjustmentRecipe` | ✅ | ✅ |
| `MyFinalPhoto` | ✅ | ✅ |

---

# 25. 原型第一轮重点状态

| 优先级 | 状态 | 原因 |
|---|---|---|
| **P0** | Reality First Target Discover | Story A 核心 |
| **P0** | Target First Compatibility | Story B 核心 |
| **P0** | Static Shot Blueprint | Story A 核心 |
| **P0** | Motion Shot Blueprint | Story B 核心 |
| **P0** | Subject Active | 双角色核心 |
| **P0** | Photographer Active | 双角色核心 |
| **P0** | BOTH Motion | 动态协同核心 |
| **P0** | Capture QA | 摄影闭环 |
| **P0** | Reality+ | 后期价值 |
| **P0** | Fine Tune Local | 最后一公里差异化 |
| **P0** | Final Hub | 商业闭环 |
| **P1** | Target Not Suitable | AI可信度 |
| **P1** | Taste Retake | 状态机能力 |
| **P1** | Product Preview | 实体商业化 |

---

# 26. 当前原型设计结论

原型工作量不应该理解为：

```text
Story A 19屏
+
Story B 19屏
=
38屏
```

而应该是：

# **约 12 个核心 Screen Component + 不同 Story State**

这套方式可以直接延续到：

- HTML 原型；
- 微信小程序；
- 抖音小程序；
- 正式前端组件；
- PRD 状态说明；
- 后续 Story C / D / E / F。

---

# 27. Story A 一句话定义

> **用户不知道拍什么，AI从“今天的你 + 现在这里”中发现一个现实可执行的视觉目标，并把它真正拍出来。**

---

# 28. Story B 一句话定义

> **用户负责说“我想拍成这个”，AI负责回答“按照今天的你和现在这里，这个效果现实中应该怎么实现”。**

---

# 29. A / B 共同产品原则

> # 原型不是为了展示有多少功能，而是让一个真实用户完成一次真实拍摄。

A 证明：

> AI 能发现 Target。

B 证明：

> AI 能实现 Target。

两条 Story 在：

```text
SelectedTarget
↓
ShotDirection
```

之后合流，因此产品、算法与前端都应该以：

> **共用 Engine + Story-specific State**

为基本架构。
