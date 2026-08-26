# Fine Tune Range Mapping Audit

The current control is a custom range track, not a native HTML/Taro Slider.

```text
Production raw range = -100..100 from pointer position
Production step buttons = ±10 raw points
Calibration/preset buttons = -30 / 0 / +30 raw points
Normalized/recipe/renderer range = -1..1
AdjustmentRecipe schema = UNCHANGED
```

Controlled trace:

| Raw | Normalized | Recipe | Renderer | Reload |
|---:|---:|---:|---:|---:|
| -100 | -1.0 | -1.0 | -1.0 | -1.0 |
| -30 | -0.3 | -0.3 | -0.3 | -0.3 |
| 0 | 0 | 0 | 0 | 0 |
| +30 | +0.3 | +0.3 | +0.3 | +0.3 |
| +100 | +1.0 | +1.0 | +1.0 | +1.0 |

```text
Observed +95/-100 cause = UI_LABEL_ONLY_MISMATCH
SLIDER_RANGE_WRONG = NOT_OBSERVED
NORMALIZATION_BUG = NOT_OBSERVED
RECIPE_MAPPING_BUG = NOT_OBSERVED
DISPLAY_MAPPING_BUG = NOT_OBSERVED
```

The three visible `-30% / 0% / +30%` controls are presets but visually read as range labels, while the actual track intentionally spans ±100 raw / ±1 recipe. The displayed +95% and -100% accurately reflect the current underlying track values.

No range or contract was changed.
