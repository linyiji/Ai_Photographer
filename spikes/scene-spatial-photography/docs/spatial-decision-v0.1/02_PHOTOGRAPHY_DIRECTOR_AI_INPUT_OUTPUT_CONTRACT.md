# 02 — Photography Director AI Input / Output Contract

> V0.2 TERMINOLOGY AMENDMENT: P1 `LEFT_THIRD / CENTER / RIGHT_THIRD` values are canonical `CompositionAnchorCandidateV01` image-plane anchors. They are not physical placement. Future `SubjectPlacementCandidate` belongs to P3 and remains `NOT_STARTED`. AI may consume P1 view/anchor candidates before P2/P3, but must not invent physical coordinates.

## 1. AI 的角色

`AI Photography Director` 的核心任务：

> 将某一个具体人物主体与某一个真实场景中的可执行候选进行匹配，选择最终拍摄关系，并设计目标照片。

AI 不负责从原始帧推导 Geometry，也不能发明空间事实。

## 2. AI 输入

正式建议对象：

`PhotographyDirectorInputV01`

```text
PhotographyDirectorInputV01
├── user_intent
├── subject_evidence
├── scene_visual_evidence
├── direction_evidence
├── spatial_evidence
├── candidate_shots
└── decision_policy
```

### UserIntent
示例：
```json
{
  "photo_type": "TRAVEL_PORTRAIT",
  "style": ["NATURAL", "ENVIRONMENTAL"],
  "environment_importance": "HIGH",
  "framing_preference": "AUTO"
}
```

### SubjectEvidence
必须包含人物主体：

```text
SubjectEvidence
├── SubjectReferenceImage
└── SubjectAppearanceProfile
```

结构化事实可包括衣服颜色/纹理、当前姿态、身体可见范围；没有证据时必须 `UNKNOWN`。

### SceneVisualEvidence
默认给 AI：
- 3–5 张候选/代表图
- 上限建议 8 张

每张带 `view_id` 与 `relative_yaw_deg`。

### DirectionEvidence
让 AI 知道不同图片属于同一个连续现场，并知道相对左右关系。

### SpatialEvidence
示例：
```json
{
  "status": "USABLE",
  "confidence": 0.84,
  "geometry_type": "SPARSE_RELATIVE",
  "metric_scale_available": false,
  "depth_type": "RELATIVE"
}
```

`INSUFFICIENT` 时 AI 不得把 Spatial 当事实。

### CandidateShots
AI 不从无限空间里自己找点；算法先压缩成 3–6 个可执行组合。

## 3. AI 输出

正式建议对象：

`PhotographyDirectorDecisionCandidateV01`

```text
PhotographyDirectorDecisionCandidateV01
├── selected_view_candidate
├── selected_subject_placement
├── selected_camera_placement
├── framing
├── composition
├── subject_direction
├── camera_direction
├── target_blueprint
├── spatial_usage
├── confidence
└── evidence_usage
```

### Selected View
必须来自合法 View Candidate。

### Selected Subject Placement
必须来自 `SubjectPlacementCandidate`，不得发明现实 XYZ。

### Selected Camera Placement
没有 metric scale 时只输出相对动作：
- SLIGHTLY_RIGHT
- SLIGHTLY_BACK
等，不输出无依据的 0.73m。

### Framing / Composition
决定环境人像、半身、全身、LEFT/CENTER/RIGHT 等。

### Subject Direction
决定 body orientation、head direction、pose。

### Camera Direction
决定 Camera height、tilt、distance relation 等相对语义。

### Target Blueprint
示例：
```json
{
  "subject_anchor": {"x": 0.34, "y": 0.52},
  "subject_scale": {"target_ratio": 0.46},
  "headroom": "MODERATE",
  "background_relation": "PRESERVE_ENVIRONMENT"
}
```

后续交给 Live。

### Spatial Usage
AI 每次显式返回：
- `USED`
- `NOT_NEEDED`
- `UNAVAILABLE`

用于后续成本优化。

## 4. AI 可以决定

- 人物 × 场景匹配
- candidate selection
- framing
- composition
- pose
- scene semantics
- camera intent
- Target Blueprint

## 5. AI 禁止

- 发明 Geometry
- 发明 Subject/Camera Candidate
- 超出扫描范围
- Geometry insufficient 时猜精确 3D
- 发明 Safety
- 没有 metric scale 时输出精确米制距离
- 把 Candidate 当 Fact

## 6. 输出不是最终 Authority

```text
DecisionCandidate
↓
Constraint Validator
↓
SelectedShotPlan
↓
LiveTarget
```
