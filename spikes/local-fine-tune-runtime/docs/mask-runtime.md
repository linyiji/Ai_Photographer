# Semantic mask runtime (FT-P1)

The runtime is provider-independent and non-generative. `MaskProvider` accepts decoded, upright `SourceImage` pixels and returns an ephemeral `SemanticMaskSet` bound to source identity, dimensions, provider id/version, and `DECODED_UPRIGHT_SOURCE` coordinates.

Required masks are `PERSON` and `BACKGROUND`; background is the exact complement of person for this two-class spike. Values are finite and clamped to `[0,1]`. Bilinear resizing produces cached preview masks while export consumes full-source masks. Bounded refinement preserves thin one-pixel signals.

`MaskRuntime` exposes `NOT_REQUESTED`, `LOADING`, `READY`, `ERROR`, and `UNAVAILABLE`. Cache identity is source asset/dimensions + provider/version + options. Slider rendering reads cached masks only. Source replacement invalidates masks and disables semantic tabs when no admitted automatic provider exists; ALL and LOCAL_REGION remain usable.

Implemented providers are deterministic `FixtureMaskProvider` and validating `ExternalMaskSetProvider`. FACE, SKIN, HAIR, CLOTHING and other classes remain future design work.
