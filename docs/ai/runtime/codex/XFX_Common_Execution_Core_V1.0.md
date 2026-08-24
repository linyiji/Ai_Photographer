# XFX Common Execution Core V1.0

## Admission

Before writes, read AGENTS/current status/current task, record worktree, branch, `START_HEAD`, dirty state, expected lineage, authorities, allowed/frozen scope, and special permissions. Run Git status and diff checks. Unknown dirty state is never reset, stashed, discarded, or silently committed.

Required Task Contract fields: `WHAT`, `BOUNDARY`, `AUTHORITY`, `ACCEPTANCE`, `CURRENT_CHECKPOINT`, `EXPLICIT_AUTHORIZATIONS`, and `NEXT_TASK`.

## Default safety

Push, Production, Preview, remote environment mutation, broad permission expansion, cross-user mutation, credential use, and irreversible data mutation are forbidden unless the current Task explicitly authorizes them. Secrets may be checked for presence, identity, mode, or hash but never printed or committed.

Bounded auto-fix requires the same root cause, reversibility, auditability, in-scope impact, and unchanged Authority.

## Candidate and evidence rules

- `CANDIDATE_RESULT != TASK_RESULT`.
- Candidate failure may coexist with Task PASS when discovery acceptance is met by a later controlled candidate.
- Preserve negative evidence; do not rewrite history into only the final recommendation.
- `PASS_WITH_WARNING` is a first-class component result.
- Candidate promotion requires its explicit Gate; a Spike cannot create final Authority.
- During diagnosis, change the minimum number of variables and record every matrix.
- Multi-runtime tasks require evidence for every runtime in scope.

## Execution and checkpoints

Use `PRE_WRITE_ADMISSION`, `POST_PHASE_CHECKPOINT`, `PRE_NEXT_PHASE_CHECKPOINT`, and `FINAL_CHECKPOINT`. Long-running work uses bounded polling, durable checkpoints, safe resume, and failure classification; never hold a long database transaction across a Provider wait.

Read authorities once, use targeted rereads, avoid full-history repetition, and never reduce required validation to save context.

## Validation

Default gates are targeted tests, task-scoped TypeScript/ESLint where relevant, affected builds, runtime readback where relevant, and `git diff --check`. Record unrelated baseline failures separately from task-introduced failures.

Evidence supports runtime/device/scenario/assets/fixtures/model route/provider/CV runtime plus targeted tests, TypeScript, ESLint, build, WeChat/H5 builds, replay, real device, runtime readback, visual QA, photography QA, reality preservation, performance, diff check, and Preview.

## Git, report, and handoff

Commit only authorized files. No force push, destructive reset, published-history rebase, or unrelated cleanup. Material tasks produce a Task Report, update Project Status/Handoff when required, preserve challenge truth, and end with a clean tree.

Final output records Task/Profile/Mode, success classification, root cause, start/end heads, commits, validation, safety counters, artifacts, warnings, deferred items, and `NEXT_TASK`.

## XFX invariants

Reality First, Capture Causality, SelectedTarget/ShotDirection separation, sparse AI planning with continuous local vision, conservative identity, and candidate-to-validation-to-accepted-state semantics may not be silently changed by implementation tasks.
