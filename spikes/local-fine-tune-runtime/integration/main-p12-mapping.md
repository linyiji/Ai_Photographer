# Main P12 mapping

```text
P11 REALITY_PLUS
  accepted RealityPlusAsset + AssetRef
        ↓
P12 FINE_TUNE
  source/session/existing-or-neutral Recipe/mask capability
        ↓ save and finalize
P13 FINAL
  derived AssetRef + MyFinalPhoto + governed event/readback
```

P12 load resolves an accepted source asset, checks session/source identity, loads or creates one AdjustmentRecipe and resolves mask capability. Editor-only selection, history cursor, overlays and transient preview buffers are not persisted visual authority.

Finalize order:

1. validate and idempotently persist AdjustmentRecipe;
2. render from immutable full source using the persisted recipe;
3. checksum and idempotently write a DERIVED AssetRef/manifest entry;
4. create or update MyFinalPhoto with `selected_asset_id`, `adjustment_recipe_id` and complete lineage;
5. emit a governed event only after persistence succeeds;
6. transition with canonical `SAVE_ADJUSTMENT_RECIPE` and verify P13 readback.

Event names/payloads and the production API shape are integration candidates, not new M01 Authority. They require the future Main integration gate. Back navigation preserves the accepted P11 choice and saved recipe; failure never invents a final asset.
