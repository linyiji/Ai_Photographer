# 00 — Scene Spatial Node Overview

## 1. 节点目标

Scene Spatial 的目标不是生成通用、可漫游的完整 3D 世界，而是把一次 Scene Scan 得到的复杂现场信息压缩成少量可信、可执行的摄影候选。

节点同时服务：

1. **Direction Level**：哪个相对方向值得继续考虑。
2. **Spatial Level**：在可用证据下，人物可在哪些区域站/坐，相机可在哪些区域拍，遮挡与前后层次如何。

## 2. 用户体验

用户默认只做一次：

```text
打开相机
↓
点击“扫描现场”
↓
跟随箭头缓慢扫过现场
↓
完成
```

同一次 Scan 内部产生：

```text
Scene Scan
├── Direction Evidence
└── Spatial Evidence
```

Spatial 是否可用由 Geometry/CV 根据视差、匹配、Pose、重建质量判定。用户不需要知道是否真正进行了空间重建。

## 3. 完整链路

```text
Subject Reference
↓
Subject Understanding
       ┐
Scene Scan Runtime
├── Direction Pack
└── Spatial Pack
       ↓
Geometry / CV
↓
Photography Affordance
↓
Placement Candidates
↓
Candidate Shots
       ┘
       ↓
AI Photography Director
↓
DecisionCandidate
↓
Constraint Validator
↓
SelectedShotPlan
↓
LiveTarget
↓
Live Guidance
↓
Capture
```

## 4. 职责

### Scene Scan Runtime
负责方向、关键帧、质量、运动/视差证据；不负责决定“最好机位”。

### Geometry / CV
负责相对 Camera Pose、Depth、Visibility、Occlusion、Free/Support Space、Spatial Confidence；不负责审美。

### Photography Affordance
将复杂 Geometry 压缩成：
- `SubjectPlacementCandidate[]`
- `CameraPlacementCandidate[]`
- `ViewCandidate[]`

### Candidate Generator
组合有限数量的 `CandidateShot[]`。

### AI Photography Director
根据人物主体、用户意图、场景图片、空间候选决定最终摄影方案。

### Constraint Validator
确认 AI 的选择来自合法候选、未越权使用 Unknown、未发明安全或米制距离。

### Live
将 `SelectedShotPlan` 转成可实时控制的 `LiveTarget`。

## 5. 核心原则

- 一次采集，多能力消费。
- Geometry 不是审美。
- AI 不是 Geometry Engine。
- Candidate != Authority。
- P1/P2 是后台能力阶段，不是用户两次操作。

## 6. 推荐阶段

- P0：Scene Sweep / Direction Capture。
- P1：SceneFrameSet + SceneDirectionMap + 多视角 Candidate。
- P2：Spatial Evidence + Photography Affordance。
- P3：AI Photography Director。
- P4：Validator + Main Integration。
- P5：LiveTarget + Physical Agent 闭环。
