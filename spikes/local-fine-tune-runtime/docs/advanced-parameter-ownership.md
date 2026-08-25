# Advanced parameter ownership

| Parameter | Decision | Reason |
|---|---|---|
| BLUR | FINE_TUNE_V1, IMPLEMENTED for BACKGROUND only | Product baseline names light background defocus. The admitted implementation is deterministic, one-sided, mask-normalized, edge-safe and non-generative. Unsupported scopes are rejected. |
| MOOD | CONTRACT_PRODUCT_GAP | M01 enum exists, but Authority does not choose tone curve, versioned preset interpolation or high-level aesthetic intent. Arbitrary cinematic behavior would create hidden semantics. |
| SKIN_TONE | FINE_TUNE_LATER / DEFERRED_MASK_DEPENDENCY | Requires an accepted true SKIN mask. Whole-person WARMTH is not a substitute. |
| SKIN_RETOUCH | REALITY_PLUS_OWNED by default; narrow Fine Tune exploration later | Identity/age/feature risk and strong Reality+ overlap. Any future version needs accepted SKIN mask, edge-preserving texture-only semantics and explicit no-reshape evidence. |

Reality+ owns AI-directed professional finishing. Fine Tune owns user-controlled deterministic final-mile taste. None of these parameters authorizes relighting, object removal, generative fill, face/body reshape or automatic beautification.
