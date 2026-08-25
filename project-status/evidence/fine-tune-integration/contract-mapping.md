# Fine Tune Contract Mapping

| Requirement | Main implementation | Result |
|---|---|---|
| SourceAssetResolver | session-scoped accepted RealityPlus projection and immutable content route | PASS |
| AdjustmentRecipeRepository | validated/versioned SQLite business object with create/read/reload | PASS |
| FineTuneRuntimeAdapter | provider-neutral runtime/session interface | PASS |
| MaskCapabilityResolver | optional validated masks; absent masks disable semantic scopes | PASS |
| DerivedAssetWriter | idempotent session-scoped JPEG upload | PASS |
| MyFinalPhotoRepository | persisted session state projection with recipe link and lineage | PASS |
| GovernedEventWriter | event emitted only after transactional persistence | PASS |

M01 schemas and Workflow V1 were not modified. The API validates all writes before persistence, enforces `semantic_edit_allowed=false`, accepts only BRIGHTNESS/WARMTH/SATURATION/SOFTNESS plus BACKGROUND-only BLUR, and rejects stale source identity.

`AUTO_SEMANTIC_MASK=NOT_YET_PASS`. Controlled masks are test-only inputs to the provider-neutral seam; production does not fabricate masks.
