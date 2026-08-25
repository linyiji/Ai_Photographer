# M01 AdjustmentRecipe Mapping

FT-P1 implements ALL, PERSON, BACKGROUND and LOCAL_REGION with BRIGHTNESS, WARMTH, SATURATION and SOFTNESS. MOOD, SKIN_TONE, SKIN_RETOUCH and BLUR remain deferred. PERSON/BACKGROUND recipes use the unchanged M01 schema and retain `semantic_edit_allowed=false`.

`SemanticMaskSet` is ephemeral renderer/provider integration data, not a persistent M01 contract. Future mask persistence requires `CONTRACT_DESIGN_REQUIRED`.

```text
M01_SCHEMA=packages/contracts/schemas/AdjustmentRecipe.schema.json
M01_STATUS=PRESERVED
SEMANTIC_EDIT_ALLOWED=false
M01_REGION_SEMANTIC_MAPPING=GAP_RECORDED
```

Implemented scopes: `ALL`, `LOCAL_REGION`.

Deferred scopes: `PERSON`, `BACKGROUND`. The renderer accepts optional deterministic masks for fixture compositing, but no automatic detection is claimed.

Implemented parameters: `BRIGHTNESS`, `WARMTH`, `SATURATION`, `SOFTNESS`.

Deferred canonical parameters: `MOOD`, `SKIN_TONE`, `SKIN_RETOUCH`, `BLUR`.

All emitted recipes include `schema_version`, `recipe_id`, `session_id`, `source_asset_id`, `created_at`, `semantic_edit_allowed=false`, and `adjustments`, and are validated by Ajv 2020 against the unmodified M01 schema before serialization/reload.

`SpikeLocalRegionDescriptor` is persisted inside the schema-permitted `region` object:

```text
id, x, y, width, height, feather
```

Coordinates are normalized, bounded, and non-cropping. Feather is a fixed-ratio smoothstep falloff. M01 does not lock these fields or overlap semantics; production promotion requires a separate contract decision. The renderer normalizes recipe processing to canonical parameter order rather than array order; that policy is also integration-local until accepted.
