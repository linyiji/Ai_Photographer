# Task Report — XFX_MAIN_FULLSTACK_FOUNDATION_AND_M02_01

## Classification and admission

```text
PROMPT_STANDARD = XFX_CODEX_EXECUTION_STANDARD_V1
EXECUTION_STRATEGY = ACCELERATED_COMPOSITE_TASK
TASK STATUS = PASS
START_HEAD = 0dd2e3e5d44db45a45e1515bb36f6d6259e1712d
WORK_BRANCH = feature/main-fullstack-foundation-m02
PRE_WRITE_ADMISSION = PASS / CLEAN
DEVELOP = origin/develop = 0dd2e3e5d44db45a45e1515bb36f6d6259e1712d
MAIN = origin/main = aa816548a53384e4e215e1496d6697f2aff25a16
LIVE EVIDENCE HEAD AT ADMISSION = 5b4aba45065dc49d435e4790e807e9a5a4ad2d3c
LIVE HEAD AT CLOSURE READ-ONLY OBSERVATION = c439e7877ca64f87b7c5bc32667f5b7cd1e78961
```

The feature branch was created from the required develop head. Main was not checked out or modified. The independent Live worktree advanced concurrently, was observed read-only, and was never entered or changed by this task.

## Phase A — Backend Runtime L1

Candidate discovery used stable release metadata and selected the newest reproducible set on this Windows host.

| Runtime | Candidate / locked result | Evidence |
|---|---:|---|
| Python | 3.14.7 / LOCKED_L1 | uv-managed install, import, ASGI, SQLite, pytest, fresh environment |
| uv | 0.12.5 / LOCKED_L1 | deterministic `apps/api/uv.lock`, frozen sync |
| FastAPI | 0.141.1 / LOCKED_L1 | import and real Uvicorn health request |
| Pydantic | 2.13.4 / LOCKED_L1 | exact import |
| Uvicorn | 0.52.4 / LOCKED_L1 | real server startup and HTTP 200 |
| pytest | 9.1.1 / LOCKED_L1 | runtime and M02 suites |
| httpx | 0.28.1 / test companion | ASGI/network contract tests |
| SQLite | M02_DEVELOPMENT_ADAPTER / PASS | UTF-8 JSON roundtrip and transactional workflow persistence |

Fresh isolated frozen sync and test reproduction passed. `PYTHON_MISSING` was removed. Docker remains missing and was not installed. Production DB remains `NOT_LOCKED`.

## Phase B/C — Product shell and frontend

The prototype was mapped, not copied, in `docs/product-design/18-frontend-product-shell-design-v1.0.md`. The production-shaped Taro shell covers P01–P13, including the Target-first entry surface, and renders backend workflow projections. It does not calculate legal transitions.

Frontend Authority is preserved exactly: Taro 4.2.1, React 18.3.1, ReactDOM 18.3.1, TypeScript 5.9.3, npm 11.6.2, and committed `package-lock.json`. A typed API boundary centralizes transport and ErrorContract presentation; Taro session storage is isolated behind a platform adapter. Shared code contains no `wx.*` or browser-only API.

## Phase D/E — Backend, API, workflow, persistence

FastAPI exposes a compact surface:

- `GET /health`, `GET /capabilities`;
- `POST /sessions`, `GET /sessions/{id}`;
- `POST /sessions/{id}/actions` with mandatory `Idempotency-Key`;
- `GET /sessions/{id}/events`, `GET /sessions/{id}/assets`.

Handlers delegate to a session/workflow service, capability ports, and a SQLite repository. The service consumes `packages/workflow/workflow-v1.json`; it does not redefine a conflicting workflow. SQLite tables persist sessions, candidates, accepted dispositions, domain events, assets/lineage, and idempotency results. Each meaningful action is one transaction. No frame-level Live state is persisted.

## Phase F — Fake capability inventory

