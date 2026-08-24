# 向风行｜AI Visual Director 实时拍摄控制算法设计记录 V1.0

**Document ID：** `XFX_AI_VISUAL_DIRECTOR_REALTIME_SHOT_CONTROL_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** 产品算法 / 实时拍摄控制 / 双角色协同设计记录  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 第一版设计基线；后续允许追加修订，不静默覆盖历史结论

---

# 0. 文档目的

本文件用于完整记录向风行 AI Visual Director 当前已经形成的核心拍摄算法设计，重点解决：

> **在没有专业摄影师的情况下，AI 如何通过一个共享 Shooting Session，同时指导被拍摄者与拍摄者，把现实画面逐步调整到 Selected Target。**

当前设计已经从最初的“AI 推荐姿势”升级为：

> **AI Shot Direction + Shared Shooting Session + Realtime Shot Control**

系统不只需要理解“人物怎么摆”，还需要协调：

- 被拍摄者站哪里；
- 拍摄者站哪里；
- 摄影者如何移动；
- 人物如何移动；
- 手机高度；
- 镜头 / 景别；
- 背景锚点；
- 人物姿势；
- 视线；
- 动态动作；
- 快门时机；
- 双方 Ready 状态；
- 实时纠偏；
- 异常恢复；
- 必要时重新规划。

本记录覆盖 Step 01～Step 05，并重点冻结 Step 05「实时 AI 导演」的第一版算法思路。

---

# 1. 产品核心定义

向风行当前核心问题不是：

> “怎么给用户推荐一个好看的姿势？”

而是：

> **“普通用户到了一个地方想拍照，但双方都不懂摄影时，AI 如何把专业摄影师的现场判断拆成可执行指令，让两个人真正拍出更好的照片？”**

因此核心能力定义为：

# Shared AI Shooting Session

一个 Shooting Session 内存在：

- 一个共同 Target；
- 一个共同 ShotDirection；
- 一个统一 AI Director；
- 两个角色视角；
- 一个统一实时状态机。

角色包括：

```text
SUBJECT
被拍摄者

PHOTOGRAPHER
拍摄者
```

双端产品原则：

> **One Target**  
> 双方始终追同一个最终画面。

> **Two Views**  
> 被拍摄者与拍摄者只看到属于自己的信息。

> **One Role, One Instruction**  
> 普通调整阶段，每个时刻只让一个主要角色做一件事。

> **One AI Director**  
> 所有指令由统一 ShotDirection / CurrentShotState 决策，不允许两个端各自独立下指令。

---

# 2. 当前完整 Golden Flow

```text
STEP 01
START
选择“AI看看这里怎么拍” / “照这个效果拍”

        ↓

STEP 02
UNDERSTAND REALITY
人物理解 + 场景理解 + 光线 + 空间 + 安全

        ↓

STEP 03
SELECT TARGET
这里具体想拍成什么

        ↓

STEP 04
SHOT DIRECTION
人物站位 + 摄影者机位 + 构图 + Pose + 执行顺序

        ↓

STEP 05
REALTIME AI DIRECTOR
持续检测现实与目标差异
→ 判断优先级
→ 让正确的人做正确的一件事

        ↓

STEP 06
CAPTURE REVIEW / QA
AI判断“拍到了没有”
用户判断“我喜不喜欢”

        ↓

STEP 07
REALITY+ / AI ARTWORK
真实照片增强 / 风格化 / 保存 / 分享 / 商品化
```

其中：

```text
STEP 03 = WHAT
我要什么画面

STEP 04 = HOW
现实里怎么实现这个画面

STEP 05 = CONTROL
现在做得怎么样，下一步应该让谁做什么
```

---

# 3. STEP 02 输出：RealityContext

实时拍摄控制不能从原始图片直接开始。首先必须建立统一的现实上下文：

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

核心原则：

> 第二步不是简单“识别人物和场景”，而是建立一个可供 Target Generator 与 ShotDirection 使用的 Reality Model。

---

# 4. STEP 03 输出：SelectedTarget

Target 不是一个 Theme 名称，也不是“电影感 / 小清新 / 港风”这样的风格标签，而应该是一张现实可执行、可被后续算法验证的目标画面合同。

例如：

```text
冷雾湖畔

