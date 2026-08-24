# Frontend Runtime L1 Lock

**Task:** `XFX_FRONTEND_RUNTIME_L1_LOCK_01`

**Gate:** `XFX_FRONTEND_RUNTIME_L1_LOCK`

**Status:** PASS

**Date:** 2026-08-24

## Authority

| Component | Exact version | State |
|---|---:|---|
| Taro runtime/build packages used by the fixture | 4.2.1 | LOCKED_L1 |
| React | 18.3.1 | LOCKED_L1 |
| ReactDOM | 18.3.1 | LOCKED_L1 |
| TypeScript | 5.9.3 | LOCKED_L1 |
| Webpack build companion | 5.91.0 | VERIFIED |

Node 24.18.0 and npm 11.6.2 remain `LOCKED_L0`. npm remains the package manager and `package-lock.json` the lock strategy.

This Authority applies to future XFX production frontend manifests when M02 creates them. This task did not create a root manifest or production application skeleton. Transitive packages in the Spike lock file are reproducibility evidence, not global Authority.

## Deterministic reproduction

The committed fixture at `spikes/frontend-runtime-compatibility` was reproduced without version search or dependency overrides:

```text
npm ci --no-audit --no-fund: PASS (1172 packages)
npm ls --depth=0: PASS
npx tsc --noEmit: PASS
npm run build:weapp: PASS (19 artifacts)
npm run build:h5: PASS (11 artifacts)
```

Both runtime builds contain the shared `XFX runtime probe`. WeChat emitted the expected JS/JSON/WXML/WXSS files. H5 emitted `index.html` and JavaScript assets.

## Exact package evidence

All direct Taro runtime/build packages used by the fixture resolve to 4.2.1, including CLI, components, helper, framework/plugin packages, platform packages, React bridge, runtime/shared/core, loader, Webpack runner, and Babel preset. React and ReactDOM resolve to 18.3.1, TypeScript to 5.9.3, and the pinned Webpack companion to 5.91.0. The dependency tree has no invalid or unresolved peer entries.

## Preserved negative evidence

React 19.2.6 remains a tested rejected candidate with result `FAIL`: `@tarojs/react@4.2.1` requires React `^18`, and the real Matrix A install failed with `ERESOLVE`. It was not retried, overridden, or removed from historical evidence.

## Non-blocking warnings

- The clean npm reproduction reports deprecations in transitive ecosystem packages.
- Taro/Webpack under Node 24 emits the `[hash]` to `[fullhash]` deprecation warning.
- TypeScript 5.9.3 uses the documented `skipLibCheck` boundary for Taro cross-platform third-party declarations.
- H5 emits a 299 KiB entrypoint warning against Webpack's recommended 244 KiB limit.

These warnings did not cause install, dependency, type, or build failure and remain recorded for future maintenance.

## Boundary

This Gate locks the frontend build runtime only. It does not lock Camera/CV, Python/backend, database/cache, Provider, or device runtime. CH-003 remains `IDENTIFIED`; build success is not real-device Camera/CV evidence. M01, M02, Web Lab, and Live Physical Agent were not started.
