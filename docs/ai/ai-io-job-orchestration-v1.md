# AI I/O and Job Orchestration V1

This baseline implements the Owner authority package `XFX_AI_PHOTOGRAPHER_ALGORITHM_AND_API_AUTHORITY_V1` without wiring it into Main and without any real provider transport.

## Boundary

The flow is deliberately provider-neutral:

```text
versioned node input
  -> deterministic ContextBuilder
  -> AIRequestEnvelopeV01
  -> AIJobOrchestrator
  -> LunaProviderPort / ImageEditProviderPort
  -> normalized structured output
  -> schema validation
  -> business validation
  -> DomainCandidateEnvelopeV01
  -> explicit promotion gate
```

Provider-native SDK types, credentials, media bytes and raw provider responses do not enter domain contracts. The only executable providers in this baseline are `FakeLunaProvider`, `FakeImageEditProvider`, and `ReplayProvider`.

## Reused accepted contracts

The accepted `SubjectProfileCandidateV01`, `SceneUnderstandingCandidateV01`, `LightingEvidenceCandidateV01`, `PhotographyDirectorInputV01`, `ShotPlanCandidateV01`, `LiveTargetBlueprintV01`, `ErrorContract`, `AssetRef`, `CandidateEnvelope`, and `DomainEvent` remain unchanged. V1 adds infrastructure envelopes and node inputs around those seams; it does not redefine their domain authority.

## Revision and candidate governance

Every request is bound to `session_id`, `session_revision`, `input_hash`, `prompt_version`, and a deterministic idempotency key. A newer input supersedes queued or in-flight work for the same session and capability. A result can become accepted only through an explicit promotion gate and only while its revision and input hash remain current.

Provider output is never domain authority. Normalization, typed schema validation and business validation must all pass before a `CANDIDATE` envelope is created.

## Media and latency safeguards

Media is limited per capability, requires explicit provider-send authorization, and forbids raw video, continuous frame streams and geometry sequences. Director uses structured-only context by default. Camera/Live hot paths import none of the provider or orchestrator modules and issue no per-frame backend AI calls.

The latency waterfall records queue, upload, provider, normalization, schema validation, business validation and end-to-end time. The client exposes named stage states only and never synthesizes a percentage.

## Integration status

The API-shaped surface is in-process through command/query/event ports. No FastAPI route, Main coordinator, production provider configuration or real network call is included. `MAIN_INTEGRATION = NOT_STARTED` and `REAL_PROVIDER_CALLS = 0` are intentional phase gates.
