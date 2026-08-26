# Fine Tune Performance Matrix

```text
Source = deterministic 360×480 RGBA fixture
Parameters = BRIGHTNESS / WARMTH / SATURATION
Changes per run = 20
Telemetry publication = once after each run (not per slider event)
OPPO controlled Main-app A/B = 12/12 ROWS COMPLETE
OPPO Plain H5 runs = 3 COMPLETE
```

Required modes are implemented behind the diagnostic build flag:

| Mode | Work included |
|---|---|
| UI_ONLY | numeric React state and paint only; no image or Canvas work |
| CURRENT | numeric state/paint + current `renderPixels` + Canvas commit |
| RENDERER_MAIN | current renderer math on Main thread, page orchestration bypassed |
| WORKER_DIAGNOSTIC | same current renderer module in an isolated Worker plus response/commit |
| PLAIN_H5 | separate page without Taro/React lifecycle, same brightness hot-path math |

The earlier production OPPO evidence remains the reproduction baseline:

```text
UI rAF FPS = as low as 13.0
Long Task max = 882.0ms
input→number = 804.7–824.0ms
input→preview p95 = 802.4–835.8ms
preview render p95 = 798.7–835.1ms
preview = 360×480
preview JPEG encode = 0
ObjectURL create/revoke = 0/0
```

Because the earlier product renderer's measured duration rises to approximately the same 800ms range, `MAIN_THREAD_RENDERER` was the leading candidate before the controlled matrix. The completed matrix below separates UI paint, integrated current work, renderer-only work, Worker handoff, and Plain H5.

OPPO Plain H5 evidence (Chrome Mobile 138.0.7204.168):

| Run | p50 (ms) | p95 (ms) | max (ms) | elapsed (ms) | Long Tasks | Long Task max (ms) |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 84.8 | 98.7 | 98.7 | 1805.6 | 20 | 100 |
| 2 | 66.5 | 80.4 | 80.4 | 1468.5 | 20 | 81 |
| 3 | 82.9 | 96.3 | 96.3 | 1784.9 | 20 | 96 |

```text
p50 range = 66.5–84.8ms; median of run p50 values = 82.9ms
p95 range = 80.4–98.7ms; median of run p95 values = 96.3ms
Long Task count = 20/20 render steps in every run
Long Task max range = 81–100ms
```

The isolated Plain H5 hot path is therefore a measured performance contributor on this OPPO device. It does not by itself reproduce the production path's approximately 800ms p95/max behavior, so generic H5 execution is not sufficient to explain that larger failure.

Completed Main-app A/B matrix, combined from external user screenshots `codex-clipboard-30f36db8-4fc5-4e53-aaec-32c778ef2b5c.jpg` and `bc92077e0d0898d064b3c86bfe3e9d04.jpg`:

| Parameter | Mode | p50 (ms) | p95 (ms) | max (ms) | throughput (/s) | Long Tasks / max (ms) | Render count |
|---|---|---:|---:|---:|---:|---|---|
| BRIGHTNESS | UI_ONLY | 33.5 | 41.6 | 41.6 | 26.6 | 0 / 0.0 | 20 |
| BRIGHTNESS | CURRENT | 124.8 | 144.8 | 144.8 | 7.7 | 20 / 124.0 | 20 |
| BRIGHTNESS | RENDERER_MAIN | 96.1 | 206.0 | 206.0 | 8.6 | 20 / 193.0 | 2 |
| BRIGHTNESS | WORKER_DIAGNOSTIC | 148.8 | 924.9 | 924.9 | 5.2 | 0 / 0.0 | 1 |
| WARMTH | UI_ONLY | 33.3 | 35.1 | 35.1 | 26.9 | 0 / 0.0 | 20 |
| WARMTH | CURRENT | 141.6 | 152.5 | 152.5 | 6.9 | 20 / 136.0 | 20 |
| WARMTH | RENDERER_MAIN | 83.6 | 119.1 | 119.1 | 11.2 | 20 / 120.0 | 1 |
| WARMTH | WORKER_DIAGNOSTIC | 176.3 | 295.1 | 295.1 | 5.2 | 1 / 55.0 | 1 |
| SATURATION | UI_ONLY | 33.1 | 34.8 | 34.8 | 26.9 | 0 / 0.0 | 20 |
| SATURATION | CURRENT | 159.9 | 206.7 | 206.7 | 5.9 | 20 / 161.0 | 20 |
| SATURATION | RENDERER_MAIN | 91.0 | 109.7 | 109.7 | 10.5 | 20 / 110.0 | 1 |
| SATURATION | WORKER_DIAGNOSTIC | 328.6 | 787.1 | 787.1 | 2.8 | 11 / 144.0 | 3 |

Evidence-supported classification:

```text
H5_BROWSER_BASELINE = MEASURED_SECONDARY
TARO_REACT_RENDER_CHURN = MEASURED_SECONDARY
MAIN_THREAD_RENDERER / PIXEL_LOOP = MEASURED_DOMINANT
GET_IMAGE_DATA = NOT_OBSERVED PER INPUT
PUT_IMAGE_DATA = NOT_DOMINANT BY RENDERER-MAIN VS CURRENT COMPARISON
TELEMETRY_CHURN = MEASURED_SECONDARY IN EARLIER PRODUCT PATH; removed from controlled harness hot loop
PREVIEW_SCHEDULER_BACKLOG = NOT_DOMINANT (max pending depth 1)
WORKER_TRANSFER / STARTUP = MEASURED_DOMINANT IN THIS DIAGNOSTIC WORKER PATH
```

UI-only p95 stays below 42ms with zero Long Tasks, while Current and Renderer Main create a Long Task for every measured step and reach 109.7–206.7ms p95. The synchronous renderer is therefore the dominant source of sustained Main-thread jank, with Taro/React state/paint and telemetry coupling secondary rather than primary.

The diagnostic Worker result is not evidence that Worker ownership is inherently slower. This harness creates and terminates a Worker for every sample and transfers a fresh source buffer each time; its p95 of 295.1–924.9ms classifies Worker startup/transfer/orchestration as dominant in this specific diagnostic path. It does not authorize or validate a production Worker redesign.

Desktop smoke evidence is retained only as harness validation, not device performance evidence. It proved all modes execute and the Plain H5 page produces scalar output.
