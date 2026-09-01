# 向风行｜Live V4 视觉线框与指示算法规范

> Superseded by `18_LIVE_V4_VISUAL_GUIDANCE_AND_OVERLAY_ALGORITHM_V03.md` under 05G. Retained only as historical context.

**Document ID:** `XFX_LIVE_V4_VISUAL_GUIDANCE_AND_OVERLAY_ALGORITHM_V02`
**Status:** `OWNER_DESIGN_AUTHORITY / SUPERSEDES_V01`
**Date:** `2026-08-31`
**Applies to:** `PARALLEL_LIVE / Live V4`
**Implementation task reference:** `XFX_LIVE_P2_V4_MEASUREMENT_READINESS_AND_VISUAL_GUIDANCE_INTEGRATED_REBASELINE_05A`
**05A alignment:** `HEAD_CORE centroid / MeasurementCapability / coverage-measurement separation`

---

# 0. 文档目的

本文件不是 UI 灵感稿，也不是 Codex 可自行扩展的建议。

本文件定义 Live V4 的：

- 线框展示语义；
- Current / Target 的视觉关系；
- Required Body Guide；
- Semantic Anchor Guide；
- Scale Guide；
- Target Zone；
- Movement Arrow；
- 文字指示；
- 语音指示；
- VERIFY / READY 反馈；
- 各状态之间的切换算法；
- Presentation 与 Controller 的唯一数据来源关系。

后续实现必须遵守：

> **算法决定“现在差什么”，Presentation 决定“如何让普通用户一眼看懂并执行”。**

但 Presentation 不得形成第二套独立判断逻辑。

唯一正确链路：

```text
HumanObservation
+
LiveTarget
↓
LiveConstraintState
↓
LiveAction
↓
LivePresentationModelV02
↓
Renderer
```

前端 Renderer 只渲染 `LivePresentationModelV02`，不得自行根据 `TOO_RIGHT / TOO_LARGE / BodyMode` 等内部状态重新推导指令。

## 0.1 V02 核心修正：先识别“当前看到了人体哪一段”，绝不默认要求全身

Live 的 Observation 层必须先从实时视频中**反推出当前人体可见范围**，而不是进入 Live 后先要求用户把全身展示出来。

正确顺序：

```text
Camera Frame
↓
Person / Pose
↓
Subject Lock
↓
Observed Body Coverage
“当前画面实际上看到了头 / 头肩 / 上半身 / 三分之二 / 全身中的哪一种”
↓
Semantic Anchors + Measurement Capability
↓
HumanObservation
```

然后才与 `LiveTarget` 比较。

硬规则：

```text
DEFAULT_FULL_BODY_REQUIREMENT = NO
```

是否需要继续看到髋、膝、脚，只能由**当前 Shot Plan / LiveTarget 所需要的 measurement**决定。

例如：

```text
Close Portrait Target
→ 可能只需要 HEAD / SHOULDERS / EYE_LINE
→ 不要求 HIPS / KNEES / FEET

Upper Body Target
→ 可能需要 HEAD_TO_HIP + TORSO_CENTER
→ 不要求 KNEES / ANKLES / FEET

Full Body Target
→ 才需要相应下肢 / ankle / foot coverage basis
```

`Observed Body Coverage` 只描述当前视频里“看到了人物哪一段”，不代表它对当前 Shot Plan 是好还是坏。

---

# 1. Live 的完整输入 / 输出关系

## 1.1 输入 A：Camera Frames

```text
Camera Frame
↓
Pose / Person Perception
↓
Subject Lock
↓
Body Visibility Evidence
↓
Observed Body Coverage
↓
Semantic Anchors
↓
Measurement Capability / Readiness
↓
HumanObservationV02
```

`HumanObservationV02` 只描述现实，不包含 Target 判断。

## 1.2 输入 B：LiveTargetV02

`LiveTargetV02` 来自已经选定的 Shot Plan。

它描述：

- 当前 Shot Plan 需要的身体可见范围 / measurement basis（可为头肩、上半身、三分之二或全身；**默认不要求全身**）；
- 人物在画面中的目标视觉尺度；
- 哪个 Semantic Anchor 是主要控制锚点；
- 该锚点目标 X/Y；
- Target tolerance；
- 次级约束；
- Pose constraint；
- Camera constraint；
- Control Actor。

Live 不自行决定什么构图“最好”。

## 1.3 核心比较

```text
HumanObservationV02
+
LiveTargetV02
↓
LiveConstraintStateV01
```

输出当前唯一主要问题，例如：

```text
ACQUIRE_SUBJECT
ACQUIRE_REQUIRED_BODY
ADJUST_SCALE
ALIGN_PRIMARY_ANCHOR
ALIGN_SECONDARY_CONSTRAINT
VERIFY
READY_LATCHED
```

