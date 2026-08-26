# Future Production Interface

P0 exports four conceptual seams without importing the spike UI: `OrientationProvider` supplies trustworthy relative-yaw samples or an explicit unavailable state; `SceneSweepRuntime` accepts scalar orientation and locally measured frame-quality candidates; `SceneSweepManifest` serializes ordered metadata and privacy counters; `YawMap` answers nearest observed view and gaps.

The future production adapter must own platform permission UX and transient image lifetime. It must map output into a future `SceneSpatialContext` candidate and pass Main validation before accepted state. P0 makes no `PhotographySession`, asset persistence, provider, or navigation contract.
