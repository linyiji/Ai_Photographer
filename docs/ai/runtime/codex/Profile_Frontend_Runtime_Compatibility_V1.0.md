# Profile: FRONTEND_RUNTIME_COMPATIBILITY V1.0

Modes: `PACKAGE_DISCOVERY`, `CANDIDATE_MATRIX`, `MULTI_RUNTIME_BUILD`, `L1_RECOMMENDATION`.

Use stable package metadata and exact locally pinned dependencies. The package manager and lock strategy come from Environment Authority. Do not guess versions or bypass peer constraints to manufacture success.

Candidate search uses Matrix A, then Matrix B, then Matrix C only when needed. Each matrix records versions, changed variables, install/dependency/type/build results, warnings, failure reason, runtime evidence, and Authority state. Change the minimum variables needed to isolate causality.

A matrix may FAIL while the Task passes if the objective is to discover an evidence-backed candidate and a later controlled matrix satisfies acceptance. Preserve rejected candidates. `PASS_WITH_WARNING` remains visible. `SPIKE_PASS != VERSION_LOCK`.

For XFX multi-runtime acceptance, both WeChat and H5 must pass when both are named. Shared code must avoid direct platform-only APIs; platform behavior remains behind an adapter boundary.

Completed evidence example: Taro 4.2.1 + React 19.2.6 + TypeScript 5.9.3 failed at React peer resolution. Changing only React to 18.3.1 produced passing WeChat/H5 builds; TypeScript 5.9.3 remained `PASS_WITH_WARNING`. The recommendation is `L1_CANDIDATE`, not locked Authority.
