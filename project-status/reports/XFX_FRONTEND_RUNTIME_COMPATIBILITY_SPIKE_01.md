# XFX_FRONTEND_RUNTIME_COMPATIBILITY_SPIKE_01

## PRE_WRITE_CHECKPOINT

PASS. Started on clean `develop` tracking `origin/develop`; Node `v24.18.0`, npm `11.6.2`, and `.node-version` `24.18.0` were verified. `main` was not modified.

Starting Commit: `0cbeec9409defbc9edd3151236fc520b53536e66`

## Investigated Versions

Live npm metadata was queried for Taro CLI, core, React bridge, React framework plugin, Webpack runner, WeChat/H5 platform plugins, React/React DOM, TypeScript, and React type declarations. Stable Taro `4.2.1` was selected; prereleases were excluded.

## Matrix A — FAIL

Node 24.18.0, npm 11.6.2, Taro 4.2.1, React/React DOM 19.2.6, TypeScript 5.9.3. Real installation failed with `ERESOLVE`: Taro 4.2.1's React integration requires React `^18`. No dependency override was used.

## Matrix B — PASS_WITH_WARNING

Only the React line changed: React/React DOM 18.3.1 and `@types/react` 18.3.31. Installation, `npm ci`, `npm ls`, type checking, WeChat build, and H5 build passed.

## Matrix C — NOT_REQUIRED

TypeScript 5.9.3 did not cause an application/build failure, so no TypeScript version change was tested.

## Node, Taro, React, and TypeScript Evidence

- Node 24.18.0: PASS_WITH_WARNING; no fatal Node-specific incompatibility.
- Taro 4.2.1: latest verified stable; exact local packages and lock file used.
- React 19.2.6: FAIL due to explicit Taro peer dependency; React 18.3.1: PASS.
- TypeScript 5.9.3: PASS_WITH_WARNING; project type check passes with `skipLibCheck` for third-party cross-platform declarations.
- `npm ci --no-audit --no-fund`: PASS; 1172 packages.
- `npm ls --depth=0`: PASS.

## WeChat Build Evidence

PASS. Post-lock reproduction build exited 0, emitted 19 expected artifacts, and contains the shared runtime probe.

## H5 Build Evidence

PASS. Post-lock reproduction build exited 0, emitted 11 artifacts including `index.html`, and contains the shared runtime probe.

## Shared Core Probe and Platform Adapter Probe

Both builds consume `src/shared/runtimeProbe.ts`. Platform naming is isolated behind `src/platform/platform.ts`; shared code contains no platform API imports.

## Warnings

- Taro's cross-platform declaration dependencies require `skipLibCheck` for TypeScript 5.9.3 direct checking.
- H5 entrypoint is 299 KiB versus Webpack's recommended 244 KiB.
- Taro/Webpack emits nonfatal `[hash]` deprecation warnings under Node 24.

## Failures

- Matrix A React 19.2.6 installation: `ERESOLVE`, caused by Taro 4.2.1 React peer constraint `^18`.
- An initial generated config referenced an intentionally omitted generator plugin; removing the unused build plugin reference resolved it without changing tested versions.

## Decision

`XFX_FRONTEND_RUNTIME_COMPATIBILITY_SPIKE = PASS`. A reproducible stable frontend combination was found. The versions remain candidates and are not final global Authority.

Recommended L1 Candidate: Taro `4.2.1`, React `18.3.1`, TypeScript `5.9.3`.

CH-003 remains `IDENTIFIED`; this task did not test Camera Frame API, CV FPS, device performance, heat, power, or latency.

## POST_PHASE_CHECKPOINT

Spike source is isolated under `spikes/frontend-runtime-compatibility`; npm is the only package manager; package lock is present; no secrets, dependency directory, build output, cache, or logs are intended for commit. WeChat and H5 builds pass.

## PRE_NEXT_PHASE_CHECKPOINT

Next task is recorded only as `XFX_FRONTEND_RUNTIME_L1_LOCK_01`. L1 Lock, production frontend work, Camera/CV, backend, and M01 have not started. Merge disposition: `READY_FOR_MERGE` after commit/push verification.
