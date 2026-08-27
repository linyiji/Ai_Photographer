# Scene Spatial V0.2 spike-local backend

This isolated first-party service is the only current-session `SpatialEvidenceV02.status` authority in the spike. The H5 client produces `SpatialPrecheckV01` routing hints only. Controlled fixtures validate the algorithm and never substitute for a user's session.

Run with the pinned Python 3.12 environment and dependencies in `requirements.txt`:

```powershell
$env:PYTHONPATH = 'D:\Projects\_bootstrap\.runtime\p2-opencv-python'
python backend/server.py --host 127.0.0.1 --port 8765
```

Endpoint: `POST /scene-spatial/geometry/analyze` using multipart `metadata` JSON plus 3–8 bounded JPEG frame parts. Raw video, continuous frame streams, Provider and Luna uploads are forbidden.

## Binary identity contract

Each `frame_sha256` is SHA-256 of the exact uploaded JPEG part bytes, before image decoding. `frame_set_hash` is SHA-256 of the UTF-8 JSON serialization of the ordered array `[[frame_id, frame_sha256], ...]` using compact separators. Multipart boundaries, FormData serialization, decoded pixels and re-encoded JPEGs are never part of either identity. The server parses metadata headers separately while preserving image part bytes losslessly for validation and later CV decode.

Client working images preserve pixel orientation and aspect ratio. Their longest edge targets 640px without upscaling; the backend independently rejects any declared working long edge above 960px instead of silently resizing it.
