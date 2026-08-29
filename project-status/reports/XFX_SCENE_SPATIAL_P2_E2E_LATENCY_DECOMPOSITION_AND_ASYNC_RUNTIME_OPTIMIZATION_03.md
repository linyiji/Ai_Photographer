# XFX Scene Spatial P2 E2E latency decomposition and async runtime optimization 03

Status: **AUTOMATED PASS / ONE QUICK + ONE WIDE REAL-DEVICE WATERFALL PENDING**
Track: `PARALLEL_SCENE_SPATIAL`
Start head: `968dcb71c3d23c157e325796c7987c38a91d74c1`
Geometry algorithm gate: **UNCHANGED**

## Accepted baseline

- OPPO QUICK `sweep-1787994955242`: 5 frames, `360×640`, 124,485B, HTTP 200, Solver 29.716ms, E2E 4,606.3ms, valid `INSUFFICIENT / PURE_ROTATION_OR_HOMOGRAPHY_DOMINANT`.
- OPPO WIDE `sweep-1787994900356`: 7 frames, `360×640`, 220,363B, HTTP 200, Solver 106.005ms, E2E 9,037.8ms, valid `INSUFFICIENT / LOW_PARALLAX`.

These are valid Geometry results. No threshold, GFTT/PyrLK, pose, triangulation, early-exit, camera-model or Spatial Evidence semantics changed.

## Authoritative timing contract

The client now records monotonic timestamps for scan completion, Geometry selection, resize, JPEG encode, hash, multipart build, fetch start, response headers, response body completion and Spatial Evidence application. Derived durations are separately exported as frame selection, resize, encode, hash, multipart build, network wait, response read, client apply, fetch, backend processing, `TRANSPORT_AND_QUEUE_REMAINDER` and total E2E. `prepare_ms` no longer hides these stages.

The backend separately records request-body receipt, lossless multipart parse, validation, cache lookup, Solver and response serialization. `multipart_parse_ms` begins only after the body has been read. `backend_total_after_body_received_ms` excludes body receipt. Client and server absolute clocks are never subtracted.

Every request has one `geometry_request_id`, present in client evidence, backend logs, top-level backend response and `SpatialEvidenceV02.diagnostics`.

## Same-class localhost baseline

Generated-only inputs matched the accepted classes: QUICK 5×`360×640` / 128,554B and WIDE 7×`360×640` / 224,643B. Each class used one cold miss followed by two keep-alive cache hits.

| Local stage | QUICK P50 / P95 | WIDE P50 / P95 |
|---|---:|---:|
| resize | 5.710 / 6.727ms | 7.713 / 7.776ms |
| encode | 2.819 / 2.834ms | 3.942 / 4.048ms |
| hash | 0.086 / 0.104ms | 0.135 / 0.136ms |
| multipart build | 0.070 / 0.109ms | 0.095 / 0.096ms |
| body receive | 0.055 / 0.069ms | 0.117 / 0.165ms |
| multipart parse | 0.128 / 0.277ms | 0.159 / 0.185ms |
| transport + queue remainder | 0.784 / 1.398ms | 0.658 / 0.764ms |
| E2E | 10.844 / 82.623ms | 13.083 / 87.852ms |

Cold-miss Solver was 79.387ms QUICK and 81.984ms WIDE. Warm cache-hit Solver was 0ms. Cold-to-warm E2E differences were 80.305ms and 83.088ms, almost entirely the deliberate cold Solver miss on localhost.

## HTTPS Quick Tunnel path

The generated workload was repeated through `HTTPS Quick Tunnel → Vite same-origin proxy → first-party backend`, three requests per class over a reused client connection. This is the same proxy/tunnel family as OPPO but is a workstation diagnostic, not OPPO radio evidence.

| Tunnel stage | QUICK P50 / P95 | WIDE P50 / P95 |
|---|---:|---:|
| fetch | 2,123.913 / 3,295.090ms | 3,427.586 / 4,963.584ms |
| body receive | 1,759.006 / 2,068.696ms | 3,026.392 / 4,518.130ms |
| multipart parse | 0.202 / 0.509ms | 0.229 / 0.281ms |
| validation | 0.137 / 0.224ms | 0.158 / 0.425ms |
| transport + queue remainder | 700.508 / 1,184.713ms | 400.631 / 746.993ms |
| E2E | 2,133.339 / 3,304.525ms | 3,441.012 / 4,975.810ms |

Tunnel cold-miss Solver was 81.719–81.902ms; response serialization was at most 0.106ms. Cold-to-warm differences were 1,359.596ms QUICK and 1,884.788ms WIDE, so tunnel variability dominates and the difference must not be attributed solely to TLS, cache or backend cold start.

Primary latency family: **SERVER_BODY_RECEIVE**. Secondary family: **TRANSPORT** (`TRANSPORT_AND_QUEUE_REMAINDER`). Multipart parse, validation, cache, Solver and response are not the multi-second source.

## Bounded optimization and audits

- P1 candidates render before P2 starts and remain usable while the backend request continues.
- Product state is `VIEW_READY_GEOMETRY_PENDING`; repeat, WIDE and mode controls stay enabled. Backend `INSUFFICIENT` does not reset P1.
- Starting a new scan aborts the old browser request as `CLIENT_SUPERSEDED`; a completed backend result remains stored in its original trial evidence.
- Browser preparation already encodes and hashes concurrently within the hard 8-frame cap. Device evidence did not justify adding worker pools.
- Each selected frame is resized once during scan, encoded once after scan, converted to exact Blob bytes once for hashing, and that same Blob is appended to binary multipart. No base64 is used.
- FormData construction is explicitly timed and is sub-millisecond in same-class generated baselines.
- Backend reads the body once, parses once, validates hashes before decode and preserves exact byte identity. No correctness tradeoff was made.
- HTTP/1.1 keep-alive is enabled; repeated identical scan/frame-set/solver requests hit cache. Photography intent does not alter Geometry cache identity; a changed frame set does.
- 640px target long edge, 960px backend maximum, JPEG quality, frame count and all Geometry early exits remain unchanged.

## Regression and browser evidence

- TypeScript: 161/161 PASS.
- Backend: 14/14 PASS.
- Production build: PASS, 59.31kB JS / 20.09kB gzip.
- Controlled matrix: deterministic; pure-rotation false usable 0; low-parallax false usable 0; direction 4/4; cache PASS.
- Local browser Fixture: P1 visible with 3 candidates; start, next-sweep and mode controls enabled; no backend upload.
- Privacy: raw video 0, frame stream 0, selected Geometry frames first-party backend only, Provider 0, Luna 0, real user media in Git 0.

## Real-device closure gate

Runtime code and evidence format changed materially, so exactly one fresh OPPO QUICK and one fresh OPPO WIDE are requested. Each downloaded P2 JSON must contain `geometry_request_id`, complete client/backend waterfalls, HTTP result and `SpatialEvidenceV02`. No additional scan is requested. Until those two files are reviewed, `P2_RUNTIME` remains `ACCEPTED_WITH_LATENCY_WARNING` and this task remains real-device pending.

P3 and Main Integration remain `NOT_STARTED`.
