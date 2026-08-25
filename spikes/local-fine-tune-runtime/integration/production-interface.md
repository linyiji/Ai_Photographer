# Production interface candidate

`FineTuneRuntime` is a provider- and platform-neutral Main-facing seam. Main must not import Canvas, ImageData, Worker or OffscreenCanvas types.

```ts
interface FineTuneRuntime {
  open(input: {
    source: SourceAssetRef;
    recipe: AdjustmentRecipe;
    masks?: OptionalMaskSet;
    options: RuntimeOptions;
  }): Promise<FineTuneSession>;
}

interface FineTuneSession {
  project(recipe: AdjustmentRecipe): Promise<PreviewProjection>;
  renderFinal(recipe: AdjustmentRecipe, idempotencyKey: string): Promise<FinalRenderArtifact>;
  metrics(): RenderMetrics;
  warnings(): RuntimeWarnings[];
  close(): void;
}
```

Required invariants:

- `source.asset_id === recipe.source_asset_id`; mismatch fails closed.
- Recipe validation uses canonical M01 schema and always retains `semantic_edit_allowed=false`.
- Preview may downsample and coalesce, but Final always reads immutable full Source.
- Same Source checksum + Recipe serialization + runtime version + mask identity yields the same semantic pixels within the locked tolerance.
- Final render idempotency key is derived from session, source checksum/version, recipe identity/version and runtime version. A retry returns the existing derived asset instead of creating a second lineage branch.
- Missing masks disable PERSON/BACKGROUND while ALL/LOCAL_REGION remain available.

Main owns persistence and asset identity. The runtime owns only deterministic projection/render execution and metrics.
