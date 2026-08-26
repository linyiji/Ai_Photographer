# PhotographyOpportunity V0.1

> Historical P1 V1 baseline — superseded by `p1-direction-map-and-candidates-v0.1.md` under `SCENE_SPATIAL_TRACK_DESIGN_AUTHORITY_V0_1`. It is retained as checkpoint provenance and is no longer the active runtime output.

`PhotographyOpportunityV01` ranks valid angular regions for a local `PhotographyIntent`. P1 defaults to `SINGLE_PERSON` with `ENVIRONMENTAL` framing and `AUTO` composition.

The versioned score combines representative frame quality, region quality, low clutter, placement potential, low edge conflict, exposure, and confidence. Severe blur/exposure multipliers prevent broken frames from ranking first when usable alternatives exist. Top selection suppresses candidates inside a configurable 24° neighborhood and returns at most three truthful alternatives.

Reason codes are derived directly from measured thresholds, including balanced exposure, sharpness, low clutter, a clean placement anchor, clearance, stability, and explicit penalties. UI labels are compositional only; semantic scene captions are forbidden.

Every result fixes `physical_subject_position` and `physical_camera_position` to `NOT_SUPPORTED`, and `safety` to `UNKNOWN_REQUIRES_USER_CONFIRMATION`. Relative yaw is sweep-local and is never displayed as global compass truth.

OPPO K11 V1 evidence showed four real sweeps collapsing to one region and one opportunity. The amended runtime therefore separates candidate generation from region count and removes P1 ownership of the final photography decision.
