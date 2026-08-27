# 09 — Scene Spatial Node and Flow Redefinition V0.2

版本：`v0.2`  
状态：`DESIGN AUTHORITY AMENDMENT / READY FOR IMPLEMENTATION`  
适用 Track：`PARALLEL_SCENE_SPATIAL`

本文件修订 `Spatial Decision v0.1` 中 P1/P2/P3 职责、Spatial Status 产生方式和 Photography Affordance 所属阶段。Reality First、Candidate != Authority、一次 Scene Scan、多能力按需消费、Main Integration NOT_STARTED 保持不变。

## 1. V0.2 为什么需要

V0.1 的总体方向正确，但 P2 判断链有三个结构性问题：

1. **开发期 Controlled Reference 与真实 Session Authority 混在一起。** Controlled Reference 可以证明某套 Geometry Algorithm 是否可信，但不能替用户当前这一次 Scene Scan 产生 SpatialEvidence。
2. **端侧 residual motion 被赋予过强 Authority。** 它最多只能证明“值得继续跑 Geometry”，不能直接产生 `PARTIAL / USABLE`。
3. **Photography Affordance 被过早塞进 P2。** Sparse Geometry 可以证明相对空间关系，但不能单独证明地面、支撑、可站、可达与物理安全。

V0.2 收敛为：

```text
P0 — SCAN
↓
P1 — VIEW
↓
P2 — GEOMETRY
↓
P3 — AFFORDANCE
↓
AI PHOTOGRAPHY DIRECTOR
```

## 2. 节点总目标

Scene Spatial 不再定义为“扫描后直接决定人物站在哪里”，而定义为：

> **用一次 Scene Scan 获取足够的多视图证据，将真实现场逐层压缩成 View Evidence、Spatial Evidence，以及未来可选的 Photography Affordance；最终由 AI Photography Director 结合人物主体、用户意图和候选证据完成摄影决策。**

Scene Spatial 不拥有最终审美 Authority。

## 3. 一次 Scene Scan

用户默认只执行一次：

```text
点击“扫描现场”
↓
沿引导缓慢扫过真实环境
↓
完成
```

同一次 Scan 内部被多个能力消费：

```text
ONE Scene Scan
│
├── P1 View Preparation
├── P2 Geometry
└── Future P3 Affordance
```

P1/P2/P3 是内部阶段，不是三次用户操作。

## 4. P0 — SCAN

P0 只回答：

> **这次扫描采集是否足够形成一个可继续分析的 Scene Scan？**

建议输出：

```text
SceneScanEvidenceV02
├── scan_id
├── frame references
├── timestamps
├── relative yaw
├── orientation metadata
├── frame quality
├── overlap candidates
├── scan coverage
└── capture limitations
```

P0 不回答：真实深度、平移是否成立、人物能否站、哪个方向最好看、哪张照片最好。

QUICK/WIDE 具体角度与容差属于 Capture Protocol / Algorithm Calibration，不进入上层 Product Judgment Contract。

## 5. P1 — VIEW PREPARATION

P1 只回答：

> **现场有哪些值得后续继续判断的候选方向？**

输出：

```text
SceneFrameSetV01
SceneDirectionMapV01
PhotographyViewCandidateV01[]
CompositionAnchorCandidateV01[]
```

继续沿用：

```text
Region Count != Candidate Count
max ViewCandidates ≈ 3
```

### 5.1 命名修正

原：

```text
PlacementCandidateV01
```

容易被理解为现实人物站位。V0.2 推荐 canonical name：

```text
CompositionAnchorCandidateV01
```

其含义只能是：

```text
LEFT_THIRD
CENTER
RIGHT_THIRD
```

即照片画面的构图锚点候选。

它不是：

```text
SubjectPlacementCandidate
```

后者保留给未来 P3，表示现实空间候选位置。

P1 不回答现实人物站位、Camera 现实机位、真实深度、米制距离、安全性和最终最佳照片。

## 6. P2 — GEOMETRY

P2 唯一回答：

> **这一次 Scene Scan 是否拥有足够可靠的多视图空间关系证据？**

P2 不再承担“哪里可以站”的任务。

## 7. P2A — Spatial Precheck

端侧/小程序只执行轻量预检查：

```text
selected overlapping frames
↓
lightweight feature / motion analysis
↓
SpatialPrecheckV01
```

只允许：

```text
UNRELIABLE
NO_SIGNAL
POSSIBLE
```

解释：

- `UNRELIABLE`：图片/对应不足，无法形成可靠 routing hint；
- `NO_SIGNAL`：轻量证据暂未看到值得立即深算的空间信号；
- `POSSIBLE`：存在可能的 parallax / translation signal，值得提交后端 Solver。

