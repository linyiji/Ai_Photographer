# Product Workflow V1

`workflow-v1.json` is the machine-readable M01 workflow Authority. It keeps workflow stage, transition action, and domain state separate; it also defines QA recovery paths without resetting valid prior state.

All runtimes use the same stage language even when screens and platform adapters differ. The backend will persist meaningful business transitions, while per-frame live state remains local and ephemeral.

## Product Master Flow V2 mapping

The concise user-facing flow is not a replacement workflow:

| Product stage | Machine states |
|---|---|
| REALITY_CAPTURE | ENTRY / SHOOTING_RELATION_DEVICE_MODE / REALITY |
| AI_PHOTOGRAPHY_DIRECTOR | TARGET / SHOT |
| LIVE_SHOOTING | LIVE / CAPTURE |
| AI_PHOTO_QA + REALITY_PLUS | QA / REALITY_PLUS and retake edges |
| USER_FINE_TUNE | FINE_TUNE |
| MY_FINAL_PHOTO | FINAL |

For Phase 1, TARGET/SHOT can be populated by a validated deterministic preset. That proves Shot Plan execution only and does not assert Non-AI best-shot discovery.
