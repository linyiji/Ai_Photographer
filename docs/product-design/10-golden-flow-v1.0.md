# 向风行｜AI Visual Director 完整 Golden Flow 设计记录 V1.0

**Document ID：** `XFX_AI_VISUAL_DIRECTOR_COMPLETE_GOLDEN_FLOW_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** 完整产品流程 / Golden Flow / 产品与算法基线  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 完整流程第一版基线；后续应以版本追加方式修订，不静默覆盖

---

# 0. 文档目的

本文件用于汇总并冻结向风行 AI Visual Director 当前已经完成讨论的完整产品闭环。

该闭环已经从最初的：

> AI 推荐姿势 / AI 拍照辅助

升级为：

> **AI 理解现实 → 决定拍什么 → 制定拍摄方案 → 双角色实时导演 → 拍后 QA → AI Reality+ → 用户最后微调 → 保存 / 分享 / 实体化 / 创意衍生 / 长期作品资产。**

完整产品已经不再只是一个“拍照页面”，而是一套从现实拍摄到数字资产、实体商品和传播增长的完整视觉工作流。

---

# 1. 完整 Golden Flow

```text
STEP 01
START
进入 / 选择起点

        ↓

STEP 02
UNDERSTAND REALITY
理解人物、穿搭、场景、空间、光线与安全

        ↓

STEP 03
SELECT TARGET
确定“这次具体想拍成什么”

        ↓

STEP 04
SHOT DIRECTION
制定人物与摄影者可执行的拍摄方案

        ↓

STEP 05
REALTIME AI DIRECTOR
实时检测现实状态并协调双方调整

        ↓

STEP 06
CAPTURE REVIEW / QA
判断“刚才这张到底拍到了没有”

        ↓

STEP 07
AI REALITY+
自动专业精修

        ↓

USER FINE TUNE
用户完成最后一公里微调

        ↓

MY FINAL PHOTO
正式数字母资产

        ↓

FINAL ACTION HUB
保存 / 分享 / 实体化 / 更多玩法 / 作品库
```

整个流程可以浓缩为：

> # **看懂现实 → 决定拍什么 → 算出怎么拍 → 现场指导拍好 → 判断有没有拍到 → 自动精修 → 用户最后收口 → 保存、传播、商业化和长期资产化。**

---

# 2. STEP 01｜START

## 2.1 用户核心问题

> **“我现在应该怎么开始？”**

首页不让用户理解复杂产品概念，只保留两个核心入口。

---

## 2.2 入口 A｜AI 看看这里怎么拍

适合：

> 我到了这里，但不知道应该怎么拍。

流程：

```text
Reality First

人物
+
现场
↓
AI 理解 Reality
↓
寻找视觉机会
↓
推荐 Target
```

这是：

> **我不知道答案，AI 帮我找答案。**

---

## 2.3 入口 B｜照这个效果拍

适合：

> 我已经有一个喜欢的参考效果。

流程：

```text
Target First

喜欢的效果
+
现实人物
+
现实现场
↓
AI 判断可实现性
↓
适配现实条件
↓
形成可执行 Target
```

这是：

> **我已经知道想要什么，AI 帮我把它实现。**

---

## 2.4 STEP 01 需要实现的内容

- Reality First 主入口；
- Target First 主入口；
- 上一次 Shooting Session 继续；
- 扫码 / 链接加入 Shared Shooting Session；
- 为后续单人、双人、双手机模式预留进入逻辑。

---

## 2.5 STEP 01 输出

```text
EntryMode

