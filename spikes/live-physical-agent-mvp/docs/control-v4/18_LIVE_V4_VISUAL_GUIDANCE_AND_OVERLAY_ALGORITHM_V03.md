# Live V4 Visual Guidance & Overlay Algorithm V03

Status: OWNER_PRESENTATION_AUTHORITY / 05G

## 输入

```text
SubjectRecognitionState
ObservedBodyState
TargetFramingProfile
TargetObservationGap
LiveAction
CurrentReadyState
↓
LivePresentationModel
↓
Renderer
```

Renderer 不做第二套算法判断。

## Recognition-first

例：

```text
已识别到人物。当前看到头部。
已识别到人物。当前看到头部和双肩。
人物范围已识别，正在判断人物大小和位置。
```

## Profile-specific

`HEAD_SHOULDERS` 不能提示用户补双髋。

`UPPER_BODY` 如果 Hips 真的是当前 Target requirement，可提示：

```text
这张半身照还需要看到腰部和双髋。
```

## Temporal blocker copy

短暂不稳定：

```text
双髋测量正在稳定，请保持一下。
```

持续目标必需区域不在画面：

```text
当前半身构图需要看到腰部和双髋。
```

只有 Actionability 证明后才追加：

```text
请稍微退后
```

## Position Zone

支持：

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

显示：

```text
Current Anchor
Target Zone
一个主要 Arrow
```

## Dynamic READY

当前满足：

```text
位置很好，可以拍了
```

当前状态离开 Target：

```text
位置发生变化，正在重新确认
```

必须取消 READY visual。

历史 `trial_success_latched` 只进 Debug/Evidence，不控制绿色 READY。

## Internal Names

正常 UI 禁止：

```text
HEAD_TO_HIP
TORSO_CENTER
TargetObservationGap
BILATERAL_VALID
MeasurementCapability
```

## Gesture

05G 不增加详细手势 Overlay。


