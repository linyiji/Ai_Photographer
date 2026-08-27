# P2 minimum photography geometry spike v0.1

## Boundary

P2 is an internal capability branch of the same user-operated Scene Scan. `GeometryFrameSelector` observes the existing local frame callback independently from the P0/P1 angular keyframe sampler. It retains at most 10 160px-wide RGBA frames in transient browser memory; it never uploads or persists them.

```text
Platform Capture Adapter
  ├─ P0 angular sampler → P1 frame/direction/view candidates (max 3)
  └─ GeometryFrameSelector → SceneScanGeometryInputV01 (max 10)
       → GFTT + PyrLK → homography RANSAC residual / parallax class
       → SpatialEvidenceV01
```

The H5 client uses OpenCV.js only after scan completion. The pinned Web build exposes GFTT, PyrLK, ORB and homography, but not Essential Matrix, `recoverPose`, or triangulation. Therefore a device result is never promoted above `PARTIAL`; robust pose/triangulation is a controlled native reference responsibility until a portable implementation is validated.

The mobile envelope uses at most seven distributed adjacent pairs, 180 GFTT points, a 15×15 LK window and two pyramid levels. The WASM asset is fetched into browser cache during scanning, but is not parsed or executed until the scan has completed.

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

Contracts and evidence classification contain no DOM APIs. Camera acquisition and OpenCV loading are adapters. This preserves a path to WeChat/Douyin Mini Program adapters without creating a cross-Worktree runtime dependency.
