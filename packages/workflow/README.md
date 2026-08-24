# Product Workflow V1

`workflow-v1.json` is the machine-readable M01 workflow Authority. It keeps workflow stage, transition action, and domain state separate; it also defines QA recovery paths without resetting valid prior state.

All runtimes use the same stage language even when screens and platform adapters differ. The backend will persist meaningful business transitions, while per-frame live state remains local and ephemeral.
