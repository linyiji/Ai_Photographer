# Coarse Framing Controller

`CoarseFramingEpisode` is a separate diagnostic/control layer before precision Scale. It never enters the Parent correction denominator.

## Lifecycle

1. Target profile maps BodyMode to `TOO_TIGHT`, `COMPATIBLE`, `TOO_WIDE`, or `UNCERTAIN`.
2. `TOO_TIGHT` starts one `COARSE_MOVE_FARTHER`; `TOO_WIDE` starts one `COARSE_MOVE_CLOSER`.
3. After 250 ms persistence, one visible instruction is emitted.
4. While the proxy moves in the requested direction or BodyMode progresses, no repeat instruction is emitted.
5. A stable meaningful proxy change (`>=5%`), positive BodyMode progression, or entry to `COMPATIBLE` is `SUCCESS`.
6. Sustained opposite proxy change (`>=6%` after 900 ms) is `WRONG_DIRECTION`.
7. No measured response by 4500 ms is `NO_EFFECT`; unavailable proxy at timeout is `MEASUREMENT_UNCERTAIN`.

The episode records start/best proxy, confidence, BodyMode path, signed progression, and terminal outcome. A later retry requires a terminal outcome and a 1200 ms gap.

## BodyMode progression

The visibility order `HEAD_ONLY → HEAD_SHOULDERS → UPPER_BODY → THREE_QUARTER → FULL_BODY` is used only to measure coarse visibility progress. Target compatibility still comes from the selected profile. Thus `HEAD_SHOULDERS → UPPER_BODY` is positive for farther movement toward a medium target, but `FULL_BODY → UPPER_BODY` can be positive for closer movement toward a close target.

## Coarse-to-precision handoff

When compatibility becomes `COMPATIBLE`:

1. the coarse episode terminates;
2. its metric is not compared with the precision target;
3. the current state version becomes a handoff barrier;
4. precision requires a newer, stable, valid semantic Scale state;
5. the new ControlEpoch snapshots the new metric family, baseline, and target-specific calibration.

This prevents a BodyMode/metric-family switch from creating a false Scale delta or Episode.
