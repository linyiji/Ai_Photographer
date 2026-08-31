# Decoupling and provider acceptance

The connected boundary is:

`PhotographySession / Main composition -> SceneSpatialCoordinator -> SceneSpatialPort -> Real/Fake/Replay adapter -> capability implementation`

Main consumes only versioned scan/view/precheck/spatial evidence, geometry identity, normalized completion events, and evidence references. The solver and OpenCV imports remain backend module-private. Main reducers and workflow state are not mutated by the Scene Spatial implementation.

Acceptance:

- `MODULE_DECOUPLING = PASS`
- `SCENE_SPATIAL_PORT = PASS`
- `CAPABILITY_PROVIDER_SWITCH = PASS`
- `MAIN_WITH_FAKE_SCENE_SPATIAL = PASS`
- `MAIN_WITH_REPLAY_SCENE_SPATIAL = PASS`
- `MAIN_WITH_REAL_SCENE_SPATIAL = PASS_WITH_WARNING`
- `SCENE_SPATIAL_STANDALONE = PASS`
- `CROSS_MODULE_PRIVATE_IMPORTS = 0`
- `SCENE_SPATIAL_DIRECT_WORKFLOW_MUTATION = 0`

`SCENE_SPATIAL_MODE=REAL|FAKE|REPLAY` is compile/development configuration and does not alter business contracts. The Main app composition root constructs the capability without starting a camera, scan, network call, or UI effect.

One scan returns P1 ViewEvidence immediately as `VIEW_READY_GEOMETRY_PENDING`; Geometry completes asynchronously. Successful solver rejection produces `SpatialEvidenceV02.status=INSUFFICIENT`. Transport/backend failure produces no SpatialEvidence and the normalized `GEOMETRY_FAILED`/`NOT_PRODUCED` outcome. PARTIAL, INSUFFICIENT, failure, and supersession preserve the P1 view-only product path.

Session persistence contains domain refs/evidence, Geometry job status/version/outcome, lineage, and normalized history only. It does not persist features, tracks, candidates, OpenCV objects, matrices, triangulation workspaces, or capability cache internals.
