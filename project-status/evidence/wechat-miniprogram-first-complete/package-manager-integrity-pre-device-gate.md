# Package Manager Integrity — Pre-Device Gate Audit

Task: `XFX_MAIN_WECHAT_TOOLCHAIN_INTEGRITY_PRE_DEVICE_GATE_AUDIT_02A`

Date: 2026-08-27

## Admission

- Branch: `feature/wechat-miniprogram-first-complete-product-baseline`
- Previous accepted head: `4de559e93f3f16a48203c22298e57e1c817f5e57`
- Audited head: `790caddb25d47e5deb5b1898f1c7b3b8dd1cbd28`
- `HEAD` and `origin/feature/wechat-miniprogram-first-complete-product-baseline`: synchronized (`0 / 0`)
- Admission working tree: clean

## Exact Git finding

The reported repository-level deletion is not present in the stated Git range.

- `790cadd` changes only `wechat-devtools-and-real-device-reacceptance.md` (two additions and two deletions).
- `git diff --name-status 4de559e..790cadd` contains only the accepted WeChat evidence/report additions.
- Neither `4de559e` nor `790cadd` contains a tracked root or `apps/client` `pnpm-lock.yaml` or `pnpm-workspace.yaml`.
- Full reachable-history object inspection finds pnpm metadata only under `spikes/scene-spatial-photography/`; that independent Spike remains present and unchanged.
- Therefore there is no file object at the stated previous accepted head that can be restored to either the repository root or `apps/client`.

The two transient files previously generated under `apps/client` by a rejected bundled-pnpm attempt were untracked runtime artifacts. Their removal was working-tree cleanup, not a committed deletion. It did not alter a Git package-manager authority.

## Package manager authority

`CANONICAL_PACKAGE_MANAGER = NPM`

Evidence:

- `apps/client/package.json` explicitly declares `packageManager: npm@11.6.2`.
- `apps/client/package-lock.json` is tracked, has lockfile version 3, and identifies the `xfx-client` root package.
- The accepted frontend runtime records reproducibility through `npm ci`, TypeScript, WeChat build, and H5 build.
- No product script, CI definition, or current development instruction consumes a root pnpm workspace.
- `scripts/check-env.ps1` and `scripts/check-env.sh` merely report whether pnpm is installed; they do not make pnpm the product dependency authority.
- The independent scene/spatial Spike retains its own pnpm lock/workspace files; this audit does not change that isolated toolchain.

No root multi-package workspace semantics existed in either compared commit. The npm-locked client project and the isolated Spike metadata are both preserved.

## Classification

- Package-manager change in the stated range: `NO_CHANGE`
- Reported root `pnpm-lock.yaml` deletion: `SOURCE_REQUIRED` (the stated source commit contains no such tracked file)
- Reported root `pnpm-workspace.yaml` deletion: `SOURCE_REQUIRED` (the stated source commit contains no such tracked file)
- Package-manager integrity: `PASS`
- Bounded restore required: `NO`

Restoring invented root pnpm files would create a new, unsupported mixed-toolchain authority and is therefore prohibited. If the deletion summary came from another repository, worktree, commit, or untracked runtime snapshot, that exact source is required before any restoration decision can be made.

## Validation

Validation used the configured bundled Node executable and the already-installed locked frontend dependencies; no package was installed and no lockfile was changed.

- Runtime observed: Node `v24.19.0`; repository package authority remains `npm@11.6.2`.
- Package metadata and lockfile-v3 consistency: PASS.
- TypeScript (`tsc --noEmit`): PASS.
- Frontend tests: PASS (`87 / 87`).
- WeChat build (`taro build --type weapp`): PASS.
- H5 regression build (`taro build --type h5`): PASS.
- Existing non-blocking build warnings retained: 993 KiB Guangzhou Tower asset; H5 also reports a 262 KiB chunk and 303 KiB app entrypoint over recommended size thresholds.

## Disposition

`PACKAGE_MANAGER_INTEGRITY = PASS`

Resume the same parent task: `XFX_MAIN_WECHAT_MINIPROGRAM_DEVTOOLS_AND_REAL_DEVICE_REACCEPTANCE_02`.

Next external gate remains installation/use of official WeChat Developer Tools with an authorized WeChat account/AppID context.
