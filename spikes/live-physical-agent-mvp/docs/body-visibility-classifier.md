# Body Visibility Classifier

The classifier uses official MediaPipe Pose group semantics, never raw bounding-box height.

| Mode | Deterministic evidence |
| --- | --- |
| `HEAD_ONLY` | stable head core; bilateral shoulders unavailable |
| `HEAD_SHOULDERS` | head core + bilateral shoulders; hips unavailable |
| `UPPER_BODY` | bilateral shoulders + hips; knees unavailable or credible bottom crop |
| `THREE_QUARTER` | bilateral shoulders + hips + knees; ankles unavailable/cropped |
| `FULL_BODY` | head + bilateral shoulders/hips/knees/ankles; no credible bottom crop |
| `PARTIAL_OR_AMBIGUOUS` | conflicting topology or insufficient bilateral evidence |

Group validity uses the unchanged visibility/presence threshold `0.50`. Head core requires at least two reliable points; bilateral body groups require both official pair points. Group confidence is the mean of `min(visibility,presence)`.

Crop evidence uses the actual sensor rectangle visible through centered `object-fit: cover`. A crop requires reliable topology near a visible edge plus the expected missing downstream group; one missing knee or ankle alone never establishes crop.

Candidate mode must persist for 400 ms before commitment. Short drops hold the prior measurement for at most 250 ms but disable precision output. Recorded metrics include transition count, candidate/committed timestamps, confidence, and flicker count.
