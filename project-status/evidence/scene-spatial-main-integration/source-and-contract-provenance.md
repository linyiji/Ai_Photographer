# Scene Spatial source and contract provenance

- Task: `XFX_MAIN_SCENE_SPATIAL_V02_SELECTIVE_INTEGRATION_05`
- Formal accepted source-track head: `68999dbc8c8332d789f7f74a094b2b02cd9cbae0`
- Accepted algorithm/runtime implementation commit referenced by that source track: `ed0449efaefdcb30e1f20859656757ce77c43b14`
- Source worktree: `D:\Projects\_worktrees\Ai_Photographer-scene-spatial`
- Source disposition: `READ_ONLY_ACCEPTED_SOURCE`
- Integration mode: `SELECTIVE_MIGRATION`

The source worktree was inspected without modification. The difference from the accepted algorithm commit to the formal source head contains acceptance documentation/manifest changes, not Geometry algorithm changes.

Main adds language-neutral JSON Schema contracts for SceneScanEvidence V0.1, SceneFrameSet V0.1, SceneDirectionMap V0.1, ViewEvidence V0.1, SpatialPrecheck V0.1, SceneGeometryRequest V0.1, SpatialEvidence V0.2, and SceneSpatialSessionState V0.1. Source labels `0.1` and `0.2` map to Main semantic schema versions `0.1.0` and `0.2.0`; meaning and authority are preserved.

The accepted solver was selectively adapted into the existing FastAPI application under `apps/api/app/scene_spatial/`. No spike server, UI, cache runtime, or source worktree was copied wholesale. The algorithm gate remains closed: accepted selection, rotation/low-parallax rejection, multi-pair verification, early exit, camera-model semantics, client 640 px working edge, backend 960 px maximum, exact binary hash, and ordered frame-set hash are retained. Python 3.14-compatible NumPy/OpenCV dependency bounds are runtime compatibility only, not algorithm retuning.
