# 向风行 Frontend Product Shell Design V1.0

## 1. Authority and boundary

This document maps CURRENT S01 prototype intent to the M01 workflow and machine-readable contracts. The prototype is interaction evidence, not runtime or contract authority. M01 remains authoritative for state, transitions, events, errors, assets, and evaluation. The page layer renders projections and raises user intents; it does not own a second workflow engine.

Global shell rules:

- one screen, one primary decision;
- WHAT (accepted product state) is separated from HOW (ephemeral live guidance);
- accepted session state is backend-owned and refreshable; live frame/readiness data stays runtime-only;
- every mutation has loading, retry-safe error, and recovery behavior;
- fake capabilities use deterministic S01 fixtures behind the same ports future capabilities will implement;
- target-first is a declared entry route and may collect visual intent before the shared workflow begins.

## 2. Screen contract map

| ID | Workflow stage | Purpose / primary decision | Inputs -> outputs | M01 contracts | API boundary | Loading / empty / error | Fake now -> future | Platform / recovery |
|---|---|---|---|---|---|---|---|---|
| P01 START | ENTRY | Start or resume; choose Reality-first or Target-first | stored session -> new/resumed session and route | PhotographySession, WorkflowState | `POST /sessions`, `GET /sessions/{id}` | start spinner; no prior session is valid; retry without duplicate session | deterministic S01 session -> authenticated project/session service | Taro storage adapter only; back stays at entry |
| P02 TARGET-FIRST | pre-workflow intent | Decide the visual target before observing reality | target text/reference -> pending visual intent | CandidateEnvelope, SelectedTarget | local pending intent, later `POST /target-candidates` | generating; empty prompt guidance; retry preserves prompt | fixture candidates -> AI target generation | image picker adapter later; back to P01 |
| P03 RELATION | SHOOTING_RELATION_DEVICE_MODE | Choose friend-shoots-me or solo | route intent -> shooting relation | PhotographySession, DomainEvent | `POST /sessions/{id}/relation` | saving; no selection disables continue; retry idempotently | fixed relation choices -> unchanged domain capability | none; back returns P01 before acceptance |
| P04 DEVICE | SHOOTING_RELATION_DEVICE_MODE | Choose single/dual/fixed device mode | relation -> accepted device mode, transition to REALITY | PhotographySession, WorkflowState | `POST /sessions/{id}/device-mode` | saving; incompatible option hidden; contract error shown | deterministic modes -> platform capability negotiation | camera/device catalog later; recover from session readback |
| P05 REALITY | REALITY | Accept observed person and scene facts | fake scans -> RealityContext | RealityContext, AssetRef, CandidateEnvelope | `POST /sessions/{id}/reality` | scanning; no observations offers retry; capability error is recoverable | fixed S01 person/scene scan -> camera/CV perception | camera permission adapter later; back does not erase accepted facts |
| P06 TARGET | TARGET | Select one desired image target | RealityContext + candidates -> SelectedTarget | CandidateEnvelope, SelectedTarget | `POST /target-candidates`, `POST /targets/{candidate_id}/accept` | generation; empty offers regenerate; retry preserves candidates | three deterministic targets -> AI planning provider | asset preview adapter; back retains Reality |
| P07 SHOT | SHOT | Accept the concrete shot blueprint | selected target -> ShotDirection / CurrentShotState | ShotDirection, CurrentShotState | `POST /sessions/{id}/shot` | planning; empty offers regenerate; retry keeps target | deterministic blueprint -> planning agent | none; back to target without deleting accepted target |
| P08 LIVE | LIVE | Follow one instruction and declare readiness | shot + ephemeral readiness -> capture-window decision | LiveShotRuntime, FramePerception (ephemeral) | `POST /sessions/{id}/live/advance` | connecting; unavailable offers retry; stale runtime is discarded | scripted instructions -> on-device Camera/CV director | camera/pose adapters later; back preserves shot |
| P09 CAPTURE | CAPTURE | Trigger capture | capture window -> CaptureAsset and candidate | CaptureAsset, AssetManifest, CandidateEnvelope | `POST /sessions/{id}/capture` | capturing; no asset offers retry; idempotency prevents duplicates | stable fixture asset ref -> real camera capture/upload | camera/shutter adapter later; back to LIVE |
| P10 QA | QA | Accept, repair, or choose a bounded retake | capture + evaluation -> CaptureDecision / EvaluationResult / optional RetakePlan | EvaluationResult, CaptureDecision, RetakePlan | `POST /sessions/{id}/qa`, `POST /sessions/{id}/retake` | evaluating; missing result retries; explicit error keeps capture | deterministic QA -> quality/evaluation providers | none; retake follows M01 preservation semantics |
| P11 REALITY+ | REALITY_PLUS | Accept or skip a bounded enhancement | accepted capture -> RealityPlusAsset or skip | RealityPlusAsset, AssetManifest | `POST /sessions/{id}/reality-plus` | processing; unavailable permits skip; retry keeps original | deterministic overlay manifest -> generation provider | compute/provider adapter later; original asset always recoverable |
| P12 FINE TUNE | FINE_TUNE | Save a reproducible adjustment recipe | accepted image + controls -> AdjustmentRecipe | AdjustmentRecipe, AssetRef | `POST /sessions/{id}/fine-tune` | applying preview; defaults are valid; retry preserves values | deterministic recipe -> render pipeline | slider/UI adapter only; back retains Reality+ choice |
| P13 FINAL | FINAL | Confirm final result and review lineage | recipe/final asset -> MyFinalPhoto and event/readback | MyFinalPhoto, AssetManifest, DomainEvent | `POST /sessions/{id}/final`, `GET /sessions/{id}`, `/events`, `/assets` | finalizing; missing final offers retry; readback failure never invents success | stable final asset reference -> export/share/storage | save/share adapters later; resume returns final readback |

## 3. Shell composition

The application shell owns API transport, correlation/idempotency keys, session-id persistence, refresh/readback, and a screen registry keyed by the backend `workflow_stage`. Screen components receive a projection plus intent callbacks. They never calculate legal transitions.

Target candidates, capture candidates, Reality+ candidates, and adjustment recipes remain candidates until explicit acceptance. Candidate generation and acceptance are separate calls. All accepted mutations cause a domain event and revision increment in the same SQLite transaction.

## 4. M02 visual and accessibility baseline

The shell uses a dark photographic canvas, a single highlighted primary action, compact evidence cards, readable status labels, and safe-area spacing. Buttons expose text labels rather than color-only meaning. Loading disables only the active mutation; contract errors show their correlation id and a retry action. The implementation intentionally contains no production camera, CV, AI-provider, voice, or dual-device behavior.
