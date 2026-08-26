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
  opportunities: PhotographyOpportunityV01[];
}
```

The future production adapter must own platform permission UX and transient keyframe lifetime. Raw keyframes stay local/transient; validated scalar context and opportunity envelopes may become persistable later. The deterministic baseline has no Main Session, navigation, backend per-frame, Provider, or Luna dependency.

Replacement seams are documented, not implemented: `DeterministicVisualDescriptorProvider`, `FutureSemanticSceneProvider`, and `FutureOpportunityRanker`. Future semantic/aesthetic enrichment must preserve the Scene Sweep, YawMap, `SceneSpatialContextV01`, and `PhotographyOpportunityV01` envelopes and still enter Main as candidate output requiring validation.
