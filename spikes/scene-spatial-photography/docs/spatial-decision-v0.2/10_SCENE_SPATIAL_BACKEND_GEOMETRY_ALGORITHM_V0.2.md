# 10 — Scene Spatial Backend Geometry Algorithm V0.2

版本：`v0.2`  
定位：`P2 Production Geometry Solver Algorithm Design`  
执行位置：`FIRST-PARTY BACKEND`  
客户端角色：`Capture + GeometryFrameSelector + SpatialPrecheck`

## 1. 目标

本算法不是为了构建完整 3D，而是：

> **用同一次 Scene Scan 的少量重叠视图，在第一方后端验证是否存在足够可信的非米制多视图空间关系，并输出可被摄影系统消费的 `SpatialEvidenceV02`。**

最终不输出 dense mesh、完整 point cloud 给 AI、米制距离、真实人物站位、安全性或最终照片。

## 2. 总体链路

```text
ONE Scene Scan
↓
Client GeometryFrameSelector
↓
4–8 Geometry Frames
↓
Client SpatialPrecheck
↓
First-party Backend
↓
Input Validation
↓
Primary Pair Solve
↓
Multi-pair Verification
↓
Relative Pose
↓
Sparse Triangulation
↓
Geometry Validation
↓
SpatialEvidenceV02
```

## 3. Client Geometry Frame Preparation

不使用摄影原图直接跑 Geometry。

推荐：

```text
Display / Original Asset
= 保留摄影质量

Geometry Working Frame
= 长边 640–960 px
```

Geometry 只需要 feature、overlap、motion、pose、relative depth，不需要 12MP。

默认选择：

```text
4–8 frames
```

Spike 可以评估：

```text
min 3
max 12
```

但禁止 unbounded frame stream。

选择优先级：

```text
temporal adjacency
+
visual overlap
+
sufficient texture
+
low blur
+
usable exposure
+
small/moderate viewpoint change
+
potential parallax
```

P1 的 ViewCandidate 追求角度分散；P2 GeometryFrame 追求连续重叠，两套 Selector 不能混用。

## 4. Client SpatialPrecheck

客户端只产生 Routing Hint：

```text
UNRELIABLE
NO_SIGNAL
POSSIBLE
```

当前 grayscale、sparse feature、轻量 track/match、residual motion 等可以保留，但其绝对 pixel threshold 只属于 Spike Calibration。

例如当前：

```text
0.75 px
1.5 px
2.0 px
```

不得成为领域 Contract。

建议逐步尝试：

```text
normalized_residual =
residual_px / image_diagonal
```

或其他经受控数据验证的归一化量。

### Precheck 不拥有 Spatial Authority

`POSSIBLE` 只表示值得后台继续算。

`NO_SIGNAL` 也不等于 Backend 已经证明 Geometry 不存在。

在 Spike/Evaluation 模式中，应允许强制将 `NO_SIGNAL` 样本送到 Backend，统计 client false-negative rate。

未来调度可考虑：

```text
POSSIBLE
→ immediate solve

NO_SIGNAL
→ delayed / skip unless spatial is later requested

UNRELIABLE
→ no immediate solve / possible rescan
```

最终 `SpatialEvidence.status` 只能由 Backend Solver 产生。

## 5. Backend API Contract

建议 spike-local 定义：

```text
POST /scene-spatial/geometry/analyze
```

或等价隔离接口。

输入概念：

```json
{
  "scan_id": "scan_x",
  "frame_set_hash": "sha256...",
  "geometry_version": "p2-v0.2",
  "platform": "h5|wechat|douyin|fixture",
  "camera_model_evidence": {
    "status": "KNOWN|ESTIMATED_VALIDATED|UNKNOWN",
    "source": "..."
  },
  "client_precheck": {
    "status": "POSSIBLE",
    "diagnostics": {}
  }
}
```

真实图片建议走 multipart/file references，不把多张图片 base64 塞进 JSON。

## 6. Camera Model Evidence

Multi-view Geometry 必须显式记录 Camera Model 质量：

```text
KNOWN
ESTIMATED_VALIDATED
UNKNOWN
```

记录：

- focal/FOV source；
- principal point assumption；
- distortion assumption；
- platform/device profile；
- calibration confidence。

如果 Camera Model 证据不足，不允许因为 Essential Matrix “有输出”就自动变成 `USABLE`。

