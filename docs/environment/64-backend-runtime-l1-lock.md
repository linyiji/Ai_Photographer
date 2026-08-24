# Backend Runtime L1 Lock

**Task:** `XFX_MAIN_FULLSTACK_FOUNDATION_AND_M02_01`

**Gate:** `BACKEND_RUNTIME_L1_GATE`

**Status:** PASS

**Date:** 2026-08-24

## Locked authority

| Component | Exact version | State |
|---|---:|---|
| CPython | 3.14.7 | LOCKED_L1 |
| uv | 0.12.5 | LOCKED_L1 |
| FastAPI | 0.141.1 | LOCKED_L1 |
| Pydantic | 2.13.4 | LOCKED_L1 |
| Uvicorn | 0.52.4 | LOCKED_L1 |
| pytest | 9.1.1 | LOCKED_L1 |
| httpx test client | 0.28.1 | LOCKED_L1_TEST |
| SQLite | CPython stdlib | M02_DEVELOPMENT_ADAPTER |

Project authorities are `.python-version`, `apps/api/pyproject.toml`, and `apps/api/uv.lock`. The lock contains exact transitive versions and integrity hashes. uv manages the project interpreter and environment; a globally discoverable `python` executable is not required.

## Candidate discovery

Stable candidates were read from Python.org, official uv documentation/PyPI metadata, and PyPI project metadata on 2026-08-24. Pre-release versions were excluded. Python 3.14.7 was the newest stable CPython feature-series maintenance release and all selected dependencies declared compatible Python requirements.

## Reproduction evidence

```text
uv 0.12.5: PASS
uv python install 3.14.7: PASS
uv lock --python 3.14.7: PASS
uv sync --frozen --all-groups --python 3.14.7: PASS
Fresh isolated temp environment sync: PASS
New-shell imports and exact version readback: PASS
FastAPI/Pydantic/Uvicorn/pytest imports: PASS
Uvicorn process start + HTTP /health 200: PASS
pytest runtime probe: PASS
SQLite create/write/read: PASS
UTF-8 JSON round-trip: PASS
```

The Windows uv cache could not hardlink to the repository environment and fell back to copying files. The fresh reproduction used explicit copy mode; this is a performance observation, not dependency drift.

The initial FastAPI `TestClient` probe emitted a Starlette deprecation warning about its current httpx compatibility path. Application and HTTP behavior passed. Production integration tests use the direct ASGI transport boundary so the deprecated compatibility wrapper is not an application dependency.

## Persistence boundary

SQLite is locked only as `M02_DEVELOPMENT_ADAPTER`. It is not production database Authority. PostgreSQL remains a future production candidate; Redis and Docker are not required or installed by this Gate.

## Security and scope

No provider credential or API key is required. Local `.venv` and SQLite runtime files are ignored. This Gate locks the backend runtime and dependency graph; it does not lock production infrastructure or cloud deployment.