## 1.4 Presentation 输出

```text
LiveConstraintState
+
LiveAction
+
Response State
+
Verify State
↓
LivePresentationModelV02
```

Renderer 输出：

```text
Current Subject Outline
Required Body Guide
Current Anchor
Target Zone
Current Scale Guide
Target Scale Guide
Movement Arrow
Primary Text
Secondary Text
Voice
Haptic
Verify Progress
Ready State
```

---

# 2. Presentation 的七个视觉原语

所有正常产品画面只允许由以下七类基础视觉对象组成。

## 2.1 `CURRENT_SUBJECT_OUTLINE`

含义：

> **系统当前稳定观察到的被摄人物范围。**

它只表示 Observation。

它不表示：

- 构图正确；
- 人物已经在目标位置；
- READY；
- Target；
- “拍得好”。

### 显示条件

```text
Subject Lock = LOCKED / HELD
```

### 隐藏条件

```text
ACQUIRING
LOST
```

或 Observation 质量不足。

### 推荐视觉

普通观察状态：

```text
neutral / white outline
```

不要使用最终 READY 绿色语义。

## 2.2 `BODY_COVERAGE_GUIDE`（兼容字段：`REQUIRED_BODY_GUIDE`）

含义：

> **只有当当前视频可见的人体范围不足以计算当前 LiveTarget 所需 measurement 时，才显示“还需要把哪一段身体带进画面”。**

它绝不表示：

> “Live 一开始就要求全身展示。”

### Observation First

系统必须先得到：

```text
ObservedBodyCoverage
```

例如：

