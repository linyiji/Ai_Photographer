# Integration test plan

M03 deterministic scenarios:

| Scenario | Essential assertion |
|---|---|
| FINE_TUNE_NEUTRAL | no-op recipe preserves source selection/lineage |
| FINE_TUNE_GLOBAL | global adjustment persists and resumes |
| FINE_TUNE_PERSON | accepted PERSON mask affects no analytic background |
| FINE_TUNE_BACKGROUND | accepted BACKGROUND mask affects no analytic person |
| FINE_TUNE_LOCAL | normalized region does not crop/change dimensions |
| FINE_TUNE_COMBINED | all four scopes replay deterministically |
| FINE_TUNE_RECIPE_RELOAD | saved recipe alone reconstructs pixels |
| FINE_TUNE_MASK_UNAVAILABLE | semantic scopes disabled; global/local remain |
| FINE_TUNE_EXPORT_FAILURE | no derived/final record or success event is invented |
| FINE_TUNE_SOURCE_INVALIDATION | stale mask/preview/final cannot overwrite new source |

Contract gates validate source/recipe/session identity, schema drift, Recipe idempotency, render idempotency, AssetManifest lineage and MyFinalPhoto readback. Runtime gates cover Worker and fallback, full-source Final, duplicate export, cache invalidation, orientation and privacy counters.

Platform closure requires H5 browser, WeChat build/capability disposition and OPPO regression. No phone is required for M03 replay itself. Security assertions remain third-party upload/cloud provider/generative AI/backend-per-slider calls = 0.
