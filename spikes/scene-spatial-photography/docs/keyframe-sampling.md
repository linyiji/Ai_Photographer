# Keyframe Sampling

Default angular novelty is 12°. QUICK retains at most 12 metadata records, WIDE 18, FULL 32. A lightweight luma/edge pass measures an edge-energy sharpness proxy, mean exposure, clipping ratios, and a 16-bin fingerprint. These gates select representative frames; they do not claim professional image-quality judgment.

Yaw is primary novelty. Visual duplicate rejection applies only within 4°, so similar texture at a meaningfully different view is retained. Busy work is skipped, the UI schedules at most one synchronous candidate, and rejection counters remain in the manifest. Image bytes remain transient and are excluded from export.
