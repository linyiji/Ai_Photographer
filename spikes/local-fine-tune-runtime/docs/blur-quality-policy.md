# BACKGROUND BLUR quality policy

`BLUR` is admitted only for `BACKGROUND`. The canonical Recipe value remains `[-1,1]`; zero and all negative values are deterministic no-ops, while positive values map linearly to a bounded `0..0.84` defocus mix. The UI exposes only `0..1`. This does not redefine negative blur as sharpening.

The renderer applies canonical color/detail adjustments first, then a radius-bounded separable box defocus. It convolves premultiplied background color and mask weight together, unpremultiplies the result, and composites by the original background weight. Foreground pixels with zero background weight remain byte-exact; foreground color therefore cannot seed background blur at a hard analytic boundary. A soft provider boundary remains intentionally soft rather than creating a hard cutout.

The radius is deterministic: `round(min(width,height) * 0.008)`, clamped to `2..48` source pixels. No synthetic bokeh, depth invention, randomness, cloud call or semantic edit is present. Missing, empty or dimensionally invalid background masks produce a controlled no-op.

Automated gates cover neutral/negative behavior, background-only scope, empty/invalid masks, foreground byte preservation, analytic red/blue leakage, deterministic pixels, alpha/source identity, combined color order, monotonic detail reduction, 512 preview bounds, 12MP bounds and a locked blur hash. Real-device admission additionally requires a scrollable Worker final and visual inspection of hair/thin structures, silhouettes, foliage, bright/dark contrast boundaries, halo, bleed, seams and double edges.
