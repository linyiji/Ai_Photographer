# Camera Preview / Still A-B

```text
Harness = PASS
Required captures = 3 stationary same-moment captures
Device result = 3/3 COMPLETE / USER-OPERATED OPPO RUN
```

Each diagnostic capture remains local and displays:

1. current CSS-visible cover crop;
2. intrinsic video frame with contain projection;
3. centered 3:4 crop derived from the same intrinsic video frame;
4. native ImageCapture still.

User evidence (external screenshot only; no diagnostic media committed):

| Capture | Native still | Transform estimator |
|---|---|---|
| 1 | 3072×4096 / 7,899,471 bytes / image/jpeg | MANUAL_VISUAL_ONLY / scale 0.95 / offset -0.12, 0.06 / confidence 0.0591 |
| 2 | 3072×4096 / 7,911,928 bytes / image/jpeg | MANUAL_VISUAL_ONLY / scale 0.95 / offset -0.12, 0.06 / confidence 0.1894 |
| 3 | 3072×4096 / 7,922,931 bytes / image/jpeg | MANUAL_VISUAL_ONLY / scale 0.95 / offset -0.12, 0.06 / confidence 0.1300 |

Manual comparison is consistent across all three captures:

```text
CURRENT COVER vs NATIVE STILL = MISMATCH
INTRINSIC CONTAIN vs NATIVE STILL = PARTIAL_MATCH
CENTER 3:4 vs NATIVE STILL = PARTIAL_MATCH / materially closer than CURRENT COVER
Native still wider/narrower than all video-derived views = NOT PROVEN
```

The current cover representation keeps only normalized vertical source coordinates `0.3317..0.6683`, approximately 33.7% of the stream height. This geometrically explains the visibly enlarged preview. The centered 3:4 representation keeps `0.125..0.875`, or 75% of stream height, and is materially closer to the native still.

```text
PRIMARY = MIXED / CSS_COVER_CROP + ASPECT_RATIO_MISMATCH
SECONDARY = VIDEO_VS_STILL_FOV_PIPELINE UNRESOLVED / MANUAL_VISUAL_ONLY
DIGITAL_ZOOM_STATE = NOT_SUPPORTED (current zoom 1)
PHYSICAL_CAMERA_LENS_SELECTION = NOT_SUPPORTED BY EXPOSED DEVICE EVIDENCE
```

No diagnostic image was uploaded or committed. Evidence retains only filenames, hashes, scalar inventory, dimensions, and the user's external screenshot reference.
