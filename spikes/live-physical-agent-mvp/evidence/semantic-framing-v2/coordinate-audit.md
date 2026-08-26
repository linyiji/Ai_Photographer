# Canonical Visible Framing Coordinate Audit

Status: AUTOMATED PASS / DEVICE CONFIRMATION PENDING

1. **Sensor normalized coordinate** — MediaPipe X/Y, non-mirrored, is the control authority.
2. **Visible cover crop** — centered `object-fit: cover` scale is `max(container/source)`; offsets determine the actual sensor rectangle visible on screen. Crop classification uses this rectangle.
3. **Display coordinate** — the same cover projection maps semantic boxes/anchors to CSS pixels. Front-camera mirroring changes display X only.
4. **User action coordinate** — canonical physical left/right remains derived from non-mirrored sensor X and is never fed the CSS mirror transform.

Automated assertions cover matching aspect, horizontal crop, portrait sensor vertical crop, mirrored subject/target equality, and finite zero-size fallback. Target coordinates and semantic anchor share the same sensor basis before display projection.

The previous green-box ambiguity is removed from control semantics: raw min/max is labeled `DEBUG POSE EXTENT` and appears only when `Semantic Debug` is enabled. The normal subject guide uses the semantic body extent.
