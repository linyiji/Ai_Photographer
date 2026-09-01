# Live V4 Current Position Decision Logic V3

Status: OWNER_ALGORITHM_AUTHORITY / 05G

## 顺序

```text
Recognition
→ Observed Body
→ Framing Profile
→ Measurement Requirement
→ Observation Gap
→ Active Constraint
→ Presentation
```

## 当前推荐状态流

```text
ACQUIRE_SUBJECT
→ ENSURE_TARGET_MEASURABILITY
→ ADJUST_SCALE
→ ALIGN_PRIMARY_X
→ ALIGN_PRIMARY_Y
→ ALIGN_SECONDARY
→ VERIFY
→ CURRENT_READY
```

兼容旧 enum 可以保留，但语义必须服从上面的 Authority。

## Position

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

一次只处理一个主要 Constraint。

## Calibration

X-only Calibration：

```text
HEAD
+
BILATERAL SHOULDERS
+
SHOULDER_CENTER
```

即可 Ready。

不读取：

```text
HIPS
HEAD_TO_HIP
Scale Target
Full Target Gap
```

## Dynamic READY

进入：

```text
所有当前 Target 条件满足
+ fresh
+ stable
+ Verify hold
```

退出：

```text
当前 Target Truth 持续失效
```

历史 Trial Success 不得覆盖当前 Constraint Resolver。

## Gesture

详细手势不属于当前 Gate。

未来 Pose/Gesture 插入 Primary Spatial Constraint 之后。


