# Task Report — XFX_M03_REPLAY_E2E_LAB_01

## Admission and boundaries

```text
EXECUTION_STRATEGY = ACCELERATED_COMPOSITE_TASK
START_HEAD = 86bf9bc91116f290f92f3113bf46fde35854ed2c
WORK_BRANCH = feature/m03-replay-e2e-lab
PRE_WRITE_ADMISSION = PASS / CLEAN
DEVELOP = origin/develop = START_HEAD
MAIN = origin/main = aa816548a53384e4e215e1496d6697f2aff25a16
LIVE READ-ONLY OBSERVED HEAD = c439e7877ca64f87b7c5bc32667f5b7cd1e78961
```

Main and the Live worktree were not entered or changed. M01 contracts and Workflow V1 were not edited. M03 is subordinate tooling over the accepted M02 application path.

## Replay model and implementation

`docs/architecture/65-replay-e2e-lab-v1.0.md` defines Replay Source/Plan/Step/Checkpoint/Trace/Result, Evaluation, Fault, and Diff concepts plus canonical normalization. Generated session/event/replay/correlation identities and timestamps are non-semantic; stages, revisions, decisions, event order, candidate dispositions, retake rules, lineage, and final outcome remain semantic.

The Replay Engine creates a per-run isolated SQLite database, creates a real Session, and submits every action to `SessionService.mutate`. Checkpoint resume reconstructs its prefix using those same governed calls rather than patching rows. Trace records pre/post stages, revisions, hashed key refs, capability, candidate acceptance, appended events/assets, governed errors, durations, and warnings; it contains no raw bytes or secrets.

Lab APIs are absent unless `XFX_LAB_MODE=1`. `XFX_ENVIRONMENT=production` plus Lab mode rejects startup. The exposed surface is limited to scenario listing and typed replay/result/trace/diff operations; arbitrary SQL, filesystem read, Python/code execution, environment dump, and generic mutation routes do not exist.

## Scenario matrix, fault, diff, and evaluation

Manifest V2 expands 12 deterministic scenarios: Happy, reload/resume, micro/position retakes, Target-first, fivefold idempotency, illegal transition, timeout recovery, invalid candidate, persistence rollback, missing asset, and Reality+ recovery. Each expanded manifest includes the required action/stage/event/lineage/final/warning/nondeterminism/fault/evaluation fields.

Four core scenarios ran twice with semantic equality; unexpected semantic differences were zero. Checkpoints after Reality, Target, and QA/retake-equivalent positions matched full-run final semantics. Persistence failure during the transaction left revision/events/assets unchanged before a legal retry. Same command/key repeated five times produced one transition; same key with a materially different payload returned `IDEMPOTENCY_MISMATCH`.

The typed registry contains 12 named faults. Error traces use the M01 ErrorContract vocabulary. Semantic diff compares an explicit manifest-derived oracle rather than comparing raw JSON; Evaluation covers workflow, state, candidate governance, events, lineage, error, idempotency, recovery, final outcome, and determinism without an LLM.

## Performance and bundle evidence

```text
Single happy replay: 165.277 ms (measurement run)
12-scenario matrix: 2026.700 ms
Happy trace size: 5397 bytes
Maximum isolated replay DB: 61440 bytes
Unexpected semantic diff: 0
H5 entry before M03: 307633 bytes
H5 entry after M03: 307814 bytes (+181)
Lab lazy page JS+CSS: 61412 bytes
```

Trace retention is capped at 100 in-process result records; databases are per replay. There is no unbounded polling, raw media trace, infinite retry, or shared-session parallel write path.

## Acceptance evidence

```text
Backend tests: 33 passed
Scenario count: 12
Contract catalog / Workflow validation: PASS
TypeScript: PASS
WeChat build: PASS
H5 build: PASS_WITH_WARNING (retained entrypoint advisory)
Lab browser E2E: PASS
Normal S01 browser E2E + refresh/readback: PASS
Default H5 Lab route: LAB_DISABLED / no console errors
Production Lab startup: BLOCKED
M01 authority diff: 0
git diff --check: PASS
```

Browser Lab evidence covered scenario selection, FROM_SCRATCH Happy trace/timelines/events/assets/diff, CAPABILITY_TIMEOUT ErrorContract and recovery, FROM_CHECKPOINT semantic MATCH, and zero uncaught console errors. Normal P01–P13 was rerun over real network to FINAL and refreshed with 3 assets and 12 events.

## Safety and disposition

```text
Provider Calls = 0
Provider Credentials Used = 0
Secrets Committed = 0
Raw Live Video Upload = 0
Real User Media Required = NO
Arbitrary SQL/File/Code Endpoint = NO
Production DB = NOT_LOCKED
Docker = MISSING / UNCHANGED
M01 = PRESERVED
M02 = PRESERVED
LIVE = UNTOUCHED
CH-003 = IDENTIFIED / UNCHANGED
MAIN = UNCHANGED
M03 = PASS
NEXT = XFX_M04_PLATFORM_ADAPTER_AND_REAL_CAPABILITY_INTEGRATION_FOUNDATION_01
START_NEXT_TASK = NO
```
