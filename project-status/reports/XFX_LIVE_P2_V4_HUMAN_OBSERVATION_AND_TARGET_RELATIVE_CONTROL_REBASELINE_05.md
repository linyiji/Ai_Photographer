# XFX_LIVE_P2_V4_HUMAN_OBSERVATION_AND_TARGET_RELATIVE_CONTROL_REBASELINE_05

## Status

Implementation, automated, TypeScript, production build and deterministic browser gates are PASS. Fresh OPPO evidence has not yet been collected, so the task is `MANUAL_REVIEW_REQUIRED`; V4 is not a production candidate and Main integration is not started.

## Delivered architecture

- `SubjectLockObservationV01`
- `BodyVisibilityGraphV01`
- `SemanticAnchorSetV01`
- target-independent `HumanObservationV02`
- externally supplied fixture `LiveTargetV02`
- target comparison in `LiveConstraintStateV01`
- target-relative X and semantic-span scale
- required-body acquisition and explicit actor boundary
- strict response → settle → evaluation causality
- scalar-only V4 evidence download
- six-route V4 browser matrix

## Gate summary

| Gate | Result |
|---|---|
| Subject lock | PASS |
| Body visibility graph | PASS_WITH_WARNING — single-person Pose; no occlusion identity claim |
| Semantic anchors | PASS |
| Observation/Target separation | PASS |
| Fixed center authority | REMOVED |
| BodyMode distance authority | REMOVED |
| Target-relative X/scale | PASS |
| Required body acquisition | PASS |
| Actor boundary | PASS_WITH_WARNING — fixture actions are SUBJECT; CAMERA_OPERATOR/EITHER contract is present |
| Response gate | PASS |
| No-response outcomes/reissues | 0 / 0 |
| Passive relation change | DIAGNOSTIC_ONLY |
| Automated | 257/257 PASS |
| TypeScript/build | PASS / PASS |
| Browser matrix | 6/6 PASS |
| OPPO | MANUAL_REVIEW_REQUIRED |

Bounded remediation 05A separates shot coverage from target measurement readiness, derives `UPPER_TORSO` from shoulder/hip evidence, and fixes the invalid `HEAD_CORE.pair_center` assumption by using a bounded head centroid. Automated and browser gates pass; fresh Center device acquisition evidence remains required.

## OPPO attempt 01 follow-up

The first supplied scalar trace was `LEFT_THIRD_UPPER_BODY`, not Center. All 214 rows were correctly blocked in `ACQUIRE_REQUIRED_BODY` because only `HEAD_SHOULDERS` was observed and `UPPER_TORSO,HIPS` were missing. It therefore contains no VERIFY evidence and is not a valid Center/Left target-relative correction trial. The trace exposed presentation problems: incomplete-body acquisition looked frozen, old MODE/BodyMode debug overlays remained visible, and the conventional green rectangle did not match V4 semantic target meaning.

A bounded correction now hides V4 debug and conventional target rectangles, gates the stabilized green subject box on required-body satisfaction, exposes VERIFY progress, and tolerates brief stability flicker without changing any target interval or causal rule. Fresh OPPO evidence is required after this correction.

## Warnings

- Multi-person tracking is not supported; V4 explicitly reports one detected subject and makes no identity claim.
- `OCCLUDED` is not fabricated when the local pose basis cannot distinguish it.
- Y is represented in the target contract, but unsupported operator/camera movement is not mapped to a fake subject action.
- Fresh real-device heat, latency and semantic-relation evidence remains required.

## Privacy / boundary

Provider=0, Luna=0, backend per-frame=0, raw upload=0. No real frames/video are stored. Historical V3 device evidence was not modified. Main/develop were not modified or merged.