人物位于湖岸偏左
人物约占画面 1/3
保留湖面和远山
身体先面向湖
最后回头看镜头
整体保持冷灰克制的电影氛围
```

建议 Target 结构：

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

核心边界：

```text
Target = What
ShotDirection = How
```

---

# 5. STEP 04 输出：ShotDirection

Step 04 是 AI Visual Director 的计划层。它负责把 Target 转换成机器可执行拍摄合同。

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

# 6. ShotDirection 示例：冷雾湖畔

```yaml
target_name: 冷雾湖畔

shot_type: STATIC

subject:
  region: LEFT_THIRD
  scale: MEDIUM_FULL_BODY
  orientation: FACE_LAKE
  final_gaze: CAMERA

camera:
  relation: SUBJECT_RIGHT_REAR
  lens: 1X
  height: CHEST
  framing: ENVIRONMENT_HEAVY

background:
  required:
    - LAKE
    - MOUNTAIN
  avoid:
    - LARGE_OCCLUDER

pose:
  template: LOOK_BACK
  sequence:
    - FACE_LAKE
    - HOLD_BODY
    - TURN_HEAD
    - LOOK_CAMERA

execution_order:
  - PHOTOGRAPHER_POSITION
  - SUBJECT_POSITION
  - FRAMING
  - BODY_ORIENTATION
  - HEAD_GAZE
  - CAPTURE

safety:
  keep_distance_from_water_edge: true
```

---

# 7. STEP 05 的正式定义

# Realtime Shot Control System

第五步不是“实时让大模型不停看视频”。

真正需要完成的是：

```text
1. Observe
现实现在怎么样

2. Compare
现实离 ShotDirection 差多少

3. Prioritize
哪个差异最值得先解决

4. Assign
现在应该让谁调整

5. Instruct
只输出一条简单指令

6. Stabilize
等待用户执行，不频繁改变

7. Verify
是否进入 Acceptable Zone

8. Advance
进入下一个执行阶段
```

核心：

```text
ShotDirection
       VS
CurrentShotState
       ↓
Difference Vector
       ↓
Priority Engine
       ↓
Coordination Controller
       ↓
Next Best Instruction
```

---

# 8. 实时判断的四层频率

## L0｜Camera Stream

```text
Camera ≈ 30 FPS
```

只负责相机输入，不调用 VLM，不消耗语言模型 Token。

## L1｜Local Vision

建议：

```text
5～10 FPS
```

持续轻量视觉检测：

- Person Detection；
- Pose Skeleton；
- Face / Head Pose；
- Subject Scale；
- Subject Region；
- Camera Motion；
- Framing；
- Stability；
- Brightness；
- Blur；
- Basic Safety Signal。

示例：

```yaml
subject:
  center_x: 0.47
  center_y: 0.63
  scale: 0.58

body:
  orientation: FRONT

head:
  yaw: 4

frame:
  stable: true
  face_brightness: 0.42
```

主要采用端侧 CV、手机 GPU/NPU、轻量人体模型、Pose Estimation、Face Landmark、Optical Flow、IMU 等。

原则：

> **尽可能端侧完成。**

## L2｜Shot State Engine

建议：

```text
2～5 Hz
```

将一段时间内的 CV 结果聚合为：

```yaml
CurrentShotState:

  safety: PASS

  subject:
    position: GOOD
    scale: GOOD
    body_orientation: BAD
    gaze: GOOD

  camera:
    composition: BAD
    stability: GOOD

  background:
    anchors: PASS

  readiness:
    subject_ready: false
    camera_ready: false
```

仍然不需要语言模型。

## L3｜Instruction Engine

只在状态稳定变化时触发。

例如：

```text
Camera Position Error
连续 > 700ms
        ↓
“往右移动一点”
        ↓
Instruction Lock 1～2 秒
        ↓
等待用户执行
        ↓
