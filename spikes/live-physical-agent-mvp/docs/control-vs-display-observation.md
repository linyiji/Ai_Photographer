# Control vs Display Observation

Status: IMPLEMENTED / DEVICE LATENCY PENDING

`ControlObservation` is the causal input used for instruction issuance. It retains the filtered perception state, state version, measurement timestamp/age, decision age, freshness result, and suppression reason. It never consumes preview mirroring.

`DisplayObservation` is presentation-only. The subject box uses elapsed-time-aware smoothing with moving/quiet time constants of 80/150 ms and a bounded 70 ms motion projection. Its current/p50/p95/max latency is recorded separately. It cannot change Delta, deadband status, priority, action, terminal outcome, or READY.

Presentation entry uses the exact controller deadband. A 1.15x exit hysteresis affects only visual target flicker; it does not make control geometry satisfied. The default overlay is one target guide frame, one corner-style subject box, at most one short cue, distinct STOP/READY, and grid OFF. DEFAULT is the acceptance theme; LINE_DOG remains a presentation-equivalent candidate.
