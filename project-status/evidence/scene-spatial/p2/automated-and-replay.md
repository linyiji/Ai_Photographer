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
- OPPO V0.2 selected-frame runtime: **PASS_WITH_WARNING**; exact closure evidence is recorded below.

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

## Backend frame identity and bounded working-image remediation 02

- Real-device negative evidence retained: `sweep-1787832539640` returned HTTP 400 `FRAME_SET_HASH_MISMATCH`; a superseded request displayed `CANCELLED` locally while the backend still recorded 400; a two-frame attempt correctly remained `NOT_REQUESTED`.
- Canonical binary identity: per-frame SHA-256 of exact uploaded JPEG bytes; ordered frame-set hash over compact UTF-8 `[[frame_id, frame_sha256], ...]`.
- Browser-style multipart binary preservation, including CRLF, NUL and high-byte patterns: PASS.
- One-byte mutation, wrong declared frame-set hash and frame ordering negative tests: PASS.
- Request → validation → Solver → `SpatialEvidenceV02` local HTTP integration: PASS.
- Resize matrix: `1080×1920 → 360×640`, `1920×1080 → 640×360`, `1200×1200 → 640×640`, `300×500 → 300×500`, `500×300 → 500×300`: PASS.
- Backend resolution validation accepts bounded cases and rejects `640×1138` / 961px long edge: PASS.
- Current frontend tests: 160/160 PASS; backend tests: 13/13 PASS; production build: PASS (55.93kB JS); controlled semantic matrix deterministic and all prior algorithm gates PASS.
- OPPO QUICK `sweep-1787994955242`: HTTP 200; 5/5 `1080×1920 → 360×640`; payload 124,485B; Solver reached; `SpatialEvidenceV02 = INSUFFICIENT / PURE_ROTATION_OR_HOMOGRAPHY_DOMINANT`; Solver compute 29.716ms; end-to-end 4,606.3ms.
- OPPO WIDE `sweep-1787994900356`: HTTP 200; 7/7 `1080×1920 → 360×640`; payload 220,363B; Solver reached; `SpatialEvidenceV02 = INSUFFICIENT / LOW_PARALLAX`; Solver compute 106.005ms; end-to-end 9,037.8ms.
- Both exact uploaded-JPEG hashes and canonical ordered frame-set hashes were accepted. The real-device runtime gate is **PASS_WITH_WARNING**. The tested `multipart_parse` timing includes request-body receipt; use `backend_timing_ms.total_compute` for Solver compute. End-to-end latency remains the warning, and these two mode-specific samples do not establish P50/P95.
- No additional scan is requested. Geometry semantics remain unchanged; P3 and Main Integration remain not started.

## E2E latency decomposition and async runtime optimization 03

- Client/backend monotonic waterfall, `geometry_request_id`, corrected post-body multipart timing and `TRANSPORT_AND_QUEUE_REMAINDER`: PASS.
- Same-class localhost cold/warm and HTTPS Quick Tunnel three-request sequences: PASS; binary multipart, cache identity and privacy preserved.
- P1 non-blocking browser gate: PASS; P1 remains visible and repeat/WIDE/mode controls remain enabled during Geometry enhancement.
- OPPO QUICK `sweep-1788139706806`: 8 frames / 223,887B / HTTP 200 / `SpatialEvidenceV02 = PARTIAL`; E2E 2,129.900ms; transport remainder 1,108.040ms; Solver 273.140ms.
- OPPO WIDE `sweep-1788139727740`: 3 frames / 94,007B / HTTP 200 / `SpatialEvidenceV02 = INSUFFICIENT`; E2E 1,201.400ms; transport remainder 954.416ms; Solver 17.343ms.
- Final runtime disposition: `PASS_WITH_WARNING / ACCEPTED_WITH_LATENCY_WARNING`; real-device primary latency `TRANSPORT`; Geometry algorithm unchanged; no additional scan requested.
