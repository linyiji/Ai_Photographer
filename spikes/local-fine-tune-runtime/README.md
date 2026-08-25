# Local Fine Tune Runtime — FT-P0

Independent H5 spike proving deterministic, non-generative, non-destructive fine tuning driven entirely by the canonical M01 `AdjustmentRecipe`.

## Run

Use the repository runtime authority: Node `24.18.0`, npm `11.6.2`.

```powershell
npm ci
npm run validate
npm run dev
```

The sandbox supports `ALL` and `LOCAL_REGION`, BRIGHTNESS/WARMTH/SATURATION/SOFTNESS, fixed feather, three local regions, recipe save/reload, recipe history, press/hold Compare, and full-resolution JPEG export. All image processing remains browser-local.

`PERSON`, `BACKGROUND`, `MOOD`, `SKIN_TONE`, `SKIN_RETOUCH`, and `BLUR` are intentionally deferred. No automatic segmentation or AI provider is included.

See [STATUS.md](STATUS.md), [docs/architecture.md](docs/architecture.md), and the evidence directories for the bounded FT-P0 result.
