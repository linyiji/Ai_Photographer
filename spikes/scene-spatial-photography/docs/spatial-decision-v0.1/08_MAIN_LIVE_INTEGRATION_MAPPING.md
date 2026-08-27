# 08 — Main / Live Integration Mapping

> V0.2 MAPPING AMENDMENT: canonical object flow is `SceneScanEvidence → ViewEvidence + CompositionAnchorCandidate → SpatialEvidenceV02 → future P3 Affordance → PhotographyDirectorInput`. Backend Geometry remains spike-local; Main Integration stays `NOT_STARTED` and future adoption is selective migration only.

## 1. Main

负责：
- PhotographySession
- WorkflowState
- persistent lineage
- contracts
- candidate promotion
- asset registry
- events
- resume/replay
- routing

不负责 per-frame CV 或审美。

## 2. Scene Spatial

负责：
- Scene Scan
- SceneFrameSet
- SceneDirectionMap
- SpatialEvidence
- Photography Affordance
- Placement Candidates
- CandidateShot

## 3. AI Director

负责：
- 对这个具体人物选择合法候选
- framing/composition/pose
- target design

## 4. Validator

负责：
- Candidate 存在性
- Geometry 一致性
- Authority
- Safety/Metric claim

## 5. Live

负责：
- 将 `SelectedShotPlan` 映射为 `LiveTarget`
- 实时控制达到目标

## 6. 对象链路

```text
SceneScanEvidenceV01
↓
PhotographyDirectorInputV01
↓
PhotographyDirectorDecisionCandidateV01
↓
Constraint Validator
↓
SelectedShotPlanV01
↓
LiveTargetV01
↓
CurrentShotState
↓
Live Guidance
```

## 7. SelectedShotPlan

摄影语义：
- selected_view
- selected_subject_placement
- selected_camera_placement
- framing
- composition
- subject_pose
- camera_direction
- target_blueprint
- evidence_refs

## 8. LiveTarget

控制语义：
- target_subject_x/y
- target_subject_scale
- body/head orientation
- target_camera_relation
- tolerances
- control_priority

两者不得混成一个对象。

## 9. Provider Seam

建议：
`PhotographyDirectorProvider`

输入：
`PhotographyDirectorInputV01`

输出：
`PhotographyDirectorDecisionCandidateV01`

## 10. Geometry Seam

建议：
`SpatialEvidenceProvider`

输入：
`SceneScanCapturePackage`

输出：
`SpatialEvidenceV01`

实现可替换 OpenCV / COLMAP / depth 等。

## 11. Integration Gate

只有当 P1 Direction Candidate、P2 Spatial Evidence、Affordance、Contract、Privacy 通过，才进入 Main Integration。

## 12. 最终闭环

```text
Subject
+
Scene Scan
↓
Reality / Spatial Evidence
↓
Candidate Shots
↓
AI Director
↓
Validator
↓
SelectedShotPlan
↓
LiveTarget
↓
Live Guidance
↓
Capture
↓
QA
↓
Reality+
```