REALITY_FIRST
或
TARGET_FIRST
```

---

## 2.6 核心产品原则

用户只需要回答：

> **“我现在有没有明确想拍成什么？”**

不要要求用户理解：

- Reality Mode；
- Theme Mode；
- ShotDirection；
- Shared Shooting Session；
- AI Director。

复杂度属于系统。

---

# 3. STEP 02｜UNDERSTAND REALITY

## 3.1 用户感受到的体验

用户不填写复杂表单。

只需要：

> **先让我看看今天的你。**

然后：

> **再让我看看准备拍照的这里。**

---

## 3.2 人物理解

系统需要理解：

- 人物 Anchor；
- 当前人物形象；
- 发型；
- 穿搭；
- 穿搭主要颜色；
- 服装视觉重点；
- 人物轮廓；
- 适合的动作类型；
- 后续身份保持所需 Reference。

系统不需要判断：

> “这个人好不好看。”

而是：

> **“这个视觉状态怎样被最好地呈现。”**

---

# 4. 场景理解

系统需要理解：

- 场景类型；
- 背景 Anchor；
- 地标；
- 环境色彩；
- 光线方向；
- 光线强弱；
- Visual Noise；
- 透视；
- 留白；
- 可利用构图；
- 拍摄方向。

例如场景理解不能只是：

```text
湖
山
雾
```

而应该继续理解：

```text
大环境干净
湖面留白
山谷纵深
冷灰色调
柔和光线
适合人物偏左
适合中远距离
```

---

# 5. 空间理解

系统还需要理解：

# Scene Affordance

即：

- 人物可以站哪里；
- 摄影者可以站哪里；
- 两个人是否可以移动；
- 有什么 Movement Path；
- 哪些方向有更好的构图；
- 哪些区域会发生遮挡。

这一层是后续 ShotDirection 的空间基础。

---

# 6. 安全理解

Safety 在第二步就必须建立。

例如：

- 机动车道；
- 湖岸；
- 湿滑区域；
- 车辆区域；
- 禁止站位区域；
- 高风险移动路径。

Safety 不是后面补一句：

> 注意安全。

而应该成为：

# Hard Constraint

```text
Safety
↓
Target Filter
↓
ShotDirection
```

任何视觉上好看、但需要用户进入危险区域的 Target，都不应该被推荐。

---

# 7. STEP 02 输出：RealityContext

```yaml
RealityContext:

  person:
    identity_anchor:
    outfit:
    hair:
    visual_features:
    pose_affordance:

  scene:
    scene_type:
    background_anchors:
    lighting:
    visual_noise:
    composition_opportunity:

  spatial:
    subject_candidate_zones:
    camera_candidate_zones:
    movement_paths:
    occlusion:

  safety:
    forbidden_zones:
    risk_notes:

  desired_target_constraint:
    optional:
```

核心定义：

> **STEP 02 不是简单“识别图片”，而是建立后续 Target 和 ShotDirection 可使用的 Reality Model。**

---

# 8. STEP 03｜SELECT TARGET

## 8.1 用户核心问题

> **“那我到底要拍成什么？”**

---

# 9. Reality First 模式

AI 基于：

```text
RealityContext
↓
Opportunity Detection
↓
Target Candidate Generation
↓
Feasibility Filter
↓
Safety Filter
↓
Diversity Filter
↓
Target Ranking
↓
Top 3
```

建议一次只给：

# 3 个 Target

例如：

- AI 首推；
- 更自然；
- 更有氛围。

不要给十几个模板。

---

# 10. Target First 模式

用户已经选择某种喜欢的效果。

系统需要判断：

```text
很适合
可以拍，但需要调整
当前不太适合
```

然后生成当前现实可实现的版本。

如果不适合，应提供：

- AI 适配现在这里；
- 换一个效果；
- 换个位置。

不能假装所有 Target 在所有 Reality 中都适合。

---

# 11. Target 不是 Theme 标签

禁止只把：

```text
电影感
日系
港风
清透
```

当作 Target。

真正 Target 应描述：

> **最终具体想得到一张什么画面。**

例如：

```text
冷雾湖畔

人物位于湖岸偏左
人物约占画面 1/3
保留湖面和远山
身体面向湖
最后回头看镜头
整体冷灰克制
```

---

# 12. STEP 03 输出：SelectedTarget

```text
SelectedTarget
=
我要什么画面
```

建议结构：

```yaml
Target:
  visual_reference:
  subject_scale:
  subject_region:
  framing:
  composition:
  background_anchors:
  desired_body_orientation:
  desired_gaze:
  mood:
  lighting_direction:
  realism_constraint:
  safety_constraints:
  user_overrides:
```

这一阶段正式解决：

# WHAT

---

# 13. STEP 04｜SHOT DIRECTION

这是 AI Visual Director 的计划层。

## 13.1 用户核心问题

> **“那现实里到底怎么拍？”**

---

# 14. Shot Direction 要回答的问题

AI 必须把 Target 转成：

### 人物

- 站哪里；
- 朝哪里；
- 做什么动作；
- 看哪里；
- 是否移动。

### 摄影者

- 站哪里；
- 相对人物什么方向；
- 前后关系；
- 手机高度；
- 镜头；
- 景别；
- 是否移动。

### 背景

- 哪些 Anchor 必须保留；
- 哪些区域需要避开；
- 哪些方向更适合。

### 双方协调

- 谁先动；
- 谁保持；
- 谁后动；
- 动态 Shot 如何协同。

---

# 15. ShotDirection 核心结构

```yaml
ShotDirection:

  subject_anchor:
    position:
    orientation:
    safe_zone:

  camera_anchor:
    relation:
    distance:
    height:
    angle:

  framing:
    lens:
    shot_size:
    subject_scale:

  background:
    required_anchors:
    avoid_regions:

  action:
    shot_type:
    pose:
    gaze:
    subject_movement_path:
    camera_movement_path:

  execution_order:

  tolerance:

  safety_constraints:

  success_criteria:
```

---

# 16. ShotDirection 不等于 Pose Recommendation

一个关键结论：

> **不要先推荐 Pose。**

更加合理的顺序是：

```text
Camera Position
↓
Subject Position
↓
Framing
↓
Major Pose
↓
Gaze
```

很多照片不好看，首先是因为：

> 人物站错位置 + 摄影者站错位置。

Pose 只是后面的一部分。

---

# 17. 静态与动态 Shot

ShotDirection 需要区分：

```text
STATIC
MOTION
```

### Static

例如：

> 面湖回眸。

### Motion

例如：

> 人物向摄影者走，摄影者缓慢后退。

Motion 需要：

# Shot Choreography

包括：

- Subject Movement Path；
- Camera Movement Path；
- Timing；
- Capture Window。

---

# 18. STEP 04 输出

```text
SHOT_DIRECTION_READY
```

对应核心对象：

```text
ShotDirection
```

这一阶段解决：

# HOW

---

# 19. STEP 05｜REALTIME AI DIRECTOR

这是整套产品技术难度最高、差异化最强的一段。

## 19.1 核心问题

系统持续回答：

> **现实现在离 ShotDirection 还有多远？**

以及：

> **下一步到底应该让谁做什么？**

---

# 20. 实时指导不是实时调用大模型

正式原则：

> # AI plans sparsely, vision tracks continuously.

中文：

> **AI 低频做规划，视觉高频做检测。**

实时体验不等于：

> Continuous VLM。

---

# 21. 实时架构

```text
L0
Camera Stream
约 30 FPS

↓
L1
Local Vision
5～10 FPS

↓
L2
CurrentShotState
2～5 Hz

↓
Difference Engine

↓
Priority Engine

↓
Instruction Stabilizer

↓
Coordination Controller

↓
Next Best Instruction
```

正常实时阶段：

> **AI Token ≈ 0。**

---

# 22. Local Vision 需要判断

主要包括：

- Person Detection；
- Subject Position；
- Subject Scale；
- Body Orientation；
- Pose Skeleton；
- Head Pose；
- Gaze；
- Camera Motion；
- Framing；
- Stability；
- Brightness；
- Basic Safety；
- Background Anchor 状态。

---

# 23. CurrentShotState

```yaml
CurrentShotState:

  subject:
    position:
    scale:
    body_orientation:
    pose_landmarks:
    head_pose:
    gaze:

  camera:
    motion:
    framing:
    stability:

  background:
    anchors:

  lighting:

  safety:

  readiness:
    subject_ready:
    camera_ready:
    framing_ready:
    pose_ready:
    gaze_ready:

  control:
    active_phase:
    active_role:
    current_instruction:
```

---

# 24. Difference Engine

系统持续比较：

```text
ShotDirection
        VS
