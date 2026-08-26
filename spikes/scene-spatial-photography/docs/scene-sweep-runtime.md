# Scene Sweep Runtime

`SCENE_SWEEP` observes a relative angular arc; it does not generate a panorama. QUICK targets 110°, WIDE 180°, and FULL 360° remains experimental. A local session moves `ACQUIRING → SWEEPING → COMPLETE`, or `CANCELLED`; useful-frame coverage is a min/max span, so reversal never double-counts. Steps above 45° are rejected as sensor spikes.

The camera defaults to rear `environment`, requests permission only after Start, owns/stops every track, and invalidates stale async requests. Candidate work runs at a bounded 8 Hz with synchronous, non-queued evaluation. Preview FPS is independently measured with `requestVideoFrameCallback` when present.
