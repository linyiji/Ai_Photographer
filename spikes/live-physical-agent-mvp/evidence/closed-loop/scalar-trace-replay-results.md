# LIVE-P2 Scalar Trace Replay Results

The deterministic harness feeds structured scalar P1 states through the same controller used by the phone page. All 18 mandatory fixtures are present: delayed response, gradual X/scale, cross into deadband, overshoot, true wrong direction, no motion, jitter, improving stop/regress, reissue, READY causality, HOLD exclusion, timer invariant, eight renders/one event, sequential X/Scale, and temporary loss.

Node replay is deterministic. Browser replay `correct-gradual-x` ended with `Trial READY / 2.2 s`, Episode `1 / TERMINAL`, ordinary/HOLD/SUCCESS `1/1/1`, `SUCCESS / 100.0%`, motion/deadband true, and no console error. Provider/Backend/Luna/Upload remained `0/0/0/0`.
