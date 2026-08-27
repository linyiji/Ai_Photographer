# XFX_SCENE_SPATIAL_P2_MINIMUM_PHOTOGRAPHY_GEOMETRY_ALGORITHM_SPIKE_01

Status: **MANUAL_REVIEW_REQUIRED — OPPO K11 gate pending**  
Authority: `SCENE_SPATIAL_TRACK_DESIGN_AUTHORITY_V0_1`  
Start Head: `1380a741f54b144d52d9013e855257a9268ccf8f`  
P1 Accepted Runtime: `f0e8baf6600f52ca6f8d509cc959b4edc04e93ee`

## Current disposition

The bounded P2 implementation and controlled algorithm gates are complete. Final P2 classification is intentionally withheld because the required OPPO K11 / Chrome Mobile one-scan gate has not yet been executed. The spike is not production geometry and Main Integration remains `NOT_STARTED`.

## Architecture and one-scan capture

P0/P1 retain angularly diverse keyframes. P2 adds an independent `GeometryFrameSelector` in the same frame callback, favoring temporal overlap, texture/quality and small-to-moderate view change. It retains at most 10 frames (within the authorized 8–20 envelope), with measured byte accounting and no persistence. The core contract is `SceneScanGeometryInputV01`; DOM/camera acquisition stays in the platform adapter.

## Correspondence comparison

Pinned OpenCV 4.12 controlled Web fixtures compared both required routes:

| Route | Mean retention | Mean RANSAC inlier ratio | Two-scenario latency | Failures | Disposition |
|---|---:|---:|---:|---:|---|
| GFTT + PyrLK | 1.000 | 0.929 | 190.1 ms | 0 | **PRIMARY** |
| ORB + BF matching | 0.520 | 0.438 | 562.9 ms | 0 | REFERENCE/FALLBACK |

The selection is measured, not theoretical. Evidence: `opencvjs-correspondence-comparison.json`.

## Parallax, pose and triangulation

The deterministic native OpenCV reference uses homography RANSAC residuals for the hard parallax gate, followed only when eligible by Essential Matrix RANSAC, `recoverPose` and triangulation. Camera convention is X-right/Y-down/Z-forward; recovered center is `-Rᵀt`.

- 12/12 controlled scenarios deterministic;
- pure rotation: `ROTATION_DOMINANT / INSUFFICIENT`, false `USABLE` = 0;
- low parallax: `LOW_PARALLAX / INSUFFICIENT`, false `USABLE` = 0;
- LEFT/RIGHT/FORWARD/BACKWARD direction sign: 4/4 correct;
- lateral, forward, backward and mixed translation: `USABLE` in controlled reference;
- usable cases: 176–180 triangulated points, positive-depth ratio 1.0, controlled noiseless reprojection median 0 px;
- weak texture, repetitive texture, blur, exposure failure and insufficient frames: `INSUFFICIENT`.

The noiseless zero reprojection figure is fixture evidence only and is not a device expectation.

## Browser/WASM vs backend reference

The pinned OpenCV.js runtime exposes GFTT, PyrLK, ORB and homography. Its actual runtime does not expose Essential Matrix, `recoverPose` or triangulation despite broad TypeScript declarations. Therefore:

- client/WASM: bounded frame selection, correspondence and parallax diagnostics;
- controlled native/backend reference: pose, triangulation and geometry validation;
- client translation evidence is at most `PARTIAL`; rotation/low-parallax is `INSUFFICIENT`;
- no per-frame backend requests are introduced.

## SpatialEvidenceV01 and relative depth

Implemented fields include status, geometry type, non-metric flag, confidence, correspondence/parallax/pose/triangulation diagnostics, relative motion, relative depth, visibility/occlusion proxies, evidence refs, limitations, reasons and zero-network privacy counters.

Validated sparse geometry may produce relative `NEAR/MID/FAR`; metric distance remains UNKNOWN. Visibility/occlusion is sparse proxy only, with no semantic object claim.

## Photography Affordance

**NOT_YET_PASS.** Sparse geometry does not establish support surface, free space or physical safety. `support_evidence` and `free_space_evidence` remain UNKNOWN. No authoritative subject STAND zone is created. Direction-only CameraPlacement candidates are technically possible only after `SpatialEvidence=USABLE`; `CandidateShotV01` is not reached without valid subject evidence.

## Performance and privacy

- geometry budget: max 10 frames / max 7 distributed adjacent pairs / max 180 GFTT points;
- real capture analysis size: 160 px wide RGBA;
- OpenCV.js is lazy-loaded after scan completion (10.87 MB build asset);
- controlled native total: 0.2–64.7 ms per scenario on this workstation;
- latest controlled Web two-scenario comparison: 190–563 ms by route; GFTT fell 43.3% from the preceding 335 ms run;
- Provider/Luna/raw video upload/frame stream upload: 0;
- real-user raw media in Git: 0;
- metric scale and physical safety authority: NO.

Device latency/memory/UX numbers remain pending and no arbitrary device performance PASS is claimed.

## Regression

- automated suite: 158/158 PASS, including near-target WIDE, QUICK→reversed-WIDE and bounded correspondence regressions;
- replay: P0 11/11 + P1 5/5 PASS;
- P1 max 3 ViewCandidates, region/candidate separation and LEFT/CENTER/RIGHT markers preserved;
- typecheck and production build PASS;
- initial browser DOM PASS; post-WASM Fixture inspection timed out and is not counted as browser PASS.

The OPPO continuation exposed a display/runtime boundary defect: 109.6° rendered as a full 110° bar while strict runtime completion still required 110.0°. The runtime now uses a matching 0.5° completion tolerance, incomplete visual progress is capped at 99%, and the completed action is restored synchronously as “再拍一次”.

A following OPPO run exposed overlap between completed-scan P2/WASM work and the next WIDE scan. Repeat actions are now gated by a visible `空间分析中…` state until P2 returns. Mixed reversal over an already-covered arc now displays an explicit retrace message; replay proves `0→150→−30` produces 180° unique coverage and completes as `MIXED` without leaking QUICK state.

The next OPPO run showed prolonged QUICK analysis and WIDE stalling in the final few degrees. The client now prefetches (but does not execute) the WASM asset during scanning, reduces geometry work to the measured 10-frame/7-pair envelope, and accepts WIDE at an honest sensor tolerance of 174° while preserving the actual Manifest coverage. The UI labels WIDE as approximately 180°.

## OPPO and final gate

Required OPPO K11 runs (rotation, lateral, forward/back, mixed) remain pending. The mostly-rotation scan must never be `USABLE`. Final `PASS / PASS_WITH_WARNING / FAIL` and integration-manifest update must wait for these exports and qualitative results.

## Integration and productization

`main_integration_status = NOT_STARTED`; migration remains `SELECTIVE_MIGRATION_ONLY_NO_RAW_SPIKE_MERGE`. Do not merge raw spike code to Main. Recommended productization is a small platform capture adapter plus portable geometry core, with a deliberately chosen pose runtime; do not make full SLAM, NeRF, Gaussian Splatting or dense mesh prerequisites.

Current P2 disposition: `MANUAL_REVIEW_REQUIRED`  
Main Integration: `NOT_STARTED`  
Integration manifest: unchanged until OPPO P2 Gate  
Next: user-operated OPPO K11 one-scan gate; do not automatically start another task.
