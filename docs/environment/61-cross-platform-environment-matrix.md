# Cross-platform Environment Matrix

**Authority Level:** Environment L0

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
| Taro | N/A | N/A | XFX-specific compatibility spike | NOT_LOCKED |
| React | candidate only | not installed | XFX-specific compatibility spike | NOT_LOCKED |
| TypeScript | candidate only | not installed | XFX-specific compatibility spike | NOT_LOCKED |
| uv | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| FastAPI | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| Pydantic | not locked | not installed | XFX-specific future authority | NOT_LOCKED |
| PostgreSQL | not locked | not installed | Future infrastructure authority | NOT_LOCKED |
| Redis | not locked | not installed | Future infrastructure authority | NOT_LOCKED |
| Camera | N/A | not evaluated | Photography runtime authority | NOT_LOCKED |
| Realtime CV | N/A | not evaluated | Photography runtime authority | NOT_LOCKED |

## Interpretation

- `LOCKED` means the exact project version is authoritative across Windows and the Mac reference.
- `VERIFIED` means the tooling pattern is proven and available; its host binary version is evidence, not a cross-platform exact lock.
- `PASS` means compatible operation is verified without imposing an exact host version.
- `NOT_LOCKED` means no version or runtime choice may be inferred from this L0 Task.

No Taro, frontend runtime, backend runtime, database, Camera, CV, or M01 implementation was started.
