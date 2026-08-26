# OPPO K11 P2 real-device gate

Status: **MANUAL_REVIEW_REQUIRED / NOT YET EXECUTED**

Use one ordinary Scene Scan per run; do not perform a separate 3D scan. Chrome Mobile through trusted HTTPS Quick Tunnel.

Required runs:

1. mostly rotate in place;
2. slow scan with natural lateral translation;
3. slow scan with small forward/back movement;
4. mixed natural scan.

For each exported P2 result record scan duration, P0 keyframe count, geometry frame count, preview FPS, orientation rate, angular coverage, features/tracks, RANSAC inlier ratio, median parallax, classification, SpatialEvidence status and total analysis latency. The mostly-in-place run must not be `USABLE`.

User qualitative checks: camera continuity, no black screen, no freeze/jank, no huge false jump, one-scan UX remains understandable. Return the four Manifest/P2 JSON pairs. No raw user images are required.
