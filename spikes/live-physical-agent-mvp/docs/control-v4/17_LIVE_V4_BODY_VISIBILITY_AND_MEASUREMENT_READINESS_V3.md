# Live V4 Body Visibility & Measurement Readiness V3

Status: OWNER_MEASUREMENT_AUTHORITY / 05G

## 1. 没有全身默认要求

Measurement Capability 是当前 Observation 能测什么。

Target Readiness 是当前 Profile 需要什么。

两者不同。

## 2. Observed extent

```text
HEAD
HEAD_SHOULDERS
UPPER_BODY
THREE_QUARTER
FULL_BODY
PARTIAL_OR_AMBIGUOUS
```

只由当前视频 Evidence 决定。

## 3. Landmark reduction

继续锁定：

```text
HEAD_CORE = MULTI_POINT → CENTROID

SHOULDERS/HIPS/KNEES/ANKLES
= BILATERAL_PAIR → PAIR_CENTER when valid
```

`non-bilateral` 不等于 cropped。

`global crop` 不等于所有 Region cropped。

## 4. Measurement catalog

允许逐步形成：

```text
HEAD_SIZE
EYE_LINE
SHOULDER_CENTER
HEAD_SHOULDER_SCALE
TORSO_CENTER
HEAD_TO_HIP
HIP_CENTER
HEAD_TO_KNEE
HEAD_TO_ANKLE
BODY_CENTER
```

只有经过定义/验证的 Measurement 才能进 Production Control。

## 5. Profile dependency

```text
HEAD
→ no hip dependency

HEAD_SHOULDERS
→ no hip dependency

UPPER_BODY
→ hip dependency allowed/expected

THREE_QUARTER
→ knee dependency; ankle not required

FULL_BODY
→ lower-body endpoint required
```

## 6. Low confidence 不直接等于等待

`LOW_CONFIDENCE` 是 Observation。

Gap 层再判断是：

```text
TEMPORARILY_UNSTABLE
REGION_NOT_OBSERVED
REGION_EDGE_CROPPED
SYSTEM_MEASUREMENT_DEFECT
```

持续几十秒缺失不应该永远输出“等待稳定”。

## 7. Calibration

`SHOULDER_CENTER.x` 足以支持纯 X Calibration。

不得要求 HIPS / HEAD_TO_HIP / Scale Target。

## 8. Dynamic READY

`current_framing_ready` 必须持续依赖当前 Measurement。

Required Measurement 丢失达到 exit condition：

```text
current_framing_ready = false
```

`trial_success_latched` 独立保留。


