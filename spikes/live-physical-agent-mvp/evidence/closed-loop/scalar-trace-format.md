# LIVE-P2 Scalar Trace Format v1

Browser-local downloadable JSON only. The top-level object is `{ format: "xfx-live-p2-scalar-trace-v1", raw_media: false, rows: [...] }`.

Allowed rows contain timestamp/sequence, subject presence, filtered center X/height, filtered velocities/stability, target and signed Delta, active issue/action/runtime, Episode id/state, verification, and an optional instruction event. The trace contains no frame, image, video, audio, landmark coordinates, device identifier, provider call, or backend upload. Recording clears when `ARM 新试验` is pressed and remains local until the user explicitly downloads it.
