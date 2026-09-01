# Live V4 Gesture & Pose Future Scope V01

Status: DEFERRED_CAPABILITY_SCOPE

## 决策

当前 05G 不把详细手势作为 blocking gate。

先完成：

```text
人物范围
→ Scale
→ Anchor X/Y
→ Dynamic READY
```

再增加姿势/手势。

## 可以较早加入的内容

粗粒度身体姿态：

```text
BODY_FRONT
BODY_SLIGHT_LEFT
BODY_SLIGHT_RIGHT
HEAD_FORWARD
HEAD_TURN_LEFT
HEAD_TURN_RIGHT
```

这些可以作为 Secondary Constraint。

## 后续详细手势

例如：

```text
V_SIGN
HAND_ON_HIP
HANDS_DOWN
ARMS_CROSSED
ONE_HAND_IN_POCKET
```

建议独立 Gate，因为它涉及：

```text
手部可见性
手部 landmark
遮挡
左右手语义
Gesture classifier
Pose timing
```

## 未来接口

```text
PoseGestureObservationV01
PoseGestureRequirementV01
PoseGestureGapV01
```

同样遵循：

```text
Observation
+
Requirement
→ Gap
→ Control
```

如果 Shot Plan 没有要求手势：

```text
gesture 不能阻塞 READY
```