重新判断
```

## L4｜VLM Replan

真正的大视觉模型只应事件触发。

典型触发：

- 场景发生明显变化；
- 原 Shot 不可执行；
- Background Anchor 消失；
- 光线显著变化；
- 连续 Guidance 失败；
- 用户做了影响 ShotDirection 的重大 Override。

调用：

```text
Current Key Frame
+
RealityContext
+
SelectedTarget
+
Current ShotDirection
+
Failure Reason
        ↓
VLM
        ↓
ShotDirection V2
```

因此：

> **实时体验 ≠ 实时 VLM。**

---

# 9. 当前正式技术原则

# AI plans sparsely, vision tracks continuously.

中文：

> **AI低频做决策，视觉高频做检测。**

以及：

# Realtime Guidance ≠ Realtime LLM/VLM.

大模型负责：

- 理解；
- 审美判断；
- Target；
- Shot Planning；
- 异常重规划。

轻量视觉 / 状态算法负责：

- 盯住现实；
- 判断偏差；
- 决定是否达标。

---

# 10. 为什么不能每帧调用 VLM

如果拍摄持续 2 分钟，持续发送视频帧给视觉大模型会造成：

- Token / 图像输入成本高；
- 推理次数极高；
- 网络流量增加；
- 延迟不可预测；
- 移动网络不稳定；
- 云端 GPU 成本；
- 隐私风险增加；
- VLM 输出容易抖动；
- 双端同步更加困难。

因此禁止将：

```text
Camera Stream
→ Continuous VLM
→ Instruction
```

作为默认架构。

---

# 11. 摄影者位置的技术边界

MVP 不必准确恢复：

```text
摄影者距离人物 3.82m
摄影者角度 34.6°
```

普通 RGB 手机在没有完整 AR / SLAM 的情况下，不适合把绝对几何关系作为首版硬依赖。

第一版采用：

# View-based Guidance

目标是判断 Camera View 是否达到了想要的视觉关系。

例如目标要求：

- 人物位于左 1/3；
- 人物占画面约 35%；
- 远山不能被人物遮挡；
- 湖面完整；
- 人物身体侧向。

当前画面如果人物过于居中、挡住山，则系统可以指导：

> **摄影者往右一点。**

移动后重新检测，达到 Target 即 PASS。

后续高级版本再考虑 Visual-Inertial Odometry、SLAM、AR、Depth、IMU Fusion。

---

# 12. 实时检测能力分级

## 必须实时 / 高频

建议 5～10 FPS：

- 人物是否在目标区域；
- 人物大小；
- 人物主要身体朝向；
- 头部大方向；
- 构图；
- 摄影者移动趋势；
- 稳定性；
- 明显安全风险。

## 可以低频

建议 0.5～2 Hz：

- 手部大致位置；
- 背景 Anchor；
- 光线变化；
- 遮挡；
- 简单表情；
- 头发状态。

## 拍完再判断

- 精细清晰度；
- 微表情；
- 闭眼；
- 最终人物观感；
- Target Match 总体评分；
- 是否需要 AI Repair；
- 哪一张最佳。

---

# 13. CurrentShotState

```yaml
CurrentShotState:

  timestamp:

  subject:
    detected:
    center_x:
    center_y:
    scale:
    body_orientation:
    pose_landmarks:
    head_pose:
    gaze:
    visibility:

  camera:
    motion_direction:
    stability:
    framing:
    estimated_height_class:

  background:
    required_anchor_status:
    occlusion_status:

  lighting:
    face_brightness:
    exposure_state:

  safety:
    risk_state:

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

# 14. Difference Vector

系统先计算结构化差异，不直接让大模型输出中文：

```yaml
Difference:

  safety_error:
  camera_position_error:
  subject_position_error:
  framing_error:
  scale_error:
  body_orientation_error:
  major_pose_error:
  gaze_error:
  micro_error:
```

然后进入 Priority Engine。

---

# 15. Guidance Priority

第一版建议：

