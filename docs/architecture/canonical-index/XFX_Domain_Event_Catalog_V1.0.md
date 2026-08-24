# XFX Domain Event Catalog V1.0

**Status:** `LOCKED_M01`

**Envelope:** `DomainEvent` V1.0.0

Events are immutable business facts. Every event has stable identity/type/version, session identity, timestamp, producer, payload, and optional causation/correlation identity. Payloads must not include credentials or secrets.

| Event type | Meaning | Minimum payload semantics |
|---|---|---|
| `session.created` | Persistent session identity established | session status, entry mode when known |
| `session.started` | Session enters active execution | device mode, initial workflow revision |
| `reality.accepted` | Validated candidate promoted | reality context identity, candidate identity, evidence refs |
| `target.selected` | User-selected feasible target accepted | selected target identity, source candidate identity |
| `shot_direction.accepted` | Executable HOW plan accepted | shot direction identity, target identity, version |
| `live.readiness_changed` | Meaningful readiness transition | prior/new readiness, active role, bounded sequence; never raw frames |
| `capture.created` | Capture asset and lineage established | capture identity, asset identity, attempt number |
| `capture.decision_made` | Technical QA decision accepted | capture and decision identities, technical result, taste status |
| `retake.planned` | Partial recovery plan established | plan identity, invalidated dimensions, preserved state/assets |
| `reality_plus.accepted` | Enhancement candidate passed Reality First checks | RealityPlus identity, source capture, evidence refs |
| `final_photo.selected` | User selected formal final product asset | final photo identity, selected asset, lineage |

Event type names are stable lowercase dot-separated identities. A payload schema can be added by a compatible contract revision, but it may not change event meaning or turn high-frequency frame telemetry into domain events.
