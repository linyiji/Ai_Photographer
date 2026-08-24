# Cross-platform Environment Matrix

**Authority Level:** Environment L0 + Frontend Runtime L1 + Backend Runtime L1

**Status:** LOCKED

**Date:** 2026-08-24

| Component | Mac Reference | Windows | Authority | State |
|---|---|---|---|---|
| Node | 24.18.0 | v24.18.0 | `.node-version` | LOCKED |
| npm | 11.6.2 | 11.6.2 | Environment L0; future `package.json#packageManager` | LOCKED |
| fnm | used | 1.39.0 via `Schniz.fnm` | Tooling pattern | VERIFIED |
| Git | compatible | 2.53.0.windows.3 | Cross-platform compatible | PASS |
| Python | uv-managed project runtime | 3.14.7 reproduced | `.python-version`; Backend Runtime L1 | LOCKED_L1 |
| Docker | compatible | not installed | Compatibility-only | NOT_LOCKED |
| Taro | evidence-backed | 4.2.1 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| React | evidence-backed | 18.3.1 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| ReactDOM | evidence-backed | 18.3.1 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| TypeScript | evidence-backed | 5.9.3 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| Webpack | evidence-backed companion | 5.91.0 reproduced | Fixture build companion | VERIFIED |
| uv | project dependency manager | 0.12.5 reproduced | Backend Runtime L1 | LOCKED_L1 |
| FastAPI | project API runtime | 0.141.1 reproduced | `apps/api/uv.lock` | LOCKED_L1 |
| Pydantic | contract projection runtime | 2.13.4 reproduced | `apps/api/uv.lock` | LOCKED_L1 |
| Uvicorn | ASGI runtime | 0.52.4 reproduced | `apps/api/uv.lock` | LOCKED_L1 |
| pytest | backend test runtime | 9.1.1 reproduced | `apps/api/uv.lock` | LOCKED_L1 |
| SQLite | development adapter | stdlib read/write reproduced | M02 development persistence | M02_DEVELOPMENT_ADAPTER |
| PostgreSQL | not locked | not installed | Future infrastructure authority | NOT_LOCKED |
| Redis | not locked | not installed | Future infrastructure authority | NOT_LOCKED |
| Camera | N/A | not evaluated | Photography runtime authority | NOT_LOCKED |
| Realtime CV | N/A | not evaluated | Photography runtime authority | NOT_LOCKED |

## Interpretation

- `LOCKED` means the exact project version is authoritative across Windows and the Mac reference.
- `LOCKED_L1` means the exact frontend or backend runtime baseline passed its dedicated promotion Gate.
- `VERIFIED` means the tooling pattern is proven and available; its host binary version is evidence, not a cross-platform exact lock.
- `PASS` means compatible operation is verified without imposing an exact host version.
- `NOT_LOCKED` means no version or runtime choice may be inferred from this L0 Task.

Frontend Runtime L1 and Backend Runtime L1 are locked. SQLite is only the M02 development adapter; the production database remains not locked. Docker, PostgreSQL, Redis, Camera/CV production integration, and Live P1 are not started.
