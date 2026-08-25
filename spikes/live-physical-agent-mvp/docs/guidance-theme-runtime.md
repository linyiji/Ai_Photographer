# Guidance Theme Runtime

The theme renderer consumes `VisualGuidanceState` and returns presentation tokens and glyphs. It cannot mutate controller state or visual guidance semantics.

- `DEFAULT`: neutral free theme used by default.
- `LINE_DOG`: lightweight line-art candidate with dog-ear lock corners and playful glyphs. Its metadata is `PREMIUM_CANDIDATE`; payment and entitlement are not implemented.

The development selector changes only theme ID and presentation. Automated semantic signatures prove target geometry, acceptable zone, tracking, direction, STOP, READY, metrics, and mode are identical across both themes. A nonzero controller semantic diff is rendered in the HUD and is a failure.
