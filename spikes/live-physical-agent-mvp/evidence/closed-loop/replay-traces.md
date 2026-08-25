# LIVE-P2 Deterministic Replay Traces

## Included trajectories

```text
subject-missing-then-enter
left-to-target
right-to-target
too-far-move-closer
too-close-move-farther
x-and-scale-both-bad
improving-while-waiting
no-effect
wrong-direction
overshoot-through-deadband
jitter-inside-deadband
x-scale-priority-competition
oscillation-pressure
temporary-subject-loss
ready-stable-window
```

## left-to-target

| Timestamp | Current X | Runtime | Event | Verification |
| ---: | ---: | --- | --- | --- |
| 0 | 0.20 | ANALYZING | persistence begins | NONE |
| 300 | 0.20 | INSTRUCTING | MOVE_LEFT / 往左一点 | NONE |
| 800 | 0.36 | WAITING | silent while moving | NONE |
| 1500 | 0.50 | ANALYZING | no new instruction | SUCCESS |
| 2100 | 0.50 | READY | HOLD / 好，就这里 | SUCCESS |
| 2200 | 0.50 | READY | no event; count unchanged | SUCCESS |

Increasing non-mirrored sensor X requires the facing subject to move physically left. Mirrored front preview never changes state/action mapping.

## X and scale both bad

X score wins and emits one MOVE_LEFT. WAITING blocks scale overwrite. After X verifies SUCCESS, scale persists and emits MOVE_CLOSER after the gap. All traces are synthetic, deterministic, and not device evidence.
