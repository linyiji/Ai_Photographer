# 06 — Evidence, Confidence and Authority Rules

## 1. Evidence Class

所有关键字段必须属于：
- `FACT`
- `CANDIDATE`
- `UNKNOWN`

## 2. FACT

由传感器/算法在当前标准下确认的事实，例如：
- relative_yaw
- image dimensions
- blur status
- SpatialEvidence.status

AI 不能改写 FACT。

## 3. CANDIDATE

算法根据事实产生、尚未成为 Authority 的方案，例如：
- SubjectPlacementCandidate
- CameraPlacementCandidate
- ViewCandidate
- CandidateShot

AI 可选择或拒绝，不得凭空新增不存在的候选。

## 4. UNKNOWN

当前证据不足，例如：
- metric_distance
- physical_safety
- walkable_surface
- depth

AI 必须保持 Unknown。

## 5. Spatial Status

- `USABLE`
- `PARTIAL`
- `INSUFFICIENT`

`INSUFFICIENT` 时 Geometry 不参与空间决策。

## 6. Confidence

建议带：
- confidence
- evidence source
- quality reason
- validity reason

高 confidence 的 Candidate 仍然只是 Candidate。

## 7. Authority

### Geometry
负责：motion、depth、visibility、occlusion、free/support space、placement feasibility。

### AI
负责：人物×场景、候选选择、pose、framing、composition、target design。

### Validator
负责最终合法性检查。

## 8. Safety

第一阶段默认：
`UNKNOWN_REQUIRES_USER_CONFIRMATION`

Free Space 不等于现实安全。

## 9. Metric Scale

默认：
`metric_scale_available=false`

允许：
- slightly closer/farther
- left/right
- relative depth

禁止：
- 0.72m
- 2.3m
- 精确物理坐标

## 10. Promotion

```text
Raw Evidence
→ validated FACT
→ Candidate Generator
→ CANDIDATE
→ AI
→ DecisionCandidate
→ Validator
→ SelectedShotPlan
```
