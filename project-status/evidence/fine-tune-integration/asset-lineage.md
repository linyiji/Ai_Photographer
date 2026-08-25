# Fine Tune Asset Lineage Evidence

Browser session `session-ed44237aa01a` completed with one non-neutral brightness adjustment.

```text
Capture       asset-capture-001
RealityPlus   asset-reality-plus-001
Derived       asset-fine-tune-8cc92a5640bab59e
Recipe        recipe-session-ed44237aa01a
Final         MyFinalPhoto.selected_asset_id = derived
```

Readback showed one DERIVED asset, one `SAVE_ADJUSTMENT_RECIPE_COMMITTED` event, a false semantic-edit flag, and lineage containing all three asset identities. Runtime was `main-fine-tune-1.0.0`; final backend was `WORKER_OFFSCREENCANVAS`.

Neutral browser session `session-ce61b97b4f81` selected `asset-reality-plus-001`, created zero Fine Tune derived assets, linked its persisted recipe, and emitted one completion event. This proves neutral completion does not fabricate a no-op derivative.
