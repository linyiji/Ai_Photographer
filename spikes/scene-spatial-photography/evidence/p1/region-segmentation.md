# Region Segmentation

The mixed 180° controlled sweep forms ordered, bounded regions from yaw adjacency and descriptor discontinuities. Uniform input truthfully remains one region. Representative keyframes always belong to their region, singleton fragments merge deterministically, and region scores stay within `[0,1]`.

Acceptance: **PASS**. Controlled WIDE fixture produces 4 source visual bands and a bounded region representation; runtime browser fixtures produced 3 visible angular regions for both QUICK and WIDE. No stitching, homography, depth, or semantic labels are used.
