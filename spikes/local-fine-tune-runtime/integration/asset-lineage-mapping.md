# Asset lineage mapping

Current accepted input:

```text
Capture Asset
→ accepted RealityPlusAsset.asset_id
→ AdjustmentRecipe.source_asset_id
→ rendered DERIVED AssetRef
→ MyFinalPhoto.selected_asset_id
```

Required consistency:

- SourceAssetRef resolves by stable asset identity and storage reference, never an absolute local path.
- Recipe `source_asset_id` equals the selected P11 source asset.
- Derived AssetRef uses `status=DERIVED`, records the source asset in `source_asset_ids`, a producer/runtime version and SHA256 checksum.
- AssetManifest appends/version-updates the derived entry; it never overwrites the accepted Reality+ source.
- MyFinalPhoto references the derived asset, saved recipe id and unique lineage ids including the upstream accepted source.
- Neutral/skip Fine Tune may select the accepted source directly only through the canonical skip/final path; it must not fabricate a no-op derived asset.

`CreativeAsset → Fine Tune` is a future option. No canonical CreativeAsset input contract is present here, so enabling it is `CONTRACT_REQUIRED`.
