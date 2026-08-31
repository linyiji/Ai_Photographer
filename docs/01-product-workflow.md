# 01｜Product Workflow

> **2026-08-31 authority note:** the user-facing Product Master Flow is governed by `docs/product-design/82-product-master-flow-v2.md`. The machine workflow below remains the detailed execution state model and must not be collapsed into the five user-facing stages.

```text
ENTRY
↓
SHOOTING RELATION / DEVICE MODE
↓
REALITY UNDERSTANDING
↓
TARGET SELECTION / ADAPTATION
↓
SHOT DIRECTION
↓
REALTIME SHOT CONTROL
↓
CAPTURE
↓
CAPTURE QA / RETAKE ROUTER
↓
REALITY+
↓
OPTIONAL USER FINE TUNE
↓
MY FINAL PHOTO
↓
FINAL ACTION HUB
```

必须保持：

```text
SelectedTarget = WHAT
ShotDirection = HOW
```

Under Product Master Flow V2, these M01 objects remain compatible projections inside a selected Shot Plan. Scene Spatial supplies evidence only; the Director owns Shot Plan decision semantics; Live executes the resulting target.

QA Decision：

- ACCEPT
- ACCEPT_WITH_REPAIR
- RETAKE_MICRO
- RETAKE_POSE
- RETAKE_FRAMING
- RETAKE_POSITION
- REPLAN