```text
HEAD_ONLY
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

该结果完全来自当前视频内容，不依赖 Target。

随后再问：

```text
Does current observation contain enough evidence
for the active LiveTarget measurements?
```

只有答案为 `NO` 时，才显示 `BODY_COVERAGE_GUIDE`。

### 示例 1：Close Portrait

当前看到：

```text
HEAD_SHOULDERS
```

Target 只要求：

```text
HEAD / SHOULDERS / EYE_LINE
```

则：

```text
MEASUREMENT_READY = YES
BODY_COVERAGE_GUIDE = HIDDEN
```

不得要求用户继续展示髋部或全身。

### 示例 2：Upper Body

当前看到：

```text
HEAD_SHOULDERS
```

Target 需要：

```text
HEAD_TO_HIP
TORSO_CENTER
```

当前 Hip basis 不可测，则显示：

```text
人物当前观察框
+
Coverage Guide 到髋部
```

文案：

> `让髋部也进入画面`

### 示例 3：Full Body

只有当当前 Shot Plan 明确需要全身 measurement 时，才允许进一步要求：

> `让膝盖也进入画面`

或：

> `把脚完整带进画面`

### 禁止

不能仅因为某身体区域当前没出现，就自动要求补齐该身体区域。

不能仅因为当前不是全身画面，就要求：

```text
“请退后直到全身出现”
```

只有当前 Target measurement 确实需要更完整范围时，才触发 Coverage Guide。

同样，缺少某身体区域本身也不能自动映射成：

```text
“退后一点”
```

除非同时有足够证据证明：

```text
Target needs that coverage
+
bottom/edge crop or scale evidence supports the cause
+
control actor = SUBJECT
```

## 2.3 `CURRENT_SEMANTIC_ANCHOR`

含义：

> **当前 Controller 实际用于判断位置的人体语义锚点。**

例如：

```text
TORSO_CENTER
HEAD_CENTER
HIP_CENTER
```

正常产品只显示一个轻量点/标记，不显示技术字段名称。

Debug 模式可以显示：

```text
TORSO_CENTER
x=0.52
y=0.48
confidence=0.91
```

## 2.4 `TARGET_ZONE`

含义：

> **当前 Semantic Anchor 的可接受目标区域。**

不是传统全人物矩形。

例如：

```text
target_x = 0.33
x_tolerance = 0.055
```

则显示：

```text
x ∈ [0.275, 0.385]
```

对应一个可接受的纵向 Zone / Band。

示意：

```text
┌───────────────────────────┐
│    ║ TARGET ZONE ║        │
│    ║             ║        │
│    ║             ║   ●    │ ← Current torso anchor
│    ║             ║        │
│             ←             │
│      向左移动一点         │
└───────────────────────────┘
```

### 硬规则

`LEFT_THIRD_TARGET`：Target Zone 必须显示在左侧约 1/3。
`CENTER_TARGET`：Target Zone 显示在中心。
`RIGHT_THIRD_TARGET`：Target Zone 显示在右侧约 2/3。

不得把 Target Guide 永远画在画面中心。

## 2.5 `SCALE_GUIDE`

含义：

> **当前人体语义跨度与 Target 视觉尺度之间的差异。**

不是 Camera 实际米制距离。

例如 Upper Body：

```text
metric = HEAD_TO_HIP
```

显示 Current Span 与 Target Span / Target Range。

产品表达：

```text
人物当前偏大
→ 退后一小步
```

或：

```text
人物当前偏小
→ 靠近一小步
```

前提是 Control Actor 与 Shooting Relation 支持由人物移动完成。

## 2.6 `MOVEMENT_ARROW`

含义：

> **当前唯一一条应执行的物理动作。**

同一时刻最多一个主要箭头。

禁止：

```text
Scale arrow + X arrow + Y arrow 同时出现
```

Priority 跟随 Constraint Resolver：

```text
ACQUIRE
→ SCALE
→ PRIMARY ANCHOR
→ SECONDARY
→ VERIFY
```

### Subject Actor

```text
← 向左移动一点
→ 向右移动一点
退后一小步
靠近一小步
```

### Camera Operator Actor

```text
📱 相机稍微向下
📱 相机向右一点
📱 相机降低一些
```

禁止把 Camera Correction 错误表达成人物移动。

## 2.7 `VERIFY_READY_GUIDE`

含义：

> **所有主要 Target Constraint 已满足，现在只确认稳定性。**

进入 VERIFY 后：

```text
Movement Arrow = NONE
ordinary instruction = NONE
```

显示：

```text
很好，保持一下
稳定确认 420 / 600 ms
```

READY 后：

```text
Movement Arrow = NONE
ordinary guidance = 0
```

显示：

```text
✓ 位置很好
可以拍了
```

---

# 3. 状态 → 视觉 → 文字完整映射

以下映射是正式算法，不允许前端自行重新设计。

## 3.1 `ACQUIRE_SUBJECT`

### 条件

```text
SubjectLock = ACQUIRING / LOST / REACQUIRING
```

### Overlay

```text
CURRENT_SUBJECT_OUTLINE = NONE / acquiring visualization
REQUIRED_BODY_GUIDE = HIDDEN
TARGET_ZONE = HIDDEN
CURRENT_ANCHOR = HIDDEN
SCALE_GUIDE = HIDDEN
MOVEMENT_ARROW = NONE
VERIFY_PROGRESS = NONE
```

### Primary Text

未找到：

> `站到画面里，让我先找到你`

开始检测：

> `正在确认人物`

重新获取：

> `重新找到你之后再继续`

### Voice

只在首次进入该状态时可播一次：

> `先站到画面里`

不得高频重复。

## 3.2 `SUBJECT_LOCKED_TRANSITION`

### 条件

```text
ACQUIRING / REACQUIRING
→ LOCKED
```

### Overlay

显示 `CURRENT_SUBJECT_OUTLINE`，但仍然是 Neutral Observation Style。

### Primary Text

> `已找到你`

显示短暂过渡后自动进入下一 Constraint。

## 3.3 `ENSURE_TARGET_MEASURABILITY`（旧实现枚举可兼容 `ACQUIRE_REQUIRED_BODY`）

### 语义修正

这里不是：

> “要求把完整身体找出来。”

这里真正回答：

> **“基于当前视频实际看到的人体部分，是否已经足够可靠地测量当前 LiveTarget？”**

系统先产生 target-independent：

```text
ObservedBodyCoverage
```

然后根据当前 Target 的 measurement requirements 判断 readiness。

### 条件

例如 Upper Body Target：

```text
HEAD_TO_HIP = INVALID
TORSO_CENTER = INVALID
```

则说明当前 Target 暂时不可测。

但如果是 Close Portrait Target，只需要：

```text
EYE_LINE
HEAD_SIZE
SHOULDER_CENTER
```

即使 `HIPS / KNEES / FEET` 都不可见，也不进入该 Stage。

### Overlay

只有当 Target-specific measurement 缺失时显示：

```text
CURRENT_SUBJECT_OUTLINE
BODY_COVERAGE_GUIDE
```

隐藏与当前尚不可测的 Target 无关的：

```text
TARGET_ZONE
MOVEMENT_ARROW for unavailable measurement
VERIFY_PROGRESS
```

### Primary Text

文案只能针对**当前 Target 真正缺少的 measurement basis**。

例如：

> `让髋部也进入画面`

> `让膝盖也进入画面`

> `把脚完整带进画面`

但这些文案绝不是固定顺序，也不代表系统最终一定要求全身。

### Secondary Text

原因尚未确认：

> `再把这张照片需要的身体范围带进画面`

只有因果证据明确时，才可给动作型文案，例如：

> `稍微退后，让髋部进入画面`

### Hard Rule

```text
OBSERVED_BODY_COVERAGE
!=
TARGET_REQUIRED_COVERAGE
```

前者来自视频现实。
后者来自 Shot Plan。
只有两者比较后，才知道是否需要补更多身体范围。

## 3.4 `ADJUST_SCALE`

### 条件

```text
Measurement Ready = YES
Scale Constraint = OUT_OF_RANGE
```

### Overlay

显示：

```text
CURRENT_SUBJECT_OUTLINE
CURRENT_SCALE_GUIDE
TARGET_SCALE_GUIDE
MOVEMENT_ARROW
```

隐藏 `TARGET_X_ZONE`，因为当前只解决 Scale。

### Current too large

```text
current_span > target_max
```

如果 actor = SUBJECT：

Primary：

> `退后一小步`

Secondary：

> `让人物在画面里小一点`

### Current too small

Primary：

> `靠近一小步`

Secondary：

> `让人物在画面里大一点`

### 禁止

正常用户界面不得显示：

```text
TOO_LARGE
TOO_SMALL
HEAD_TO_HIP=0.58
```

## 3.5 `ALIGN_PRIMARY_ANCHOR`

### 条件

```text
Scale = IN_RANGE
Primary Anchor = OUT_OF_TARGET_ZONE
```

### Overlay

显示：

```text
CURRENT_SUBJECT_OUTLINE
CURRENT_SEMANTIC_ANCHOR
TARGET_ZONE
MOVEMENT_ARROW
```

隐藏 Scale action。

### Current right of target

```text
current_x > target_max
```

如果目标动作是向用户自身左侧：

Primary：

> `向左移动一点`

### Current left of target

Primary：

> `向右移动一点`

## 3.6 `ALIGN_SECONDARY_CONSTRAINT`

### 条件

Primary Scale / Anchor 已满足，但仍有次级约束。

例如：

```text
HEAD_CENTER.y
BODY_ORIENTATION
CAMERA_HEIGHT
```

### Overlay

只显示当前次级约束对应的 Guide。

Camera Actor 示例：

> `相机稍微向下`

Subject Pose 示例：

> `身体再侧一点`

禁止同时显示多条普通动作。

## 3.7 `WAIT_FOR_RESPONSE`

### 条件

一个 `LiveAction` 已 ISSUED，但尚未检测到真实 response。

### Overlay

保持：

```text
同一个 Target
同一个 Current
同一个 Movement Arrow
```

不得产生新的视觉 Action。

### 0–900ms

Primary 保持原 Action。

### >900ms 且无 response

Primary 仍保持原动作语义。

Secondary：

> `还没检测到移动，请按提示调整一小步`

### 硬规则

```text
NO_RESPONSE
→ NO_OUTCOME
→ NO_NEW_CONTROLEPOCH
```

因此禁止：

- 箭头反转；
- Target Zone 改变；
- 新 instruction id；
- 新普通文字动作；
- “很好”；
- “已经到位”。

## 3.8 `RESPONSE_OBSERVED`

### 条件

检测到真实、相关的 Subject / Scale Motion。

### Overlay

保留 Current + Target。Movement Arrow fade / inactive。

### Primary Text

> `很好，请停一下`

### Secondary Text

> `我已经看到你的调整`

可选。

### Voice

> `很好，停一下`

仅播放一次。

## 3.9 `WAIT_FOR_SETTLE`

### Overlay

```text
CURRENT
+
TARGET
```

Arrow 不再作为 active imperative。

### Primary Text

> `很好，请停一下`

### Secondary Text

> `正在确认这次调整`

## 3.10 `ACTION_EVALUATED_IMPROVED`

必须先有真实 Response、Settle、Reobserve。

正常用户不显示内部 `IMPROVED`。

如果同一类 Constraint 仍未完成，可在新合法 ControlEpoch 中：

> `很好，再一点点`

## 3.11 `ACTION_EVALUATED_NO_EFFECT`

必须满足：

```text
response_observed = true
settled = true
measurement comparable = true
```

正常用户不显示 `NO_EFFECT`。

禁止在 `response_observed=false` 时进入此状态。

## 3.12 `WRONG_DIRECTION`

只有真实 Response Evidence 且误差明确朝错误方向变化才允许。

Primary：

> `方向反了，往另一边一点`

Measurement Drift 不得触发。

## 3.13 `VERIFY`

### 条件

所有当前 Target Constraint = PASS。

### Overlay

隐藏 `MOVEMENT_ARROW`，显示稳定确认进度。

### Primary Text

> `很好，保持一下`

### Secondary Text

> `稳定确认 n / 600 ms`

### Progress Algorithm

```text
GOOD + stable sample
→ accumulate

