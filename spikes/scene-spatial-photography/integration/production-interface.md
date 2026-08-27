# Future Production Interface

P0 exports four conceptual seams without importing the spike UI: `OrientationProvider` supplies trustworthy relative-yaw samples or an explicit unavailable state; `SceneSweepRuntime` accepts scalar orientation and locally measured frame-quality candidates; `SceneSweepManifest` serializes ordered metadata and privacy counters; `YawMap` answers nearest observed view and gaps.

P1 adds a future provider-neutral analysis seam:

```ts
analyzeSceneSweep(
  manifest: SceneSweepManifest,
  yawMap: YawMapData,
  transientKeyframes: TransientKeyframePixels[],
  photographyIntent: PhotographyIntent,
): {
  context: SceneSpatialContextV01;
  frame_set: SceneFrameSetV01;
  direction_map: SceneDirectionMapV01;
  view_candidates: PhotographyViewCandidateV01[];
}
```

Each `PhotographyViewCandidateV01` contains multiple canonical `CompositionAnchorCandidateV01` image-plane anchors; the deprecated `placement_candidates` property is a compatibility alias only. Region count is metadata and does not control candidate count. The platform adapter owns permission UX and transient frame lifetime. V0.2 permits only 3–8 bounded selected geometry frames to a first-party Backend; raw video, frame streams, Provider and Luna uploads remain zero. Client `SpatialPrecheckV01` is routing-only and only the Backend emits `SpatialEvidenceV02.status`.

Replacement seams are documented, not implemented: `DeterministicVisualDescriptorProvider`, `FutureSemanticSceneProvider`, `SpatialEvidenceProvider`, and `PhotographyDirectorProvider`. Future semantic/aesthetic enrichment must preserve Scene Sweep, SceneFrameSet, SceneDirectionMap, and candidate authority boundaries. P1 candidates are not final decisions.
