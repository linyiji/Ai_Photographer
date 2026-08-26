# P1 Replay

Final controlled replay inventory:

- P0 orientation/quality replay: 11/11 PASS.
- P1 pixel/context/opportunity replay: 5/5 PASS.
- Total Scene Spatial automated tests: 131/131 PASS.

P1 fixtures are `mixedWide`, `severeQuality`, `placement`, `uniform`, and `duplicateNeighborhood`. Each replay starts from `SceneSweepManifest + YawMap + controlled transient pixels`, requires no Camera, DeviceOrientation, network, Provider, backend, or Luna, and emits deterministic context/descriptors/opportunities under `evidence/p1/generated-replay/`.
