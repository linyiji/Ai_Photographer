# Cross-platform Environment Matrix

**Authority Level:** Environment L0 + Frontend Runtime L1

**Status:** LOCKED

**Date:** 2026-08-24

| Component | Mac Reference | Windows | Authority | State |
|---|---|---|---|---|
| Node | 24.18.0 | v24.18.0 | `.node-version` | LOCKED |
| npm | 11.6.2 | 11.6.2 | Environment L0; future `package.json#packageManager` | LOCKED |
| fnm | used | 1.39.0 via `Schniz.fnm` | Tooling pattern | VERIFIED |
| Git | compatible | 2.53.0.windows.3 | Cross-platform compatible | PASS |
| Python | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| Docker | compatible | not installed | Compatibility-only | NOT_LOCKED |
| Taro | evidence-backed | 4.2.1 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| React | evidence-backed | 18.3.1 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| ReactDOM | evidence-backed | 18.3.1 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| TypeScript | evidence-backed | 5.9.3 reproduced | Frontend Runtime L1 | LOCKED_L1 |
| Webpack | evidence-backed companion | 5.91.0 reproduced | Fixture build companion | VERIFIED |
| uv | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| FastAPI | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| Pydantic | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| PostgreSQL | not locked | not installed | Future infrastructure authority | NOT_LOCKED |
| Redis | not locked | not installed | Future infrastructure authority | NOT_LOCKED |
| Camera | N/A | not evaluated | Photography runtime authority | NOT_LOCKED |
| Realtime CV | N/A | not evaluated | Photography runtime authority | NOT_LOCKED |

## Interpretation

- `LOCKED` means the exact project version is authoritative across Windows and the Mac reference.
- `LOCKED_L1` means the exact frontend production build baseline passed its dedicated promotion Gate.
- `VERIFIED` means the tooling pattern is proven and available; its host binary version is evidence, not a cross-platform exact lock.
- `PASS` means compatible operation is verified without imposing an exact host version.
- `NOT_LOCKED` means no version or runtime choice may be inferred from this L0 Task.

Frontend Runtime L1 is locked without creating a production application skeleton. Backend runtime, database, Camera, CV, Live Physical Agent, and M01 remain not started.
