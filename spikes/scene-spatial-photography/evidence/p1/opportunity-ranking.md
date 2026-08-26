# Opportunity Ranking

> Historical V1 controlled-fixture evidence. Superseded for runtime acceptance by the P1 V2 direction-map and candidate model. The original result is preserved because real-device evidence later showed that one-region/one-opportunity behavior was not product-acceptable.

Acceptance: **PASS** on controlled fixtures.

- clean balanced alternatives outrank severely blurred and severely clipped candidates;
- clean-left and clean-right fixtures choose the corresponding third;
- a center edge conflict avoids center placement;
- Top-3 candidates reference valid regions and respect the configured 24° diversity neighborhood;
- reason codes map to measured descriptor thresholds;
- normalized placement rectangles stay inside image bounds;
- physical subject/camera positions are always `NOT_SUPPORTED`;
- safety is always `UNKNOWN_REQUIRES_USER_CONFIRMATION`.

Identical replay output is exact; a controlled minor yaw perturbation retains at least two of three dominant opportunities within the stability tolerance.