**Precheck 不产生 `USABLE / PARTIAL / INSUFFICIENT`。**

它是：

```text
Routing / Cost Hint
```

不是：

```text
Spatial Authority
```

## 8. P2B — Production Backend Geometry Solver

真实 Session 的 SpatialEvidence 必须由第一方后端对当前 Session 数据计算：

```text
Mini Program / Client
├── GeometryFrameSelector
├── resize/compress
├── quality
└── SpatialPrecheck
        ↓
FIRST-PARTY BACKEND
        ↓
Production Geometry Solver
        ↓
SpatialEvidenceV02
```

Controlled Reference 只验证算法，不参与真实 Session Authority。

## 9. 为什么主计算放后端

后端优先因为：

1. 微信/抖音小程序的 WASM、线程、内存与 Camera API 差异较大；
2. Geometry 不应被某个客户端 Runtime 绑死；
3. OpenCV / multi-view geometry 在后端更容易版本统一；
4. Solver 升级不要求客户端同时升级；
5. 微信、抖音、H5 可以输出同一 `SceneGeometryRequest`；
6. 后端便于做 Early Exit、Cache、Version、Telemetry；
7. 客户端负责“采什么”，后端负责“这些数据能不能成为空间事实”。

## 10. Backend Input

建议：

```text
SceneGeometryRequestV01
├── scan_id
├── frame_set_hash
├── geometry_version
├── platform
├── camera_model_evidence
├── selected_geometry_frames[]
│   ├── frame_id
│   ├── timestamp
│   ├── relative_yaw
│   ├── orientation
│   ├── image width/height
│   └── resized image asset
└── client_precheck
```

Geometry Frames：

- 优先 4–8 张；
- 工作长边约 640–960 px；
- 受控 JPEG/WebP 压缩；
- 保留时间顺序和 yaw；
- 不上传原始视频；
- 不上传连续 frame stream。

## 11. Backend Output

建议正式空间对象升级为：

```text
SpatialEvidenceV02
```

产品层只暴露：

```text
SpatialEvidenceV02
├── status
│   ├── INSUFFICIENT
│   ├── PARTIAL
│   └── USABLE
├── confidence
├── geometry_type
├── metric_scale_available = false
├── relative_camera_motion
├── relative_depth_summary
├── geometry_coverage
├── visibility_evidence
├── occlusion_evidence
├── evidence_refs
└── limitations
```

Feature count、inlier ratio、parallax、pose stability、positive depth、reprojection error 等全部进入 `diagnostics`，不要让 Product Workflow 理解 CV 阈值。

## 12. SpatialEvidence 状态

### INSUFFICIENT

当前 Scan 没有足够可靠 Geometry，例如：

- pure rotation；
- low parallax；
- unreliable correspondence；
- camera model evidence 不足；
- pose/triangulation validation fail。

### PARTIAL

部分相对空间关系可信，但覆盖、Camera Model 或 multi-pair consistency 不足。

### USABLE

当前 Session 的 multi-view Geometry 通过 Production Geometry Solver Gate。

`USABLE` 仍然只等于：

```text
NON_METRIC / RELATIVE GEOMETRY
```

不等于 meter distance、safety、walkability、standable surface 或 final photography plan。

## 13. Controlled Reference 新定位

旧逻辑：

```text
Client PARTIAL
→ Controlled Reference
→ USABLE
```

废止。

新逻辑：

```text
Development:
Controlled Reference
→ validate Geometry Solver

Production:
Current Scene Scan
→ Backend Geometry Solver
→ current Session SpatialEvidence
```

Reference 是 `ALGORITHM VALIDATION AUTHORITY`，不是 `SESSION EVIDENCE AUTHORITY`。

## 14. P3 — PHOTOGRAPHY AFFORDANCE

P3 从 P2 主 Gate 中拆出。未来回答：

> **基于 Geometry + Scene Semantics，现实空间有哪些摄影动作候选？**

未来输出：

```text
SubjectPlacementCandidate[]
CameraPlacementCandidate[]
```

人物 V1 可以只支持：

```text
STAND
```

后续才支持：

```text
SIT
LEAN
CROUCH
```

P3 可能需要 ground/support surface、free space、semantic segmentation、depth、occupancy、visibility、occlusion、framing feasibility。这些不再要求 P2 一次解决。

## 15. P2/P3/AI Authority

```text
P2
“这里存在可信空间关系”
        ↓
P3
“这里可能可以让人/相机占据”
        ↓
AI
“这个具体的人和意图，应该选哪个”
```

因此：

```text
SpatialEvidence != SubjectPlacementCandidate
```

