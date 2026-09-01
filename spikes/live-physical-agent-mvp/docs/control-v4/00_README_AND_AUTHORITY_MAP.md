# XFX Live V4 — 05G Framing Profile / Position Guidance Rebaseline

Date: 2026-09-01
Status: OWNER_DESIGN_AUTHORITY_CANDIDATE
Track: PARALLEL_LIVE

## 核心修正

Live 不再默认要求全身。先识别当前视频实际看到了人物哪一段，再根据当前 Shot Target 决定是否足够。

正式范围：

- HEAD：特写
- HEAD_SHOULDERS：头肩
- UPPER_BODY：半身，头到髋
- THREE_QUARTER：大半身，头到膝
- FULL_BODY：全身

硬规则：

```text
HEAD_SHOULDERS != UPPER_BODY
DEFAULT_FULL_BODY_REQUIREMENT = NO
HEAD_SHOULDERS_REQUIRES_HIPS = NO
```

## 新六层

```text
1 SubjectRecognitionState
2 ObservedBodyState
3 TargetFramingProfile
4 TargetMeasurementRequirement
5 TargetObservationGap
6 Control / Presentation
```

## READY 修正

```text
trial_success_latched
= 历史上曾经成功，供 Evidence 使用

current_framing_ready
= 当前这一刻是否仍可拍，必须持续复核
```

历史成功不再强制 UI 永久 READY。

## 专门验收

新增：

`20_LIVE_V4_BODY_EXTENT_AND_POSITION_GUIDANCE_ACCEPTANCE_GATE_V01.md`

自动化要求至少：

```text
5 个范围 × 3 个位置 = 15 个场景
```

位置测试：

```text
LEFT_TOP
CENTER
RIGHT_BOTTOM
```

## 手势

详细手势暂缓，不进入 05G blocking gate。

先完成：

```text
人物范围识别
→ 大小
→ 人体语义锚点位置
→ READY 可进入/撤销
```

之后再做：

```text
粗粒度身体朝向
→ 详细姿势
→ 手势
```


