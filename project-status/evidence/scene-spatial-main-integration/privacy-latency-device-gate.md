# Privacy, latency, and device gate

Privacy boundary:

- `RAW_VIDEO_UPLOAD = 0`
- `FRAME_STREAM_UPLOAD = 0`
- `SELECTED_GEOMETRY_FRAME_UPLOAD = FIRST_PARTY_BACKEND_ONLY`
- `PROVIDER = 0`
- `LUNA = 0`
- `REAL_USER_MEDIA_IN_GIT = 0`

Only 3-8 selected JPEG working frames may cross to the existing first-party FastAPI backend. Client working edge is at most 640 px; backend rejects values over 960 px. Upload metadata carries each exact binary SHA-256 and the ordered frame-set hash. No base64 conversion or third-party image/provider path is introduced.

The accepted P2 transport-latency warning is preserved. It does not reopen Geometry optimization and does not block P1. Cache identity is `scan_id + frame_set_hash + geometry_solver_version`; intent, subject, recommendation, and future AI prompt do not participate.

The official WeChat Developer Tools installation is present, but its CLI service port is disabled. This task did not change that security setting. Current compiled AppService passed the bounded forbidden-global/bootstrap compatibility check, but no fresh phone-to-backend Scene Scan was fabricated. Therefore:

- `INTEGRATED_DEVICE_GATE = MANUAL_REVIEW_REQUIRED`
- `INTEGRATED_SPATIAL_STATUS = NOT_EXERCISED`
- `REAL_PROVIDER = PASS_WITH_WARNING`

The next owner-operated device gate should run one bounded WeChat Scene Scan and verify Session creation, immediate P1, non-blocking UI, request arrival at Main FastAPI, SpatialEvidenceV02 (any of INSUFFICIENT/PARTIAL/USABLE), and no P1 reset.
