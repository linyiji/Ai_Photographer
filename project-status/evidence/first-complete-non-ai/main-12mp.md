# Main 12MP Gate

Controlled full-quality source: `4000 × 3000` JPEG (12,000,000 pixels), generated outside the repository and passed through the real Main integrated upload → Session → Fine Tune → derived → Final route.

Fresh measured non-BLUR run:

```text
Adjustment = ALL / BRIGHTNESS / non-neutral
Source dimensions = 4000 × 3000
Final dimensions = 4000 × 3000
Preview reused as final = NO
Backend = WORKER_OFFSCREENCANVAS
Decode = 250.1 ms
Render = 4482.2 ms
Encode = 252.2 ms
Total = 4984.5 ms
UI frame heartbeats during render = 288
UI maximum frame gap = 50.1 ms
UI responsive = true
Derived assets = 1
Finalize events = 1
Browser fatal errors = 0
Crash / OOM = NONE
```

Controlled BACKGROUND BLUR is `UNAVAILABLE_BY_MASK_POLICY` on the accepted Main user path because no legal controlled mask is supplied. AUTO semantic mask remains off. The deterministic controlled-mask test fixture still passes, but is not mislabeled as a Main user route.
