# P2 automated and replay evidence

## V0.2 current evidence — 2026-08-27

- TypeScript suite: **156/156 PASS**; client produces only `UNRELIABLE / NO_SIGNAL / POSSIBLE` routing hints.
- Backend unittest + multipart API: **8/8 PASS**, including UNKNOWN Camera Model `PARTIAL` ceiling and frame-set hash rejection.
- Controlled Backend matrix: deterministic 12/12; pure rotation and low parallax false `USABLE` = 0; direction sign 4/4; triangulation 176–180.
- Precheck confusion matrix on controlled set: false positive 0.0, false negative 0.0.
- Backend result cache: MISS → HIT, repeated compute 0ms.
- Controlled compute: P50 2.524ms, P95 60.238ms.
- Full Backend generated-media early-exit benchmark (20×, 4×640×480): compute P50 55.123ms / P95 67.039ms; payload P50 721,488B / P95 721,808B. All cases were deliberately limited planar/early-exit workloads, not successful geometry or device network evidence.
- P0 replay **11/11**, P1 replay **5/5**.
- Production H5 build: **PASS**, 52.51kB JS, no OpenCV.js/WASM asset.
- Local browser: P1 visible about 53ms after scan completion; precheck 17.7ms then 3.7ms; repeat enabled; Fixture upload 0.
- OPPO V0.2 selected-frame payload/network/end-to-end evidence: **PENDING**.

Everything below this point is retained as V0.1 historical evidence; its client Spatial Status and Controlled Reference session-authority semantics are superseded by V0.2.

Date: 2026-08-26

- TypeScript automated suite: **161/161 PASS** (P0 + P1 + P2, including near-target WIDE and bounded client-diagnostic regressions).
- Deterministic replay: **P0 11/11 + P1 5/5 PASS**.
- Typecheck: **PASS**.
- Production Vite build: **PASS**; client bundle is 49.21 kB and emits no OpenCV.js/WASM asset.
- Geometry selector: 10-frame hard cap, 250 ms minimum adjacency, quality/exposure gates and transient-memory accounting covered.
- Hard negatives: pure rotation and low parallax false `USABLE` = 0 in TypeScript and native controlled matrix.
- Privacy serialization: `SpatialEvidenceV01` contains no raw pixels; Provider/Luna/upload counters remain zero.

Browser initial page/DOM load passed. The OPPO Chrome HTTPS gate remains required after the client-runtime replacement.

OPPO continuation hotfix: coverage that displays as the target (for example QUICK 109.6° → 110.0°) now completes with a 0.5° tolerance; an incomplete scan caps the visual bar at 99%. This prevents a visually full bar from leaving the session `SWEEPING` and the repeat button disabled.

Second OPPO continuation hotfix: post-scan P2 work owns a visible `空间分析中…` gate and repeat/WIDE actions remain disabled until it returns, preventing old-scan computation from overlapping a new camera scan. A WIDE `0→150→−30` mixed-direction replay completes at 180°; retracing already-covered angles is not double-counted and is explicitly labelled in the UI.

OPPO performance continuation: GFTT/PyrLK is bounded to 10 frames, seven distributed pairs and 180 features with a smaller LK pyramid. Latest controlled two-scenario latency fell from 335.1 ms to 190.1 ms (43.3%) while retention remained 1.0 and mean RANSAC inlier ratio remained 0.929. WIDE accepts an honest 174°–180° sensor envelope; the Manifest retains the measured coverage rather than rewriting it to 180°.

QUICK completion continuation: OPPO Chrome showed `看完了` followed by `空间分析中…` for more than 30 seconds. Root cause is the 10.87 MB OpenCV.js/WASM asset parsing on the main thread; a JavaScript timeout cannot fire while parsing blocks that thread. The H5 runtime now excludes that asset and runs a four-pair/48-feature lightweight block-flow diagnostic. Synthetic global/layered-motion regression measured about 16–18 ms on the development host. This diagnostic remains at most `PARTIAL`; controlled GFTT/PyrLK remains the primary geometry reference.

Local browser UI regression ran two consecutive QUICK fixtures after the replacement: P2 completed in 12.1 ms and 3.4 ms, `再拍一次` was enabled after completion, and the browser resource inventory contained zero OpenCV requests. This is local evidence only; OPPO HTTPS confirmation remains pending.