| Priority | 类型 | 例子 |
|---|---|---|
| P0 | Safety | 离车道远一点 |
| P1 | Camera Position | 拍摄者往右 |
| P2 | Subject Position | 人物靠湖边一点 |
| P3 | Framing / Scale | 后退一点 |
| P4 | Body Orientation | 身体面向湖 |
| P5 | Major Pose | 手轻轻碰头发 |
| P6 | Head / Gaze | 回头看镜头 |
| P7 | Micro Adjustment | 下巴稍微收一点 |
| P8 | Capture Timing | 很好，保持，现在拍 |

原则：

> 高优先级问题未解决时，不处理低优先级细节。

最终优先级：

```text
Safety Hard Priority
        ↓
Current Phase Priority
        ↓
Error Severity
        ↓
User / Scene Constraints
```

---

# 16. Acceptable Zone

实时 Guidance 追求：

> **Good Enough，而不是数学完美。**

例如：

```yaml
subject_x:
  ideal: 0.34
  acceptable:
    min: 0.28
    max: 0.40

subject_scale:
  ideal: 0.56
  acceptable:
    min: 0.50
    max: 0.64

head_rotation:
  ideal: 15
  tolerance: 12
```

进入范围即 PASS，不继续纠正。

---

# 17. Instruction Stabilizer

任何指令都需要稳定器：

```text
发现 Error
      ↓
持续超过 500～800ms？
      ↓
YES
      ↓
生成 Instruction
      ↓
锁定 1～2 秒
      ↓
等待执行
      ↓
重新判断
```

同时需要：

```text
Dead Zone
Hysteresis
Cooldown
```

避免阈值附近频繁切换。

---

# 18. 双角色协调不是“两套 Guidance”

禁止：

```text
Subject AI 自己决定人物做什么
+
Photographer AI 自己决定摄影者做什么
```

正确结构：

```text
Shared CurrentShotState
        ↓
Coordination Controller
        ↓
ONE ActiveInstruction
        ↓
分别映射到两个角色
```

---

# 19. ActiveInstruction

```yaml
ActiveInstruction:

  target_role:
    - SUBJECT
    - PHOTOGRAPHER
    - BOTH

  action_type:
    - MOVE
    - HOLD
    - ROTATE_BODY
    - HAND_ACTION
    - GAZE
    - CAMERA_MOVE
    - CAMERA_HEIGHT
    - FRAMING
    - CAPTURE

  action:
  paired_state:
  priority:
  issued_at:
  valid_until:
  completion_condition:
```

例：

```yaml
target_role: PHOTOGRAPHER
action_type: CAMERA_MOVE
action: MOVE_RIGHT
paired_state:
  SUBJECT: HOLD
priority: P1
```

摄影者端：

> **往右一点。**

被拍摄者端：

> **你的位置很好，先保持。**

---

# 20. 单 Active Role 原则

静态 Shot 默认：

# Single Active Role

原因：

如果 Subject 和 Photographer 同时移动：

- Camera View 同时变化；
- 很难判断哪个操作产生改善；
- 用户容易混乱；
- 已经 Ready 的状态容易被破坏。

只有 ShotDirection 明确定义协同动态时才允许：

```text
BOTH
```

---

# 21. 动态 Shot：Shot Choreography

例如欧式街头：

```yaml
shot_type: MOTION

subject:
  WALK_FORWARD

camera:
  MOVE_BACKWARD

timing:
  - SUBJECT_LOOK_LEFT
  - CONTINUE_WALK
  - SUBJECT_LOOK_CAMERA
  - BURST_CAPTURE
```

此时允许：

```yaml
target_role: BOTH
action_type: COORDINATED_MOVEMENT
```

这是一个提前设计好的协同动作，而不是两个 AI 各说各话。

---

# 22. 静态 Shot 推荐调整顺序

```text
Camera Position
        ↓
Subject Position
        ↓
Framing
        ↓
Major Pose
        ↓
Gaze / Micro
        ↓
Capture
```

理由：

- 摄影者机位决定背景、透视和大构图；
- 人物站位决定 Scene Region；
- Framing 决定景别和比例；
- 位置正确后再修 Pose；
- 最后才做 Gaze / Micro。

Safety 永远高于这一顺序。

---

# 23. Photographer View

摄影者端：

> **Camera First。**

屏幕主要用于实时 Camera，仅叠加：

