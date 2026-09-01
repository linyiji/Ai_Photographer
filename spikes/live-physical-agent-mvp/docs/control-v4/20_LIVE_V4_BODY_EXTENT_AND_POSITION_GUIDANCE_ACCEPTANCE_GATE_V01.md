# Live V4 Body Extent & Position Guidance Acceptance Gate V01

Status: SUPERSEDED_05G_BASELINE

Superseded for 05H device acceptance by
`20_LIVE_V4_BODY_EXTENT_AND_POSITION_GUIDANCE_ACCEPTANCE_GATE_V02_05H.md`.

## 1. 目标

这个 Gate 专门验证两件事：

```text
A. Live 能否判断当前视频实际拍到了人物哪一段
B. Live 能否针对该 Profile 的 Semantic Anchor 做位置判断和指导
```

它不是 AI Director Gate，也不是手势 Gate。

---

## 2. Gate 顺序

```text
A BODY EXTENT CLASSIFICATION
↓
B PROFILE-SPECIFIC READINESS
↓
C ANCHOR POSITION CLASSIFICATION
↓
D POSITION GUIDANCE
↓
E DYNAMIC READY ENTER / EXIT
↓
F DEVICE ACCEPTANCE
```

---

## 3. Gate A — 人物范围识别

必须独立识别：

```text
HEAD
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

### HEAD

头部有效，肩可缺失。

Expected:

```text
observed_extent = HEAD
```

### HEAD_SHOULDERS

头 + 双肩有效，髋部可完全缺失。

Expected:

```text
observed_extent = HEAD_SHOULDERS
```

Hard:

```text
HIPS_MISSING_DOES_NOT_INVALIDATE_HEAD_SHOULDERS = PASS
```

### UPPER_BODY

头 + 双肩 + 双髋构成有效上半身 basis。

Expected:

```text
observed_extent = UPPER_BODY
```

### THREE_QUARTER

头 + 双肩 + 髋 + 膝。

脚踝可以缺失。

Expected:

```text
observed_extent = THREE_QUARTER
```

### FULL_BODY

头、肩、髋、膝、脚踝/脚形成完整链。

Expected:

```text
observed_extent = FULL_BODY
```

---

## 4. Observation 必须 Target-independent

同一 Pose Observation 分别输入：

```text
HEAD_SHOULDERS Target
UPPER_BODY Target
FULL_BODY Target
```

`ObservedBodyState` 必须一致。

Hard:

```text
TARGET_INFLUENCES_BODY_EXTENT_CLASSIFICATION = 0
```

---

## 5. Gate B — Profile-specific readiness

Observation：

```text
HEAD + SHOULDERS valid
HIPS absent
```

Expected：

```text
HEAD_SHOULDERS → READY_FOR_MEASUREMENT
UPPER_BODY → NOT_READY
FULL_BODY → NOT_READY
```

Observation：

```text
HEAD + SHOULDERS + HIPS valid
KNEES absent
```

Expected：

```text
HEAD_SHOULDERS → READY
UPPER_BODY → READY
THREE_QUARTER → NOT_READY
FULL_BODY → NOT_READY
```

Observation：

```text
HEAD + SHOULDERS + HIPS + KNEES valid
ANKLES absent
```

Expected：

```text
UPPER_BODY → READY
THREE_QUARTER → READY
FULL_BODY → NOT_READY
```

---

## 6. Gate C — 位置 Zone

专门测试三个位置：

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

它们只是算法验收 Zone，不代表 AI Director 以后只能输出三个构图。

---

## 7. Profile 默认测试 Anchor

自动化 Fixture 默认：

```text
HEAD → HEAD_CENTER
HEAD_SHOULDERS → SHOULDER_CENTER
UPPER_BODY → TORSO_CENTER
THREE_QUARTER → HIP_CENTER 或当前已接受 Anchor
FULL_BODY → BODY_CENTER 或当前已接受 Anchor
```

不得为通过测试临时发明不存在的 Anchor。

---

## 8. 完整自动化矩阵

最低：

```text
5 个 Profile
×
3 个 Position Zone
=
15 个场景
```

每个场景验证：

```text
Observed extent
Profile readiness
Active anchor
Target Zone
X relation
Y relation
Single active action
Presentation consistency
```

最低结果：

```text
AUTOMATED_BODY_POSITION_MATRIX = 15/15 PASS
```

---

## 9. X / Y 关系分开

X：

```text
LEFT_OF_ZONE
IN_X_RANGE
RIGHT_OF_ZONE
```

Y：

```text
ABOVE_ZONE
IN_Y_RANGE
BELOW_ZONE
```

不能合并成一个模糊的“位置不对”。

---

## 10. Guidance Priority

当前测试优先级：

```text
Measurement readiness
→ Scale
→ X
→ Y
→ VERIFY
```

一次只允许一个普通动作。

如果 Y 暂时不能可靠映射成 Subject Action：

```text
Y_CLASSIFICATION = PASS
Y_ACTION = DEFERRED / CAMERA_OPERATOR_REQUIRED
```

不能为了通过 Gate 伪造“人物向上移动”。

---

## 11. LEFT_TOP

Target Zone：

```text
左侧 + 上侧
```

当 Current Anchor 在中心/右下：

系统必须能分别判断 X/Y gap。

Presentation 中 Target Zone 也必须出现在正确的 Display 投影位置。

---

## 12. CENTER

只因为测试 Target 明确是 CENTER 才居中。

这不能恢复：

```text
GLOBAL CENTER AUTHORITY
```

---

## 13. RIGHT_BOTTOM

同理验证：

```text
right-of-frame target
+
lower target
```

---

## 14. Mirror Gate

前摄镜像下仍需分离：

```text
SENSOR_X/Y
DISPLAY_X/Y
SUBJECT_LOCAL_PHYSICAL_DIRECTION
```

测试：

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

Hard：

```text
DOUBLE_MIRROR_INVERSION = 0
```

---

## 15. Gate E — Dynamic READY

至少一个 Profile：

```text
满足所有 Constraint
→ VERIFY
→ current_framing_ready = true
```

随后故意离开 Target：

```text
current_framing_ready
→ false
```

同时：

```text
trial_success_latched
→ true
```

这是强制验收。

---

## 16. READY revoke 场景

自动化至少覆盖：

```text
Subject lost
Target measurement invalid
Scale leaves exit range
Anchor leaves exit zone
Measurement stale
Meaningful motion
```

都不得继续把 UI 维持为 CURRENT READY。

---

## 17. 真机测试不做 15 次

### Device A — 一次连续人物范围 Sweep

不切换 Target，只做 Observation。

用户逐渐改变拍摄范围：

```text
HEAD
→ HEAD_SHOULDERS
→ UPPER_BODY
→ THREE_QUARTER
→ FULL_BODY
```

确认算法确实能识别不同范围。

这是最重要的“人体部位识别专门测试”。

### Device B — 三个位置指导

建议三个代表性场景：

```text
HEAD_SHOULDERS → LEFT_TOP
UPPER_BODY → CENTER
THREE_QUARTER → RIGHT_BOTTOM
```

先不强制 FULL_BODY 真机，因为早期人工成本高；FULL_BODY 必须自动化通过，后续单独补真机。

每个场景证明：

```text
当前 Profile readiness 正确
Anchor 可测
Target Zone 正确
只发一条指导
用户按提示执行后 Target error 下降
```

### Device C — READY 撤销

选择一个最稳定 Profile：

```text
进入 current_framing_ready
```

然后用户明显离开 Target。

要求：

```text
current_framing_ready = false
trial_success_latched = true
```

---

## 18. Device Hard Outputs

```text
BODY_EXTENT_DEVICE_SWEEP
HEAD_CLASSIFICATION
HEAD_SHOULDERS_CLASSIFICATION
UPPER_BODY_CLASSIFICATION
THREE_QUARTER_CLASSIFICATION
FULL_BODY_CLASSIFICATION

