# Real Capability Integration Governance V1.0

Status: `ACTIVE_M04_FOUNDATION`

## Purpose

Product pages request a capability. They do not choose a concrete browser, WeChat, fake, experimental, or future physical-agent implementation. The centralized `PlatformAdapterRegistry` makes that selection, reports availability before action, records provenance, and returns a normalized result compatible with the M01 ErrorContract shape.

## Promotion path

```text
Spike
→ Accepted Evidence
→ Production Adapter Candidate
→ M01 Contract Mapping
→ Integration Implementation
→ Deterministic Regression
→ Platform Acceptance
→ Production Selection
```

A Spike is never merged directly into product runtime. Accepted evidence identifies behavior and limits; a Main-track adapter is implemented independently against the locked platform catalog. The adapter must pass contract mapping, security review, deterministic fallback regression, platform build, and its declared acceptance gate.

## Selection and provenance

Every descriptor records:

- capability name, adapter id, and adapter version;
- runtime platform and availability;
- `SUPPORTED`, `PARTIAL`, `UNSUPPORTED`, or `UNVERIFIED_REAL_DEVICE`;
- implementation source and catalog version;
- reason, fallback, and acceptance level.

Runtime capability selection records `FAKE`, `REAL`, `EXPERIMENTAL`, or `UNAVAILABLE`. Environment, platform, explicit feature configuration, availability, and accepted evidence determine selection. Pages cannot pass provider class names or arbitrary adapter ids.

## Fake replacement rule

A fake adapter remains the default until a real candidate:

1. maps to existing M01 input/output semantics without changing Authority;
2. has deterministic failure and fallback behavior;
3. passes the relevant platform acceptance gate;
4. does not require an unauthorized credential or production dependency;
5. retains rollback to the fake selection.

M04 selects real development storage/network paths and experimental H5 platform actions. `FakeLiveGuidanceCapability` remains selected. The future seam is `RealPhysicalAgentAdapter`, but no Live branch code, FrameAdapter, CV, per-frame call, or guidance state is integrated.

## Error boundary

Platform errors normalize to governed uppercase codes and M01 categories, including permission denied, unsupported, cancellation, timeout, network unavailable, storage failure, invalid asset, share failure, and camera failure. Unsupported is a valid controlled result and never an uncaught success claim.

## Asset safety

`DEVELOPMENT_LOCAL_STORAGE_ADAPTER` accepts only authorized multipart JPEG/PNG/WebP uploads up to 20 MiB. Server-generated stable ids select files beneath one ignored local root. Client paths, absolute paths, UNC paths, traversal, encoded traversal, wrong signatures, wrong MIME/extension pairs, empty input, and oversize input cannot select or create arbitrary files. Session JSON contains stable references and metadata, never binary/base64 or an absolute server path.

The governed path is:

```text
authorized binary upload
→ validation + SHA256
→ local-asset stable reference
→ SessionService CREATE_CAPTURE
→ Capture Candidate
→ accepted CaptureAsset
→ fake RealityPlusAsset
→ MyFinalPhoto
→ authorized download/share action
```

Development SQLite scopes candidate and asset identities by Session, preventing deterministic fixture ids from overwriting lineage in another Session.

## Rollback

Feature selection can return to the deterministic fake without changing pages or Workflow. Stored binary metadata and workflow mutation remain separate governed transactions: an invalid/missing upload cannot advance CAPTURE; a failed SQLite mutation rolls back accepted state/events/assets; and an unsupported final platform action does not change Session truth.
