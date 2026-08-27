# P2 minimum photography geometry spike v0.1

> HISTORICAL V0.1 IMPLEMENTATION EVIDENCE: V0.2 supersedes the client `PARTIAL/INSUFFICIENT` and Controlled Reference session-authority semantics below. Current client output is `SpatialPrecheckV01` (`UNRELIABLE/NO_SIGNAL/POSSIBLE`, routing-only); current-session `SpatialEvidenceV02.status` is first-party Backend-only. P3 physical placement is not a P2 responsibility.

## Boundary

P2 is an internal capability branch of the same user-operated Scene Scan. `GeometryFrameSelector` observes the existing local frame callback independently from the P0/P1 angular keyframe sampler. It retains at most 10 160px-wide RGBA frames in transient browser memory; it never uploads or persists them.

```text
Platform Capture Adapter
  ├─ P0 angular sampler → P1 frame/direction/view candidates (max 3)
  └─ GeometryFrameSelector → SceneScanGeometryInputV01 (max 10)
       → lightweight block flow → robust global-motion residual / parallax diagnostic
       → SpatialEvidenceV01
```

The H5 client deliberately excludes OpenCV.js/WASM after OPPO Chrome showed more than 30 seconds of main-thread loading/parsing after QUICK completion. It uses only a bounded overlap/parallax diagnostic and never promotes a device result above `PARTIAL`; GFTT/PyrLK, pose and triangulation remain controlled reference responsibilities until a portable implementation is validated.

The mobile envelope uses at most four distributed adjacent pairs and 48 local gradient features per pair with a bounded 3×3 block search. It estimates a robust global image displacement and treats only residual motion as a parallax diagnostic. It makes no RANSAC, pose, triangulation or metric claim. Controlled OpenCV comparison still selects GFTT/PyrLK over ORB as the primary reference engine.

## Coordinate and authority convention

- camera coordinates: X right, Y down, Z forward;
- recovered camera center: `C2 = -Rᵀt`;
- relative motion is direction-only and non-metric;
- relative yaw and validated direction are FACT;
- subject/camera/shot proposals are CANDIDATE;
- metric distance, support surface and physical safety are UNKNOWN.

## Gates

`USABLE` requires translation evidence, robust correspondence, stable pose, at least 20 triangulated points, positive-depth ratio ≥ 0.75 and reprojection error ≤ 2 px. Pure rotation and low parallax are hard negatives regardless of an Essential Matrix solution.

Sparse geometry may expose NEAR/MID/FAR categories and bounded visibility/occlusion proxies. It cannot establish support or free space, so P2 does not manufacture an authoritative STAND zone and does not form `CandidateShotV01` without valid subject affordance.

## Portability

Contracts and evidence classification contain no DOM APIs. Camera acquisition is an adapter and the lightweight diagnostic is portable TypeScript. This preserves a path to WeChat/Douyin Mini Program adapters without creating a cross-Worktree runtime dependency.