HEAD_SHOULDERS_WITHOUT_HIPS

POSITION_LEFT_TOP
POSITION_CENTER
POSITION_RIGHT_BOTTOM

ANCHOR_POSITION_RELATION
ONE_ACTION_ONLY
TARGET_ERROR_REDUCTION

CURRENT_READY_ENTER
CURRENT_READY_REVOKE
TRIAL_SUCCESS_PRESERVED
```

---

## 19. Scalar Evidence

Trace 至少记录：

```text
observed_extent
active_framing_profile
required_measurements
active_anchor
current_anchor_x/y
target_zone
x_relation
y_relation
current_scale
current_framing_ready
trial_success_latched
active_action
response_observed
target_error_before
target_error_after
```

不要求保存 Raw Video。

---

## 20. STOP Rule

如果：

```text
人物范围分类错
```

停止后续位置 Gate。

如果：

```text
Coordinate / Mirror 映射错
```

停止 READY Gate。

如果：

```text
current READY 不撤销
```

直接 FAIL。

---

## 21. 最终判断

Live 的 framing foundation 只有在以下全部成立后才算完整：

```text
5 种范围可识别
不同 Target 不错误要求额外部位
不同 Profile 使用对应 Measurement
LEFT_TOP / CENTER / RIGHT_BOTTOM 可判断
对应人体 Anchor 可指导
一次只给一个动作
READY 是当前状态而非永久历史状态
```

