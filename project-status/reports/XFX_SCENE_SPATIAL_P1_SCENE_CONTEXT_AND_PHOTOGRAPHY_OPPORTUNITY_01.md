# XFX_SCENE_SPATIAL_P1_SCENE_CONTEXT_AND_PHOTOGRAPHY_OPPORTUNITY_01

Status: **PASS_WITH_WARNING**  
Amendment: `XFX_SCENE_SPATIAL_P1_DIRECTION_MAP_AND_CANDIDATE_GENERATION_AMENDMENT_01`  
Authority: `SCENE_SPATIAL_TRACK_DESIGN_AUTHORITY_V0_1`  
Start Head: `b7b60466bd65187c34b542e656849eabc328a55b`  
P0 Accepted Runtime: `1e7b6b4889e13104f23c9a3e13902177740ca612`  
P1 V2 Accepted Runtime Head: `f0e8baf6600f52ca6f8d509cc959b4edc04e93ee`

## Disposition

The original deterministic `one region → one opportunity → top recommendation` design is preserved as failed V1 checkpoint evidence. Four OPPO K11 V1 trials all returned one region and one opportunity, and the user found the singular recommendation and concrete placement presentation unsuitable.

The accepted amendment changes P1 to:

```text
SceneFrameSetV01
+
SceneDirectionMapV01
+
PhotographyViewCandidateV01[]
+
PlacementCandidateV01[]
```

`Region Count != Candidate Count`. P1 prepares multiple bounded candidates; it does not own the final photography decision.

## Docs Import Status

**PASS**. The package `scene-spatial-photography-spatial-decision-v0.1` was located in the authorized staging directory, all manifest entries were present, and all 11 SHA-256 entries matched before and after import. It was committed independently as `80d30a1` with message `docs: add scene spatial decision architecture v0.1`.

The imported documents are Scene Spatial Track Design Authority only. They are not Main Global Authority and do not mutate M01 or Main contracts.

## P1 capability status

| Capability | Status | Notes |
|---|---|---|
| P0 regression | PASS | QUICK/WIDE runtime and 11 replay fixtures preserved |
| SceneSpatialContextV01 | PASS_WITH_WARNING | retained as diagnostic context; no semantics/depth |
| SceneFrameSetV01 | PASS | every analyzed keyframe prepared; no image bytes in export |
| SceneDirectionMapV01 | PASS | relative-yaw arc; depth UNKNOWN; metric geometry unsupported |
| SceneAngularRegion | PASS_WITH_WARNING | retained as metadata only |
| PhotographyViewCandidateV01 | PASS_WITH_WARNING | max 3, angular diversity + technical usability |
| PlacementCandidateV01 | PASS_WITH_WARNING | LEFT/CENTER/RIGHT image anchors; STAND; not physical position |
| Final Photography Decision | NOT_P1_RESPONSIBILITY | reserved for future authorized AI Director + Validator |

## Candidate count logic

- no prepared frame → 0 candidates;
- one frame or very narrow evidence → 1 candidate;
- at least 2 frames and 24° coverage → 2 candidates;
- at least 3 frames and 72° coverage → 3 candidates;
- maximum is 3;
- region count never determines candidate count;
- severe blur/exposure is avoided when usable alternatives exist;
- all candidates are deterministic and ordered by relative yaw.

Controlled replay proves `1 region + 110° → 3 ViewCandidates`. OPPO V2 proves both QUICK and WIDE one-region cases can still produce three candidates.

## Automated / replay / browser

- Automated tests: **135/135 PASS**;
- TypeScript: **PASS**;
- Build: **PASS**, 24 modules;
- Replay: **P0 11/11 + P1 5/5 PASS**;
- Browser QUICK/WIDE: **PASS**;
- OPPO-like 393×873: 3 cards / 9 placement markers / 15 direction nodes / no overflow;
- browser warning/error: 0;
- banned UI wording (`Top 1`, best camera/standing position, numeric aesthetic score): absent.

## OPPO Results

Device: OPPO K11 / ColorOS 15 / Chrome Mobile. ADB not required. User-operated local H5 through a temporary HTTPS Quick Tunnel.

- V2 trials: 5 total — 2 QUICK, 3 WIDE;
- every trial: 3 view candidates;
- one-region cases: QUICK and WIDE both returned 3 candidates;
- prepared frames: 4–11;
- total P1 analysis: 13.8–67.6 ms;
- recorded Preview FPS median: 29.69–29.97;
- supplied manifests: COMPLETE, 110.4°–182.0°, including LTR/RTL/mixed;
- every candidate view: LEFT/CENTER/RIGHT placement candidates;
- final export: 10 frames / 10 direction nodes / 1 region / 3 view candidates / 3 anchors each;
- user qualitative checks: all PASS;
- black screen, jank, freeze, huge false jump: none reported.

## Privacy and authority

- Provider: 0;
- Backend per-frame: 0;
- Luna: 0;
- Raw video upload: 0;
- Frame stream upload: 0;
- raw media persistence/upload: false;
- committed real-user media: 0;
- cross-worktree runtime dependency: 0;
- depth: UNKNOWN;
- metric geometry: NOT_SUPPORTED;
- physical placement and safety: UNKNOWN / user confirmation required.

## Integration Status

`READY_FOR_INTEGRATION_DESIGN` only. Main Integration remains `NOT_STARTED`; no Main/develop/Live/Fine Tune/AI Visual mutation occurred. Migration remains `SELECTIVE_MIGRATION_ONLY_NO_RAW_SPIKE_MERGE`.

## Spatial P2 Readiness

**READY_FOR_ALGORITHM_SPIKE / NOT_STARTED**. The bounded plan is recorded in `XFX_SCENE_SPATIAL_P2_IMPLEMENTATION_READINESS_AND_ALGORITHM_SPIKE_PLAN_01.md`. It uses overlapping frames from the same single Scan and follows feature/track/match → RANSAC → parallax → relative pose → triangulation → sparse relative geometry → SpatialEvidenceStatus. It does not make NeRF, Gaussian Splatting, SLAM, or full dense 3D prerequisites.

## Warnings

- no semantic scene understanding or final AI aesthetic decision;
- P2 spatial evidence and physical Photography Affordance are not implemented;
- candidate direction spacing depends on technically usable retained frames; two real trials had an adjacent yaw gap below 20° despite qualitative acceptance;
- absolute heading is not globally calibrated;
- metric distance and physical safety remain unavailable.

## Final track state

P1: `PASS_WITH_WARNING`  
Scene Spatial Track: `ACTIVE_ACCEPTED_P1`  
Integration: `READY_FOR_INTEGRATION_DESIGN`  
Main Integration: `NOT_STARTED`  
P2 Implementation: `NOT_STARTED`  
Next: return to product program owner; do not automatically start P2 or Main Integration.