short instability
→ pause

continuous instability >1000ms
→ reset

final sample must be GOOD + stable
```

## 3.14 `READY_LATCHED`

### Overlay

显示最终成功状态，隐藏所有普通动作 Guide。

### Primary Text

> `位置很好，可以拍了`

### Haptic

允许一个明确但轻量的成功反馈。

### 硬规则

```text
POST_READY_ORDINARY = 0
```

READY 表示当前 Selected LiveTarget 已满足，不是“找到人”。

---

# 4. 线框颜色与状态语义

不得只依靠颜色传达状态，但颜色语义必须统一。

建议：

```text
NEUTRAL / WHITE
= 系统稳定观察到人物

ATTENTION / YELLOW
= 当前有一项需要调整

VERIFY
= 接近完成 / 保持

READY / GREEN
= Target 已满足，可以拍摄
```

禁止：

```text
绿色人物框 = merely person detected
```

否则会与 READY 冲突。

---

# 5. Current Subject Outline 与 Target Guide 的区别

## Current Subject Outline

回答：

> `我现在看到你在哪里`

## Target Zone / Target Span

回答：

> `这个 Shot Plan 希望你最终在哪里 / 多大`

两个对象不能合并成一个矩形。

---

# 6. 为什么不使用传统“目标人物矩形”

当前 Target 不是一个 bounding rectangle，而是：

```text
required body
+
semantic span
+
semantic anchor
+
target zone
+
secondary constraints
```

一个传统 Target Rectangle 无法准确表示这些语义。

因此禁止把一个矩形同时当作：

- 人物范围 Target；
- Scale Target；
- X Target；
- Body Coverage Target。

必须分别使用语义 Guide。

---

# 7. Target-relative X Visual Algorithm

内部 canonical：

```text
sensor normalized non-mirrored
```

算法：

```text
target_min = target_x - tolerance
target_max = target_x + tolerance

