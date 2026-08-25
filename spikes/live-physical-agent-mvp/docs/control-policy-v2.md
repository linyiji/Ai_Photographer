# LIVE-P2 Control Policy V2

Status: IMPLEMENTED / REAL-DEVICE GATES PENDING

The V2 controller changes causality, not the accepted target or success rule. `AXIS_TARGET_SUCCESS` remains the only Correction Success numerator; the target center, scale, tolerances, and `>=80%` device gate are unchanged.

## Instruction causality

Every ordinary instruction owns one immutable `ControlEpoch`: trial/episode/epoch IDs, action and committed axis, target snapshot, measurement snapshot and timestamp, measurement/decision age, camera facing, preview mirror state, canonical/display signs, and perception state version. Later observations may update verification but cannot reinterpret the issued action.

The controller consumes `SENSOR_NORMALIZED_NON_MIRRORED` coordinates. For a subject facing the lens, sensor image-right is the subject's physical left. Preview mirroring is presentation-only: it flips the X arrow sign, never the controller action or Chinese copy. Scale actions do not depend on mirroring.

## Freshness and replanning

Based on the accepted 6.9 Hz vision / 6.6 Hz state cadence and 80.4 ms inference p95, ordinary issuance requires:

- measurement age `<=180 ms`;
- guidance decision age `<=160 ms`;
- present subject and canonical coordinate basis;
- not the first state after reacquisition.

Suppression is scalar-telemetry-visible. An axis remains committed until terminal outcome or invalidation. After terminal evaluation, a new instruction requires a strictly newer perception state version; this is a semantic response barrier, not an arbitrary delay.

## Non-goals and boundaries

No Luna, Provider, Backend inference, capture, raw media persistence, success-semantic change, or deadband expansion is introduced. Y remains observed but action-deferred.
