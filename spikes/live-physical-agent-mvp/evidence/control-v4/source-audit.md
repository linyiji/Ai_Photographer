# V3 → V4 source audit

| Area | Decision | V4 treatment |
|---|---|---|
| Camera session/runtime | KEEP | Camera ownership, preview, scheduler and HTTPS paths are unchanged. |
| MediaPipe Pose runtime | KEEP | Still a bounded local observation source. |
| Semantic framing landmarks/filters | ADAPT | Reprojected into body-region evidence, semantic anchors and target-independent spans. |
| Visual presentation/theme | KEEP | Presentation remains downstream and cannot modify controller semantics. |
| V3 measurement projector | DEPRECATE | It mixes Current evidence with target relations and BodyMode compatibility. V4 does not call it. |
| V3 fixed `TargetState` center/height semantics | DEPRECATE | Replaced by externally selected `LiveTargetV02` fixtures. |
| BodyMode distance authority | REMOVE | `BodyMode` is diagnostic summary only. |
| Fixed `x = 0.5` authority | REMOVE | X comes from the active target fixture (0.33, 0.50 or 0.67 in the acceptance matrix). |
| V3 900 ms settle-without-response path | REMOVE | V4 requires observed motion before settle/evaluation. |
| V3 historical replay/evidence | KEEP | Read-only regression history; no historical evidence was rewritten. |

The V3 OPPO failure at `7798fa5…` remains historical input, not V4 acceptance evidence.

