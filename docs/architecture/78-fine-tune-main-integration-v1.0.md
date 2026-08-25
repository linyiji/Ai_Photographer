# Fine Tune Main Integration V1.0

Status: `PASS_WITH_WARNING`

Main owns a provider-neutral `FineTuneRuntime` seam. The product page supplies a stable `SourceAssetRef`, canonical M01 `AdjustmentRecipe`, optional ephemeral masks, and runtime options. Canvas2D, ImageData, Worker, and OffscreenCanvas remain inside the client adapter.

```text
accepted RealityPlusAsset
  -> persisted AdjustmentRecipe
  -> local deterministic preview
  -> Worker/OffscreenCanvas final or Canvas2D fallback
  -> idempotent derived upload
  -> DERIVED AssetRef projection / AssetManifest
  -> MyFinalPhoto(adjustment_recipe_id)
  -> FINAL
```

Invariants:

- Source identity must equal `recipe.source_asset_id`; mismatch and invalidation fail closed.
- `semantic_edit_allowed` is always false. MOOD, SKIN_TONE, SKIN_RETOUCH, generative AI, semantic edit, and cloud image processing are not implemented.
- Final reads the immutable full source. Preview is a downsampled projection and never becomes Final.
- Finalization is keyed by source, recipe hash, session, and runtime version. Recipe, upload, workflow event, revision, and derived domain asset are idempotent.
- Neutral completion selects the accepted source and creates no no-op derived asset.
- Non-neutral completion writes one derived JPEG and complete Capture -> RealityPlus -> Fine Tune lineage.
- Mask persistence remains `EPHEMERAL_RECOMPUTE`; automatic semantic mask remains `NOT_YET_PASS`.
- No mask means ALL and LOCAL_REGION available; PERSON, BACKGROUND, and BACKGROUND BLUR unavailable.

`INTEGRATION_LOCAL_V1_SEMANTICS` uses normalized upright-source coordinates, stable region id, feather 0.04-0.45, deterministic overlap composition, and at most three regions. `GLOBAL_M01_REGION_SEMANTIC_GAP=RETAINED`.

Source provenance: `PARALLEL_LOCAL_FINE_TUNE` at `9b2f813082d5822cef8c38bfba2b65725e8c5d2d`. Production code has no dependency on `spikes/`.
