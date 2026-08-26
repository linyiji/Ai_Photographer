# Semantic Framing Measurement V2

Scope: spike-local amendment inside `XFX_LIVE_P2_CONTROL_POLICY_V2_AND_SERVO_STABILITY_01`.

## Pipeline

```text
MediaPipe 33-point Pose
→ named landmark groups and confidence
→ visible-cover crop evidence
→ candidate BodyMode
→ 400 ms committed-mode hysteresis
→ torso anchor + mode-specific robust scale
→ deterministic uncertainty proxy
→ One Euro adaptive filter
→ FramingMeasurement
→ compatibility stage
→ precision servo
```

The raw Pose min/max extent remains available only as `DEBUG POSE EXTENT`. Live precision X reads `FramingMeasurement.anchor_x`; precision scale reads the committed BodyMode's `scale`. Raw wrist/elbow/ankle extremes cannot directly move either control value.

`FramingMeasurement` records timestamp/state version, committed mode/confidence, anchor/source, scale/metric, bounded uncertainty proxies, visible crop edges, precision-valid flags, velocities, stability, selected filter, semantic display box, and raw debug extent. No raw frame, video, landmark array, backend call, Provider call, or Luna call is persisted.

## Causality

`ControlEpoch` snapshots BodyMode, scale metric family, and scale baseline. A metric-family transition resets scale velocity. If an active precision Episode loses its metric, it remains auditable and eventually terminates as `NO_EFFECT` with `MEASUREMENT_UNCERTAIN_METRIC_SWITCH`; it is not silently removed from the existing denominator.

`MEASUREMENT_UNCERTAIN` is not a wider deadband. Existing target center, target scale, tolerances, `AXIS_TARGET_SUCCESS`, and Correction Success `>=80%` remain unchanged.

## Filtering and cadence

Selected synthetic A/B candidate: One Euro (`minCutoff=0.35`, `beta=2`, derivative cutoff `1`). Device confirmation remains mandatory. Vision cadence remains 8 Hz by default; 10/12 Hz can be selected only for the required OPPO A/B and remain bounded to one inference in flight with no queue.
