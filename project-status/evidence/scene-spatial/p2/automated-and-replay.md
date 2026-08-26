# P2 automated and replay evidence

Date: 2026-08-26

- TypeScript automated suite: **151/151 PASS** (P0 + P1 + P2 after final additions).
- Deterministic replay: **P0 11/11 + P1 5/5 PASS**.
- Typecheck: **PASS**.
- Production Vite build: **PASS**; OpenCV.js emitted as a lazy 10,872.78 kB asset.
- Geometry selector: 16-frame hard cap, 120 ms minimum adjacency, quality/exposure gates and transient-memory accounting covered.
- Hard negatives: pure rotation and low parallax false `USABLE` = 0 in TypeScript and native controlled matrix.
- Privacy serialization: `SpatialEvidenceV01` contains no raw pixels; Provider/Luna/upload counters remain zero.

Browser initial page/DOM load passed. In-app Fixture post-WASM result inspection timed out and is not counted as browser PASS. The OPPO Chrome HTTPS gate remains required.