1. Target Preview；
2. Ghost Framing；
3. Current Instruction。

例如：

> **→ 往右一点**

避免展示 Dashboard、评分、角度、坐标和复杂摄影参数。

产品类比：

> 后台像专业摄影系统，前端像导航。

---

# 24. Subject View

拍摄开始后，被拍摄者不应该一直低头看手机。

因此 Subject Phone 更像：

# AI 摄影耳返

主要输出：

- 大字；
- 箭头；
- 简单动作动画；
- 语音；
- 震动；
- Ready 状态。

例如：

```text
身体转向湖面
        ↗
```

达到后：

```text
很好，保持
```

---

# 25. Active Speaker Policy

双设备同时播 AI 语音会造成现场混乱。

第一版建议：

- Subject Phone：语音为主；
- Photographer Phone：Camera Overlay + 文字 + 箭头 + 震动。

原则：

> **同一时刻最多一个 AI Voice Speaker。**

---

# 26. 双 Ready 状态

两端持续显示：

```text
👤 人物
📱 机位
```

状态：

```text
UNKNOWN
ADJUSTING
READY
```

例如：

```text
👤 人物   ✓
📱 机位   ●
```

最终：

```text
👤 ✓
📱 ✓
```

解决现实问题：

> “为什么还不拍？”
> “是我站错了还是你站错了？”

---

# 27. Ghost Framing

摄影者端建议加入 Target Subject Zone。

不是教程式三分法，而是：

```text
╭────────╮
│ 人放这里 │
╰────────╯
```

人物进入目标区后变绿。

原则：

> **能用视觉表达，就不要一直说。**

---

# 28. Ghost Pose

进入 Pose 阶段，可以显示简化 Target Skeleton，只帮助理解：

- 身体方向；
- 肩部；
- 头部；
- 大动作。

不要做严格的人体动作考试。

---

# 29. 空间指令语言规范

“往右”容易歧义。

摄影者端可以：

> 你往右一点。

被拍摄者端优先用 Scene Anchor：

> 靠湖边一点。

> 往栏杆方向一步。

如果必须左右：

> 往你的右手边一步。

---

# 30. Guidance Escalation

如果用户一直没有完成指令：

### Level 1

> 往右一点。

### Level 2

> 再往右走两步。

### Level 3

视觉提示：

```text
当前位置 ●
        →
推荐位置 ○
```

### Level 4

> 这个机位不太好调整，我们换个更简单的拍法。

进入 Backup ShotDirection 或 VLM Replan。

---

# 31. Recovery

如果用户执行错，例如摄影者右移时人物也跟着移动：

```text
Camera improved
Subject degraded
```

系统不显示 ERROR，而是协调恢复：

Subject：

> **你退回刚才的位置。**

Photographer：

> **你先保持。**

---

# 32. User Override

AI 是默认，不是强制。

Subject 可调整：

- 换动作；
- 不想看镜头；
- 更自然一点；
- 想拍全身；
- 不喜欢这个姿势。

Photographer 可调整：

- 人物大一点；
- 背景多一点；
- 换机位；
- 用 2×；
- 就从这里拍。

原则：

# AI chooses the default. User owns the taste.

---

# 33. 双手机不是强制

Shared Shot Model 同时支持：

## A｜双人双手机

完整双角色体验。

## B｜双人单手机

摄影者手机承担主 Camera 和 CV，人物 Guidance 由摄影者手机扬声器播出。

## C｜一个人 + 支架

系统先指导手机放置，机位锁定后再通过语音指导用户站位、Pose 和倒计时。

---

# 34. 双设备同步

双手机不应该同步两路完整视频到服务器。

摄影者端作为：

# Authority Device

维护：

```yaml
SharedShotState:
  subject_ready:
  camera_ready:
  active_phase:
  active_role:
  current_instruction:
  capture_ready:
```

同步的数据可以非常小：

```json
{
  "subject_ready": true,
  "camera_ready": false,
  "active_role": "PHOTOGRAPHER",
  "instruction": "MOVE_RIGHT"
}
```

Subject Phone 主要订阅状态和 Instruction。

---

# 35. 断网 / 双端失败降级

