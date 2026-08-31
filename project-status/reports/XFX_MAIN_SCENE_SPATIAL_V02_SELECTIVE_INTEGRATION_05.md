# XFX Main Scene Spatial V0.2 selective integration

## Decision

`PASS_WITH_WARNING`. Scene Spatial P0/P1/P2 is connected to Main through a replaceable capability boundary without admitting algorithm internals into Main. P1 is immediately usable, P2 is asynchronous, failure degrades to the view-only path, and REAL/FAKE/REPLAY providers share the same contracts. The warning is limited to the accepted P2 transport-latency family and a fresh integrated WeChat real-device gate that remains owner-operated.

## Source and scope

- Formal accepted source head: `68999dbc8c8332d789f7f74a094b2b02cd9cbae0`.
- Accepted algorithm implementation provenance: `ed0449efaefdcb30e1f20859656757ce77c43b14`.
- Source worktree remained read-only and is retained.
- Migration was selective; the existing Main FastAPI service is the only production-shaped backend.
- Geometry algorithm gate is closed/unchanged. P3, Live integration, and AI Director remain not started.

## Contract and architecture result

Eight versioned JSON Schemas establish scan, selected frame set, direction map, P1 view evidence, routing-only precheck, Geometry request, SpatialEvidenceV02, and Session domain state. Main schema versions `0.1.0`/`0.2.0` are the semantic-version projection of source V0.1/V0.2.

The client composition is `Main -> SceneSpatialCoordinator -> SceneSpatialPort -> REAL/FAKE/REPLAY adapter`. The backend composition is `FastAPI -> SceneGeometryService -> SceneSpatialPort adapter -> module-private solver`. The `solver.py` implementation and OpenCV dependency are never imported by Main workflow/client code. Cache storage and solver intermediate state remain capability-private.

The WeChat and H5 scan adapters share portable P0/P1 domain analysis. Platform-specific code is limited to acquisition/frame preparation/upload. The Main app creates the Scene Spatial capability at its composition root without camera/network/UI side effects; actual scan work begins only through `start()`.

## Async, Session, events, and failure semantics

A single scan commits SceneScanEvidence plus immediate ViewEvidence and emits `SCENE_SCAN_COMPLETED` and `VIEW_EVIDENCE_READY` without advancing or blocking the existing workflow stage. The client returns `VIEW_READY_GEOMETRY_PENDING` before Geometry completes.

Geometry emits normalized `GEOMETRY_REQUESTED`, `SPATIAL_EVIDENCE_AVAILABLE`, `SPATIAL_EVIDENCE_INSUFFICIENT`, `GEOMETRY_FAILED`, or `GEOMETRY_SUPERSEDED`. Only a successful first-party backend result may attach SpatialEvidenceV02 and set its status. Request failure records `NOT_PRODUCED` with a null SpatialEvidence reference; it is not rewritten as INSUFFICIENT. Old-scan completion cannot attach evidence to the active scan.

PhotographySession persists only domain evidence/references, Geometry identity/status/version/outcome, lineage, and event history. Historical sessions without Scene Spatial fields continue to load because the new state is optional.

## Geometry, cache, and privacy

Accepted solver semantics are preserved, including frame selection, pose/rotation/low-parallax rejection, triangulation, multi-pair verification, and early exit. Client working frames are capped at 640 px and backend validation at 960 px. Three to eight selected frames use exact binary hashes and an ordered frame-set hash.

Cache identity is `scan_id + frame_set_hash + geometry_solver_version`; subject, intent, recommendation, and future AI prompt are excluded. Raw video/frame-stream upload is zero. Selected Geometry frames go only to the first-party backend. Provider and Luna calls are zero, and no real-user media is committed.

## Validation

- Backend regression: 121/121 PASS.
- Frontend regression: 97/97 PASS; TypeScript and test compilation PASS.
- Contract/catalog and workflow integration tests: PASS.
- REAL/FAKE/REPLAY, standalone, cache, failure degradation, supersession, and isolation tests: PASS.
- WeChat build: PASS; valid import root `D:\Projects\Ai_Photographer\apps\client\dist\weapp` contains `app.json`, `app.js`, and `pages/`.
- Current AppService output contains the Scene Spatial composition/upload path and zero occurrences of the checked bootstrap-risk constructs.
- H5 build: PASS with existing size advisories; runtime Home render and console regression PASS.
- Output separation: PASS (`dist/weapp` and `dist/h5`).

## Remaining manual evidence

The current WeChat Developer Tools CLI service port is disabled and was not changed. No fresh integrated phone-to-backend Scene Scan was claimed. The integrated device gate is `MANUAL_REVIEW_REQUIRED`, with spatial status `NOT_EXERCISED`. This does not block code integration under the task authority, but it prevents claiming current real-device Geometry evidence.

Detailed evidence is under `project-status/evidence/scene-spatial-main-integration/`.
