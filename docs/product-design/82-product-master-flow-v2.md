# 向风行｜Product Master Flow V2

**Document ID:** `XFX_PRODUCT_MASTER_FLOW_V2`
**Status:** `ACCEPTED_ARCHITECTURE_AUTHORITY`
**Effective date:** 2026-08-31
**Rebaseline task:** `XFX_MAIN_PRODUCT_MASTER_FLOW_AND_CAPABILITY_AUTHORITY_REBASELINE_06`

## Product master flow

```text
REALITY_CAPTURE
→ AI_PHOTOGRAPHY_DIRECTOR
→ LIVE_SHOOTING
→ AI_PHOTO_QA + REALITY_PLUS
→ USER_FINE_TUNE
→ MY_FINAL_PHOTO
```

The five user-facing stages are: capture subject and scene reality; receive approximately three executable Shot Plan candidates; select one and let Live execute it; route the capture to retake or Reality+ through Photo QA; make deterministic final adjustments and create My Final Photo.

This is the concise user-level authority. It does not replace the M01 machine workflow or the P01-P13 screen registry.

## Responsibility freeze

| Module | Authority | Explicitly does not own |
|---|---|---|
| Scene Spatial | reality evidence: scene contents, Views and relative geometry | best shot, subject placement, pose, ShotDirection or LiveTarget |
| AI Photography Director | Shot Plan candidate generation and decision semantics | accepted authority without validation/selection; Live control |
| Live | execution of the selected `LiveTarget` | aesthetic selection, universal center composition or universal best distance |
| Photo QA | accept/retake/repairability decision | fabricating a missing camera angle |
| Reality+ | reality-preserving enhancement of an accepted capture | changing identity, pose, scene relationship or viewpoint |
| Fine Tune | deterministic user-owned final adjustment | redesigning the shot |

`Candidate != Authority`. A candidate becomes selected domain state only after validation and the required selection gate.

## Non-AI scope

```text
NON_AI_BEST_SHOT_DISCOVERY = NO
NON_AI_SHOT_PLAN_EXECUTION = YES
```

Phase 1 proves `Preset / deterministic Shot Plan → LiveTarget → Live Guidance → Capture → QA slot → Reality+ slot → Fine Tune → Final`. It does not claim that the system discovers the globally best place or way to shoot.

## Reality Capture and Scene Spatial

```text
SCENE_SPATIAL_P0 = ACCEPTED
SCENE_SPATIAL_P1 = ACCEPTED_WITH_WARNING
SCENE_SPATIAL_P2 = ACCEPTED_WITH_LATENCY_WARNING
P1_NON_BLOCKING = PASS
SPATIAL_EVIDENCE_V02 = PASS
GEOMETRY_ALGORITHM_GATE = CLOSED / UNCHANGED
P3 = NOT_STARTED
```

`CompositionAnchorCandidate` is image-plane evidence only and is not a physical `SubjectPlacementCandidate`. `SpatialEvidenceV02` is reality evidence and is not `ShotDirection`. Scene Spatial must not create `LiveTarget` directly.

Director Level 1 remains usable from subject, Scene/View evidence, lighting and user intent without waiting for optional P2 SpatialEvidence. P2 may later improve ranking, feasibility and design asynchronously.

## Director input and output authority

The future `PhotographyDirectorPort` consumes `SubjectProfile + Scene/View Evidence + LightingEvidence + optional SpatialEvidence + UserIntent` and returns approximately three `ShotPlanCandidateV01` objects.

A candidate conceptually includes view, framing, required body visibility, image-plane placement, pose, camera direction/approximate height, lighting use, rationale, feasibility and a `LiveTargetBlueprint`. Exact physical stand-point or safety claims remain unsupported until future Affordance evidence exists.

## Post-capture authority

```text
Capture
↓
Photo QA
├─ RETAKE → Live / Partial Retake
└─ ACCEPT → Reality+ → Fine Tune
```

Reality+ may perform bounded crop, level, tone, exposure, color and minor perspective corrections. A wrong view, materially wrong camera height, pose, occlusion or scene relationship must route to retake. The invariant is `Better Capture → Better Final Result`.

## Relation to legacy product documents

Golden Flow V1, Story A-F and P01-P13 remain historical/detail references. Where they imply that Scene Spatial selects the best position, that a universal centered target is authoritative, or that Phase 1 discovers the best shot without AI, this V2 rebaseline overrides those implications.
