# P2 automated and replay evidence

Date: 2026-08-26

- TypeScript automated suite: **158/158 PASS** (P0 + P1 + P2, including near-target WIDE and bounded correspondence regressions).
- Deterministic replay: **P0 11/11 + P1 5/5 PASS**.
- Typecheck: **PASS**.
- Production Vite build: **PASS**; OpenCV.js emitted as a lazy 10,872.78 kB asset.
- Geometry selector: 10-frame hard cap, 250 ms minimum adjacency, quality/exposure gates and transient-memory accounting covered.
- Hard negatives: pure rotation and low parallax false `USABLE` = 0 in TypeScript and native controlled matrix.
- Privacy serialization: `SpatialEvidenceV01` contains no raw pixels; Provider/Luna/upload counters remain zero.

Browser initial page/DOM load passed. In-app Fixture post-WASM result inspection timed out and is not counted as browser PASS. The OPPO Chrome HTTPS gate remains required.

OPPO continuation hotfix: coverage that displays as the target (for example QUICK 109.6° → 110.0°) now completes with a 0.5° tolerance; an incomplete scan caps the visual bar at 99%. This prevents a visually full bar from leaving the session `SWEEPING` and the repeat button disabled.

Second OPPO continuation hotfix: post-scan P2/WASM work now owns a visible `空间分析中…` gate and repeat/WIDE actions remain disabled until it returns, preventing old-scan computation from overlapping a new camera scan. A WIDE `0→150→−30` mixed-direction replay completes at 180°; retracing already-covered angles is not double-counted and is explicitly labelled in the UI.

OPPO performance continuation: GFTT/PyrLK is bounded to 10 frames, seven distributed pairs and 180 features with a smaller LK pyramid. Latest controlled two-scenario latency fell from 335.1 ms to 190.1 ms (43.3%) while retention remained 1.0 and mean RANSAC inlier ratio remained 0.929. WIDE accepts an honest 174°–180° sensor envelope; the Manifest retains the measured coverage rather than rewriting it to 180°.
