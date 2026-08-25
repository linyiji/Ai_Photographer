# Visual Servo Guidance

The visual-servo layer projects the existing local controller state into an on-preview guide. It does not change target, deadband, priority, Episode, STOP, verification, or READY semantics.

`VisualGuidanceState` contains the stabilized subject box, target box, acceptable zone, tracking state, per-axis status, the single current direction, STOP/READY state, and scalar visual metrics. `TEXT_DOMINANT`, `VISUAL_SERVO`, and `VISUAL_PLUS_TEXT` are presentation modes over the same state; `VISUAL_PLUS_TEXT` is the default and keeps text as a secondary explanation.

The target outline comes from `TargetState`. The acceptable zone is derived from the same X and scale tolerances used by the controller; it is not widened to improve acceptance. Mirroring and `object-fit: cover` projection are applied equally to subject and target geometry at the viewport boundary, while controller coordinates remain non-mirrored sensor coordinates.

Only one directional cue may be visible. `STOP_HERE` produces the distinct STOP visual and is not rendered as a direction. READY is driven only by controller READY and retains its explicit source. Missing tracking produces LOST; a short bounded loss produces HELD without inventing a new measurement.

No frame, video, landmark array, provider call, backend call, or Luna call is added by this layer.
