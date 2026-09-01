# Live V4 Canonical Target Goal-directed Guidance — Test Candidate 06

Date: 2026-09-01  
Implementation: `e280cf4b4b1e296c98d6490a2d40556936f180ea`  
Status: `TEST_CANDIDATE_READY / DEVICE_ACCEPTANCE_NOT_STARTED`

## Authority and mapping

Canonical authority is `D:\Projects\Ai_Photographer\算法记录\Live_Guidance`.
The current `LiveTargetV02` profile is preserved as the accepted target-value
source and projected into one locked `CanonicalFramingTargetV01`. Existing
observation and measurement remain the observation provider. V4 control epochs
are adapted into one `CanonicalGuidanceCommandV01`; old presentation-owned action
selection is superseded. The 05I Browser SpeechSynthesis adapter is retained.

## Runtime chain

```text
Canonical target -> feasibility/ownership -> target lock -> observation
-> target-relative error vector -> one canonical command -> text/visual/voice
-> all hard constraints pass -> HOLD_POSITION -> rolling stability verification
-> READY
```

Every hard constraint has an actionable owner. X and scale belong to the subject;
Y belongs to the camera operator. Feasibility is explicitly
`CONTROL_FEASIBILITY_ONLY`; this candidate makes no physical P3 reachability
claim.

Primary Text and Voice use the same `command_id`. Secondary Text reports
observation or progress only. Movement changes lifecycle to
`MOVING_TOWARD_TARGET`; it never means `TARGET_REACHED`. A direction reversal must
persist for 500 ms before replacing the command. Long no-response republishes the
same command rather than creating a new control epoch.

Only when all active hard constraints pass does the controller emit
`HOLD_POSITION` / `TARGET_REACHED`. READY follows rolling verification. The current
600 ms, 80% in-target requirement and bounded span checks are TEST_CANDIDATE
values, not frozen production thresholds.

## Acceptance surface

- H5 query: `?controlPolicy=V4&v=canonical-guidance-06`
- deterministic gate: add `&canonicalGuidanceGate=06`
- candidate HUD exposes target/revision, feasibility, error vector, owner/action,
  command lifecycle, verification, authorities, and voice event
- green target region and observed subject box are independent projections
- trace format: `xfx-live-p2-v4-canonical-guidance-trace-v2`
- raw frames, landmarks, audio, provider, backend, Luna, and upload remain zero

## Deferred sources

P3 physical target feasibility, real-device threshold tuning, shot-plan
references, thermal/performance evidence, and OPPO device acceptance remain
SOURCE_REQUIRED or NOT_STARTED. No Main integration is authorized.
