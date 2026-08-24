# Profile: RELEASE_DEPLOYMENT V1.0

Modes: `PREVIEW`, `PROD_AUTHORIZED`.

Preview authority never implies Production. Use `Local PASS → Static Gates → Commit → bounded Preview → Runtime Certification`. Production requires explicit current-task authorization plus frozen commit, deployment target/scope, environment Authority, migration status, release checklist, and rollback/recovery path.

Record Preview count, push count, Production operations, stable-alias changes, and remote-environment mutations. Default all to zero unless explicitly authorized.
