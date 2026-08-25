# Overlay Semantics Evidence

Automated invariants: PASS.

- Target box equals controller target center/scale.
- Acceptable zone equals controller X/scale deadband.
- One direction cue maximum.
- STOP is distinct and never rendered as a direction.
- READY is distinct, controller-authoritative, and source-preserving.
- LOST, HELD, LOCKED, and reacquisition are explicit.
- Grid and mode changes do not affect controller semantics.
- Front-preview mirror and cover cropping transform subject/target through the same viewport function.
- Provider / Backend / Luna / Raw Upload remain 0.

The first browser replay exposed a READY/overlay lag: the controller was READY while EMA still displayed “接近目标区域”. The bounded fix aligns a stable READY box to authoritative filtered geometry. A regression test was added before acceptance was resumed.

Fresh device evidence later exposed a separate lifecycle conflict: two trials began inside target and emitted passive-confirmation READY while still ARMED, then emitted six ordinary instructions after the subject moved. The hard post-READY gate therefore fails even though the synthetic READY replay passes. No further controller fix is made in this visual task after the real-device gate failure.
