# XFX_SCENE_SPATIAL_TRACK_BOOTSTRAP_AND_P0_SCENE_SWEEP_RUNTIME_01

Status: **PASS_WITH_WARNING**
Continuation: `XFX_SCENE_SPATIAL_P0_OPPO_REAL_DEVICE_ACCEPTANCE_CONTINUATION_01`

Start Head: `95add7946de73a7b56d3ec6399735b29d44e185e`
Accepted Runtime Head: `1e7b6b4889e13104f23c9a3e13902177740ca612`
Main Base Head: `56cd8e5c41ef35b3af43ff5979e5c921fdfddd17`
Live Reference Head: `847ff95c6d95b32f8cb36be5207d8d3a4343ad9a`
Worktree: `D:\Projects\_worktrees\Ai_Photographer-scene-spatial`
Branch: `spike/scene-spatial-photography-v0.1`

Device: OPPO K11 / ColorOS 15 / Chrome Mobile latest reported; exact version unavailable
ADB Used: NO
ADB Required: NO
Trusted HTTPS Tunnel: PASS
Camera Permission After Action: PASS
Camera Runtime: PASS
Camera Dimensions: 1080×1920 rear environment
Preview FPS: accepted medians 27.52–29.97; ordinary minima 24.57–29.85; one isolated 3.93 estimator interval without visible jank
Orientation Provider: PASS
Orientation Source: `DEVICE_ORIENTATION`
Orientation Permission: PASS
Orientation Hz: 39.4–52.6 recorded range
Stationary Yaw Stability: PASS_WITH_WARNING (initial window movement-contaminated; no false jump observed)

QUICK Trials: 4 accepted; failed pre-fix diagnostics preserved
QUICK PASS: 4/4 accepted trials
QUICK Coverage: 110.0°, 110.3°, 112.8°, 111.1°
QUICK Keyframes: 8, 12, 7, 6
QUICK Selected Yaws (final RTL): `[-0.4,-18.7,-35.5,-51.5,-75.4,-90.7,-106.0]`
QUICK Selected Yaws (final manifest): `[-5.9,7.1,25.4,41.2,78.9,95.5]`

WIDE Trials: 5 accepted; failed pre-fix repeat diagnostic preserved
WIDE PASS: 5/5 accepted trials
WIDE Coverage: 180.6°, 181.0°, 180.3°, 180.7°, 180.1°
WIDE Keyframes: 18, 12, 12, 8, 10
WIDE Selected Yaws (RTL): `[0,-13.8,-30.1,-43.9,-58.9,-77,-91.1,-106.9,-127.2,-142.7,-155.7,-171.6]`
WIDE Selected Yaws (final manifest): `[0.7,24.9,40.5,61.1,97.4,110.1,125.4,138.6,153.5,169.1]`

Coverage Reversal: PASS
Sensor Spike Handling: PASS
Blur Rejection Device: PASS_WITH_WARNING
Exposure Rejection Device: PASS_WITH_WARNING (observed exposure range reasonable; no natural extreme rejection)
Duplicate Gate Device: PASS
Quality Eval p50/p95: p50 15.8–20.6 ms / p95 22.1–40.1 ms
No Backlog: PASS, queue max 0

SceneSweepManifest Device: PASS
YawMap Device: PASS
Manifest Determinism: PASS
Progress Understandable: PASS
Instruction Understandable: PASS
Completion Understandable: PASS
Automatic Keyframe Behavior: PASS
Repeat / Next Sweep Flow: PASS

Raw Video Upload: 0
Frame Stream Upload: 0
Third-party Image Upload: 0
Provider: 0
Backend Per-frame: 0
Luna: 0
Committed Real User Media: 0

Automated Tests: 63/63 PASS
TypeScript: PASS
Build: PASS
Replay: 11 fixtures PASS
Browser: PASS_WITH_WARNING
OPPO K11: PASS_WITH_WARNING

SCENE_SPATIAL_TRACK: `ACTIVE_ACCEPTED_P0`
Scene Sweep Runtime: PASS_WITH_WARNING
SceneSpatialContext: NOT_YET_IMPLEMENTED
PhotographyOpportunity: NOT_YET_IMPLEMENTED
Panorama Stitching: NOT_IMPLEMENTED
Integration Status: `P0_RUNTIME_ACCEPTED_ONLY`

Cross-worktree Runtime Dependency: 0
Source Provenance: PASS
Remote Branch: PASS
Main: UNTOUCHED
Live: UNTOUCHED
Fine Tune: UNTOUCHED
AI Visual: UNTOUCHED
Scene Spatial Worktree: CLEAN at handoff

Warnings: exact Chrome version unavailable; absolute heading not globally calibrated; FULL sweep experimental; thermal/memory APIs unavailable; one isolated FPS estimator interval below 24 without visible jank; stationary window movement-contaminated; device quality thresholds may receive future tuning.

Next Recommended Task: `XFX_SCENE_SPATIAL_P1_SCENE_CONTEXT_AND_PHOTOGRAPHY_OPPORTUNITY_01` — **DO NOT START**.
