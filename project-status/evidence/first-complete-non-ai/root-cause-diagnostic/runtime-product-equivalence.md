# Runtime Diagnostic-off Product Equivalence

Verified on 2026-08-26 against Product Commit `02821e6c4dcefbef8d916c61eeb502b9ddba5ddd` after the provenance-aware `runtime.ts` conflict merge.

```text
normal Camera start/getUserMedia = PASS
ImageCapture production path = PASS
intrinsic-video canvas fallback = PASS
open/switch/capture/close Product Commit equivalence = PASS
diagnostic-off guards/default = PASS
diagnostic UI absent from product page = PASS
diagnostic network side effects = 0
```

The comparison normalizes the two Chinese UI strings that were stored as GBK bytes in the Product Commit, then compares the production Camera method bodies. Diagnostic geometry/capture methods are guarded by `__XFX_DIAGNOSTIC_MODE__` and are not reachable from the default product page.

No CaptureViewport, 3:4 remediation, production constraint change, capture-backend change, or product API-contract change is included in this closure.
