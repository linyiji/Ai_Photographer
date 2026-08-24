# Platform Contract Catalog V1

`catalog.json` freezes capability names, responsibilities, and language-neutral input/output semantics only. Implementations are deferred to later platform tasks.

Shared product code depends on these capabilities instead of platform APIs. The catalog must not contain platform-specific runtime calls or DOM-only APIs.
