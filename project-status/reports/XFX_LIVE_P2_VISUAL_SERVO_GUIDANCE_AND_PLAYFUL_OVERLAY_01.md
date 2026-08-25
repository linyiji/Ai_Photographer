# XFX_LIVE_P2_VISUAL_SERVO_GUIDANCE_AND_PLAYFUL_OVERLAY_01

Status: FAIL

Start Head: `190806f5733949f44d0246abcf6fbf83fe977025`

## Implementation

- Measurement Stabilization: AUTOMATED PASS / REAL DEVICE FAIL
- Raw Box Jitter: `0.0244` fresh mean
- Stabilized Box Jitter: `0.0144` fresh mean / 41.0% lower
- Visual Projection Latency: mean/p50/p95/max `261/248/500/500 ms`
- Subject Lock: PASS WITH DEVICE WARNING / loss-reacquisition `1/2`
- Subject Box: FAIL real-device stability/usability
- Target Box: IMPLEMENTED / UX FAIL
- Acceptable Zone: SEMANTIC PASS / COMPREHENSION FAIL
- Grid: IMPLEMENTED / DEVICE EFFECT NOT RECORDED
- Direction Visual: FAIL / user-observed erroneous direction
- STOP Visual: IMPLEMENTED / 19 cues / overall control gate FAIL
- READY Visual: FAIL lifecycle / 6 post-READY ordinary events
- Text Guidance: SECONDARY IN IMPLEMENTATION / STILL NECESSARY ON DEVICE
- Visual Servo modes: IMPLEMENTED
- Theme Renderer: PASS
- DEFAULT: PASS
- LINE_DOG: IMPLEMENTED_CANDIDATE
- Theme Controller Semantic Diff: `0`
- Payment/Entitlement: NOT_IMPLEMENTED

## Verification

- Automated Tests: 123/123 PASS
- Typecheck: PASS
- Production Build: PASS / 21 modules
- Browser Replay: PASS after bounded READY/EMA alignment fix
- OPPO K11: FAIL
- Fresh Trials / Episodes: `8 / 59`
- Fresh SUCCESS / NO_EFFECT / WRONG: `20 / 31 / 8`
- Correction Success: `33.9%` / required `>=80%` / FAIL
- Action Compliance: `55.9%` reconstructed from scalar deltas
- Axis Completion: `33.9%`
- Average Time To Target: `22.2 s`
- Ordinary Instructions Per Trial: `7.4`
- Overshoot-like NO_EFFECT / STOP: `9 / 19`
- Wrong Physical Direction: `>0` user-observed / required `0`
- Post-READY Ordinary: `6` / required `0`
- Obvious Oscillation: observed / required `0`
- Subject-box Flicker/Instability: observed / required `0`
- Target-state transitions: entry/exit `46/38`
- Visual Servo UX: FAIL

Fresh OPPO K11 HUD: Preview `29.3 fps`; Vision target/actual `8.0/6.9 Hz`; State `6.6 Hz`; inference p50/p95 `66/80.4 ms`. Historical P1 values are not reused.

## Evidence-derived disposition

The visual condition improved only from 28.6% in the fresh text-dominant arm to 36.8% in the fresh visual-plus-text arm, still far below 80%, while requiring slightly more ordinary instructions and more time. The user reported that the target zone was unclear without text. The primary next hypothesis is `CONTROL_POLICY`: passive-confirmation READY does not close a still-ARMED trial, permitting later ordinary instructions. Secondary hypotheses are `MEASUREMENT` due to perceived subject-box instability and capped 500 ms visual lag, and `VISUAL_COMPREHENSION` due to an insufficiently clear target zone.

Per authority, this fresh failure is recorded without lowering the gate, widening the target, or automatically tuning more thresholds. No next task is created and Luna remains OFF.

Provider / Backend / Luna / Raw Upload: `0 / 0 / 0 / 0`

LIVE-P1: PASS

P2 Implementation: PASS

P2 Real Device Gate: FAIL

LIVE-P2: FAIL

CH-003: IDENTIFIED / UNCHANGED

## Commits

- `f7a27b8` — `fix: stabilize live visual guidance measurements`
- `2d12f1e` — `feat: add live visual servo guidance`
- `372778e` — `feat: add guidance theme renderer`
- Final evidence and regression commit — `test: validate live visual servo control` (this report commit)
