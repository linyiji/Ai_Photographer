# SceneSpatialContext V0.1

`SceneSpatialContextV01` is a spike-local, provider-neutral envelope derived from one accepted `SceneSweepManifest`, its `YawMap`, and transient keyframe pixels. It organizes the observed scene by relative yaw and image-plane composition; it is not a global M01 contract.

The context preserves source sweep coverage, camera dimensions, ordered angular regions, representative directions, aggregate visual quality, capabilities, limitations, and hard-zero privacy/network counters. Region and direction references always resolve to accepted P0 keyframe metadata.

P1 spatial scope is deliberately limited to relative angular organization and normalized image-plane rectangles. It does not contain semantic object labels, depth, metric camera pose, physical subject/camera coordinates, path planning, or a safety conclusion. Safety remains `UNKNOWN_REQUIRES_USER_CONFIRMATION` on every opportunity.

Raw keyframe pixels are accepted only as transient local input. Context serialization contains scalars and identifiers, never pixel arrays or media bytes.
