# Automated Regression

## Product provenance validation

Product-only run on `feature/first-complete-non-ai-product-flow` before the diagnostic harness was restored:

```text
Backend pytest = 101/101 PASS
Frontend node:test = 26/26 PASS
TypeScript = PASS
H5 production build = PASS_WITH_WARNING
H5 entrypoint = 302 KiB advisory (pre-existing)
WeChat production build = PASS
M03 Fine Tune = 10/10 PASS
M05 user-flow replay = 12/12 PASS
git diff --check = PASS
```

The task added API-level closure coverage for refresh/readback, duplicate capture and finalize, recipe persistence, derived lineage, exact final content, My Works, multi-Session isolation, neutral finalize, and failure-before-retry preservation.

The clean isolated Product provenance rerun after Commit `02821e6c4dcefbef8d916c61eeb502b9ddba5ddd` produced `27/27 PASS`; the difference from the earlier `26/26` history is retained rather than rewritten.

## Root-cause diagnostic validation

Root-cause diagnostic amendment run on 2026-08-26:

```text
Backend pytest = 101/101 PASS
Frontend node:test including diagnostics = 34/34 PASS
TypeScript = PASS
Diagnostic H5 build = PASS_WITH_WARNING
H5 entrypoint = 302 KiB advisory (unchanged)
```

## Current combined validation

Diagnostic closure rerun on 2026-08-26:

```text
Backend pytest = 101/101 PASS
Frontend node:test including diagnostics = 34/34 PASS
Root-cause diagnostic tests = 7/7 PASS
TypeScript = PASS
Diagnostic H5 build = PASS_WITH_WARNING
H5 entrypoint = 302 KiB advisory (unchanged)
git diff --check = PASS
Diagnostic-off Product equivalence = PASS
```
