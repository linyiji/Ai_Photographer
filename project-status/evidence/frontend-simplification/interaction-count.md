# Frontend Simplification — Interaction Count

## Normal new-session path

| Segment | User decision count | Result |
|---|---:|---|
| App open -> tap `开始拍摄` | 1 | Session created and legal internal preparation starts |
| Prepared SHOOT -> tap `打开相机` | 1 | Camera permission requested and preview attempted |
| Camera ready | 0 additional | Target `<=3` met with actual count 2 |
| Shutter | excluded | Required capture act, not a decision |
| Local preview -> `使用这张` | 1 required confirmation | Upload and Capture commit authorized |
| Confirm -> FINAL | 0 | Deterministic QA/processing placeholders auto-advance |

```text
INTERACTION_COMPLEXITY_GATE = PASS
APP_TO_CAMERA_DECISIONS = 2
CONFIRM_TO_FINAL_ADDITIONAL_DECISIONS = 0
```

Settings, My Works, explicit Resume, retake, and conditional import remain available without becoming mandatory happy-path decisions.
