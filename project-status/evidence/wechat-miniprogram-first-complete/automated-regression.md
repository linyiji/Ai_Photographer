# Automated Regression

Date: 2026-08-27

```text
TypeScript = PASS
Frontend tests = 87 / 87 PASS
Backend tests = 110 / 110 PASS
WeChat build = PASS
H5 build = PASS_WITH_WARNING
Compile errors = 0
```

Covered additions include Home context authority, reliability ordering, three entry seams, backend session creation and reconciliation, camera lifecycle state, Camera adapter contracts, Fine Tune capability isolation, and mocked WeChat decode/preview/finalize/file-write behavior.

H5 build retained warnings for the 993 KiB decorative landmark asset, a 262 KiB chunk, and a 303 KiB entrypoint. The first concurrent WeChat/H5 build attempt collided while both Taro processes cleaned the shared `dist` directory; mutually exclusive reruns passed and this is classified as a test-orchestration error, not product evidence.

The bundled Python lacked pytest; the repository-owned `apps/api/.venv` reproduced 110 passing tests without installing dependencies.
