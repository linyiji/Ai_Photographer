# READY causality design

Status: IMPLEMENTED

`GEOMETRY_SATISFIED` and `CORRECTION_CAUSALLY_VERIFIED` are now separate. READY requires
subject present, all applicable target dimensions satisfied, subject stable, no active
ActionEpisode, and no active STOP cue.

Two explicit entry paths exist:

1. `EPISODE_SUCCESS`: the most recent terminal Episode is SUCCESS; the existing target
   stable window (600 ms) applies.
2. `PASSIVE_CONFIRMATION`: there is no successful recent Episode (including after
   NO_EFFECT or WRONG_DIRECTION), so geometry must remain satisfied and stable for a
   longer 1200 ms window.

During `SATISFIED_PENDING_CONFIRMATION`, no ordinary direction instruction is emitted.
Leaving the deadband resets the passive timer and resumes normal issue selection. A
passive READY never rewrites the prior terminal result or its counters. `ready_source` is
recorded explicitly. Final one-shot HOLD remains distinct from the braking STOP cue.