if current_x < target_min:
    relation = LEFT_OF_TARGET
elif current_x > target_max:
    relation = RIGHT_OF_TARGET
else:
    relation = IN_TARGET
```

Renderer：

```text
Target Zone = projected [target_min, target_max]
Current Anchor = projected current_x
Arrow = mapped physical instruction
```

---

# 8. Mirror Rule

前摄：

```text
Sensor X != Screen X
```

必须分开：

```text
Business Coordinate
↓
Presentation Projection
```

与：

```text
Business Delta
↓
Physical Direction Mapper
```

禁止 Screen mirrored x 再次参与 Controller target comparison，避免 double mirror。

---

# 8.5 Landmark Group Reduction Strategy — 05A Canonical Reference

Visual Guidance does not invent Semantic Anchors. It renders anchors produced by the accepted Measurement layer.

The canonical upstream reduction rules are:

```text
HEAD_CORE
= MULTI-LANDMARK GROUP
→ centroid(valid bounded HEAD_CORE landmarks)

SHOULDERS
= BILATERAL TWO-POINT GROUP
→ pair_center(left_shoulder, right_shoulder)

HIPS
= BILATERAL TWO-POINT GROUP
→ pair_center(left_hip, right_hip)

KNEES
= BILATERAL TWO-POINT GROUP
→ pair_center(left_knee, right_knee)

ANKLES
= BILATERAL TWO-POINT GROUP
→ pair_center(left_ankle, right_ankle)
```

Hard prohibition:

```text
HEAD_CORE.pair_center
```

The Renderer must not compensate for a missing/invalid upstream anchor by inventing a screen-space center.

If an upstream anchor is:

```text
MARGINAL
INVALID
UNKNOWN
```

Presentation must follow the bounded Measurement/Constraint state. It must not fabricate a valid Target-relative Current Anchor merely to keep an overlay visible.

The authoritative detailed measurement rules are in:

```text
17_LIVE_V4_BODY_VISIBILITY_AND_MEASUREMENT_READINESS_V2.md
```

---

# 9. Scale Visual Algorithm

例如：

```text
metric = HEAD_TO_HIP
current = 0.58
target = 0.42 ± 0.07

target_min = 0.35
target_max = 0.49
```

则：

```text
current > target_max
→ SUBJECT_VISUAL_SCALE_TOO_LARGE
```

Presentation：

```text
Current Span
+
Target Span Range
+
Single Action
```

不要显示米数。

不要说：

> `你离 Camera 太近`

更准确的用户文案：

> `退后一小步`

Secondary：

> `让人物在画面里小一点`

---

# 10. Observed Body Coverage / Measurement Readiness 视觉算法

## 10.1 第一步：先从视频推断当前人体可见范围

Live 必须先对当前画面产生一个 target-independent observation：

```text
ObservedBodyCoverageV01
```

建议派生状态：

```text
HEAD_ONLY
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

这一步的含义是：

