# Frontend Simplification — Desktop H5 E2E

```text
Environment = LOCAL / INTERNAL_DEMO
Browser = Codex In-app Chromium
API = 127.0.0.1:8000 / temporary SQLite and asset root
H5 = 127.0.0.1:4173 / built static output
Test asset = repository-controlled S01-A03 target preview
User media = 0
```

## Results

```text
START -> SHOOT -> Capture -> REVIEW -> FINAL = PASS
Explicit Resume = PASS
Camera permission denial -> conditional import fallback = PASS
Preference persisted and applied to new Session = PASS
Session UI override reset on explicit resume = PASS
Pre-confirm upload = 0
Pre-confirm CaptureAsset = 0
Pre-confirm CREATE_CAPTURE event = 0
Pre-confirm revision = 7 / unchanged by local selection
Confirmed final revision = 10
Confirm -> Final additional decisions = 0
Console fatal errors = 0
```

The first controlled camera attempt also exposed a recoverability defect: a capture failure could leave the UI in camera mode while the copy recommended import. The bounded fix closes the camera, records failure presentation state, and reveals the import fallback. A second bounded fix resets that presentation-only failure state between Sessions. Both were rebuilt and reverified.

The E2E did not claim real-device Camera acceptance. It reused the existing project fixture only within the local test API and committed no runtime database, uploaded binary, hostname, or media evidence.
