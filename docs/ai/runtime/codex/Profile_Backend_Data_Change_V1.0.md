# Profile: BACKEND_DATA_CHANGE V1.0

Modes: `CONTRACT_CHANGE`, `MIGRATION`, `DATA_QUALITY_REPAIR`, `PERSISTENCE_FIX`.

Default to schema reuse. Classify the target database, identify canonical schema/migration/ledger/replay Authority, use the narrowest approved permission, and require deterministic readback. No Production mutation, broad grant, hidden schema drift, audit-history deletion, or direct data write replacing a governed lifecycle without explicit authorization.

Migration acceptance: order valid, replay safe where practical, ledger compatible, target readback passed, and no unrelated schema drift.