CurrentShotState
        ↓
Difference Vector
```

例如：

```yaml
Difference:
  safety_error:
  camera_position_error:
  subject_position_error:
  framing_error:
  scale_error:
  body_orientation_error:
  pose_error:
  gaze_error:
```

---

# 25. Guidance Priority

建议：

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
P6 Head / Gaze
↓
P7 Micro Adjustment
↓
P8 Capture Timing
```

高优先级问题没解决时：

> 不处理低优先级细节。

---

# 26. One Active Role

静态 Shot 默认：

# One Active Role

即一个时刻主要只让一个角色调整。

例如：

### 摄影者端

> 往右一点。

### 被拍摄者端

> 你的位置很好，先保持。

摄影者完成以后：

### Subject

> 身体面向湖面。

### Photographer

> 机位很好，保持。

---

# 27. BOTH 只用于协同动态 Shot

例如：

```text
Subject
向前走

+

Photographer
缓慢后退
```

这种情况由 ShotDirection 提前定义为：

```text
BOTH
COORDINATED_MOVEMENT
```

不是两个 AI 自己分别说话。

---

# 28. 双端产品视图

## Photographer View

Camera First。

主要展示：

- Camera View；
- Target 小图；
- Ghost Framing；
- 当前一条指令；
- Ready 状态。

例如：

> **→ 往右一点**

---

## Subject View

更像：

# AI 摄影耳返

主要展示：

- 大字；
- 箭头；
- 动作动画；
- AI 语音；
- 震动；
- Ready 状态。

例如：

> **身体转向湖面。**

拍摄过程中尽量不要求人物一直低头看手机。

---

# 29. Active Speaker Policy

双手机时：

- Subject Phone：语音为主；
- Photographer Phone：视觉、箭头、文字、震动为主。

原则：

> **同一时刻最多一个 AI Voice Speaker。**

---

# 30. Acceptable Zone

实时控制不追求数学完美。

不是：

```text
必须 x = 0.3400
```

而是：

```text
x = 0.28 ~ 0.40
```

进入合理范围：

> PASS。

原则：

> **Good Enough。**

---

# 31. Instruction Stabilizer

必须防止：

```text
往左
↓
往右
↓
往左
```

建议：

```text
Error 持续 500～800ms
↓
生成 Instruction
↓
锁定 1～2 秒
↓
等待用户执行
↓
重新判断
```

并加入：

- Dead Zone；
- Hysteresis；
- Cooldown；
- Ready Lock。

---

# 32. VLM Replan

真正的大视觉模型只在必要时调用。

例如：

- 场景发生明显变化；
- 原 Shot 无法执行；
- 背景 Anchor 消失；
- 光线显著变化；
- 连续 Guidance 失败；
- 用户做重大 Override。

形成：

```text
Current Key Frame
+
RealityContext
+
SelectedTarget
+
ShotDirection
+
Failure Reason
↓
VLM
↓
ShotDirection V2
```

---

# 33. Capture Readiness

当：

```text
Safety PASS
Subject Position PASS
Camera View PASS
Framing PASS
Major Pose PASS
Gaze PASS
Stability PASS
```

进入：

# CAPTURE_READY

然后进入快门。

---

# 34. STEP 06｜CAPTURE REVIEW / QA

## 34.1 用户核心问题

> **“刚才这张到底拍到了没有？”**

---

# 35. AI Technical Pass

AI 判断：

### 基础质量

- 模糊；
- 闭眼；
- 遮挡；
- 曝光；
- 清晰度。

### Target Match

- 人物位置；
- 人物大小；
- 构图；
- Pose；
- Gaze；
- 背景 Anchor；
- 光线。

### Repairability

判断：

> **能修还是应该重拍？**

---

# 36. CaptureDecision

推荐三档：

```text
ACCEPT
```

> 这张拍到了。

```text
ACCEPT_WITH_REPAIR
```

> 这张可以用，AI 可以自然修一下。

```text
RETAKE
```

> 关键效果没有拍到，建议再拍。

---

# 37. Taste Pass

用户始终拥有最终审美决定。

