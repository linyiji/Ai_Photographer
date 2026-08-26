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

Each `PhotographyViewCandidateV01` contains multiple `PlacementCandidateV01` image anchors. Region count is metadata and does not control candidate count. The future production adapter must own platform permission UX and transient keyframe lifetime. Raw keyframes stay local/transient; validated frame/direction/candidate envelopes may become persistable later. The deterministic baseline has no Main Session, navigation, backend per-frame, Provider, or Luna dependency.

Replacement seams are documented, not implemented: `DeterministicVisualDescriptorProvider`, `FutureSemanticSceneProvider`, `SpatialEvidenceProvider`, and `PhotographyDirectorProvider`. Future semantic/aesthetic enrichment must preserve Scene Sweep, SceneFrameSet, SceneDirectionMap, and candidate authority boundaries. P1 candidates are not final decisions.
