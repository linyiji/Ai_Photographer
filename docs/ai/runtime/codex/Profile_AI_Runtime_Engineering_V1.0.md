# Profile: AI_RUNTIME_ENGINEERING V1.0

Modes: `CHECKPOINT_RESUME`, `LONG_RUNNING_JOB`, `PLANNER_EFFICIENCY`, `RUNTIME_ROUTE`, `MODEL_GATEWAY_GOVERNANCE`.

Use `JOB → PLAN → UNIT → MODEL → VALIDATE → PERSIST → CHECKPOINT → RESUME`. Completed units are not recalled from a Provider. Resume verifies source snapshot, contract/schema, Skill, route, and plan hashes; mismatch requires a new job. Long Provider waits stay outside database transactions.

Provider readiness and credentials must never be fabricated. AI output begins as Candidate and must pass the relevant XFX validation before entering accepted domain state.