> **当前视频实际给了我人物的哪一段。**

不是：

> “这张照片应该拍哪一段。”

### 建议派生依据

```text
HEAD_ONLY
= head basis reliable; shoulder/torso basis insufficient

HEAD_SHOULDERS
= head + shoulders reliable; hip basis unavailable

UPPER_BODY
= head/shoulder/hip basis sufficient; HEAD_TO_HIP measurable

THREE_QUARTER
= above + knee basis sufficient; HEAD_TO_KNEE measurable

FULL_BODY
= above + ankle/foot/full-span basis sufficient according to active observation contract

PARTIAL_OR_AMBIGUOUS
= evidence does not cleanly support one profile
```

这些是 Observation Summary，不是 Controller Action Authority。

## 10.2 第二步：计算当前能测什么

继续产生：

```text
MeasurementCapability
```

例如：

```text
HEAD_SIZE = GOOD
EYE_LINE = GOOD
TORSO_CENTER = GOOD
HEAD_TO_HIP = GOOD
HEAD_TO_KNEE = INVALID
HEAD_TO_ANKLE = INVALID
```

## 10.3 第三步：与当前 Target requirements 比较

Controller 回答：

```text
Can the active Target be measured from the current observation?
```

不是：

```text
Is the full body visible?
```

例如 Close Portrait：

```text
Target requirements:
HEAD_SIZE
EYE_LINE
SHOULDER_CENTER
```

当前 `HEAD_SHOULDERS` 已足够：

```text
TARGET_MEASUREMENT_READY = YES
```

无需出现髋、膝、脚。

例如 Upper Body：

```text
Target requirements:
HEAD_TO_HIP
TORSO_CENTER
```

如果 head/shoulder/hip basis GOOD：

```text
TARGET_MEASUREMENT_READY = YES
```

即使不存在一个独立 `UPPER_TORSO landmark`。

例如 Full Body：

只有当前 Target 明确要求 Full Body，且所需下肢 measurement 不可得时，才：

```text
TARGET_MEASUREMENT_READY = NO
```

并显示对应 `BODY_COVERAGE_GUIDE`。

## 10.4 用户视觉原则

正常 UI 不必持续显示：

```text
“当前是 HEAD_SHOULDERS / UPPER_BODY / FULL_BODY”
```

但内部必须明确识别并记录该结果。

只有它与当前 Target 不匹配、导致 measurement 不足时，才把差异转成用户可执行 Guidance。

## 10.5 Hard Invariants

```text
DEFAULT_FULL_BODY_REQUIREMENT = 0

OBSERVED_COVERAGE_INFERENCE = REQUIRED

TARGET_SPECIFIC_MEASUREMENT_GATE = REQUIRED

HEAD_SHOULDERS_TARGET_DOES_NOT_REQUIRE_HIPS = TRUE

UPPER_BODY_TARGET_DOES_NOT_REQUIRE_KNEES_OR_FEET = TRUE

FULL_BODY_LOWER_BODY_REQUIREMENT_ONLY_WHEN_TARGET_REQUIRES_IT = TRUE
```

---

# 11. 一次只显示一件事

Constraint Priority：

```text
1 ACQUIRE_SUBJECT
2 ACQUIRE_REQUIRED_BODY
3 ADJUST_SCALE
4 ALIGN_PRIMARY_ANCHOR
5 ALIGN_SECONDARY_CONSTRAINT
6 VERIFY
7 READY
```

Presentation 必须与该 Priority 一一对应。

例如：

```text
Scale OUT
X OUT
```

只显示：

```text
Scale Guide
+
Scale Action
```

Scale 解决以后才显示 X。

---

# 12. LivePresentationModelV02 建议结构

```json
{
  "stage": "ALIGN_PRIMARY_ANCHOR",
  "subject_outline": {
    "visible": true,
    "status": "NEUTRAL"
  },
  "required_body_guide": null,
  "current_anchor": {
    "visible": true,
    "kind": "TORSO_CENTER",
    "x": 0.52,
    "y": 0.48
  },
  "target_anchor": {
    "kind": "TORSO_CENTER",
    "x": 0.33,
    "y": null
  },
  "target_zone": {
    "visible": true,
    "axis": "X",
    "min": 0.275,
    "max": 0.385
  },
  "current_scale_guide": null,
  "target_scale_guide": null,
  "movement_arrow": {
    "visible": true,
    "actor": "SUBJECT",
    "action": "MOVE_RIGHT_SMALL"
  },
  "verification_progress": null,
  "primary_text": "向你自己的右侧移动一点",
  "secondary_text": null,
  "voice_text": "向你自己的右侧移动一点",
  "haptic_event": null,
  "presentation_version": "0.2"
}
```

字段可以根据已有 Contract 适配，但语义不能改变。

