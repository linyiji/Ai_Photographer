# Angular Region Segmentation V0.1

Accepted descriptors are sorted by relative yaw. Neighboring frames remain together while yaw gaps and descriptor distance stay below configured thresholds. Descriptor distance uses luma, contrast, clutter, and edge-density differences; no panorama alignment or feature homography is used.

Boundaries are reported as `DESCRIPTOR_DISCONTINUITY` or `YAW_GAP`. Small singleton fragments are merged with the most similar neighbor, uniform sweeps may truthfully remain one region, and output is capped at eight regions. WIDE controlled replay is expected to produce a bounded 3–8 region representation when meaningful visual changes exist.

Each `SceneAngularRegion` records ordered yaw bounds, member keyframes, a valid representative keyframe, descriptor summary, visual quality/clutter, placement potential, coverage confidence, consistency, boundary penalty, and a deterministic region score.
