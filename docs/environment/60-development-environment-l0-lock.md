# Development Environment L0 Lock

**Task:** `XFX_ENVIRONMENT_L0_LOCK_01`

**Gate:** `XFX_ENV_L0_LOCK`

**Status:** PASS

**Date:** 2026-08-24

## Reference

AtlasAnalyse Mac Environment Audit is the proven reference for the cross-platform L0 toolchain. Only runtime-neutral foundations are reused.

> Reuse Proven Foundations, Specialize Runtime Capabilities.

AtlasAnalyse product/runtime choices such as Next.js or Python are not inherited by 向风行.

## Exact Lock

| Component | Exact Authority |
|---|---|
| Node | 24.18.0 |
| npm | 11.6.2 |
| Package Manager | npm |
| Node Manager | fnm |

## Project Authority

```text
.node-version = 24.18.0
```

## Future JavaScript Authority

When a real JavaScript skeleton creates `package.json`, it must inherit:

```text
packageManager = npm@11.6.2
lock file = package-lock.json
```

No empty `package.json` was created by this L0 Task.

## Windows Evidence

| Component | Evidence | Result |
|---|---|---|
| fnm | 1.39.0; installed by winget package `Schniz.fnm` | VERIFIED |
| fnm path | `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe` | VERIFIED |
| Node | `node --version = v24.18.0` | LOCKED |
| npm before exact lock | 11.16.0 bundled with the installed Node distribution | OBSERVED |
| npm compatibility | npm 11.6.2 engines: `^20.17.0 || >=22.9.0` | COMPATIBLE |
| npm after exact lock | `npm --version = 11.6.2` | LOCKED |
| `.node-version` | `24.18.0` | LOCKED |
| New shell | fnm found; Node/npm exact after `fnm env` and `fnm use` | PASS |

No permanent PowerShell Profile was modified.

## Mac Reference

| Component | AtlasAnalyse Mac Evidence |
|---|---|
| Node | 24.18.0 |
| npm | 11.6.2 |
| Node Manager Pattern | fnm |

## Compatible, Not Exact

- Git: cross-platform compatible; host version is not an exact project lock.
- Docker host: compatibility-only and not installed/locked by this Task.
- VS Code: editor choice is not an exact project lock.
- Chrome: browser host version is not an exact project lock.

## Not Yet Locked

- Taro
- React
- TypeScript
- Python
- uv
- FastAPI
- Pydantic
- PostgreSQL
- Redis
- Camera
- Realtime CV

## Shell Initialization Follow-up

`fnm` is present in the persistent Windows User PATH. A new shell can select the project version using:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
fnm use
```

Adding this initialization to a permanent PowerShell Profile is optional convenience work and was deliberately not performed.
