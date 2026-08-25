# Mask provider mapping

The production seam accepts an `OptionalMaskSet` projection with source identity, decoded-upright dimensions, coordinate space, provider/version and PERSON/BACKGROUND data. Renderer and UI do not own the provider.

Source precedence is explicit:

1. accepted local provider result;
2. accepted precomputed/backend or AI Visual mask projection;
3. none.

No source is implicitly trusted. The adapter validates source asset id, dimensions, coordinate space, supported kinds and finite normalized values. On source change all mask and preview caches are invalidated.

Baseline persistence decision is `EPHEMERAL_RECOMPUTE`. Current M01 has no canonical MaskAsset. If Main needs durable precomputed masks, that becomes `PERSISTED_DERIVED_ASSET / CONTRACT_DESIGN_REQUIRED`; this package does not invent it.

When masks are absent or rejected, PERSON/BACKGROUND are controlled unavailable and ALL/LOCAL_REGION remain usable. `AUTO_SEMANTIC_MASK=NOT_YET_PASS`.
