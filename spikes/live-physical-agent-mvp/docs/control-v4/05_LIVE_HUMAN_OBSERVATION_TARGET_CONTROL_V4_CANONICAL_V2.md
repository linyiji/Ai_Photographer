# Live V4 Human Observation / Target / Control Canonical V2

Status: OWNER_DESIGN_AUTHORITY / 05G

## Canonical stack

```text
SubjectRecognitionState
↓
ObservedBodyState
↓
TargetFramingProfile
↓
TargetMeasurementRequirement
↓
TargetObservationGap
↓
Control / Presentation
```

## Observation

`ObservedBodyState` 必须 Target-independent。

范围：

```text
HEAD
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

Hard：

```text
DEFAULT_FULL_BODY_REQUIREMENT = NO
```

## Framing

```text
HEAD_SHOULDERS != UPPER_BODY
```

`HEAD_SHOULDERS` 不要求 HIPS。

`UPPER_BODY` 如果定义为头到髋，可以要求 HIPS。

`THREE_QUARTER` 不应被脚踝缺失阻塞。

`FULL_BODY` 才默认要求完整下肢。

## Measurement

每个 Profile 拥有自己的：

```text
required_regions
required_anchors
required_measurements
scale_metric
primary_anchor
```

## Calibration

Calibration Requirement 与 Photography Target Requirement 分离。

X Calibration 不要求完整 Upper Body。

## READY

```text
trial_success_latched
!=
current_framing_ready
```

前者是历史 Evidence。

后者是当前可拍状态，允许撤销。

用户 UI / Capture Permission 只能依赖 `current_framing_ready`。

## Dedicated Gate

必须通过：

```text
Body Extent Classification
Profile-specific Readiness
LEFT_TOP / CENTER / RIGHT_BOTTOM
Dynamic READY Revoke
```

之后再进入详细 Pose / Gesture。


