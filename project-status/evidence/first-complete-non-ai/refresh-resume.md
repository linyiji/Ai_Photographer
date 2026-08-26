# Refresh / Resume

Fresh API tests and built-H5 readback covered the following persisted checkpoints:

```text
A. CAPTURE before confirmation = PASS
B. QA after confirmed CaptureAsset = PASS
C. FINE_TUNE after accepted Reality+ = PASS
D. FINE_TUNE after persisted AdjustmentRecipe = PASS
E. FINAL after neutral or non-neutral finalize = PASS
```

Reload reads the Main Session, assets, events, recipe and MyFinalPhoto from SQLite. It does not reconstruct accepted business truth from browser-only state. ACTIVE and COMPLETED projections remain explicit; no silent resume is introduced.