---

# 13. Renderer 职责

Renderer 只负责：

```text
draw subject outline
draw required body guide
draw semantic anchor
draw target zone/span
draw movement arrow
draw verify progress
render primary/secondary text
play bounded voice
trigger bounded haptic
```

Renderer 不负责：

```text
decide stage
decide action
decide target
decide ready
decide too-left/right
decide too-large/small
```

---

# 14. Normal UI vs Debug UI

## Normal UI

只显示用户需要理解的：

- 人物观察框；
- Required Body Guide；
- Current Anchor；
- Target Zone；
- Scale Guide；
- 一条动作箭头；
- 一句 Primary Instruction；
- 极少 Secondary Text；
- Verify / Ready。

## Debug UI

可额外显示：

```text
stage
subject lock
body visibility
measurement readiness
anchor type
current x/y
target x/y
scale metric
current scale
target scale
control actor
response observed
settle state
episode id
```

正常用户不能看到内部 enum。

---

# 15. Voice Algorithm

Voice 不能每帧播。

建议只在：

```text
new ordinary Action issued
Subject reacquired after meaningful loss
response observed
READY
```

等有意义状态转换时触发。

禁止：

```text
WAIT_FOR_RESPONSE 每 900ms 重复播同一句
```

Voice 与 Primary Text 必须由同一个 Presentation Model 产生。

---

# 16. Haptic Algorithm

建议仅用于：

```text
response accepted（可选轻反馈）
READY（明确成功反馈）
```

不用于每个 Measurement 更新。

---

# 17. 完整示例：Left Third × Upper Body

目标：

```text
required measurement:
HEAD_TO_HIP
TORSO_CENTER

scale:
target range

primary anchor:
TORSO_CENTER.x = 0.33 ± tolerance
```

## A. 刚进入

```text
Subject = ACQUIRING
```

画面：无 Target Zone、无 Arrow。

文字：

> `站到画面里，让我先找到你`

## B. 找到人，但 Hip 不可测

```text
Subject = LOCKED
HEAD_TO_HIP = INVALID
```

画面：Current Subject Outline + Required Body Guide 到髋部。

文字：

> `让髋部也进入画面`

## C. Hip 可测，但人物太大

```text
HEAD_TO_HIP current > target_max
```

画面：Current Span + Target Span。

文字：

> `退后一小步`

## D. 用户后退

```text
response_observed = true
```

画面：Target/Current 保留，箭头 inactive。

文字：

> `很好，请停一下`

## E. Scale 到位，但人物在 Target 右边

```text
scale = PASS
current torso x = 0.52
target = 0.33
```

画面：Left-third Target Zone + Current Torso Anchor + Arrow toward Target。

文字：

> `向你自己的右侧移动一点`

## F. 用户向自己的右侧移动

检测 Response。

文字：

> `很好，请停一下`

## G. 所有 Constraint 满足

进入 VERIFY。

画面：No movement arrow + Verification progress。

文字：

> `很好，保持一下`

Secondary：

> `稳定确认 420 / 600 ms`

## H. READY

画面：Ready outline / success mark；无普通箭头。

文字：

> `位置很好，可以拍了`

---

# 18. Browser Presentation Acceptance Matrix

| Case | Expected Visual |
|---|---|
| No subject | Find-person copy; no Target |
| Subject locked, hips missing | Required Body Guide; no X guide |
| Measurement ready, scale too large | Scale Guide only |
| Left target, current right | Left Target Zone + Current Anchor + one arrow |
| Right target, current left | Right Target Zone + Current Anchor + one arrow |
| Center target | Center Target Zone |
| Response observed | Imperative stops; settle copy |
| No response | Same Action/Target; reminder only |
| Passive drift | No fake success |
| VERIFY | No ordinary arrow; progress visible |
| READY | Success visual; ordinary action count 0 |
| Front mirror | visual projection correct; physical direction correct |
| Rear camera | no mirror projection error |

---

## 18.1 Body Coverage 推断专门验收

| Current video observation | Active Target | Expected behavior |
|---|---|---|
| Head + shoulders only | Close Portrait | 不要求 hips/legs；直接进入对应 Scale/Anchor 判断 |
| Head + shoulders only | Upper Body | 识别当前为 HEAD_SHOULDERS；只有 Target measurement 缺 hip basis 时提示补髋部 |
| Upper Body measurable | Upper Body | 不要求 knees/feet；直接进入 Scale/Anchor |
| Upper Body measurable | Full Body | Coverage Guide 只针对 Full Body Target 缺失的下肢范围 |
| Full Body visible | Close Portrait | 不因“多看到身体”而失败；由 Scale Target 决定是否需要靠近 |
| Full Body visible | Upper Body | Measurement 已充分；由 Scale Target 决定视觉尺度，不要求保持全身 |

