# Visual Descriptors V0.1

`KeyframeVisualDescriptor` is computed deterministically from a downsampled local RGBA frame plus accepted P0 keyframe quality metadata. Version `0.1` records luma, clipping, contrast, gradient-based sharpness, edge density, clutter, a 3×3 local grid, third/center clutter, placement clearance, frame-quality score, and confidence.

Visual clutter is a non-semantic proxy combining strong-edge density, local contrast, edge-orientation variability, and high-frequency energy. A higher value means visually busier pixels; it does not identify objects or claim that a background is physically open.

Photography frame quality combines sharpness, balanced exposure, and moderate usable contrast. Severe clipping or low sharpness is penalized before opportunity ranking so an empty but broken frame cannot win solely from low clutter.

All constants live in `p1/config.ts`. Descriptor output is rounded for stable serialization. Synthetic fixtures cover clean, busy, over/underexposed, blurred, center-edge, asymmetric thirds, uniform, and moderate scenes without external assets.
