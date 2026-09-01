# XFX Live V4 — 05H Device Gate + 05I Voice Presentation Authority Map

## 06 canonical target authority overlay

The long-term algorithm authority under
`D:\Projects\Ai_Photographer\算法记录\Live_Guidance` governs the 06 test
candidate. Its six canonical documents define the target-first pipeline,
feasibility and ownership, goal-directed controller, multimodal presentation,
state machine, acceptance matrix, and AOP order.

06 supersedes the 05I action-selection and voice-event semantics while retaining
the accepted Browser SpeechSynthesis platform adapter. Measurement and existing
05G framing-profile target values are reused; they are not retuned here. P3
physical feasibility, real-device threshold tuning, and OPPO acceptance remain
SOURCE_REQUIRED / NOT_STARTED.

Date: 2026-09-01
Status: OWNER_ALGORITHM_AND_PRESENTATION_ACCEPTANCE_AUTHORITY
Track: PARALLEL_LIVE

## Current authority

05H is a documentation-alignment and OPPO scalar-evidence gate over the accepted
05G runtime at source head `8dfe92b272efd0c0bc5785d6cf2e102cf21f6d75`.

Read in this order:

1. `19_LIVE_V4_FRAMING_PROFILE_AND_DYNAMIC_READY_ALGORITHM_V02_05H_ALIGNMENT.md`
2. `20_LIVE_V4_BODY_EXTENT_AND_POSITION_GUIDANCE_ACCEPTANCE_GATE_V02_05H.md`
3. `23_LIVE_V4_05H_OPPO_DEVICE_GATE_PROTOCOL_V01.md`
4. `24_LIVE_V4_FUNCTIONAL_VS_PERFORMANCE_ACCEPTANCE_V01.md`
5. `25_LIVE_V4_05H_EVIDENCE_SCHEMA_AND_TRACE_FIELDS_V01.md`

The V01 algorithm and acceptance documents remain historical 05G baselines and
are superseded for the 05H device verdict. The 05H alignment does not authorize
runtime changes, target/threshold tuning, Main integration, or repeated 05F
LEFT/RIGHT calibration without fresh invalidating evidence.

## 05I voice presentation authority

05I adds a presentation-only voice channel over the same current V4 semantic
state. It does not change measurement, control, response, target, thresholds,
or READY. Read in this order:

1. `26_LIVE_V4_VOICE_PRESENTATION_AND_AUDIO_CUE_ALGORITHM_V01.md`
2. `27_LIVE_V4_VOICE_CUE_SCHEDULER_AND_CAUSALITY_V01.md`
3. `28_LIVE_V4_AUDIO_PLATFORM_ADAPTER_AND_UNLOCK_V01.md`
4. `29_LIVE_V4_VOICE_ACCEPTANCE_GATE_V01.md`
5. `30_LIVE_V4_05H_PLUS_VOICE_COMBINED_DEVICE_GATE_AMENDMENT_V01.md`

H5 uses the browser SpeechSynthesis adapter with `zh-CN` feature detection and
graceful fallback. External TTS/AI providers, audio upload/recording, and WeApp
voice runtime are not authorized. The combined OPPO device gate remains a
separate manual gate and does not start automatically after 05I implementation.

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
