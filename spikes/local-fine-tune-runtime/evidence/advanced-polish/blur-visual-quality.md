# BACKGROUND BLUR visual quality evidence

Disposition: `PASS_WITH_WARNING`.

Automated fixtures cover busy background, fine texture, soft person-like boundary, full/empty/invalid masks and a hard red-foreground/blue-background boundary. Zero-mask foreground pixels remain byte-exact. At the analytic hard boundary the background red channel remained `0`, proving foreground red did not seed the blue background convolution. Same source/recipe/mask is bit deterministic and the locked blur SHA-256 is `f100f6d8e0c313cbcccf0a542be2a1c4e1eb9ed9f773b72d77f633c80201298a`.

The implementation convolves premultiplied background color and mask weight, unpremultiplies, then composites by the original background weight. This prevents foreground bleed at a hard valid mask while retaining provider feather at soft boundaries. Missing, empty or dimensionally invalid masks are controlled no-ops.

The OPPO regression confirmed the BACKGROUND path and Worker completion, but the supplied closure screenshot primarily records metrics rather than a close-up photographic hair/hand edge. Therefore analytic edge/leakage quality is accepted while broader natural-photo hair, foliage, bright/dark silhouette and double-edge inspection remains a future production integration visual gate.
