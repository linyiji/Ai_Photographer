# XFX Scene Spatial P2 backend frame hash and working-image bounded remediation 02

Status: **AUTOMATED REMEDIATION PASS / REAL-DEVICE REVALIDATION PENDING**
Track: `PARALLEL_SCENE_SPATIAL`
Start head: `39f1eaf0b95315308904cd2b43e56fc70b20990c`

## Established failure

OPPO evidence established `OPPO_CLIENT_PRECHECK = PASS`, `OPPO_FRAME_SELECTION = PASS_WITH_WARNING`, `OPPO_BACKEND_REQUEST = FAIL` and `SpatialEvidenceV02 = NOT_PRODUCED`. The server recorded HTTP 400 `FRAME_SET_HASH_MISMATCH` before Geometry Solver execution. A later local cancellation did not reinterpret that backend response as a geometry status. A two-frame run remained correctly `NOT_REQUESTED`.

The old H5 path also fixed width to 640px, producing `640×1138` from a `1080×1920` portrait source. That violated both the 640px target-long-edge contract and the backend 960px maximum.

## Canonical hash contract

For every selected frame, `frame_sha256 = SHA256(exact uploaded JPEG bytes)`. The ordered frame-set canonical representation is compact UTF-8 JSON `[[frame_id, frame_sha256], ...]`; `frame_set_hash` is SHA-256 of those exact canonical bytes. Multipart envelopes, boundaries, decoded pixels, re-encoded JPEGs and object iteration order are excluded.

The previous generic email multipart parser was replaced with a bounded parser that separates headers while slicing each binary part directly from the received request body. Hash validation consumes those exact bytes before CV decode. Per-frame `encoded_bytes` is validated independently.

## Working-image and evidence contract

Client resize now uses `scale = min(1, 640 / max(sourceWidth, sourceHeight))`, preserves aspect ratio/orientation and never upscales. Each selected-frame trace contains source/working dimensions, encoded size and raw-JPEG hash. The backend retains its 960px maximum and does not repair oversized client inputs.

HTTP failures now preserve status, content type, JSON error code/body or text fallback. Downloaded P2 evidence contains request state, HTTP status, normalized error, bounded payload metadata, resize/encode/hash/prepare/upload/backend/total timing and nullable `SpatialEvidenceV02`. Request failure and successful `INSUFFICIENT` are distinct.

## Automated evidence

- frontend current suite: 160/160 PASS, including five-case resize matrix, no-upscale invariant, client binary/frame-set hashes and JSON/text HTTP errors;
- backend current suite: 13/13 PASS, including binary multipart preservation, byte mutation, order sensitivity, incorrect declared hash, resolution acceptance/rejection and HTTP request-to-Solver reachability;
- production build: PASS, 55.93kB JS / 19.12kB gzip;
- controlled geometry matrix: deterministic PASS; pure-rotation false usable 0; low-parallax false usable 0; direction 4/4; cache PASS; client precheck FP/FN 0/0;
- controlled matrix timing: P50 3.270ms / P95 72.373ms;
- generated-media backend benchmark: compute P50 64.295ms / P95 90.760ms; payload P50 721,488 bytes / P95 721,808 bytes;
- local browser-compatible multipart request: HTTP 200, Solver reached, `SpatialEvidenceV02` produced;
- privacy: raw video 0, frame stream 0, selected frames first-party backend only, Provider 0, Luna 0, real user media in Git 0.

## Pending real-device closure

Automated remediation is complete. Exactly one fresh OPPO QUICK and one fresh OPPO WIDE are required. Each must return HTTP success, show bounded working dimensions, reach Solver and produce `SpatialEvidenceV02`; `INSUFFICIENT`, `PARTIAL` or `USABLE` are all acceptable runtime outcomes. Until then `P2_REAL_DEVICE_RUNTIME_GATE = FAIL`. Geometry algorithm semantics are unchanged and were not retuned.
