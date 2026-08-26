# Fine Tune Render Audit

Static hot-path trace:

```text
Source decode/getImageData = once when Fine Tune opens
Per-slider source decode = 0
Per-slider getImageData = 0
Per-slider JPEG encode = 0
Per-slider ObjectURL refresh = 0
Per-slider work = recipe/state + synchronous renderPixels + putImageData
Production preview Worker = NO
Finalize Worker/OffscreenCanvas = capability dependent and outside preview hot path
```

Current UI state coupling:

- every interactive value calls `setRecipe`, rendering the FineTuneEditor component;
- every committed preview updates telemetry state;
- input-number telemetry schedules another React state update;
- long-task observer updates telemetry state for each observed entry in the current product instrumentation;
- telemetry UI is part of the same FineTuneEditor render tree.

The diagnostic harness publishes aggregate results only after a run, so its own telemetry is below the required 2Hz contamination limit.

OPPO controlled A/B result:

```text
UI_ONLY p95 = 34.8–41.6ms / Long Tasks 0
CURRENT p95 = 144.8–206.7ms / Long Tasks 20 per 20 steps
RENDERER_MAIN p95 = 109.7–206.0ms / Long Tasks 20 per 20 steps
WORKER_DIAGNOSTIC p95 = 295.1–924.9ms
PLAIN_H5 p95 = 80.4–98.7ms / Long Tasks 20 per 20 steps
```

Classification:

```text
MAIN_THREAD_RENDERER / PIXEL_LOOP = MEASURED_DOMINANT
TARO_REACT_RENDER_CHURN = MEASURED_SECONDARY
H5_BROWSER_BASELINE = MEASURED_SECONDARY
PUT_IMAGE_DATA = NOT_DOMINANT
WORKER_TRANSFER / STARTUP = MEASURED_DOMINANT IN DIAGNOSTIC WORKER PATH ONLY
```

The Worker harness instantiates and terminates a Worker for each sample, so it measures startup plus buffer transfer plus renderer plus response/commit. It is a valid negative A/B for this implementation, not a prediction of a persistent production Worker design.
