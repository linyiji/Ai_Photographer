# Descriptor Validation

Controlled programmatic fixtures: 10/10 generated locally with no external assets. Coverage includes clean balanced, high clutter, severe over/underexposure, severe blur, strong center edge, clean left/right thirds, uniform low detail, and moderate balanced texture.

Verified in the 131-test Scene Spatial suite:

- exact descriptor determinism and version `0.1`;
- high-clutter edge/clutter ordering;
- luma and clipping detection for both exposure extremes;
- sharp balanced quality outranking severe blur;
- 3×3 luma/contrast/edge mapping;
- left/center/right placement and all four framing profiles staying in bounds;
- center-edge conflict selecting a cleaner side.

Descriptors are scalar-only evidence; no fixture or real-user media bytes are committed.
