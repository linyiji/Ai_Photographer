# AGENTS.md

## Project

向风行 / AI Photographer / AI Visual Director

## Product Authority

Read before material product changes:

```text
docs/product-design/10-golden-flow-v1.0.md
docs/product-design/15-story-a-f-master-v1.0.md
docs/product-design/16-global-design-foundation-v1.0.md
docs/architecture/50-xfx-product-architecture-optimization-v2.md
```

## Current Project Authority

```text
project-status/PROJECT_STATUS.json
project-status/CHALLENGES.json
BASELINE_MANIFEST.json
```

## Core Architecture Rules

```text
Workflow 是骨架
Session 是共享状态
Contract 是模块语言
Capability 是独立实现
```

```text
Global Definition First
Modular Delivery Second
```

```text
AI Output = Candidate
Candidate must pass validation before accepted domain state
```

## Product Invariants

- Reality First
- SelectedTarget = WHAT
- ShotDirection = HOW
- Capture Causality
- Local CV First
- Strong AI Event-driven
- Fine Tune stays separate from generative semantic editing
- No God Module
- Page != Module

## Execution Rule

Before writing:

1. Read current Project Status.
2. Read current Task.
3. Identify Authority.
4. Confirm Scope and Allowed Writes.
5. Record / respect blockers.

After execution:

1. Run required tests.
2. Produce Evidence.
3. Update Task Report.
4. Update Project Status / Challenge status when applicable.
5. Do not enter next Task automatically.

## Stop Gates

Stop and require authority for:

- Architecture Contract change
- Production
- High-risk DB mutation
- Permission model change
- Credential
- Compliance
- Cross-user side effect
- Irreversible user data mutation

## Git

Git is version authority.

Never use force push or destructive reset unless explicitly authorized.
