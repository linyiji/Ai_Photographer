# Live V4 Framing Profile & Dynamic READY Algorithm V01

Status: OWNER_ALGORITHM_AUTHORITY

## 1. 正式 Framing Profile

### HEAD

用户理解：特写。

最低范围：

```text
HEAD
```

Anchor 候选：

```text
HEAD_CENTER
EYE_LINE
```

不要求肩、髋、膝、脚。

### HEAD_SHOULDERS

用户理解：头肩。

要求：

```text
HEAD
LEFT_SHOULDER
RIGHT_SHOULDER
```

默认 X Anchor：

```text
SHOULDER_CENTER
```

候选 Scale：

```text
HEAD_SIZE
SHOULDER_WIDTH
HEAD_SHOULDER_SCALE
```

硬规则：

```text
HIPS_REQUIRED = NO
```

### UPPER_BODY

用户理解：真正的半身，头到髋。

要求：

```text
HEAD
SHOULDERS
HIPS
```

当前接受 Measurement：

```text
HEAD_TO_HIP
TORSO_CENTER
```

因此双髋可以成为必要 Measurement basis。

### THREE_QUARTER

用户理解：大半身 / 膝上。

要求：

```text
HEAD
SHOULDERS
HIPS
KNEES
```

Scale 候选：

```text
HEAD_TO_KNEE
```

脚踝/脚不是默认必要条件。

### FULL_BODY

用户理解：全身。

要求：

```text
HEAD
SHOULDERS
HIPS
KNEES
ANKLES / FEET
```

Scale 候选：

```text
HEAD_TO_ANKLE
HEAD_TO_FEET
```

只有这一档默认要求完整下肢链条。

---

## 2. Observation 和 Target 分开

Camera 先产生：

```text
ObservedBodyState
```

它只回答：

```text
当前看到了 HEAD / HEAD_SHOULDERS / UPPER_BODY /
THREE_QUARTER / FULL_BODY 中的哪一种？
```

它不能因为当前 Target 是 FULL_BODY 就把当前 Observation 改成“缺失”。

同一个 Observation：

```text
HEAD + SHOULDERS 可见，HIPS 不可见
```

对于：

```text
HEAD_SHOULDERS Target
→ 可继续

UPPER_BODY Target
→ 不足，需要髋部

FULL_BODY Target
→ 不足，需要更多下肢
```

---

## 3. TargetFramingProfileV01

建议语义：

```text
profile_id
extent
coverage_expectation
required_regions
optional_regions
required_anchors
required_measurements
scale_metric
preferred_primary_anchor
secondary_constraints
```

不要再让一个 `required_body_parts` 承担全部含义。

---

## 4. Calibration Requirement 独立

X 标定不是摄影 Target。

X-only Calibration 最低条件：

```text
Subject LOCKED
HEAD valid
SHOULDERS bilateral valid
SHOULDER_CENTER valid
fresh
stable
```

明确不要求：

```text
HIPS
HEAD_TO_HIP
TORSO_CENTER
Scale Target
完整 TargetObservationGap.ready
```

---

## 5. TargetObservationGap

只在 Target 与 Observation 之间计算：

```text
ready
satisfied_requirements
missing_requirements
blocking_reasons
actionability
```

Blocking reason 至少区分：

```text
TEMPORARILY_UNSTABLE
REGION_NOT_OBSERVED
REGION_EDGE_CROPPED
LOW_CONFIDENCE
INSUFFICIENT_BILATERAL_EVIDENCE
LANDMARK_REDUCTION_INVALID
STALE_EVIDENCE
SYSTEM_MEASUREMENT_DEFECT
UNKNOWN
```

`LOW_CONFIDENCE` 不等于“永远等待稳定”。

---

## 6. 动态 READY

必须拆成两个状态。

### trial_success_latched

含义：

```text
这次 Trial 历史上曾经达到成功状态
```

用于 Evidence / Metrics。

一旦 true 可以保持 true。

### current_framing_ready

含义：

```text
当前这一刻是否仍满足当前 Target
```

必须持续重算，允许撤销。

输入：

```text
SubjectRecognitionState
ObservedBodyState
TargetRequirement
TargetObservationGap
Scale
Primary Anchor
Secondary constraints
fresh
stable
```

---

## 7. READY 进入

```text
所有当前约束满足
+
当前 measurement 有效
+
stable / GOOD 持续满足 Verify
→ current_framing_ready = true
```

现有 600ms VERIFY 可以暂时保留，除非独立 Device Evidence 证明需要修改。

---

## 8. READY 退出

以下任一情况持续达到 exit condition：

```text
人物丢失
Target Gap 失效
required measurement 无效/过期
Scale 离开退出范围
Anchor 离开退出范围
明显人物移动
必要 secondary constraint 失效
```

则：

```text
current_framing_ready = false
```

但：

```text
trial_success_latched
```

仍可保持 true。

---

## 9. READY Hysteresis

架构上必须区分：

```text
READY_ENTER_RULE
READY_EXIT_RULE
```

避免边缘抖动：

```text
READY ↔ NOT READY
```

具体 Exit tolerance / 时间不在本文件强行锁数值，需真机 Gate。

---

## 10. 位置测试

验收位置定义三种测试 Zone：

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

它们是算法测试目标，不是摄影审美模板。

每种 Profile 可选择适合的 Semantic Anchor：

```text
HEAD → HEAD_CENTER
HEAD_SHOULDERS → SHOULDER_CENTER
UPPER_BODY → TORSO_CENTER
THREE_QUARTER → HIP_CENTER / 已接受 Anchor
FULL_BODY → BODY_CENTER / TORSO_CENTER / 已接受 Anchor
```

Target 位置用 Zone，不用一个精确像素点。

---

## 11. Position Control

对当前 Anchor 分别计算：

```text
X:
LEFT_OF_ZONE
IN_X_RANGE
RIGHT_OF_ZONE

Y:
ABOVE_ZONE
IN_Y_RANGE
BELOW_ZONE
```

控制仍坚持：

```text
一次一个动作
```

建议顺序：

```text
ENSURE_TARGET_MEASURABILITY
→ ADJUST_SCALE
→ ALIGN_X
→ ALIGN_Y
→ SECONDARY
→ VERIFY
→ CURRENT_READY
```

如果当前 Y 不具备可靠的人物动作映射：

```text
只做 Y classification
或交给 CAMERA_OPERATOR
```

不能伪造人物动作。

---

## 12. 05G 完整前置能力

在加入详细手势之前，Live 至少应证明：

```text
5 种人物范围可区分
不同 Profile 的 Requirement 不串线
HEAD_SHOULDERS 不要求 HIPS
同一 Observation 在不同 Target 下产生不同 Gap
LEFT_TOP / CENTER / RIGHT_BOTTOM 能正确判断
对应 Anchor 的位置指引正确
current READY 可以进入也可以撤销
trial_success_latched 保留历史成功
```


