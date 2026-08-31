# XFX_LIVE_V4_CANONICAL_DOCUMENTATION_ALIGNMENT_AFTER_MEASUREMENT_REMEDIATION_05B

## Result

`TASK_RESULT = PASS`

This task aligns canonical Live V4 documentation with the accepted 05A Measurement Readiness remediation. It changes documentation only.

## Source authority

- Package: `D:\Projects\_bootstrap\XFX_LIVE_V4_CANONICAL_DOCUMENTATION_ALIGNMENT_05B_PACKAGE.zip`
- Package SHA-256: `FE3D2F7C19B385DAD460EB1297E717408B3AE2BD3E1CF692986B842093DF8DA1`
- Package internal SHA-256 verification: `PASS`
- Source 05A head: `ef7f6b52dd2ace562ce3e0e6c39ea856d6bda94c`

## Canonical mapping

| Canonical role | Repository document | Result |
|---|---|---|
| 05 Architecture | `spikes/live-physical-agent-mvp/docs/control-v4/05_LIVE_HUMAN_OBSERVATION_TARGET_CONTROL_V4.md` | ALIGNED |
| 16 Decision logic | `spikes/live-physical-agent-mvp/docs/control-v4/16_LIVE_V4_CURRENT_POSITION_DECISION_LOGIC.md` | ALIGNED TO V2 |
| 17 Measurement authority | `spikes/live-physical-agent-mvp/docs/control-v4/17_BODY_VISIBILITY_AND_MEASUREMENT_READINESS.md` | ALIGNED TO V2 |
| 18 Visual authority | `spikes/live-physical-agent-mvp/docs/control-v4/18_LIVE_V4_VISUAL_GUIDANCE_AND_OVERLAY_ALGORITHM_V02.md` | ADOPTED / V01 NOT RESTORED |
| Pre-05A architecture filename | `spikes/live-physical-agent-mvp/docs/control-v4/15_LIVE_CONTROL_ARCHITECTURE_V4_TARGET_RELATIVE.md` | NON-CANONICAL SUPERSEDED INDEX |

## Frozen meaning

- Observation flow now explicitly includes Landmark Evidence, Observed Body Coverage, Semantic Body Regions, Landmark Group Reduction, Semantic Anchors and Measurement Capability before `HumanObservationV02`.
- `ObservedBodyCoverage` is current-video observation only; default full-body requirement is NO.
- Coverage expectation, measurement requirements, measurement capability and target measurement readiness are distinct.
- `ACQUIRE_REQUIRED_BODY = ENSURE_TARGET_MEASURABILITY` for compatibility; it does not mean acquire full body or require every coverage label independently.
- `HEAD_CORE` is a multi-landmark group reduced by centroid of valid bounded head-core landmarks.
- Shoulders, hips, knees and ankles are bilateral two-point groups and use `pair_center` only with valid bilateral evidence.
- `UPPER_TORSO_BASIS = DERIVED`.

## Stale-authority audit

Literal `HEAD_CORE.pair_center` strings remain only in explicit prohibition or historical defect-closure statements. They are not positive authority.

| Audit | Stale authoritative occurrences |
|---|---:|
| `HEAD_CORE.pair_center` as a valid reduction | 0 |
| Generic pair-center assumption for all groups | 0 |
| BodyMode determines distance | 0 |
| `HEAD_SHOULDERS` means too close | 0 |
| `FULL_BODY` means too far | 0 |
| Direct upper-torso Pose landmark | 0 |
| Live requires full body by default | 0 |
| Every coverage label must independently be visible before control | 0 |

## Safety verification

- Runtime source changed: NO.
- Target values/tolerances changed: NO.
- Response gate changed: NO.
- VERIFY 600 ms / unstable reset 1000 ms changed: NO.
- Device gate: unchanged, `MANUAL_REVIEW_REQUIRED`.
- Main integration: not started.
