# Desktop Browser Acceptance

```text
STATUS=PASS_WITH_WARNING
PAGE_LOAD=PASS
CONSOLE_ERRORS=0
PROVIDER_NETWORK_RENDER_CALLS=0
```

Verified in a production Vite preview:

- synthetic fixture loaded at 1920×1080;
- four parameter controls and accessible step controls changed the recipe and preview immediately;
- ALL and LOCAL_REGION paths rendered;
- three regions created; fourth request disabled at `3 / 3`;
- region chips selected overlapping regions independently;
- pointer drag changed region position from `left 40%, top 34%` to `left 44.6875%, top 39.5556%`;
- pointer resize changed size from `42% × 44%` to `47.625% × 50.6667%`;
- Undo changed active saturation `0.1 → 0`; Redo restored `0.1`;
- Save → Reset → Reload restored three independently adjusted region descriptors;
- Compare left adjustment values unchanged;
- full-source JPEG export completed at 1920×1080, 137.7 KB, render 1397 ms, encode 79 ms;
- no uncaught console warnings or errors;
- editor region overlay is DOM-only and never reaches the export canvas.

Warning: preview p95 exceeded the candidate target; see performance evidence.