如果 Subject Phone 断开：

```text
双端模式
↓
Subject disconnected
↓
自动切换单机模式
```

摄影者手机开始播放人物 Guidance，Shooting Session 不应中断。

---

# 36. Capture Readiness

当以下项目全部进入 Acceptable Zone：

```yaml
CaptureReadiness:
  safety: PASS
  subject_position: PASS
  camera_view: PASS
  framing: PASS
  major_pose: PASS
  gaze: PASS
  stability: PASS
```

进入：

# CAPTURE_READY

---

# 37. Capture Window

静态 Shot：

```text
很好，保持
↓
3
2
1
↓
Capture
```

动态 Shot：

实时判断最佳 Capture Window：

> **现在，连拍。**

---

# 38. 推荐 State Machine

```text
LIVE_GUIDANCE_START

        ↓

SAFETY_CHECK

        ↓

SPATIAL_ALIGNMENT
    ├── CAMERA_POSITIONING
    └── SUBJECT_POSITIONING

        ↓

FRAMING_ALIGNMENT

        ↓

POSE_GUIDANCE

        ↓

GAZE_GUIDANCE

        ↓

MICRO_ADJUSTMENT

        ↓

CAPTURE_READY

        ↓

CAPTURE_WINDOW

        ↓

CAPTURED
```

异常：

```text
SAFETY_RISK
→ STOP_GUIDANCE

REALITY_CHANGED
→ REPLAN_REQUIRED

GUIDANCE_STUCK
→ ESCALATE / SIMPLIFY_PLAN

USER_OVERRIDE
→ UPDATE_SHOT_DIRECTION

DEVICE_DISCONNECTED
→ FALLBACK_MODE
```

---

# 39. Algorithm Loop

```text
while session_active:

    frame = camera.read()

    perception = local_vision(frame)

    current_state = aggregate(perception)

    safety = safety_check(current_state)

    if safety == FAIL:
        issue(STOP)
        continue

    difference = compare(
        ShotDirection,
        CurrentShotState
    )

    phase = resolve_phase(difference)

    candidate_instruction = prioritize(
        phase,
        difference
    )

    stable_instruction = stabilizer(
        candidate_instruction
    )

    if stable_instruction:
        active_instruction = coordinate(
            stable_instruction
        )

        dispatch(
            subject_view,
            photographer_view
        )

    if reality_changed_or_stuck():
        request_replan()

    if capture_readiness == PASS:
        enter_capture_window()
```

---

# 40. Next Best Instruction

第五步真正的核心算法能力：

# Next Best Instruction Engine

目标不是回答：

> “照片哪里不好？”

而是：

> **“为了最快接近 Target，现在最值得让谁做哪一件事？”**

可以抽象为：

```text
NBI =
argmax(
  Expected_Target_Improvement
  × Instruction_Executability
  × Phase_Priority
  × Confidence
  - User_Disruption
)
```

需要满足：

- 明显改善 Target；
- 用户容易执行；
- 当前角色适合调整；
- 不和上一条指令冲突；
- 不频繁切换；
- 不破坏已经 Ready 的部分。

---

# 41. Ready Lock / Hysteresis

某维度达到 Ready 后，应进入锁定。

例如：

```text
Camera Ready ✓
```

进入人物调整阶段时，摄影者只需保持。

除非 Camera Deviation 超过更大的退出阈值。

例如：

```text
Ready Entry Threshold = 0.10
Ready Exit Threshold  = 0.18
```

避免：

```text
READY
NOT READY
READY
NOT READY
```

---

# 42. 判断置信度

CurrentShotState 应记录：

```yaml
confidence:
  person:
  pose:
  head:
  background:
  instruction:
```

如果置信度不足，不强行指导。

例如人物严重遮挡：

> **我现在看不清动作，稍微露出完整上半身。**

---

# 43. Safety

Safety 是 Hard Constraint，不是评分项。

例如：

- 机动车道；
- 危险岸边；
- 明显车辆接近；
- 禁止区域。

一旦：

```text
Safety = FAIL
```

正常 Guidance 暂停。

