# Frontend Runtime Compatibility Spike

## Objective and reference baseline

This isolated spike evaluates a frontend runtime candidate without creating the production frontend skeleton. The locked L0 inputs are Node 24.18.0, npm 11.6.2, npm as package manager, and `package-lock.json` as lock strategy.

## Tested matrix

| Matrix | Taro | React | TypeScript | Result |
|---|---:|---:|---:|---|
| A | 4.2.1 | 19.2.6 | 5.9.3 | FAIL — Taro React peer constraint requires React 18 |
| B | 4.2.1 | 18.3.1 | 5.9.3 | PASS_WITH_WARNING |
| C | — | — | — | NOT_REQUIRED |

## Taro candidate discovery

Live npm metadata identified `4.2.1` as the latest stable Taro CLI version. Its CLI/core packages support Node 18 or newer. `@tarojs/react@4.2.1` and `@tarojs/plugin-framework-react@4.2.1` require React `^18`; the Webpack runner expects Webpack `5.91.0`. Alpha and beta releases were excluded.

## Compatibility decisions

- React 19.2.6: **FAIL**. A real npm install fails with `ERESOLVE` against Taro's React `^18` peer dependency. Dependency overrides were deliberately not used.
- TypeScript 5.9.3: **PASS_WITH_WARNING**. Direct project type checking passes when `skipLibCheck` isolates errors in Taro's cross-platform third-party declarations; both target builds pass.
- Node 24.18.0: **PASS_WITH_WARNING**. Install, lock-file reproduction, CLI, type check, WeChat build, and H5 build all work. Nonfatal Webpack deprecation warnings remain.

## Build results

- WeChat Mini Program: **PASS**; exit code 0, expected artifacts exist, shared probe present.
- H5: **PASS**; exit code 0, `index.html` and bundled assets exist, shared probe present.
- H5 warnings: 299 KiB entrypoint size and `[hash]` deprecation. Neither blocks the candidate.

## Shared core and platform adapter probes

Both targets import `src/shared/runtimeProbe.ts`. Target selection is isolated in `src/platform/platform.ts`, while the shared module imports neither WeChat APIs nor browser-only APIs. This proves the minimum Shared Product Brain + Runtime Adapter structure, not a production domain or camera architecture.

## Failures and recommendation

Matrix A is the only candidate failure and is attributable to the explicit React peer constraint. Matrix B is reproducible with `npm ci`, passes `npm ls`, type checking, and both builds. No TypeScript downgrade is justified by the evidence.

| Component | Candidate tested | Result | Recommended exact version | Authority status |
|---|---:|---|---:|---|
| Node | 24.18.0 | PASS_WITH_WARNING | 24.18.0 | LOCKED_L0 |
| npm | 11.6.2 | PASS | 11.6.2 | LOCKED_L0 |
| Taro | 4.2.1 | PASS | 4.2.1 | L1_CANDIDATE |
| React | 19.2.6 / 18.3.1 | FAIL / PASS | 18.3.1 | L1_CANDIDATE |
| TypeScript | 5.9.3 | PASS_WITH_WARNING | 5.9.3 | L1_CANDIDATE |

Proposed L1 Lock candidate: **Taro 4.2.1 + React 18.3.1 + TypeScript 5.9.3**. This spike does not promote the candidate to final Authority.
