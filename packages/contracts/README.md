# Global Contracts V1

`catalog.json` and `schemas/*.schema.json` are the language-neutral M01 contract Authority. They use JSON Schema 2020-12 and define stable domain semantics before any TypeScript, Pydantic, OpenAPI, database, or provider projection exists.

Rules:

- AI output starts as `CANDIDATE`; only a named validation/selection gate can promote accepted workflow truth.
- Contracts carry stable identities and semantic versions. Breaking changes require a new major schema identity.
- Assets use `asset_id` plus lineage and storage references; local absolute paths are never canonical identity.
- Shared contracts contain no platform APIs, provider-specific CV fields, credentials, or raw image bytes.

Canonical explanation: `docs/architecture/canonical-index/XFX_Global_Contracts_V1.0.md`.
Validation: `node scripts/validate-contracts.mjs`.