不能把安全纳入视觉评分平均。

---

# 44. Cost Architecture

第五步的商业目标：

> **用户感觉 AI 一直在场，但昂贵模型几乎不持续运行。**

正常 Session：

```text
Person Analysis
VLM × 1

Scene Analysis
VLM × 1

Target / Shot Planning
VLM / LLM × 少量

----------------------------

Realtime Guidance
Local CV + Rules + State
≈ 0 Token

----------------------------

异常 Replan
VLM × 0～1

Capture QA
Vision × 1

Final Image
Image Model
```

真正大的变量成本主要来自 Preview / Artwork / Video Generation，而不是实时摄影 Guidance。

---

# 45. MVP 能力裁剪

完整算法非常复杂，不建议 MVP 一次全部完成。

第一版优先验证：

> **AI现场指导到底能不能显著提高普通人的拍照成功率。**

## MVP 必须做

1. Person Bounding Box  
2. Subject Scale  
3. Major Body Orientation  
4. Framing Guidance  
5. Target Ghost Zone  
6. Pose Template + 简单 Pose 检测  
7. Capture QA  

其中 Framing Guidance 至少能输出：

- 往左；
- 往右；
- 后退；
- 靠近；
- 手机抬高；
- 手机降低。

## MVP 可以暂时模拟

- 精确 Camera 世界坐标；
- 复杂手部动作判断；
- 双人动态运动；
- 深度估计；
- AR 空间 Anchor；
- 高精度场景实时 Tracking；
- 自动快门；
- 多人复杂遮挡；
- 高精度 Gaze。

## 后续增强

### V2

- Head Pose；
- 更强 Pose；
- Scene Anchor Tracking；
- 双设备同步；
- Subject语音耳返。

### V3

- Dynamic Shot Choreography；
- SLAM / AR；
- 真实 Camera Position；
- 自动 Burst Timing；
- Multi-shot Session。

---

# 46. 产品体验成功标准

不是以“CV 99% 准确”为最终成功标准。

真正需要衡量：

### Guidance Success Rate
一条指令发出后，用户是否在合理时间内进入目标范围。

### Average Instructions per Shot
越少越好。

### Time to Capture Ready
从进入拍摄到 Ready 花多久。

### Guidance Oscillation Rate
是否频繁出现左 / 右 / 左 / 右反复纠正。

### Replan Rate
多少 Session 需要 VLM 重规划。

### Abandon Rate
用户是否在 Guidance 中退出。

### Capture Acceptance Rate
拍完后用户是否选择留下。

### Retake Rate
是否真正减少反复重拍。

---

# 47. 算法优化目标

算法不是为了控制用户 100% 达到理想几何点。

目标应该是：

```text
Minimize:
  User Effort
  Instruction Count
  Time To Ready
  Confusion
  Cost

Maximize:
  Visual Improvement
  Capture Success
  User Taste Acceptance
```

而不是：

```text
Maximize Geometric Target Match Only
```

---

# 48. 用户审美边界

AI 可以判断：

> 技术上更接近 Target。

但不能替用户决定：

> “这张你应该喜欢。”

因此第六步分成：

# Technical Pass

AI：

> 这张已经拍到了。

和：

# Taste Pass

用户：

> 我喜欢 / 再来一张。

原则：

> **AI owns expertise. User owns taste.**

---

# 49. 当前核心系统资产

真正值得沉淀的不是某一个 Prompt，而是：

```text
RealityContext Schema
Target System
ShotDirection Contract
Pose / Shot Template Library
CurrentShotState
Difference Engine
Priority Engine
Instruction Stabilizer
Coordination Controller
Next Best Instruction Engine
Capture Readiness
Capture QA
Replan Logic
```

这些共同形成：

# AI Shot Direction Engine

---

# 50. 当前设计决策记录

## Decision 01
实时指导不能建立在持续大模型调用上。  
**状态：APPROVED**

## Decision 02
摄影者 Camera 为主要实时视觉源。  
**状态：APPROVED**

## Decision 03
Subject Phone 主要为 Instruction Receiver，不持续开视觉模型。  
**状态：APPROVED**

