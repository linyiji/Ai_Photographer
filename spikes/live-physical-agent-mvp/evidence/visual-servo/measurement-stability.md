# Measurement Stability Evidence

Status: AUTOMATED PASS / OPPO K11 REAL-DEVICE FAIL.

- Velocity-aware EMA: quiet alpha `0.22`, moving alpha `0.48`.
- Measurement quiet window: `350 ms`; jitter threshold: `0.018` normalized box distance.
- History is bounded to 120 observations.
- Automated alternating-jitter trajectory proves stabilized mean box movement is lower than raw mean box movement.
- Automated meaningful-motion trajectory proves the box follows motion rather than freezing.
- READY authority alignment regression proves controller READY cannot coexist with a visually lagging outside box.
- Scalar trace and HUD expose raw jitter, stabilized jitter, estimated visual latency, projection age, crossing delay, and inside-to-READY time.

No acceptance threshold was widened and no raw media is retained.

Fresh device scalar means are raw `0.0244` and stabilized `0.0144`, a 41.0% reduction. Estimated visual latency is mean/p95/max `261/500/500 ms`. The user still judged the rendered subject box unstable and not naturally usable as a primary guide, so numeric reduction does not satisfy the functional gate.
