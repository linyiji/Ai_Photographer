# Capture Confirmation

Fresh API/browser evidence and `test_first_complete_non_ai_flow.py` prove:

```text
Local candidate before confirmation = no server mutation
Pre-confirm upload = 0
CaptureAsset before confirmation = 0
Retake before confirmation = workflow unchanged
Confirmed upload = exactly 1 stored binary
Duplicate confirmation with the same key = same revision
CREATE_CAPTURE_COMMITTED events = 1
Capture assets after confirmation = 1
```

The frontend keeps `busy=true` during confirmation and uses a stable key derived from the local candidate. The Main backend remains the final exactly-once authority.