AI 可以说：

> 技术上很好。

用户仍然可以：

> 不喜欢这个表情。

原则：

> # AI owns expertise. User owns taste.

---

# 38. Retake Router

重拍不应该粗暴从头开始。

根据问题精准回退：

```text
Framing 问题
→ FRAMING_ALIGNMENT

Subject Position 问题
→ SUBJECT_POSITIONING

Pose 问题
→ POSE_GUIDANCE

Gaze / Expression
→ GAZE / MICRO

Reality Changed
→ REPLAN
```

最终生成：

# `AcceptedCapture`

---

# 39. STEP 07｜AI REALITY+

AcceptedCapture 以后进入 AI 后期。

正式原则：

> **默认不直接重新生成一张 AI 写真。**

第一结果应该是：

# Reality+

定义：

> **真实拍摄结果的专业最佳版本。**

---

# 40. Capture Causality

最终结果必须证明前面的摄影行为有价值。

需要成立：

```text
Better Capture
↓
Better Final Result
```

不能变成：

```text
Bad Capture
↓
AI Recreate
↓
Same Final Result
```

否则前面的 ShotDirection 和实时 Guidance 会失去意义。

---

# 41. Reality+ 人物处理原则

# Identity Conservative

默认允许：

- 曝光；
- 肤色；
- 小瑕疵；
- 轻微磨皮；
- 黑眼圈；
- 飞发；
- 衣服细节；
- 局部阴影；
- 面部亮度。

默认不主动：

- 换脸；
- 大幅改五官；
- 大幅瘦脸；
- 大幅改身材；
- 换发型；
- 换衣服。

---

# 42. Reality+ 环境处理原则

# Environment Flexible

允许更灵活：

- 小路人；
- 小杂物；
- 垃圾桶；
- 小广告牌；
- 轻微车辆干扰；
- 天空层次；
- 色彩；
- 光线；
- 景深；
- 小范围透视；
- 小范围裁切；
- 小范围生成扩图。

---

# 43. Target-aware Reality+

Reality+ 不能只是普通一键增强。

系统拥有：

```text
RealityContext
+
SelectedTarget
+
ShotDirection
+
CaptureShotState
+
CaptureQA
+
AcceptedCapture
```

所以可以根据 Target 做：

- Target-aware Color；
- Target-aware Lighting；
- Target-aware Composition；
- Target-aware Environment Cleanup。

最终定义：

> # Reality+ = Technical Retouch + Target-aware Creative Direction

---

# 44. AI 创作与 Reality+ 分开

正式分层：

```text
Reality+
真实正式摄影结果

↓ 用户主动

Creative+
更强导演增强

↓ 用户主动

AI Artwork
作品化创作
```

AI Artwork 可以：

- 改天气；
- 强化雾气；
- 创意灯光；
- 扩背景；
- 海报化；
- 视频化；
- 文旅限定设计。

但不是默认摄影结果。

---

# 45. USER FINE TUNE｜最后一公里

Reality+ 完成以后：

> 用户自己完成最后 5%～10% 审美调整。

基础 Fine Tune：

> **不使用生成式 AI。**

采用：

- Semantic Masks；
- 确定性图像参数；
- 实时渲染；
- 非破坏式编辑。

正式原则：

> # AI 负责做到专业，用户负责调成自己喜欢。

以及：

> # Parametric Adjustment 交给用户，Semantic Modification 才交给 AI。

---

# 46. Fine Tune 四种 Scope

```text
整体
人物
背景
局部
```

底层：

```text
ALL
PERSON
BACKGROUND
LOCAL_REGION
```

---

# 47. 整体

MVP 可包括：

- 明暗；
- 冷暖；
- 氛围；
- 可选轻量对比。

---

# 48. 人物

自动复用：

```text
Person Mask
Face Mask
Hair Mask
Outfit Mask
```

用户调整：

- 人物亮度；
- 肤色；
- 肤质。

用户无需知道底层 Mask。

---

# 49. 背景

自动复用：

```text
Background Mask
Sky Mask
```

用户调整：

- 背景明暗；
- 鲜艳度；
- 轻量虚化。

