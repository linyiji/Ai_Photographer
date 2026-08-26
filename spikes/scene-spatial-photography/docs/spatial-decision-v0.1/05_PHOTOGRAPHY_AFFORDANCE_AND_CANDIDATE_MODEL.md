# 05 — Photography Affordance and Candidate Model

## 1. 定义

Photography Affordance Layer 将复杂 Geometry 压缩为：

> 哪里可以执行某种摄影动作。

核心对象：

```text
ViewCandidate[]
SubjectPlacementCandidate[]
CameraPlacementCandidate[]
CandidateShot[]
```

## 2. SubjectPlacementCandidate

表示人物可执行某种动作的候选区域，不是最终最佳站位。

示例：

```json
{
  "zone_id": "S1",
  "view_id": "VIEW_B",
  "action": "STAND",
  "image_anchor": "LEFT_THIRD",
  "relative_depth": "MIDGROUND",
  "support": "AVAILABLE",
  "free_space": "SUFFICIENT",
  "visibility": "GOOD",
  "occlusion_risk": "LOW",
  "background_separation": "GOOD",
  "confidence": 0.86,
  "evidence_class": "CANDIDATE"
}
```

## 3. Action Types

V1：
`STAND`

Future：
- SIT
- LEAN
- CROUCH

## 4. STAND 证据

至少考虑：
- support/ground-like
- free space
- expected subject footprint
- camera visibility
- occlusion
- frame inclusion
- background relation

## 5. CameraPlacementCandidate

表示摄影者/Camera 可用于拍摄某 Subject Candidate 的候选区域。

没有 metric scale 时只输出相对位置，不报精确米数。

## 6. CandidateShot

```text
ViewCandidate
+
SubjectPlacementCandidate
+
CameraPlacementCandidate
+
Framing feasibility
↓
CandidateShot
```

目标只保留约 3–6 个可执行组合。

## 7. 压缩意义

可能将：

```text
100 frames
20 keyframes
5000 tracks
2000 points
depth
pose sequence
```

压缩为：

```text
3 ViewCandidates
4 SubjectPlacementCandidates
2 CameraPlacementCandidates
5 CandidateShots
```

AI 只需要处理这些有限方案。

## 8. Authority

Algorithm：
`CANDIDATE`

AI：
`DecisionCandidate`

Validator：
`SelectedShotPlan`