Spike 要明确：

> 哪些 Solver mode 在未知内参情况下最多只能到 `PARTIAL`。

## 7. Correspondence Primary Route

基于当前 Controlled Reference，推荐：

```text
GFTT
+
Pyramidal Lucas–Kanade
```

作为 Primary Candidate。

原因：

- Scene Scan 天然是连续时间序列；
- track continuity 比每对独立 descriptor match 更匹配输入；
- 当前受控比较中 retention、RANSAC inlier 与 latency 更好。

ORB 保留：

```text
REFERENCE / FALLBACK
```

不要删除 comparative tests。

## 8. Frame / Feature Cache

Backend 对每帧只准备一次：

```text
FrameGeometryCache
├── decoded image
├── gray
├── pyramid
├── features
├── descriptors if needed
└── quality stats
```

不要 Pair 1-2 算一次 Frame2、Pair 2-3 又重新算 Frame2。

记录：

```text
decode_ms
feature_ms
cache_reuse_count
```

## 9. Pair Selection：Primary Pair First

不要全组合。

先选择最有价值的一对：

```text
high overlap
+
good texture
+
sufficient baseline candidate
+
not excessive yaw
+
good frame quality
```

先跑：

```text
correspondence
↓
RANSAC
↓
rotation/parallax rejection
↓
pose candidate
```

如果 Primary Pair 明确失败：

```text
EARLY EXIT
→ INSUFFICIENT
```

## 10. Verification Pairs

Primary Pair 通过后，再选择约 2–3 对：

- temporal neighbor；
- wider baseline；
- different scan section。

目的不是获得最多 3D 点，而是验证：

```text
stability
coverage
consistency
```

如果 pair-to-pair solution 矛盾：

```text
PARTIAL
or
INSUFFICIENT
```

并输出 reason。

## 11. Rotation / Parallax Rejection

Backend 不再使用“所有 track 的 median dx/dy”作为最终 rotation model。

推荐：

```text
feature correspondences
↓
Homography / rotation-compatible model
↓
RANSAC residual
↓
compare against epipolar / translation-supporting model
```

Hard invariant：

```text
PURE_ROTATION_FALSE_USABLE = 0
```

Low-parallax 也不得成为 `USABLE`。

## 12. Relative Pose

Production Solver 可使用成熟 OpenCV 路线：

```text
Fundamental / Essential
↓
RANSAC
↓
recoverPose
```

具体由 `CameraModelEvidence` 决定。

允许输出：

- relative rotation；
- relative translation direction；
- pose ordering；
- pose confidence。

禁止：

```text
0.73 m
```

默认：

```text
metric_scale_available = false
```

## 13. Direction Sign Controlled Gate

受控 Fixture 必须覆盖：

```text
LEFT
RIGHT
FORWARD
BACKWARD
```

明确 canonical coordinate convention。

对有效受控 Fixture：

```text
DIRECTION_SIGN_CORRECT = 100%
```

禁止 client/backend 之间静默反号。

## 14. Triangulation

只有 correspondence + parallax + pose 都通过后才执行。

记录：

```text
triangulated_point_count
positive_depth_ratio
reprojection_error
geometry_coverage
pair_consistency
```

拒绝：

- negative-depth dominated；
- exploding geometry；
- high reprojection error；
- unstable pose；
- pair-to-pair contradiction。

## 15. Spatial Status Decision

产品层只消费 Solver 结果，不理解算法阈值。

### INSUFFICIENT

可由以下情况触发：

```text
correspondence unreliable
pure rotation
low parallax
pose invalid
camera model insufficient
triangulation invalid
```

### PARTIAL

例如：

```text
some valid geometry
BUT
coverage incomplete
OR
camera model limited
OR
multi-pair consistency warning
OR
relative depth only local
```

### USABLE

整体 Geometry Validation 通过。

仍然只代表：

```text
NON_METRIC RELATIVE GEOMETRY
```

## 16. Internal Diagnostics

建议保留：

```text
selected_frame_count
feature_count
track_count
track_lifetime
inlier_ratio
normalized_parallax
homography_residual
pose_stability
positive_depth_ratio
triangulated_point_count
reprojection_error
geometry_coverage
pair_consistency
camera_model_quality
```

全部属于 `diagnostics`，不是 Workflow state。

