# READY Terminal Lifecycle

Status: AUTOMATED PASS

Both `EPISODE_SUCCESS` and `PASSIVE_CONFIRMATION` call the same terminal latch:

```text
DISARMED -> ARMED -> RUNNING -> READY_LATCHED
                                  |
                                  +-- observation only
```

`READY_LATCHED` always exposes runtime `READY`, records the source and one `HOLD`, freezes time-to-target, and makes ordinary direction emission structurally impossible. Target exit, instability, long-running movement, and later measurement changes cannot reopen the accepted trial.

Only explicit `armTrial()` creates a new monotonic trial. Episode and instruction IDs remain monotonic and accepted historical counters are preserved. Hard reset remains separate and is the only operation that clears the session metrics.
