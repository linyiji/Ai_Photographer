# Subject Lock and Overlay

The lock is a spike-local visual continuity mechanism, not identity tracking. A valid, sufficiently confident subject enters ACQUIRING and becomes LOCKED after a bounded 250 ms acquisition window. A missing measurement retains the last stabilized box as HELD for at most 650 ms. A nearby return becomes REACQUIRING and then LOCKED; a geometrically distant return starts a fresh acquisition instead of jumping the old box.

The subject rectangle is generated from the local Pose measurement and a velocity-aware EMA. Quiet observations use alpha `0.22`; meaningful movement uses `0.48` so stabilization does not freeze the guide. When the authoritative controller reaches stable READY, the rendered box aligns to the same filtered geometry used for READY, preventing a controller/overlay semantic mismatch.

The overlay reports raw/stabilized scalar jitter, estimated visual lag, source projection age, target entry/exit, target-crossing delay, time inside before READY, lock loss, and reacquisition. These are scalar observations only. Raw camera media is neither saved nor uploaded.
