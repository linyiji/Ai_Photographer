# Profile: FULLSTACK_INTEGRATION V1.0

Modes: `FEATURE_INTEGRATION`, `BOUNDED_FIX`, `STATE_RECONCILIATION`, `RUNTIME_ROUTE_FIX`.

Trace `request → handler → domain authority → runtime capability → persistence → readback → UI/result`. Pass requires both a working path and preserved Authority boundaries. Use the narrowest permission and query contract; do not default to broad grants or bypasses. Platform and Provider adapters may not leak into shared domain contracts.
