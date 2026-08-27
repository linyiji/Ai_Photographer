# Scene Spatial V0.2 spike-local backend

This isolated first-party service is the only current-session `SpatialEvidenceV02.status` authority in the spike. The H5 client produces `SpatialPrecheckV01` routing hints only. Controlled fixtures validate the algorithm and never substitute for a user's session.

Run with the pinned Python 3.12 environment and dependencies in `requirements.txt`:

```powershell
$env:PYTHONPATH = 'D:\Projects\_bootstrap\.runtime\p2-opencv-python'
python backend/server.py --host 127.0.0.1 --port 8765
```

Endpoint: `POST /scene-spatial/geometry/analyze` using multipart `metadata` JSON plus 3–8 bounded JPEG frame parts. Raw video, continuous frame streams, Provider and Luna uploads are forbidden.
