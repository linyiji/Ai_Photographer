# Safe Range Mapping

| Parameter | Normalized | Neutral | Safe internal range | Mapping |
|---|---:|---:|---:|---|
| BRIGHTNESS | `[-1,1]` | `0` | `[-0.32,+0.32]` | bounded exposure curve |
| WARMTH | `[-1,1]` | `0` | `[-1,+1]` factor | `R+14v, G+2v, B-16v` |
| SATURATION | `[-1,1]` | `0` | `[0.72,1.28]` | Rec.709 luma/chroma scale |
| SOFTNESS | `[-1,1]` | `0` | `[-0.12,+0.28]` | bounded unsharp / 3×3 blur mix |

Non-finite input maps to neutral. Values outside the canonical interval are clamped before rendering. Byte output is finite and clamped to `[0,255]`.
