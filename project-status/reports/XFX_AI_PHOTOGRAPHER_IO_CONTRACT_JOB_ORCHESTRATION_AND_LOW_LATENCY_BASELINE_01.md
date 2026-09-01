# XFX AI Photographer I/O Contract, Job Orchestration and Low-Latency Baseline 01

## Result

```text
TASK_RESULT = PASS_WITH_KNOWN_BASELINE_WARNING

AI_IO_CONTRACTS = PASS
AI_JOB_ORCHESTRATOR = PASS
CONTEXT_BUILDERS = PASS
MEDIA_POLICY = PASS
PROVIDER_PORTS = PASS
FAKE_PROVIDER = PASS
REPLAY_PROVIDER = PASS
CANDIDATE_GOVERNANCE = PASS
IDEMPOTENCY = PASS
SUPERSESSION = PASS
API_STYLE_PORTS = PASS
DOMAIN_EVENTS = PASS
LATENCY_TELEMETRY = PASS
AI_STAGE_UX_STATE = PASS

CAMERA_PROVIDER_IMPORTS = 0
LIVE_PROVIDER_CALLS = 0
PER_FRAME_BACKEND_AI = 0
RAW_VIDEO_PROVIDER = 0

REAL_PROVIDER_CALLS = 0
MAIN_INTEGRATION = NOT_STARTED

AUTOMATED_TESTS = PASS (179/179 backend; 101/101 frontend)
TYPESCRIPT = PASS
BUILD = PASS_WITH_EXISTING_SIZE_WARNINGS (H5 + WEAPP)
```

## Bootstrap and authority

The supplied ZIP was extracted to `D:/Projects/_bootstrap/XFX_AI_PHOTOGRAPHER_ALGORITHM_AND_API_AUTHORITY_V1`. Its actual SHA-256 is `5fa41e9931130c99dfd6292be8559d5ed81f49065bcbeb6d9b423f4f8b5e2e35`. No external Owner hash was supplied, so an external comparison is `NOT_AVAILABLE`; package-internal verification passed 12/12 entries. Authority files were read in the required order before implementation.

Implementation started from accepted Director V0.2 commit `fdfd6de9b35a5ced50273b49deb04e02ec0ad287` in isolated branch `spike/ai-io-contract-job-orchestration-v1`. No foundational repository conflict was found.

## Implemented baseline

Eight public infrastructure contracts are versioned, exported to Draft 2020-12 JSON Schema and registered under `AI_INFRASTRUCTURE`: job, request, result, provenance, latency waterfall, context telemetry, media policy and job event. Node inputs and post-capture candidate types cover all six authority capabilities while preserving the already accepted Subject, Scene, Lighting, Director, ShotPlan and LiveTarget contracts unchanged.

Six deterministic ContextBuilders enforce current session revision, capability media count/type/representation, explicit provider-send authorization, minimal stable/dynamic context, canonical input hash, idempotency key and context telemetry. Director is structured-only by default; raw video, frame streams and geometry sequences are forbidden.

The standalone orchestrator implements all eight required states, one bounded retry for transient failures, idempotent submission, latest-input supersession, revision supersession, normalized errors and revision-aware events. Both validation-time stale checks and explicit promotion-time revision/input-hash checks prevent old results—including already completed candidates—from becoming authority.

Provider interfaces expose Luna-style structured understanding and Image Edit boundaries. Only deterministic Fake and Replay implementations exist; there is no SDK, network, credential or production-provider path. Replay records contain normalized structured output only.

The validation pipeline performs JSON normalization, typed schema validation, business validation, candidate creation and explicit promotion. Provider output is never persisted directly as Domain Authority. API-shaped command/query/event ports remain in-process and are intentionally not registered in Main or FastAPI routes.

The client state module exposes the required named stages, ignores stale-revision events and always returns `percentage: null`. The latency schema includes `provider_ms`, aggregate `validate_ms`, schema/business validation detail, and `end_to_end_ms`.

## Verification

The dedicated suite covers happy path, Luna and Image Edit fakes, timeout with bounded retry, malformed JSON, schema invalid, unauthorized media, stale revision, queued and completed supersession, duplicate idempotency key, unknown EvidenceRef, invalid ViewRef, deterministic replay, promotion gates, API ports, latency and no-fake-progress UX. The full backend suite passes 179/179; the frontend suite passes 101/101; TypeScript, H5 and WeChat builds pass.

Static hot-path checks found zero provider/orchestrator references in Camera, Live-adjacent platform and Scene Spatial solver paths. No provider receives raw video or per-frame backend calls.

## Known baseline warning

The repository-wide legacy `scripts/validate-contracts.mjs` stops at the pre-existing `HomeContextV01` because it lacks a description. Nine accepted pre-existing schemas have the same metadata gap. This task did not rewrite those accepted contracts. The eight new AI infrastructure catalog entries are independently validated by the automated suite and all pass identity, dialect, title, description and version checks.

## Evidence

Evidence is stored in `project-status/evidence/ai-io-orchestration-v1`. It contains the authority checksum record, old-to-new inventory map and verification summary, with no secrets, media bytes or raw provider output.
