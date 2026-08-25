# Local Fine Tune Runtime — accepted Spike and integration package

Independent H5 spike proving deterministic, non-generative, non-destructive fine tuning driven entirely by the canonical M01 `AdjustmentRecipe`.

FT-P1 adds provider-independent ephemeral semantic masks and deterministic PERSON/BACKGROUND scopes. The bundled demo enables them for its deterministic fixture; uploaded images retain ALL/LOCAL_REGION while automatic segmentation is unavailable pending provider admission. No image leaves the browser. See `docs/mask-runtime.md`, `docs/mask-provider-evaluation.md`, and `docs/mask-quality-policy.md`.

FT-P2 adds mobile instrumentation, latest-state scheduling, adaptive preview, immutable SOFTNESS caching, duplicate-export protection, EXIF 1/6/8 fixtures and Worker/OffscreenCanvas full-resolution export. OPPO K11 real-device acceptance is `PASS_WITH_WARNING`: all four paths, touch, orientation, export and stability passed; COMBINED p50/p95 50.3/109.2 ms retains a bounded warning. Automatic semantic mask remains unadmitted.

The integration-readiness pass adds provider-neutral production seams, P12/lineage/mask/platform mappings and deterministic `BACKGROUND BLUR`. Blur is one-sided (`0..1` in UI), edge-safe, mask-normalized and runs through the existing Worker final path. OPPO regression remained scrollable with SEMANTIC p50/p95 74.0/127.0 ms and 12MP Worker total 6724.3 ms, so closure remains `PASS_WITH_WARNING`.

## Run

Use the repository runtime authority: Node `24.18.0`, npm `11.6.2`.

```powershell
npm ci
npm run validate
npm run dev
```

The sandbox supports `ALL`, controlled-fixture `PERSON`/`BACKGROUND`, and `LOCAL_REGION`, BRIGHTNESS/WARMTH/SATURATION/SOFTNESS, BACKGROUND-only BLUR, fixed feather, three local regions, recipe save/reload, recipe history, press/hold Compare, and full-resolution JPEG export. All image processing remains browser-local.

`MOOD`, `SKIN_TONE`, and `SKIN_RETOUCH` remain deferred by product meaning, mask dependency or Reality+ ownership. No automatic segmentation or AI provider is included.

See [STATUS.md](STATUS.md), [docs/architecture.md](docs/architecture.md), and the evidence directories for the bounded FT-P0 result.