---

# 19. Hard Acceptance

实现必须返回：

```text
LIVE_PRESENTATION_MODEL_V02 = PASS
CURRENT_SUBJECT_OUTLINE = PASS
REQUIRED_BODY_GUIDE = PASS
TARGET_ZONE = PASS
SEMANTIC_ANCHOR_GUIDE = PASS
SCALE_GUIDE = PASS
MOVEMENT_ARROW = PASS
CONTROL_ACTOR_PRESENTATION = PASS / PASS_WITH_WARNING
PRIMARY_TEXT_SINGLE_SOURCE = PASS
OVERLAY_SINGLE_SOURCE = PASS
VOICE_SINGLE_SOURCE = PASS
WAIT_RESPONSE_PRESENTATION = PASS
WAIT_SETTLE_PRESENTATION = PASS
VERIFY_PRESENTATION = PASS
READY_PRESENTATION = PASS
INTERNAL_ENUM_VISIBLE = 0
INSTRUCTION_CONTRADICTION = 0
NO_RESPONSE_OUTCOME = 0
NO_RESPONSE_REISSUE = 0
POST_READY_ORDINARY = 0
MIRROR_COORDINATE_MAPPING = PASS
```

---

# 20. Codex 实现边界

Codex 后续实现时：

## 允许

- 根据现有目录结构找到最合理的落点；
- 复用现有 renderer / overlay / presentation state；
- 为符合本规范而新增 Contract / type；
- 增加测试；
- 改善工程结构。

## 不允许自行决定

- 重新定义每个线框的语义；
- 新增另一套 Target rectangle；
- 把人检测框当 READY 框；
- 自行改变动作优先级；
- 把所有 Target 重新居中；
- 根据 UI 坐标反向改变 business Target；
- 同时显示多个普通动作；
- 自行设计新的用户文案语义；
- 把 Internal Enum 暴露给用户；
- 为“看起来更直观”突破 Observation / Target / Control 分层。

---

# 20.1 Codex 必须按 V02 处理 Body Coverage，不得自行恢复“先找全身”逻辑

后续实现明确禁止：

```text
Subject Locked
→ force full body acquisition
```

正确实现：

```text
Subject Locked
→ infer current observed body coverage
→ determine available semantic measurements
→ compare with active LiveTarget requirements
→ only request additional body coverage if this Target cannot yet be measured
```

如果当前 Target 是头肩/近景，系统必须允许只依赖当前所需头肩 measurement 完成控制。

如果当前 Target 是上半身，系统不得要求膝盖/脚进入画面。

只有 Full Body Shot Plan 才允许把对应下肢 coverage 变成硬 measurement prerequisite。

---

# 21. 一句话实现原则

> **Live 的视觉指导必须同时告诉用户三件事：我看到你现在在哪里、这张照片要求你到哪里、你现在只需要做哪一个动作。**

完整闭环：

```text
OBSERVE CURRENT
↓
DRAW CURRENT
↓
COMPARE TARGET
↓
DRAW TARGET
↓
CHOOSE ONE ACTION
↓
DRAW ARROW + SAY ONE SENTENCE
↓
WAIT FOR REAL HUMAN RESPONSE
↓
ACKNOWLEDGE RESPONSE
↓
WAIT FOR SETTLE
↓
REOBSERVE
↓
VERIFY
↓
READY
```

这就是 Live V4 正式的视觉线框与指示算法。

---

# 22. 05E recognition-first presentation contract

`LivePresentationModelV02` consumes recognition, observed-body, target-gap, action and verification states. Normal acquisition copy recognizes the person and visible body evidence before describing the missing target evidence. Internal measurement or reduction names remain debug-only.

---

# 23. 05F X direction and display contract

Horizontal presentation consumes one `SubjectPhysicalDirectionDecisionV01`:

```text
desired_sensor_delta_sign
physical_action
display_axis_sign
```

`LiveAction`, primary text, overlay text and bounded voice text are derived from `physical_action`. The arrow is derived from the same desired sensor movement after exactly one preview-mirror projection. No UI component may invert the physical action independently.

For front camera + mirrored preview + subject facing camera:

```text
desired SENSOR_X NEGATIVE
-> physical SUBJECT_RIGHT
-> mirrored DISPLAY_X POSITIVE
-> rightward screen arrow
-> “向你自己的右侧移动一小步”
```

For a non-mirrored diagnostic preview, the same physical action remains `SUBJECT_RIGHT`, while the screen arrow becomes negative because the unmirrored image moves left. This is not a second physical inversion.

If the mapper returns `UNSUPPORTED`, normal presentation issues no horizontal movement. Scale presentation is unchanged.
