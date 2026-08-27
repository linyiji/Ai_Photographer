# XFX Scene Spatial P2 Backend Geometry Runtime and Judgment Simplification 01

Status: **PASS_WITH_WARNING — OPPO V0.2 network/device continuation pending**  
Design authority: `SCENE_SPATIAL_DESIGN_AUTHORITY_V0_2`  
Track: `PARALLEL_SCENE_SPATIAL`

## Package provenance

- package: `SCENE_SPATIAL_V0.2_BACKEND_GEOMETRY_UPDATE.zip`;
- size: 20,517 bytes;
- SHA-256: `57C3F68647F0EAD46F9BD48FFD7F243D01BDE97403D1BD0F00043761DCA6D1FF`;
- controlled extraction: `D:\Projects\_bootstrap\scene-spatial-v0.2-package`;
- manifest/SHA256SUMS verification: PASS for all four listed files;
- archive/staging content committed to repository: NO; only selectively imported design documents are tracked.

## Architecture and terminology

V0.2 is implemented as `P0 SCAN → P1 VIEW → P2 GEOMETRY → future P3 AFFORDANCE → future AI DIRECTOR`. Client `SpatialPrecheckV01` is routing-only. Current-session `SpatialEvidenceV02.status` is emitted only by the first-party spike-local backend. Controlled Reference is algorithm-validation authority only.

The supplied 09/10 V0.2 authority documents are imported under `docs/spatial-decision-v0.2/`. V0.1 remains historical with bounded amendments.

P1 canonical output is `CompositionAnchorCandidateV01` with `IMAGE_PLANE_COMPOSITION_ANCHOR_ONLY` authority. The accepted `placement_candidates` property is a deprecated alias. P1 retains maximum three ViewCandidates and one region may still produce three candidates. Physical placement and STAND/SIT/LEAN/CROUCH are future P3 and are not implemented.

## Client SpatialPrecheckV01

The H5 client retains lightweight block flow and no OpenCV.js/WASM bundle. Diagnostic work uses at most four pairs and maximum 160px width. Residual is normalized by image diagonal. Output is only `UNRELIABLE / NO_SIGNAL / POSSIBLE`, always `ROUTING_HINT_ONLY`.

The Geometry selector is independent from P1, retains at most 8 frames, enforces 250ms adjacency, ≤18° yaw step and blur/exposure gates, and stores 640px-long-edge working frames for real H5 capture. Fixture data is never uploaded.

## First-party backend

Implemented under `spikes/scene-spatial-photography/backend/`, with pinned `numpy==2.2.6` and `opencv-python-headless==4.12.0.88`.

`POST /scene-spatial/geometry/analyze` accepts multipart metadata plus 3–8 JPEG frames, with a 6 MiB request ceiling. The H5 same-origin proxy is active. The backend uses a one-time frame decode/gray/GFTT cache, Primary Pair first, GFTT/PyrLK, homography residual rejection, Essential/recoverPose, sparse triangulation, 2–3 verification pairs, validation and idempotent result cache. ORB comparative evidence remains historical and was not deleted.

## Camera model and SpatialEvidenceV02

`CameraModelEvidenceV01` explicitly records `KNOWN / ESTIMATED_VALIDATED / UNKNOWN`, focal source, principal-point assumption, distortion assumption, device profile and confidence. Current H5 emits `UNKNOWN`; therefore `PARTIAL` is a legitimate ceiling.

Backend V02 output includes status, Backend-only authority, confidence, non-metric geometry type, relative camera motion, NEAR/MID/FAR relative depth source, coverage, bounded visibility/occlusion evidence, limitations, evidence refs and internal diagnostics. It does not expose raw point clouds to product or AI inputs.

## Controlled acceptance

- twelve scenarios deterministic;
- pure rotation false `USABLE`: 0;
- low parallax false `USABLE`: 0;
- LEFT/RIGHT/FORWARD/BACKWARD: 4/4;
- usable translation triangulation: 176–180 points;
- weak/repetitive/blur/exposure/insufficient cases: `INSUFFICIENT`;
- precheck false-positive rate: 0.0;
- precheck false-negative rate: 0.0;
- cache: MISS then HIT; second compute 0ms;
- algorithm-validation compute P50 2.524ms / P95 60.238ms.

These are controlled workstation timings, not device/network performance.

A separate 20-run generated-media full Backend early-exit benchmark includes JPEG decode, frame/feature cache, Primary Pair and validation: compute P50 55.123ms / P95 67.039ms; local process wall P50 56.004ms / P95 68.193ms. Four 640×480 JPEG frames measured payload P50 721,488 bytes / P95 721,808 bytes. All generated planar workloads correctly early-exited `INSUFFICIENT`; these numbers do not represent a successful pose/triangulation workload or OPPO network latency.

## H5 behavior and privacy

P1 renders without awaiting Backend. Precheck releases repeat controls; Backend is asynchronous and cancelable. Local QUICK Fixture showed P1 about 53ms after scan completion, precheck 17.7ms first run and 3.7ms repeat, with repeat enabled. Fixture explicitly performed no Backend upload.

The client encodes selected JPEG frames at quality 0.78. Count is bounded to 3–8; real H5 target is 4–8 at 640px long edge. Exact OPPO payload bytes and upload/end-to-end latency remain pending.

```text
RAW_VIDEO_UPLOAD = 0
FRAME_STREAM_UPLOAD = 0
SELECTED_GEOMETRY_FRAME_UPLOAD = FIRST_PARTY_BACKEND_ONLY
PROVIDER = 0
LUNA = 0
REAL_USER_MEDIA_IN_GIT = 0
```

## Regression and disposition

- TypeScript: 156/156 PASS;
- Backend unittest/API: 8/8 PASS;
- P0 replay: 11/11 PASS;
- P1 replay: 5/5 PASS;
- H5 production build: PASS, 52.51kB JS, no OpenCV client asset;
- Backend same-origin health: PASS;
- P1 blocking: NO;
- P3 Affordance: NOT_STARTED;
- physical placement: NOT_STARTED;
- Main Integration: NOT_STARTED.

P2 Backend Geometry is `PASS_WITH_WARNING`: core solver and Authority boundaries pass; H5 Camera Model Evidence is UNKNOWN and OPPO selected-frame upload/end-to-end P50/P95 remain pending.
