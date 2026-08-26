# Scene Spatial / Photography Track

Independent P0 exploration of where and which direction to shoot. It owns a local Scene Sweep runtime: rear-camera preview, relative yaw, useful angular coverage, bounded quality-aware keyframes, deterministic manifest, YawMap, and offline replay.

Boundaries: Scene Spatial answers **WHERE / WHICH DIRECTION / WHICH AREA**. Live answers how to align to an already-selected target. Main owns Session, Workflow, and product integration. This spike is not a panorama stitcher, Photography Director AI, or a Main `PhotographySession`.

Run from this directory:

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run replay
```

Camera and motion permissions are requested only by the **开始扫描** user action. Runtime data and transient keyframes remain in browser memory; the export contains scalar metadata only.
