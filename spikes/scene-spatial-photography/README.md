# Scene Spatial / Photography Track

Independent Scene Spatial track implementing `P0 SCAN → P1 VIEW → P2 GEOMETRY`. P3 Photography Affordance and AI Director are not started.

V0.2 boundaries: P1 provides view candidates and image-plane `CompositionAnchorCandidateV01`; client P2A provides routing-only `SpatialPrecheckV01`; the isolated first-party Backend is the only current-session `SpatialEvidenceV02.status` authority. Physical placement is future P3. Main Integration remains `NOT_STARTED`.

Run from this directory:

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run replay
```

Backend tests use the pinned isolated Python dependencies documented in `backend/README.md`.

Camera and motion permissions are requested only by **开始扫描**. Raw video and frame streams never upload. A bounded set of 3–8 selected 640px geometry JPEG frames may be uploaded only to the same first-party spike Backend. Provider and Luna remain zero.