## 16. AI 不必等待 P3

### Level 1 — View-based Director

未来可以只使用：

```text
Subject Reference
+
ViewCandidate[]
+
CompositionAnchorCandidate[]
+
UserIntent
```

决定方向、画面左/中/右、framing、pose。

### Level 2 — Spatial-enhanced Director

再加入：

```text
SpatialEvidence
+
P3 Physical Candidates
```

进一步决定现实人物/Camera 区域。

所以 Geometry 是 AI 的渐进增强，不是 AI 启动前置条件。

## 17. 执行模型与性能

不再：

```text
Scan
→ 等所有 Geometry
→ 才显示结果
```

改为：

```text
Scene Scan Complete
│
├── P1 View Preparation
│       ↓
│   View result immediately available
│
└── P2 Geometry
        ↓
    async backend enhancement
```

候选工程预算：

```text
P1 <100 ms
Client SpatialPrecheck P95 <150 ms

Backend Geometry:
P50 <1 s
P95 <2 s
```

后端预算是当前工程目标，不是永久跨硬件 Contract。

## 18. Early Exit

Backend 必须证据逐层升级：

```text
Request
↓
Input Validation
↓
Primary Pair
├── fail → INSUFFICIENT
└── pass
    ↓
Multi-pair Verification
├── unstable → PARTIAL / INSUFFICIENT
└── stable
    ↓
Triangulation / Validation
↓
SpatialEvidence
```

不要全 Pair 全算完才决定。

## 19. Cache

Cache Key：

```text
scan_id
+
frame_set_hash
+
geometry_solver_version
```

同一 Scene Scan 换人物参考图、换推荐拍法、AI 重选方向，都不重新计算 Geometry。

## 20. Privacy / Upload V0.2

明确允许：

```text
SELECTED_GEOMETRY_FRAME_UPLOAD =
FIRST_PARTY_BACKEND_ONLY
```

继续要求：

```text
RAW_VIDEO_UPLOAD = 0
FRAME_STREAM_UPLOAD = 0
PROVIDER_IMAGE_UPLOAD = 0
LUNA_IMAGE_UPLOAD = 0
```

## 21. 现有文档追加建议

- `00_SCENE_SPATIAL_NODE_OVERVIEW.md`：追加 `P2=Geometry / P3=Affordance` 并引用 V0.2。
- `01_SCENE_SCAN_AND_SPATIAL_ALGORITHM_ARCHITECTURE.md`：Production Geometry 主计算改为第一方后端；端侧为 Selector + Precheck。
- `02_PHOTOGRAPHY_DIRECTOR_AI_INPUT_OUTPUT_CONTRACT.md`：明确 `CompositionAnchorCandidate` 与 future physical `SubjectPlacementCandidate`。
- `03_CURRENT_NODE_CHECKPOINT_AND_PRODUCT_DECISIONS.md`：记录 P1 已接受、P2 V0.2、Backend Geometry next、P3 NOT_STARTED。
- `05_PHOTOGRAPHY_AFFORDANCE_AND_CANDIDATE_MODEL.md`：文件头增加 `PHASE=FUTURE P3 / NOT P2 ACCEPTANCE REQUIREMENT`。
- `06_EVIDENCE_CONFIDENCE_AND_AUTHORITY_RULES.md`：FACT/CANDIDATE/UNKNOWN 原则保持。
- `07_SPATIAL_AND_AI_ACCEPTANCE_EVALUATION_PLAN.md`：拆成 P2 Geometry / P3 Affordance / AI Director 三个 Gate。
- `08_MAIN_LIVE_INTEGRATION_MAPPING.md`：对象链更新为 `SceneScanEvidence → ViewEvidence → SpatialEvidence → future Affordance → PhotographyDirectorInput`。

## 22. 当前节点状态

```text
P0 =
ACCEPTED

P1 =
PASS_WITH_WARNING / ACCEPTED

P2 OLD JUDGMENT MODEL =
SUPERSEDED_BY_V0_2

P2 BACKEND GEOMETRY =
READY_FOR_IMPLEMENTATION

P3 PHOTOGRAPHY AFFORDANCE =
NOT_STARTED

AI DIRECTOR =
NOT_STARTED

MAIN INTEGRATION =
NOT_STARTED
```

## 23. 冻结句

> **P1 负责“往哪里看”；P2 负责“是否存在可信空间关系”；P3 负责“哪里可能可以站/坐/拍”；AI Photography Director 负责“这个具体的人最终应该怎么拍”。**

> **客户端只负责采集和快速预检查；真实 Session 的 SpatialEvidence 由第一方后端 Production Geometry Solver 生成。**
