# Automated Visual Regression

```text
STATUS=PASS
BACKEND=CANVAS2D_IMAGE_DATA_CPU_REFERENCE
FIXTURE=local-region-boundary 48x32
PIXEL_MAE_REPEAT_RENDER=0
MAX_CHANNEL_DIFFERENCE_REPEAT_RENDER=0
REFERENCE_SHA256=0d614e1807c312e6a5846f401a94b4317d628ce9ab7b28973e964cda59d578fd
```

The locked recipe contains ALL brightness/saturation and LOCAL_REGION warmth/softness with fixed normalized geometry and feather. Any renderer math change must deliberately update this evidence after visual review; tests do not normalize away differences.

Automated fixtures also cover gradient, neutral gray, skin-like patch, high contrast, fine texture, hair-like lines, highlights, shadows, busy background, local boundary, full/empty masks, soft person-like mask, background-like mask, center/edge/corner, and boundary crossing.

Browser visual QA on the busy synthetic fixture found no obvious hard rectangle, severe halo, severe color seam, clipping, or destructive softness at the tested safe values. Overlay borders were verified as editor-only and absent from JPEG output logic.