## Decision 04
实时视觉优先采用端侧 CV + CurrentShotState + Rule / State Engine。  
**状态：APPROVED**

## Decision 05
VLM 主要用于初始理解、Shot Planning、异常 Replan、拍后 QA。  
**状态：APPROVED**

## Decision 06
静态 Shot 默认 ONE ACTIVE ROLE；协同动态 Shot 才允许 BOTH。  
**状态：APPROVED**

## Decision 07
总体指导优先级为：

```text
Safety
→ Camera
→ Subject
→ Framing
→ Pose
→ Gaze
→ Micro
→ Capture
```

**状态：APPROVED_BASELINE**

## Decision 08
系统使用 Acceptable Zone，而不是精确 Target Point。  
**状态：APPROVED**

## Decision 09
必须存在 Instruction Stabilizer + Ready Hysteresis。  
**状态：APPROVED**

## Decision 10
MVP 不追求精确 3D Camera Position，优先 View-based Guidance。  
**状态：APPROVED**

---

# 51. 当前主要风险

## Risk 01｜CV 准确度

端侧人体 / Pose 在夜景、遮挡、远距离、小人物和复杂背景下可能不稳定。

需要 Confidence 和降级逻辑。

## Risk 02｜Instruction 可执行性

知道哪里不对，不代表用户知道怎么改。

例如：

```text
body_orientation_error = 25°
```

最终必须转译成：

> 身体再侧一点。

## Risk 03｜错误指令破坏已完成状态

人物调整可能重新破坏 Camera Ready。

需要 Ready Lock + Revalidation。

## Risk 04｜双人互动复杂

如果 AI 指令太多，产品可能比朋友随手拍更累。

因此 Instruction Count / Time To Ready 必须成为核心指标。

## Risk 05｜Realtime ≠ Valuable

即使技术能实时检测，也必须验证这些指导是否显著提高最终照片质量。

---

# 52. 推荐第一阶段实验

不要首先实现完整算法。

同一组：

```text
Person
+
Scene
+
Target
```

比较：

## Control
朋友自由拍。

## Variant A
只给 Target Preview。

## Variant B
Target + Shot Blueprint。

## Variant C
Target + Shot Blueprint + Realtime Guidance。

观察：

- 拍摄耗时；
- 重拍数量；
- 用户最终喜欢率；
- 第三方盲评；
- 指令次数；
- 放弃率；
- 使用意愿。

最终回答：

> **Realtime Guidance 到底增加了多少真实价值？**

---

# 53. 下一阶段建议设计项

在进入正式工程实现之前，建议依次完成：

```text
01 CurrentShotState Field Definition
02 ShotDirection Machine Contract
03 Difference Metric
04 Guidance Priority Table
05 Instruction Vocabulary
06 Instruction Stabilizer Parameters
07 Dual-role Coordination Matrix
08 Guidance Escalation Rules
09 Capture Readiness Rules
10 Replan Trigger Rules
11 MVP CV Capability Matrix
12 Offline Simulation Test Cases
```

之后再进入：

```text
正式技术架构
API
端侧模型选择
微信 / 抖音小程序 Camera Frame
WebSocket
数据库
工程实现
```

---

# 54. 第一版最终定义

向风行实时拍摄算法 V1 的核心，不是：

> 实时用大模型看视频。

而是：

# Realtime Shot Control

通过：

```text
AI Planner
+
Executable ShotDirection
+
Local Vision
+
CurrentShotState
+
Difference Engine
+
Priority Engine
+
Instruction Stabilizer
+
Dual-role Coordination
+
Event-triggered Replan
```

实现：

> **在正确的时候，只让正确的人做正确的一件事。**

最终用户应该感受到：

> “AI一直在现场帮我们拍。”

而技术实际上做到：

> **昂贵 AI 低频调用，廉价视觉持续工作。**

---

# 55. 当前一句话总结

> ## **AI 负责理解“这张照片应该怎么拍”，端侧视觉负责盯住“现在拍到了哪里”，状态算法负责决定“下一步让谁做什么”。**

这三层分工，是当前向风行 Realtime AI Director 最核心的算法架构。
