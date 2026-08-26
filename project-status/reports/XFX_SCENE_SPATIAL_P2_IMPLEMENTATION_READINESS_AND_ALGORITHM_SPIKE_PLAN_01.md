# XFX Scene Spatial P2 Implementation Readiness / Algorithm Spike Plan 01

Status: **READY_FOR_ALGORITHM_SPIKE / NOT_STARTED**  
Authority: `SCENE_SPATIAL_TRACK_DESIGN_AUTHORITY_V0_1`  
Source contract: `spikes/scene-spatial-photography/docs/spatial-decision-v0.1/02_PHOTOGRAPHY_DIRECTOR_AI_INPUT_OUTPUT_CONTRACT.md`

## Purpose

P2 will test the minimum Photography Geometry route needed to turn overlapping frames from the same Scene Scan into bounded spatial evidence. It is not a general 3D reconstruction project and is not started by this report.

The user still performs one Scene Scan. P1 consumes Direction Evidence; future P2 consumes overlapping frames, motion, and parallax evidence captured during that same operation.

## Admission from P1

Available and accepted with warnings:

- SceneSweepRuntime, SceneSweepManifest, and YawMap;
- SceneFrameSetV01 and SceneDirectionMapV01;
- transient selected keyframes with timestamps and relative yaw;
- View and image-plane Placement candidates;
- privacy boundary with no raw video/frame stream upload;
- provider-neutral source contract and FACT / CANDIDATE / UNKNOWN authority rules.

Missing by design:

- verified overlapping-frame retention protocol for Geometry;
- feature tracks, relative camera pose, triangulation, and sparse geometry;
- depth, support/free-space, visibility, and occlusion evidence;
- SubjectPlacementCandidate and CameraPlacementCandidate geometry authority;
- metric scale, physical safety, AI Director, Validator, Main, and Live integration.

## Minimal algorithm route

```text
overlapping frames from one Scene Scan
→ feature detection / tracking / matching
→ RANSAC outlier rejection
→ parallax diagnostic
→ essential matrix
→ recoverPose
→ triangulation
→ sparse relative geometry
→ reprojection and coverage checks
→ SpatialEvidenceStatus
```

Candidate implementations to compare:

- GoodFeaturesToTrack + pyramidal Lucas–Kanade optical flow;
- ORB + descriptor matching;
- RANSAC, essential matrix, recoverPose, and triangulation;
- OpenCV.js/WASM for a bounded browser prototype versus backend OpenCV for the heavier reference path.

Optional experiments only after the minimum route works: monocular relative depth, plane/support cues, local bundle adjustment, COLMAP backend reconstruction. NeRF, Gaussian Splatting, SLAM, dense mesh, and full dense 3D are not P2 prerequisites.

## Proposed spike phases

1. **Capture evidence audit** — prove that one P0/P1 scan can retain a bounded overlapping-frame subset plus timestamp, yaw, quality, motion, and parallax diagnostics without uploading a frame stream.
2. **Controlled correspondence** — compare GFTT/PyrLK and ORB matching on synthetic and local non-user fixtures; measure tracks, inlier ratio, direction signs, and compute cost.
3. **Relative pose and triangulation** — recover non-metric camera motion and sparse relative points; reject pure-rotation/low-parallax inputs.
4. **Spatial evidence envelope** — create `SpatialEvidenceV01` with `USABLE | PARTIAL | INSUFFICIENT`, confidence, relative depth, visibility/occlusion summaries, evidence references, and limitations.
5. **Photography affordance probe** — only when Geometry is usable, derive bounded `SubjectPlacementCandidate[]` and `CameraPlacementCandidate[]`; initial subject action is `STAND`.
6. **Device and cost gate** — test OPPO capture continuity and choose browser/WASM/backend responsibility without making raw video or frame-stream upload the default.

## Hard acceptance rules

- pure rotation or insufficient parallax must not become `USABLE`;
- false or unstable pose must be rejected;
- relative left/right and closer/farther trends must be controlled-fixture correct;
- triangulated point count, reprojection error, inlier ratio, parallax, pose stability, and geometry coverage must be recorded;
- `UNKNOWN` cannot be promoted to FACT;
- CANDIDATE cannot become final Authority;
- `metric_scale_available=false` forbids meter claims;
- free-space proxy does not imply physical safety;
- Geometry output is summarized for AI; raw point clouds are not the Photography Director contract;
- Provider, Luna, Main Integration, and Live remain outside the algorithm spike unless separately authorized.

## Intended future output

```text
SpatialEvidenceV01
├── status: USABLE | PARTIAL | INSUFFICIENT
├── geometry_type: SPARSE_RELATIVE | UNKNOWN
├── metric_scale_available: false
├── confidence and diagnostics
├── relative depth / visibility / occlusion summaries
├── SubjectPlacementCandidate[]
└── CameraPlacementCandidate[]
```

These may later combine with ViewCandidate into a bounded `CandidateShot[]`. AI Photography Director may select only existing candidates and may not invent Geometry, safety, unobserved directions, or metric distance.

## Readiness disposition

P2 planning readiness: **PASS**.  
P2 implementation: **NOT_STARTED**.  
Reason: P1 now provides a stable one-scan frame/direction/candidate envelope and explicit authority boundary, but P2 still requires a separately executed algorithm spike and evidence gate.
