# 01 — Scene Scan and Spatial Algorithm Architecture

> V0.2 AUTHORITY AMENDMENT: Production Geometry executes in the first-party Backend Solver. The client owns Capture, GeometryFrameSelector, resize/compression, quality and `SpatialPrecheckV01` only. Controlled Reference validates algorithms and never supplies a user's Session evidence. P3 Affordance is not a P2 acceptance dependency.

## 1. 目标

在微信/抖音小程序的一次 Scene Scan 中，同时采集 Direction Evidence 与潜在 Spatial Evidence。Spatial 算法的目标是摄影几何，不是通用 3D 展示。

## 2. 单次扫描采集

端侧采集：

- Camera frame / selected frame
- timestamp
- relative yaw
- device orientation
- frame width / height
- blur / exposure / quality
- motion / parallax evidence
- optional device motion / IMU

默认不持久化原始视频、全量帧流、全量 IMU。

## 3. Direction Path

```text
Camera
↓
Frame Sampling
↓
Frame Quality
↓
Relative Yaw
↓
Keyframe Selection
↓
SceneFrameSet
↓
SceneDirectionMap
```

## 4. Spatial Evidence 最小链路

```text
Overlapping Frames
↓
Feature Detection
↓
Feature Tracking / Matching
↓
RANSAC
↓
Essential Matrix / Relative Pose
↓
Triangulation
↓
Sparse Relative Geometry
↓
Spatial Confidence
```

候选成熟算法：

- GoodFeaturesToTrack
- ORB
- Pyramidal Lucas-Kanade Optical Flow
- Descriptor Matching
- RANSAC
- Essential Matrix
- recoverPose
- triangulation

实现可根据平台选择 OpenCV.js / WASM / 后端 OpenCV。

## 5. 算法分级

### MUST_HAVE
- Feature/Track/Match
- Parallax
- Inlier ratio
- Relative camera motion
- Sparse geometry
- Reprojection quality
- `SpatialEvidenceStatus`
- Relative depth/visibility summary
- Affordance candidate generation

### OPTIONAL_ENHANCEMENT
- Monocular relative depth
- Plane / support surface
- Ground-like support
- Occlusion map
- Multi-view track chaining
- Local bundle adjustment

### FUTURE
- COLMAP SfM/MVS
- Gaussian Splatting
- NeRF
- SLAM/VIO
- Metric-scale reconstruction
- Full 3D mesh

Future 能力不得成为当前闭环成立的前置条件。

## 6. 为什么原地 360° 不等于 3D

纯旋转的 Camera 光心基本不变，Direction Map 很好，但视差不足，真实深度与现实站位推断较弱。

因此统一 Scene Scan 应鼓励：
> 缓慢转动 + 自然轻微位移

但仍保持一次操作。

## 7. Spatial Evidence Gate

`SpatialEvidenceStatus` 仅允许：
- `USABLE`
- `PARTIAL`
- `INSUFFICIENT`

判断依据可包括：
- matched feature count
- track lifetime
- inlier ratio
- median parallax
- pose stability
- triangulated point count
- reprojection error
- geometry coverage

## 8. 小程序与后端分工

### 小程序
- Camera lifecycle
- Frame sampling
- yaw/orientation
- quality
- keyframe
- basic motion/parallax gate
- privacy gate

### 后端
- Feature matching
- Pose estimation
- Triangulation
- Sparse geometry
- Optional depth
- Optional heavy reconstruction
- Geometry normalization
- Affordance/Candidate generation

## 9. Monocular Depth

可以补充前景/中景/背景与遮挡，但默认不是米制距离 Authority。

## 10. COLMAP

作为后端可选重建能力，在 Spatial Evidence 足够且确实有决策价值时启用；不要求每次 Scan 都跑完整重建。

## 11. Geometry 给 AI 的最终产物

不是 Point Cloud，而是：

```text
SpatialSummary
├── status
├── confidence
├── relative_depth
├── foreground/midground/background
├── occlusion
├── support/free-space
├── SubjectPlacementCandidate[]
└── CameraPlacementCandidate[]
```