---

# 50. 局部

用于解决：

- 左脸太暗；
- 裙摆局部过黑；
- 天空某块太亮；
- 某个区域太艳；
- 某块环境太暗。

交互：

- 单指拖动；
- 双指放大 / 缩小；
- 调整矩形宽高；
- 自动羽化。

局部框不是 Crop，而是：

# Local Adjustment Mask

---

# 51. Fine Tune 非破坏式

保存：

# `AdjustmentRecipe`

例如：

```yaml
AdjustmentRecipe:

  global:
    brightness:
    warmth:
    mood:

  person:
    brightness:
    skin_tone:
    skin_retouch:

  background:
    brightness:
    saturation:
    blur:

  local:
    - region:
        x:
        y:
        width:
        height:
      feather:
      brightness:
      warmth:
      saturation:
```

用户点击“完成”后再 Render。

---

# 52. My Final Photo

资产关系：

```text
Original Capture
        ↓
AcceptedCapture
        ↓
AI Reality+
        ↓
AdjustmentRecipe
        ↓
MY FINAL PHOTO
```

`My Final Photo` 是正式数字母资产。

后面所有：

- 保存；
- 分享；
- 打印；
- 冰箱贴；
- 视频；
- 海报；
- AI Artwork；

均从该资产派生。

---

# 53. FINAL ACTION HUB

Final 已经不再属于摄影算法。

它属于：

> **交付 + 增长 + 商业化 + 复购 + 长期资产。**

一级入口长期尽量固定：

```text
保存高清图
分享
做成实物
更多玩法
```

另加：

> ✓ 已自动保存到「我的作品」

---

# 54. 保存

## 54.1 保存高清图

默认保存：

> `My Final Photo`

而不是中间版本。

## 54.2 自动作品库

系统自动把作品沉淀到：

# Works Library

用户以后可以：

- 再下载；
- 再编辑；
- 再打印；
- 再创作；
- 再拍同款。

---

# 55. 分享

## V1

普通图片分享。

## P1

升级成：

# Share Card

包含：

```text
Final Photo
+
Target
+
Location
+
Date
+
向风行品牌
+
“我也要拍这个”
```

形成增长：

```text
用户 A
↓
分享作品
↓
用户 B
↓
拍同款
↓
新 Session
```

---

# 56. 图片实体化

首批重点：

## 照片打印

优势：

- 供应链成熟；
- 用户理解简单；
- 实现成本低。

## 冰箱贴

优势：

- 旅行纪念属性强；
- 文旅价值高；
- 溢价空间更大。

## 大头贴 / 照片条

跟随线下设备方向推进。

---

# 57. 实体商品 Product Preview

禁止：

```text
选择冰箱贴
↓
直接下单
```

应该：

```text
My Final Photo
↓
选择 Product
↓
模板适配
↓
Product Preview
↓
移动 / 缩放 / 裁切
↓
确认
↓
下单
```

---

# 58. Product Artwork

不要修改 My Final Photo。

建立独立：

# ProductArtwork

关系：

```text
My Final Photo
↓
Product Template
↓
Product Artwork
↓
Print-ready File
↓
Order
```

同一张照片可以衍生：

- 6寸照片；
- 冰箱贴；
- 大头贴；
- 明信片；
- 海报；
- 亚克力。

---

# 59. 更多玩法

统一承载 Creative 能力。

P1 可以逐步增加：

- 动态短片；
- 旅行海报；
- AI Artwork；
- 再拍同款；
- 再拍一个动作。

不应该全部堆在 Final 首屏。

---

# 60. Works Library

作品库不是普通相册。

每个作品应该是：

# Visual Asset

包括：

```text
Original Capture
Reality+
AdjustmentRecipe
My Final Photo
Target
Scene
ShotDirection
Artwork
Video
Product Artwork
Order
```

长期可以支持：

- 再编辑；
- 再下载；
- 再打印；
- 再做冰箱贴；
- 再做视频；
- 再做海报；
- 再拍同款。

---

# 61. 完整对象流

从数据 / 工程角度：

