# Mask quality policy

Quality is measured in decoded-upright coordinates. With ground truth, report thresholded IoU, average boundary absolute error, and soft leakage outside expected foreground. Empty/empty IoU is 1.

Reject dimension mismatches and NaN/Infinity; clamp finite external values to `[0,1]`; keep the two masks complementary; preserve thin signals; never fall back from semantic scopes to ALL; and disable only semantic tabs on unavailable/error.

Fixture tests cover empty/full/inverse, soft/hard, jagged impulse, holes/disjoint regions, thin lines, resize/source mismatches and invalid values. Analytic self-ground-truth is IoU 1.0, boundary error 0, and cross-scope leakage 0. This is not a real-photo quality claim.
