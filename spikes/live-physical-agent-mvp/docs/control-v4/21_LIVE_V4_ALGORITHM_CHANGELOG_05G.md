# Live V4 Algorithm Change Log — 05G

Date: 2026-09-01

## A. 人物范围正式拆分

旧问题：

```text
头肩、半身、全身以及 X 标定可能错误复用 CENTER_UPPER_BODY
```

新 Authority：

```text
HEAD
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
```

## B. HEAD_SHOULDERS 与 UPPER_BODY 分开

```text
HEAD_SHOULDERS
→ 头 + 双肩
→ HIPS_REQUIRED = NO

UPPER_BODY
→ 头到髋半身
→ HIPS 可作为必要 Measurement basis
```

## C. Target Requirement 细分

不再只依赖一个 `required_body_parts`。

正式区分：

```text
TargetFramingProfile
CoverageExpectation
RequiredRegions
RequiredAnchors
RequiredMeasurements
ScaleMetric
PreferredPrimaryAnchor
```

## D. X Calibration 解耦

旧：

```text
X Calibration
→ target_gap.ready
→ 被 HIPS / HEAD_TO_HIP / Scale 阻塞
```

新：

```text
X Calibration
→ HEAD + bilateral SHOULDERS + SHOULDER_CENTER
```

不要求 HIPS，不要求 Scale。

## E. READY 拆分

旧：

```text
READY_LATCHED
=
历史曾成功 + 当前仍成功
```

新：

```text
trial_success_latched
= 历史 Evidence

current_framing_ready
= 当前可拍状态
```

## F. READY 可撤销

当前 Measurement / Target Gap / X / Scale / Subject Lock 持续失效时：

```text
current_framing_ready = false
```

但：

```text
trial_success_latched = true
```

可继续保留。

## G. 低置信度语义修正

旧问题：

```text
LOW_CONFIDENCE
→ 长时间“等待测量稳定”
```

新：

```text
TEMPORARILY_UNSTABLE
REGION_NOT_OBSERVED
REGION_EDGE_CROPPED
SYSTEM_MEASUREMENT_DEFECT
```

在 Gap 层区分。

## H. 新专门人体范围 Gate

必须测试：

```text
HEAD
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
```

且 Observation 不受 Target 影响。

## I. 新位置指导 Gate

自动化最低：

```text
5 Profiles × 3 Zones = 15 cases
```

Zone：

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

验证各 Profile Anchor 的 X/Y relation 和指导。

## J. 真机策略

不跑 15 次。

```text
Device A:
一次连续范围 Sweep

Device B:
三个位置代表场景

Device C:
READY 进入后主动离开，验证撤销
```

## K. 手势

详细手势延期。

当前只定义后续接口：

```text
PoseGestureObservation
PoseGestureRequirement
PoseGestureGap
```

粗粒度身体朝向可以在 framing/position 稳定后较早加入。

## L. 不变项

```text
Scene Spatial role unchanged
AI Director role unchanged
Main integration not started
Provider 0
Backend per-frame 0
Raw upload 0
```


