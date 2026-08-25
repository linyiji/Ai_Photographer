# First Complete Non-AI Product Flow — Capability Matrix

Task: `XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01`  
Admission base: `56cd8e5c41ef35b3af43ff5979e5c921fdfddd17`  
Authority state: accepted `origin/develop`; post-checkpoint prototype redesign is deferred.

| Capability | Current implementation evidence at admission | Required acceptance | Initial disposition |
| --- | --- | --- | --- |
| Frontend product shell | Taro H5/WeChat client, START/SHOOT/REVIEW/FINAL surfaces | Complete user-visible Non-AI flow | VERIFY |
| Backend | FastAPI + SQLite Session service | Real local API and persistent business state | VERIFY |
| Session / Workflow | M01 workflow actions and server Session authority | Legal transitions and refresh/resume | VERIFY |
| Camera / local capture | H5 still camera plus device import fallback | OPPO Main H5 capture, switch, retake, orientation | DEVICE_GATE |
| Capture confirmation | Local candidate before `CREATE_CAPTURE`; idempotency key | Zero upload/asset before confirm; exactly once after confirm | VERIFY |
| Capture QA | `ACCEPT`, `ACCEPT_WITH_REPAIR`, retake actions | ACCEPT / REPAIRABLE / RETAKE paths preserved | VERIFY |
| Reality+ | Deterministic accepted baseline; QA adapter remains internal fake | Exact status disclosure; no false real-AI claim | VERIFY |
| Fine Tune runtime | Deterministic client runtime and Main API recipe/finalization | ALL/LOCAL, undo/redo/reset/compare/save/reload/finalize | VERIFY |
| Semantic regions | Controlled-mask paths only; auto semantic mask not admitted | PERSON/BACKGROUND/blur unavailable without legal mask | VERIFY |
| Neutral finalize | Server selects accepted source without derived upload | No fake derived asset | VERIFY |
| Non-neutral finalize | Derived JPEG upload + persisted recipe | Exactly one derived asset and exact lineage | VERIFY |
| AdjustmentRecipe | Main SQLite business object | Save, idempotency, reload, `semantic_edit_allowed=false` | VERIFY |
| MyFinalPhoto | Final projection linked to recipe/source/derived asset | Exact selected asset and recipe identity | VERIFY |
| Refresh / Resume | Session GET/list plus persisted recipe/assets/events | Checkpoints from capture through FINAL | VERIFY |
| My Works | Session list classifies ACTIVE/COMPLETED | Correct current and multiple-session isolation | VERIFY |
| Download / Share | Final content endpoint + H5 adapters/fallback | Download and supported share/fallback | VERIFY |
| Desktop Golden Flow | Existing browser flow and Fine Tune integration evidence | Fresh built-H5 run against real Main API | VERIFY |
| OPPO K11 Main H5 | Prior M05 device evidence; Fine Tune Main not yet rerun | Fresh user-operated trusted-HTTPS Main flow | DEVICE_GATE |
| Main 12MP | Fine Tune worker/runtime present; Main 12MP not yet rerun | 4000x3000 non-BLUR, metrics, responsive UI | VERIFY |
| WeChat | Accepted compile pipeline | Fresh build; device Fine Tune may remain unverified | VERIFY |
| M03 deterministic replay | 12 scenarios plus Fine Tune 10-scenario fixture | Existing suites and Fine Tune 10/10 stay deterministic | VERIFY |
| Provider / Luna | Product decision deferred; provider unconfigured | Zero calls | VERIFY |
| Privacy | Local slider processing; bounded confirmed still upload | Zero third-party/per-slider/raw-video/frame-stream upload | VERIFY |
| Prototype redesign | Weather/location home, carousel, bottom tab, new IA, P10–P13 redesign | Must not be implemented | `DEFERRED_PRODUCT_DESIGN` |
| Live parallel track | Independent protected Worktree | No integration or mutation | UNTOUCHED |

This matrix is an admission inventory, not a PASS claim. Each `VERIFY` or `DEVICE_GATE` row requires fresh evidence under this task.
