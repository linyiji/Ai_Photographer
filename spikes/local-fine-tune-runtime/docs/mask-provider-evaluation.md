# Browser-local provider evaluation

Disposition: `DEFERRED_WITH_EVIDENCE` (`AUTO_SEMANTIC_MASK=NOT_YET_PASS`).

Candidate: Google MediaPipe Tasks Vision Image Segmenter. Official Web documentation identifies `@mediapipe/tasks-vision` and an official DeepLab v3 float32 model. MediaPipe source is Apache-2.0 and input processing is described as on-device.

- Package: `@mediapipe/tasks-vision` (not installed)
- Model: `image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite`
- URL: `https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite`
- Size: 2,780,176 bytes
- SHA-256: `FF36E24D40547FE9E645E2F4E8745D1876D6E38B332D39A82F0BF0F5D1D561B3`
- Model binary committed: NO; temporary evaluation download removed

Deferred because the model download surface does not provide a sufficiently explicit redistribution/license chain, and this general category model has not met portrait hair/hand contamination gates. No cloud fallback was introduced.

Primary sources consulted 2026-08-25: Google AI Edge Web image segmentation guide, the official MediaPipe repository/license, and its Tasks Vision README/model example.
