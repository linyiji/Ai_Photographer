# Scene Spatial P2 Judgment Logic Review

Document status: **V0.2 REWRITTEN — OLD LOGIC SUPERSEDED**  
Design authority: `SCENE_SPATIAL_DESIGN_AUTHORITY_V0_2`  
Original draft provenance: generated before V0.2 package admission and preserved here as negative design history.

## Superseded V0.1 logic

The earlier draft described `client lightweight residual → client PARTIAL / INSUFFICIENT → controlled offline reference → possible USABLE`. That authority model is invalid. It confused a routing diagnostic with Session Spatial Authority and allowed controlled fixture output to stand in for the current user's scan.

The useful historical evidence is retained: mobile OpenCV.js/WASM caused more than 30 seconds of main-thread blocking after QUICK completion, so heavy client OpenCV remains removed.

## Canonical V0.2 chain

```text
P0 SCAN
  ↓
P1 VIEW
  ├─ SceneFrameSetV01
  ├─ SceneDirectionMapV01
  ├─ PhotographyViewCandidateV01[] (max 3)
  └─ CompositionAnchorCandidateV01[] (LEFT/CENTER/RIGHT image plane only)
  ↓
P2A CLIENT SPATIAL PRECHECK
  ├─ UNRELIABLE
  ├─ NO_SIGNAL
  └─ POSSIBLE
       authority = ROUTING_HINT_ONLY
  ↓ bounded selected geometry frames
FIRST-PARTY SPIKE BACKEND
  ↓
P2B PRODUCTION GEOMETRY SOLVER
  ├─ INSUFFICIENT
  ├─ PARTIAL
  └─ USABLE
       status_authority = FIRST_PARTY_BACKEND_GEOMETRY_SOLVER
  ↓
future P3 PHOTOGRAPHY AFFORDANCE (NOT_STARTED)
  ↓
future AI PHOTOGRAPHY DIRECTOR (NOT_STARTED)
```

## P1 terminology

`LEFT_THIRD / CENTER / RIGHT_THIRD` are `CompositionAnchorCandidateV01` values. They identify image-plane composition anchors only. The deprecated serialized `placement_candidates` property remains a compatibility alias to the same anchor array; it does not provide physical coordinates, standability, walkability or safety.

Physical `SubjectPlacementCandidate` and `CameraPlacementCandidate` belong to future P3 and are not implemented by P1 or P2.

## Client precheck decision

The client keeps a bounded lightweight block-flow diagnostic. It uses at most four distributed pairs, downsamples diagnostic work to a maximum width of 160px, and reports normalized residuals against image diagonal.

- `UNRELIABLE`: fewer than 3 selected frames, fewer than 20 tracks, motion inlier ratio below 0.35, or a correspondence failure;
- `NO_SIGNAL`: reliable lightweight matching but normalized residual remains below the calibrated signal threshold;
- `POSSIBLE`: normalized median residual is at least 0.01 and backend solving is recommended.

Historical pixel classifications remain diagnostics for calibration comparison only. They are not product states. In evaluation mode, `NO_SIGNAL` may still be sent to Backend to measure false negatives. Client precheck cannot emit `INSUFFICIENT`, `PARTIAL` or `USABLE`.

## Backend decision

The isolated first-party backend accepts one multipart request containing 3–8 selected JPEG geometry frames, metadata, relative yaw, client precheck and explicit Camera Model Evidence. It never accepts raw video or an unbounded frame stream.

The solver uses one-time frame decode/gray/GFTT caches; Primary Pair selection; GFTT + pyramidal LK; homography RANSAC residual rejection; Essential Matrix and `recoverPose`; sparse triangulation; 2–3 verification pairs; an explicit Camera Model ceiling; and a cache keyed by `scan_id + frame_set_hash + solver_version`.

Only this Backend Solver produces current-session `SpatialEvidenceV02.status`.

## Status meaning

- `INSUFFICIENT`: correspondence unreliable, pure rotation, low parallax, invalid pose, invalid triangulation, or no trustworthy geometry;
- `PARTIAL`: some geometry is supported, but camera evidence, coverage or multi-pair consistency is limited;
- `USABLE`: backend multi-view validation passes.

`USABLE` remains non-metric sparse relative geometry. It never means meters, safe, walkable, standable or a final photography plan. With H5 Camera Model Evidence currently `UNKNOWN`, a real Session has a legitimate `PARTIAL` ceiling even if pose and triangulation otherwise work.

## Controlled Reference role

Controlled fixtures are `ALGORITHM_VALIDATION_AUTHORITY_NOT_SESSION_AUTHORITY`. They verify determinism, hard-negative rejection, direction sign, triangulation, cache and threshold calibration. Their result is never copied into a user's Session.

## Async and privacy

After scan completion, P1 renders immediately. Precheck releases repeat controls. Backend Geometry runs asynchronously, is cancelable, cacheable and versioned; a new scan cancels the previous in-flight request.

```text
RAW_VIDEO_UPLOAD = 0
FRAME_STREAM_UPLOAD = 0
SELECTED_GEOMETRY_FRAME_UPLOAD = FIRST_PARTY_BACKEND_ONLY
PROVIDER = 0
LUNA = 0
REAL_USER_MEDIA_IN_GIT = 0
```

## Current disposition

P0 is accepted; P1 is accepted with warning; P2 Client Precheck and spike Backend are implemented; the V0.2 OPPO upload/network gate remains pending. P3 Affordance, Subject/Camera physical placement, AI Director and Main Integration remain `NOT_STARTED`.