Deterministic replaceable slots exist for Reality, Target, Shot, Live, Capture, QA, Reality+, Voice, and Agent. They all use `packages/scenario-fixtures/s01-storm-before-arrival.json`. Fixture refs are stable repository URIs, contain subject/scene anchors, and contain no user media, absolute path, base64 payload, provider call, or credential. Voice and Agent are slots only; no ASR/TTS/VAD or real agent was implemented.

## Phase G/H — Full-stack and golden-flow evidence

Happy path trace:

```text
ENTRY → SHOOTING_RELATION_DEVICE_MODE → REALITY → TARGET
→ SHOT → LIVE → CAPTURE → QA → REALITY_PLUS → FINE_TUNE → FINAL
revision 0 → 11
```

The browser used the H5 bundle and real network requests to FastAPI. Request → handler → M01 workflow authority → deterministic capability → candidate → explicit acceptance → SQLite/event/asset transaction → readback → UI passed. Final refresh restored `session-58bcec26902b`, revision 11, stage FINAL, 3 assets, and 12 events. A new browser tab showed the same readback with no console errors.

Retake evidence created a capture, selected `RETAKE_MICRO`, returned QA → LIVE, and retained Reality, Target, Shot, camera position, subject position, framing, and major pose according to M01. Repeating the same idempotency key returned the identical response and created no duplicate transition.

Asset lineage readback contained Capture → Reality+ → Final stable refs. Raw live-video upload count was zero.

## Phase I — validation results

```text
Backend tests: PASS — 6 passed
Runtime exact-version/import probe: PASS
M01 contract catalog validation: PASS
Mandatory contract coverage: 21/21
JSON Schema validation: PASS
Workflow V1 / transition validation: PASS
Unresolved local references: 0
Frontend TypeScript: PASS
WeChat build: PASS
H5 build: PASS_WITH_WARNING
Browser real-network E2E: PASS
Refresh / SQLite readback: PASS
git diff --check: PASS
M01 contract/workflow diff: 0
```

H5 emitted one non-blocking Webpack entrypoint-size advisory (approximately 300 KiB versus the default 244 KiB recommendation). An initial browser run revealed `process is not defined`; the API-base expression was boundedly corrected to an M02 local endpoint, rebuilt, and revalidated in a new browser tab with zero errors. This resolved implementation defect is retained here rather than hidden.

## Security, unresolved items, and boundaries

```text
Provider calls = 0
Provider credentials used = 0
Secrets committed = 0
Raw live video upload = 0
Production DB = NOT_LOCKED
Real Camera/CV/Voice/Dual Device/Reality+/Agent = NOT_STARTED
LIVE-P1 = NOT_STARTED
Main = UNCHANGED
Live worktree = UNTOUCHED
M01 Authority = PRESERVED
```

Accepted Live P0 evidence commit is `5b4aba45065dc49d435e4790e807e9a5a4ad2d3c`: OPPO K11 real-device gate PASS. `Late / Drop ~= 220 / 14` and Vite Script Error x2 remain `OBSERVED_WITH_WARNING`; the latter remains `ROOT_CAUSE_UNCLASSIFIED`. CH-003 remains `IDENTIFIED / UNCHANGED`. This M02 result does not resolve physical camera/CV feasibility.

## Phase disposition

```text
PHASE_A_BACKEND_RUNTIME = PASS
PHASE_B_FE_MAPPING = PASS
PHASE_C_FRONTEND = PASS
PHASE_D_BACKEND = PASS
PHASE_E_DATA_FLOW = PASS
PHASE_F_FAKE_CAPABILITIES = PASS
PHASE_G_FULLSTACK_INTEGRATION = PASS
PHASE_H_GOLDEN_VERTICAL_SLICE = PASS
PHASE_I_ACCEPTANCE = PASS
M02_SKELETON_RUNNABLE = PASS
FULLSTACK_VERTICAL_SLICE = PASS
AUTO_FF_MERGE = AUTHORIZED_ON_FINAL_LINEAGE_CHECK
NEXT_RECOMMENDED_TASK = XFX_M03_REPLAY_E2E_LAB_01
START_NEXT_TASK = NO
```
