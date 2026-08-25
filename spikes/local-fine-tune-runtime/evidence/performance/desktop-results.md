# Desktop Performance Evidence

Environment: Windows desktop, Codex in-app Chromium browser, Canvas2D/ImageData CPU renderer. Source A is synthetic 1920×1080; preview is downsampled to 640×360.

## Browser interaction

| Path | p50 | p95 | Observation |
|---|---:|---:|---|
| Four global parameters after optimization | 80.1 ms | 147.9 ms | latest sampled 70.9 ms |
| Three overlapping local regions / interaction stress | 110–183 ms observed p50 | up to 557.4 ms transient p95 | visible delay possible during dense pointer updates |

Candidate targets were p50 `<50ms`, p95 `<100ms`. They are not global Authority. This renderer misses them and is therefore `PASS_WITH_WARNING`, not performance PASS for mobile.

## Final render

| Fixture | Resolution | Render | Encode | Result |
|---|---:|---:|---:|---|
| Browser synthetic export | 1920×1080 | 1397 ms | 79 ms | JPEG 137.7 KB, dimensions preserved |
| Node synthetic benchmark A | 1920×1080 | 1516.3 ms | n/a | PASS |
| Node synthetic benchmark B | 2560×1440 | 2566.5 ms | n/a | PASS, higher-resolution path |

The typical 1080p Final result meets the candidate `<3s` target. Browser memory API evidence was unavailable; no crash or visible allocation failure occurred. Backend fallback usage: none.

## Network and privacy

Static inspection found no `fetch`, XMLHttpRequest, Axios, WebSocket, EventSource, or remote URL in runtime source. Slider render network calls: 0. Provider calls: 0. Third-party uploads: 0.
