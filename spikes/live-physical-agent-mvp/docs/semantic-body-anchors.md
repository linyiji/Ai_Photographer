# Semantic Body Anchors

## Horizontal control

Canonical X remains sensor-normalized and non-mirrored.

Priority:

1. confidence-weighted shoulder-pair and hip-pair center fusion;
2. bilateral shoulder center;
3. bilateral hip center;
4. head center only as low-confidence coarse fallback.

Wrists, elbows, knees, ankles, and foot points never enter `TORSO_ANCHOR_X`. One-sided/fallback evidence raises uncertainty. Precision left/right is suppressed whenever uncertainty can plausibly cross the target boundary or sign.

## Scale

| BodyMode | Metric family | Robust components |
| --- | --- | --- |
| `HEAD_SHOULDERS` | `HEAD_SHOULDER_SCALE` | shoulder width + head-to-shoulder span |
| `UPPER_BODY` | `TORSO_COMPOSITE_SCALE` | shoulder width + shoulder-to-hip torso length |
| `THREE_QUARTER` | `THREE_QUARTER_COMPOSITE_SCALE` | calibrated shoulder width + torso + hip-to-knee span |
| `FULL_BODY` | `FULL_BODY_ROBUST_SCALE` | head-to-ankle pair extent + calibrated shoulder corroboration |

Independent component disagreement, pair confidence, fallback source, crop state, and short-window variance form bounded deterministic uncertainty proxies. They are diagnostic gates, not statistical confidence claims.

Vertical anchors support classification, crop evidence, and display only. No `MOVE_UP`/`MOVE_DOWN` action is introduced.
