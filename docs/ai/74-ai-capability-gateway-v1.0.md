# AI Capability Gateway V1.0

Status: `IMPLEMENTED_PROVIDER_NEUTRAL / REAL_PROVIDER_PENDING`

## Governed flow

```text
Capability Request
→ AICapabilityAdapter
→ AIProviderGateway
→ AIProvider
→ AIProviderResponse
→ Structured Candidate
→ local schema/policy validation
→ CandidateResult
```

Pages, product handlers, and Session mutation code do not call provider SDKs or provider HTTP endpoints. The Gateway owns bounded retry, error classification, provenance, usage/cost fields, and secret-safe records. A Candidate is never Session Authority merely because the provider returned it.

## Interfaces

- `AICapabilityAdapter`: capability-specific request/response mapping.
- `AIProvider`: provider-neutral execution protocol.
- `AIProviderRequest`: prompt/model specs, accepted asset identities, minimal context, in-memory bytes, MIME.
- `AIProviderResponse`: structured output, safe request id, usage, cost.
- `AIExecutionRecord`: provider/model/prompt identity, timestamps, latency, retry count, asset ids, Candidate id, usage/cost, normalized error.
- `PromptSpec` and `ModelSpec`: versioned registry authority.

Image bytes are excluded from model serialization and execution records. Authorization values, tokens, headers, raw request payloads, and raw provider output are not persisted.

## Configuration and security

Real configuration is admitted only from environment variables:

```text
XFX_AI_PROVIDER_ID
XFX_AI_MODEL_ID
XFX_AI_MODEL_VERSION
XFX_AI_BASE_URL (optional)
XFX_AI_SECRET_ENV (name of secret-bearing environment variable)
XFX_AI_TIMEOUT_SECONDS
XFX_AI_MAX_RETRIES (bounded to 0..2)
XFX_AI_CAPABILITIES
```

The config projection reports only presence, identity, bounded settings, and `credential_source=ENV`; it never returns the credential. Real configuration requires an established provider, model/version, secret reference with a present value, and QA capability support.

At M06 Admission no explicit provider configuration or credential name was present. No real provider adapter was selected and real provider calls remain zero.

## Retry and errors

Normalized classes:

- `TIMEOUT`
- `RATE_LIMIT`
- `PROVIDER_UNAVAILABLE`
- `NETWORK`
- `AUTH`
- `INVALID_OUTPUT`
- policy/content rejection when introduced by an accepted provider adapter

Only safe transient errors are retried, with the configured maximum bounded to two. Auth, schema, and policy failures are not blindly retried. Fixture fault tests prove retry boundaries and controlled failures.

## Registry

The Main-owned registries are:

- `apps/api/app/ai/registry/prompts.json`
- `apps/api/app/ai/registry/models.json`

Prompt `capture-qa-shadow@1.0.0` declares CandidateEnvelope output, reality-grounding rules, prohibited inference, unconfirmed-asset rejection, and controlled fallback. Model `fixture-capture-qa-v1` is explicitly `TEST_ONLY`; it is not evidence of real provider quality.
