# XFX Codex Profile Context Loading Map V1.0

## Global minimum

Every task loads `AGENTS.md`, the canonical XFX Codex Standard, `XFX_Common_Execution_Core_V1.0.md`, the selected Profile, the current Task Contract, and the current Project Status/Handoff. Load historical evidence only when acceptance requires it.

| Profile | Additional minimum context |
|---|---|
| DOCUMENT_ENGINEERING | docs governance, canonical index, lifecycle/path map, affected authorities |
| ENVIRONMENT_TOOLCHAIN | Environment L0 Authority, cross-platform matrix, host evidence, version/lock strategy |
| FRONTEND_RUNTIME_COMPATIBILITY | Environment L0, cross-platform matrix, Web/Mobile reuse authority, compatibility contract, candidate evidence, handoff |
| FE_VISUAL_PRODUCT | approved Product Prototype/visual authority, page/module contract, responsive and interaction acceptance |
| FULLSTACK_INTEGRATION | API/business contract, runtime route, permissions, persistence/readback, relevant Auth/Session authority |
| BACKEND_DATA_CHANGE | schema, migration/ledger, target database class, data-quality and replay contracts |
| AI_RUNTIME_ENGINEERING | job/checkpoint/resume, model gateway, route resolver, provider and persistence authority |
| AI_EVAL_END_TO_END | relevant Capability, Model Route, Safety, scenario/fixture, asset lineage, PhotographySession evidence |
| REALTIME_CAMERA_CV | ShotDirection, FramePerception, CurrentShotState, LiveShotRuntime, Platform Adapter, Device Matrix, Safety, CH-003 |
| QA_CERTIFICATION | implementation checkpoint, acceptance contract, runtime/device target, known baseline failures, prior evidence |
| RELEASE_DEPLOYMENT | frozen source commit, release checklist, deployment mapping, environment and explicit Preview/Production authority |

Do not default-load unrelated prototypes, images, business history, database history, or archived task logs. Targeted rereads are allowed; full repository rescans are not the default.
