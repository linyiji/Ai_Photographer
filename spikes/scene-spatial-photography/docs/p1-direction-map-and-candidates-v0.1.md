# P1 Direction Map and Candidate Architecture V0.1

> V0.2 TERMINOLOGY: canonical external type is `CompositionAnchorCandidateV01` and canonical internal rectangle is `CompositionAnchorZoneV01`. Any historical `PlacementCandidateV01` / `SubjectPlacementZone` names below mean image-plane composition only, never physical placement.

Authority: `SCENE_SPATIAL_TRACK_DESIGN_AUTHORITY_V0_1`.

The P1 V2 boundary is:

```text
one Scene Scan
→ SceneFrameSetV01
→ SceneDirectionMapV01
→ PhotographyViewCandidateV01[]
→ PlacementCandidateV01[]
```

P1 prepares transient scene images, organizes them on a relative-yaw direction arc, and returns at most three angularly distinct technically usable view candidates. It does not make the final photography decision.

`SceneAngularRegion` remains diagnostic metadata. Candidate count is derived from usable frame count and observed coverage, not region count. A uniform 110° or 180° sweep may therefore contain one region and three view candidates.

Every selected view exposes LEFT_THIRD, CENTER, and RIGHT_THIRD `STAND` image-plane candidates. They are `CANDIDATE`, not physical standing coordinates or aesthetic winners. Physical position, depth, metric geometry, and safety remain `UNKNOWN` or unsupported.

Raw keyframe pixels and thumbnails stay in browser memory. `SceneFrameSetV01` exports identifiers, yaw, dimensions, availability, and technical state only; it never contains image bytes.

Selection priority is:

1. angular diversity across observed coverage;
2. avoid severely blurred or clipped frames when alternatives exist;
3. stable deterministic tie-breaking.

No numeric aesthetic score is presented in the primary UI. Future AI Photography Director may select among these candidates only after its own capability and provider are authorized.