```text
EntryMode
        ↓
RealityContext
        ↓
SelectedTarget
        ↓
ShotDirection
        ↓
CurrentShotState
        ↓
CaptureAsset
        ↓
CaptureDecision
        ↓
AcceptedCapture
        ↓
RealityPlusAsset
        ↓
AdjustmentRecipe
        ↓
MyFinalPhoto
        ↓
        ├── ShareAsset
        ├── ProductArtwork
        ├── CreativeArtwork
        └── WorksLibrary
```

原则：

> 每一层生成新对象，不静默覆盖上一层资产。

---

# 62. 各步骤最终实现内容总表

| 阶段 | 用户核心问题 | 系统主要实现 | 关键输出 |
|---|---|---|---|
| **STEP 01 START** | 我怎么开始？ | Reality First / Target First 两入口、Session 进入 | `EntryMode` |
| **STEP 02 UNDERSTAND** | AI 看懂我和这里了吗？ | 人物、穿搭、场景、光线、空间、安全理解 | `RealityContext` |
| **STEP 03 TARGET** | 我要拍成什么？ | 推荐 / 适配 3 个现实可实现 Target | `SelectedTarget` |
| **STEP 04 DIRECTION** | 到底怎么拍？ | 人物站位、机位、构图、镜头、Pose、动作顺序 | `ShotDirection` |
| **STEP 05 LIVE** | 现在应该怎么调整？ | CV 检测、状态判断、双角色协调、Next Best Instruction | `CurrentShotState / CaptureAsset` |
| **STEP 06 QA** | 这张到底拍到了没有？ | Technical QA、Target Match、Repair / Retake、Taste Review | `AcceptedCapture` |
| **STEP 07 REALITY+** | 怎么把照片做到专业？ | Target-aware AI 自动精修 | `RealityPlusAsset` |
| **USER FINE TUNE** | 怎么调成我自己最喜欢？ | 整体 / 人物 / 背景 / 局部确定性调整 | `AdjustmentRecipe` |
| **MY FINAL PHOTO** | 哪张是正式成片？ | 非破坏式 Render | `MyFinalPhoto` |
| **FINAL ACTION HUB** | 成片之后做什么？ | 保存、分享、实体、创意、作品库 | 多种衍生资产 |

---

# 63. 产品责任边界总结

整个产品的职责可以拆成：

```text
AI
负责：
理解
判断
规划
专业默认
异常处理

用户
负责：
选择 Target
执行拍摄动作
最终 Taste
最后 Fine Tune
是否继续创作

实时 CV / 状态算法
负责：
盯住现实
判断偏差
触发指令

生成式 AI
负责：
Reality+
Semantic Modification
Creative+
AI Artwork
```

---

# 64. 三条最重要的产品原则

## Principle 01

> **复杂度属于系统，选择权属于用户。**

---

## Principle 02

> **AI 负责专业判断，用户拥有审美决定权。**

---

## Principle 03

> **先把现实拍好，再把现实修好，最后才允许 AI 把它变成作品。**

---

# 65. 当前完整产品一句话定义

> ## **向风行先理解“你和这里”，帮你决定“值得拍成什么”，再把专业摄影师的判断转换成人物和摄影者都能执行的现场指导，帮助普通人真正把照片拍好；之后 AI 自动完成专业 Reality+，用户自己完成最后审美微调，再从正式成片继续保存、分享、实体化、创作和长期资产沉淀。**

---

# 66. 当前阶段结论

截至 V1.0：

> **向风行完整产品主闭环已经成立。**

当前完整闭环已经覆盖：

```text
需求进入
↓
Reality Understanding
↓
Target
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
Save / Share / Physical / Creative / Works
```

下一阶段不建议继续横向增加大量功能。

更合理的是进入：

# MVP 收敛

继续拆分：

```text
V1 原型必须展示什么
↓
MVP 真正必须开发什么
↓
哪些复杂能力第一版先模拟
↓
哪些能力放到 V1.1 / V2
```

使完整愿景从“设计闭环”进一步收敛成：

> **真正可开发、可测试、可验证用户价值的第一版产品。**
