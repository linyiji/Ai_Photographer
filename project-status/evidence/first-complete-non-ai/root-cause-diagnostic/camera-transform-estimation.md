# Camera Transform Estimation

```text
Synthetic identity/crop estimator test = PASS
Method = 64×64 luma central scale/offset candidate correlation
Real OPPO result = MANUAL_VISUAL_ONLY (3/3 low-confidence estimates)
Fallback = MANUAL_VISUAL_ONLY when confidence is insufficient
```

The estimator compares the diagnostic centered-3:4 video representation with the native still and reports scale, offset, confidence, and a bounded classification. It is diagnostic only and is never applied to the production camera.

Real OPPO scalar output:

| Capture | Scale | Offset X | Offset Y | Confidence | Classification |
|---|---:|---:|---:|---:|---|
| 1 | 0.95 | -0.12 | 0.06 | 0.0591 | MANUAL_VISUAL_ONLY |
| 2 | 0.95 | -0.12 | 0.06 | 0.1894 | MANUAL_VISUAL_ONLY |
| 3 | 0.95 | -0.12 | 0.06 | 0.1300 | MANUAL_VISUAL_ONLY |

All confidence values are insufficient for a reliable automatic transform classification. No precision beyond the emitted bounded candidates is claimed. Manual visual comparison and deterministic projection geometry—not the low-confidence estimator—support the camera primary-cause classification.
