# Theme Equivalence

Result: PASS.

The DEFAULT and LINE_DOG renderers receive the same immutable `VisualGuidanceState`. Automated tests compare a semantic signature containing boxes, acceptable zone, tracking, per-axis state, direction, STOP, READY, source, mode, and metrics. Controller semantic diff is exactly `0`.

LINE_DOG changes only CSS tokens, ornaments, and glyphs. It is `IMPLEMENTED_CANDIDATE` with `PREMIUM_CANDIDATE` metadata. Payment and entitlement are NOT_IMPLEMENTED. Unknown theme IDs fall back to DEFAULT.
