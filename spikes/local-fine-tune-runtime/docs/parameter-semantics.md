# Parameter Semantics

All canonical values remain `[-1, +1]`, with `0` neutral.

| Parameter | Safe renderer mapping | Scope in P0 | Failure checks |
|---|---|---|---|
| BRIGHTNESS | bounded exposure-curve exponent, `±0.32` stops | ALL, LOCAL_REGION | highlight clipping, shadow crush |
| WARMTH | red `+14v`, green `+2v`, blue `-16v` bytes before clamp | ALL, LOCAL_REGION | gray/white cast, skin-like patch, sky tint |
| SATURATION | luma/chroma scale `1 + 0.28v` | ALL, LOCAL_REGION | oversaturation, negative/overflow values |
| SOFTNESS | positive 3×3 blur mix up to `0.28`; negative bounded unsharp mix to `0.12` | ALL, LOCAL_REGION | hair/fine texture destruction, halo |

SOFTNESS is a general deterministic detail mix. It is not `SKIN_RETOUCH`, does not detect a face, and cannot reshape identity.

Deferred canonical parameters are preserved without contract mutation:

```text
MOOD=DEFERRED
SKIN_TONE=DEFERRED
SKIN_RETOUCH=DEFERRED
BLUR=DEFERRED
```
