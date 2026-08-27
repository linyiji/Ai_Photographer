# 03 — Current Node Checkpoint and Product Decisions

> V0.2 CHECKPOINT: P0 accepted; P1 accepted with warning; old P2 judgment model superseded; P2 spike-local Backend Geometry is the current implementation target; P3 Affordance, AI Director and Main Integration remain `NOT_STARTED`.

## 1. P0

`Scene Sweep = PASS_WITH_WARNING`

已证明 OPPO K11 的 QUICK/WIDE、Camera、DeviceOrientation、Relative Yaw、Keyframe、SceneSweepManifest、YawMap 和隐私边界。

## 2. P1 原始方案

原链路：

```text
Keyframes
→ Descriptors
→ SceneAngularRegion
→ One Region = One Opportunity
→ Top Recommendation
```

4 次 OPPO 实测均退化为：

`1 region / 1 opportunity`

因此当前真实场景候选质量未成立，P1 为：

`CHECKPOINT / NOT_ACCEPTED`

## 3. 已确认 P1 修正

正式锁定：

`Region Count != Candidate Count`

P1 改为：

```text
SceneFrameSet
+
SceneDirectionMap
+
Multi-view Candidate Generation
+
Multi-anchor Placement Candidate
```

P1 不再拥有 Final Photography Decision。

## 4. 已确认单次扫描原则

不采用默认两次操作。

统一为：

```text
一次 Scene Scan
↓
Direction Evidence
+
Spatial Evidence
↓
Geometry 判断 Spatial 是否可用
↓
AI 决定是否使用 Spatial
```

## 5. “位置”定义

算法输出：

- `SubjectPlacementCandidate`
- `CameraPlacementCandidate`

表示几何可行候选区域，不是最终最佳位置。

第一阶段人物动作重点支持：
`STAND`

Future：
`SIT / LEAN / CROUCH`

## 6. AI 最新职责

输入：
- Subject Reference
- Subject Profile
- 3–5 Scene Images
- Direction Map
- Spatial Summary
- Candidate Shots
- User Intent

输出：
- Selected View
- Selected Subject Placement
- Selected Camera Placement
- Framing
- Composition
- Pose
- Camera Direction
- Target Blueprint

## 7. 架构冻结句

> 算法不是为了给 AI 重建整个世界，而是为了把整个世界压缩成少量“可执行的人物位置 × 摄影机位置 × 拍摄方向”候选。

> AI 在 Geometry 已验证的 CandidateShot 中完成“人物 × 场景”的摄影决策。

## 8. 当前未实现

- Production P2 Spatial Evidence
- Reliable depth/3D
- Subject Stand Zone
- Camera Zone
- Photography Affordance runtime
- Real AI Director
- Constraint Validator
- Main integration
- LiveTarget integration

## 9. 推荐顺序

1. 完成 P1 Candidate 修正。
2. 锁定小程序 Scene Scan Capture Protocol。
3. P2 Spatial Evidence Spike。
4. Photography Affordance。
5. AI Director I/O 实现。
6. Validator。
7. Main Integration。
8. LiveTarget。