## 17. Relative Depth

P2 只允许：

```text
NEAR
MID
FAR
UNKNOWN
```

或等价的归一化 relative-depth zone。

来源必须明确：

```text
SPARSE_MULTI_VIEW_GEOMETRY
```

Monocular Depth 可以未来作为额外 Evidence Source，但不是 V0.2 前置条件。

## 18. Visibility / Occlusion

P2 可以输出 Geometry-only 的：

```text
visibility_evidence
occlusion_evidence
```

但不能说：

```text
safe
walkable
standable
```

Safety / physical placement 继续 UNKNOWN。

## 19. 不做 P3 Affordance

以下能力全部移到未来 P3：

```text
ground plane authority
support surface
standability
walkability
subject footprint
safe path
SIT
LEAN
CROUCH
physical SubjectPlacementCandidate
CameraPlacementCandidate
```

P2 只做 Geometry。

## 20. Backend Early Exit

正式执行方式：

```text
Input
↓
validate
↓
Primary Pair
├── fail → INSUFFICIENT
└── pass
    ↓
Verification Pairs
├── inconsistent → PARTIAL / INSUFFICIENT
└── stable
    ↓
Triangulation
↓
Validation
↓
SpatialEvidence
```

## 21. P1/P2 并行

P2 不阻塞 P1：

```text
Scene Scan Complete
│
├── P1 → ViewCandidate immediately
└── P2 → async backend job
```

P2 job 应支持：

```text
cancelable
cacheable
versioned
```

未来 AI Level 1 可以先消费 P1。

## 22. Cache

建议：

```text
GeometryCacheKey =
scan_id
+
frame_set_hash
+
geometry_solver_version
```

同一个 Scene Scan：

- 换人物参考图；
- 换推荐拍法；
- AI 重选；

均不重新计算 Geometry。

## 23. Payload / Upload

只允许第一方 Backend。

建议：

```text
4–8 frames
640–960 long edge
controlled JPEG/WebP compression
```

目标总 payload：

```text
约 1–3 MB
```

这是当前候选预算，不是永久 Contract。

记录：

```text
selected_frame_count
payload_bytes
upload_latency
```

保持：

```text
RAW_VIDEO_UPLOAD = 0
FRAME_STREAM_UPLOAD = 0
PROVIDER_IMAGE_UPLOAD = 0
LUNA_IMAGE_UPLOAD = 0
```

## 24. Performance Candidate Budget

建议第一轮工程目标：

```text
Client Precheck
P50 <100 ms
P95 <150 ms

Backend Compute
P50 <1 s
P95 <2 s

End-to-end
P50 <1.5 s
P95 <3 s
```

正式 Release Gate 需在固定后端硬件、网络和平台条件下另行锁定。

## 25. Performance 优先级

优化顺序：

1. 少算；
2. resize；
3. GeometryFrameSelector；
4. Early Exit；
5. frame/feature cache；
6. pair prioritization；
7. async；
8. session cache；
9. 再考虑 SIMD/GPU/threading。

当前不优先：

```text
client OpenCV WASM
dense 3D
NeRF
Gaussian Splatting
full SLAM
```

## 26. Platform Adaptation

客户端统一输出：

```text
SceneGeometryRequestV01
```

平台只有 Adapter 差异：

```text
H5SceneScanAdapter
WeChatSceneScanAdapter
DouyinSceneScanAdapter
```

Backend Geometry Solver 不依赖 DOM、微信 API、抖音 API 或 Chrome API。

这就是后端计算的核心适配价值。

## 27. Spike / Production 分界

当前仍是 Parallel Scene Spatial Track。

因此 Backend 优先实现为：

```text
spike-local first-party geometry service
```

不直接提升为 Main Global Backend。

未来：

```text
P2 accepted
↓
Selective Migration
↓
Main Geometry Capability
```

禁止 raw spike merge。

## 28. Acceptance

P2 Backend Geometry Spike 至少证明：

```text
backend solver runs
client payload bounded
pure rotation rejection
low parallax rejection
relative pose controlled sign
triangulation validation
SpatialEvidenceV02
cache/idempotency
performance telemetry
P1 non-blocking
privacy boundary
```

允许最终结果：

```text
P2 Geometry = PASS
P3 Affordance = NOT_STARTED
```

这就是正确收口。
