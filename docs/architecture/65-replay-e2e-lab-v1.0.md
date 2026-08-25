# XFX Replay E2E Lab V1.0

## Authority and purpose

M03 is subordinate test/development tooling over the accepted M01 contracts and M02 runtime. It does not redefine `PhotographySession`, `WorkflowState`, candidates, events, assets, or errors. Every replay step enters through `SessionService.mutate`, so workflow validation, capability seams, transactions, idempotency, events, assets, and readback remain the real path.

## Laboratory model

- **Replay Source** — `SCENARIO_FIXTURE`, `RECORDED_ACTION_TRACE`, or `CHECKPOINT_PLUS_REMAINING_ACTIONS`.
- **Replay Plan** — versioned scenario, mode, seed, typed fault plan, and ordered actions.
- **Replay Step** — one governed action plus expected stage and optional named fault.
- **Replay Checkpoint** — compatible scenario version, action position, and read-only accepted projection. Resume reconstructs the prefix by replaying governed actions; it never patches session rows or stages.
- **Replay Trace** — bounded system evidence: step/action, key reference, pre/post stage and revision, capability, candidate/disposition summary, appended event/asset types, governed error, duration, and warnings. It contains no raw media, secret, or chain-of-thought.
- **Replay Result** — lifecycle, duration, step/failure position, final projection references, trace/diff references, evaluation status, and warning count.
- **Evaluation Result** — deterministic findings for workflow, state, candidates, events, lineage, errors, idempotency, recovery, final outcome, and determinism.
- **Fault Injection** — named, seeded, Lab-only behavior at the existing service/capability/transaction seam.
- **Diff Result** — semantic path findings classified `MATCH`, `MISMATCH`, `ALLOWED_NONDETERMINISM`, `MISSING`, or `EXTRA`.

## Modes and isolation

`FROM_SCRATCH` creates a new isolated SQLite database. `FROM_CHECKPOINT` validates the checkpoint and replays its prefix before remaining actions. `FAULT_INJECTED` applies only manifest-declared typed faults. `DRY_EVALUATION` compares supplied results without product mutation.

Lab endpoints are absent unless `XFX_LAB_MODE=1`. Startup rejects Lab mode when `XFX_ENVIRONMENT=production`. Each replay owns a database under the configured Lab root; the normal M02 database is never selected. There is no SQL, filesystem-read, code-execution, environment-dump, or generic mutation endpoint.

## Determinism and canonical comparison

Semantic comparison normalizes only generated `session_id`, `event_id`, replay/correlation/request identities, and timestamps. It preserves stage and revision progression, action and event order, candidate dispositions, decisions, retake preservation, asset kinds and parent relationships, errors, and final outcome. Object keys are sorted and stable repository asset references remain semantic.

The canonical summary compares:

```text
workflow.stage/revision
accepted state semantic values
candidates[].kind/disposition/payload
events[].event_type/payload transition semantics
assets[].kind/status/storage_ref/lineage
final outcome
```

## Fault and recovery policy

Supported typed faults include capability timeout/error, invalid/rejected candidate, duplicate action, illegal transition, persistence failure before commit/during transaction, missing asset, forced QA retake, Reality+ failure, and test-only readback failure. No unseeded randomness is used. Persistence faults are raised within the same repository transaction and must leave revision, accepted state, events, assets, and idempotency unchanged. Recovery uses a new request key and the same legal action.

## Trace, diff, and evaluation

Trace collection snapshots counts and projections before and after each action. Idempotency keys are represented by a SHA-256 prefix, never raw. Diff emits individual semantic paths rather than a giant JSON comparison. Evaluation applies explicit manifest rules without an LLM and returns `PASS`, `PASS_WITH_WARNING`, or `FAIL` with machine-readable findings.

## H5 Dev Lab

The H5 Lab is a separate Taro page chunk. It presents scenario/mode/fault selectors, run status, stage/action/event timelines, asset lineage, candidate acceptance, semantic diff, warnings/errors, evaluation, and checkpoint resume. Production navigation never links to it; a default build renders the route unavailable. The WeChat build may contain the inert page module but exposes no product entry or Lab backend.
