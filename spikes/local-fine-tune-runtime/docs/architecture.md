# Architecture

## Selected path

```text
Source Blob
→ browser-local decode with orientation request
→ immutable full-quality SourceImage
├─ downsample to 640px long edge → Preview Render
└─ original dimensions           → Final Render → JPEG encode
```

`Canvas2DFineTuneRenderer` implements the spike-local `FineTuneRenderer` interface. UI code sees `SourceImage`, `AdjustmentRecipe`, optional masks, and render options; it does not access renderer loop details.

The primary and portability path is `CANVAS2D_IMAGE_DATA`. No separate GPU backend is required for FT-P0. Canvas2D absence fails closed; the deterministic CPU implementation is also the reference path for later GPU comparisons.

## Deterministic evaluation

Recipe array order is normalized to a documented canonical order:

```text
BRIGHTNESS → WARMTH → SATURATION → SOFTNESS
```

At each pixel, global and feather-weighted local values for a parameter are added and clamped to `[-1, 1]`. A separable 3×3 blur source is computed only when SOFTNESS is non-neutral. This replaced the initial multi-pass probe while retaining the same public renderer contract.

## State boundaries

- Source bytes are cloned/read only and never overwritten.
- Recipe is the sole visual edit authority.
- Active region selection is UI-only; geometry that affects pixels is stored in `AdjustmentRecipe.adjustments[].region`.
- History stores cloned recipes, never high-resolution bitmaps.
- Compare toggles presentation only.
- Preview is 640px-long-edge downsampled; Final always re-renders from the full source.
- `OptionalMaskSet` is accepted for deterministic fixture composition, but automatic semantic mask generation is deferred.
