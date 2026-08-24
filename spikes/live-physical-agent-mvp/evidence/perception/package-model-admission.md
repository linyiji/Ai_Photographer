# Package and Model Admission

## Decision

```text
Package = @mediapipe/tasks-vision@1.0.1 (exact lock)
Package license metadata = Apache-2.0
Model = Pose Landmarker Lite / float16 / version 1
Model storage = local ignored asset; not committed or redistributed
```

The implementation follows Google's official Web Pose Landmarker guidance: `@mediapipe/tasks-vision`, VIDEO running mode, one pose, and off-main-thread inference where possible because video detection is synchronous.

## Reproducible identifiers

Package lock records the npm registry tarball and integrity:

```text
https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-1.0.1.tgz
sha512-HF9VScSUZgqECzYtV0d5Ju7nXgRtXihc/At4hAQBmMCUABl9m1g0pXPlEwKM2M0iMAMuA1wc5AxBB1d4J1KybA==
```

Model source and required local identity:

```text
URL = https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
Size = 5,777,746 bytes
SHA-256 = 59929E1D1EE95287735DDD833B19CF4AC46D29BC7AFDDBBF6753C459690D574A
Destination = public/models/pose_landmarker_lite.task (gitignored)
```

Run `npm run setup:model`. The checked-in script downloads to a temporary file, verifies exact size/hash, then moves it into place. A mismatch fails without accepting the artifact.

## Redistribution boundary

The package has explicit Apache-2.0 metadata. The official documentation supplies the model bundle and instructs applications to store it locally, but this task did not identify model-bundle redistribution terms precise enough to authorize committing the binary. Therefore the conservative boundary is: fetch from the official source, verify locally, ignore the artifact, and commit only URL/identity/tooling.

## Runtime settings

```text
runningMode = VIDEO
numPoses = 1
minPoseDetectionConfidence = 0.5
minPosePresenceConfidence = 0.5
minTrackingConfidence = 0.5
outputSegmentationMasks = false
delegate = CPU
```

References:

- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
