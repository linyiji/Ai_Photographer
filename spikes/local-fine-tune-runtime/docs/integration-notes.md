# Integration Notes

This spike is not Main P12 integration and must not be merged directly as production completion.

Future integration should adapt the spike-local renderer contract to `RealityPlusAsset` or `CreativeAsset` input, preserve source asset lineage, persist the canonical `AdjustmentRecipe`, create a derived asset, and reference it from `MyFinalPhoto.adjustment_recipe_id`.

Open contract questions:

- M01 allows an object in `adjustment.region` but does not lock normalized coordinate, feather, identifier, or overlap semantics.
- FT-P0 stores `SpikeLocalRegionDescriptor` there because it is schema-valid; it is not promoted Authority.
- Recipe array order is not treated as semantic order by this renderer; canonical parameter order must be explicitly accepted or revised during integration.
- Asset storage, checksums, derived asset manifests, and persistence adapters are intentionally absent.
- PERSON/BACKGROUND mask source and quality gates belong to FT-P1.

No Main, Live, or AI Visual worktree changes are part of this track.
