# LIVE-P2 Scalar Trace Format v2

Browser-local downloadable JSON only. The top-level object is `{ format: "xfx-live-p2-scalar-trace-v2", raw_media: false, evidence_context: {...}, gate1_acceptance?: {...}, rows: [...] }`.

Allowed rows contain timestamp/sequence, subject presence, filtered center X/height, filtered velocities/stability, target and signed Delta, active issue/action/runtime, Episode id/state, verification, control epoch, semantic scalar framing, visual scalar metrics, and an optional instruction event. `evidence_context` records the selected scenario plus browser/device-class and aggregate performance telemetry.

Gate 1 traces additionally lock the scalar Pre-ARM BodyMode/X/Scale validity and unchanged target relation, expected/actual trial coverage, precision Episode/success counts, READY source, post-READY ordinary count, and STOP-to-settle scalar causality. STOP telemetry includes the measurement version/epoch, X/Scale at STOP, first newer measurement, continued-motion observation, settling time, maximum scalar excursion, and any opposite reissue age.

The trace contains no frame, image, video, audio, landmark coordinates, raw device media, provider call, or backend upload. Recording clears when `ARM 新试验` is pressed and remains local until the user explicitly downloads it.
