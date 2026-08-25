# XFX Live Physical Agent — LIVE-P2 Local Closed Loop

This isolated Mobile Web spike preserves accepted LIVE-P0 camera and LIVE-P1 perception, then adds only the deterministic local P2 chain:

```text
Camera -> bounded Pose perception -> Current State + local Target
       -> Delta / Deadband -> Priority / Persistence / Hysteresis
       -> one local Action -> WAITING -> stable Verification -> READY
```

Luna, cloud/provider AI, Backend inference, Voice, Agent planning, Dual Device, Capture, QA, Reality+, complex Pose, and production integration remain excluded.

## Locked runtime

```text
Node 24.18.0; npm 11.6.2; Vite 8.2.2; TypeScript 5.9.3
@mediapipe/tasks-vision 1.0.1 (exact)
Pose Landmarker Lite float16 v1
```

The model binary is ignored and not redistributed. Setup verifies official artifact size `5,777,746` and SHA-256 `59929E1D1EE95287735DDD833B19CF4AC46D29BC7AFDDBBF6753C459690D574A`:

```powershell
npm ci
npm run setup:model
```

## Validation and development

```powershell
npm ls --depth=0
npm test
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:5173/`. Camera/model remain user-triggered. P1 inference prefers the verified Worker and uses an identified bounded fallback. Desktop automation cannot substitute for phone Camera/CV or P2 UX acceptance.

Controlled routes:

```text
?simulateUnsupported=1
?closedLoopReplay=left-to-target
?closedLoopReplay=x-and-scale-both-bad
?closedLoopReplay=no-effect
?closedLoopReplay=wrong-direction
```

Replay routes are explicitly synthetic, request no camera, call no provider, and exist only for deterministic browser evidence.

## P1 perception semantics

- One subject, VIDEO mode, no segmentation, candidate 8 Hz, at most one inference in flight.
- Missing geometry stays nullable; no fake zero coordinates.
- Sensor geometry is normalized and non-mirrored; front-preview mirroring is CSS-only.
- Phone-tuned visibility/presence candidates are `0.50/0.50`, shared by Worker and fallback.
- EMA, timestamp-normalized velocity, stability, bounded loss, and reacquisition reset are transient.
- Real-device P1 passed on OPPO K11 / ColorOS 15 / Chrome Mobile: preview ~29–30 fps, vision 8.0 Hz, state 6.9 Hz, inference p50/p95 68.8/97.4 ms.

## P2 local control semantics

- Three debug target presets; phone-tuned natural-medium defaults are X/Y `0.50/0.50`, height `0.35`, tolerances `0.05/0.06/0.07`, ready stability `600 ms`.
- Delta uses `target-current`; normalized error uses tolerance; values inside deadband are satisfied.
- Priority weights are missing `100`, X `10`, scale `8`, Y `6`. Only one issue/action can be active.
- Issue persistence is `250 ms` after the first phone UX pass; a competing issue must exceed `1.25x` to switch.
- Local action library is fixed Chinese copy for `MOVE_LEFT`, `MOVE_RIGHT`, `MOVE_CLOSER`, `MOVE_FARTHER`, and one-shot `HOLD`.
- Sensor image-right maps to the facing subject's physical left. Front-preview mirroring never enters action calculation.
- Y is measured but explicitly exempted by the included presets because no validated vertical action exists.
- Minimum instruction gap is `1200 ms`; WAITING keeps Camera/Vision/Delta live but blocks ordinary instruction emission.
- Verification classifies SUCCESS, IMPROVING, NO_EFFECT, or WRONG_DIRECTION after the movement stabilizes. Improvement remains silent.
- READY requires subject present, applicable targets satisfied, and stable for `600 ms`; HOLD is emitted once on entry.
- The primary instruction/status overlay is centered in the lower-middle camera area. WAITING never retains the previous ordinary action copy; it shows silent movement/verification state instead.
- Each emitted action remains readable for 700 ms without incrementing or re-emitting it; a local reset control exits fail-safe recovery without restarting Camera/Pose.
- Repeated local failures stop at `LOCAL_RECOVERY_REQUIRED`; they never escalate to Luna.

All parameters are spike-local Candidates, not global Authority.

## Privacy and external-call boundary

```text
Saved/Committed Camera Frames = 0
Raw Video Upload = 0
Provider Calls = 0
Backend Per-frame Calls = 0
Luna Calls = 0
```

## Manual P2 validation

Use a trusted HTTPS tunnel without bypassing certificate warnings and complete `evidence/closed-loop/manual-device-test-template.md`. Run at least three trials with a fixed phone and one person. Verify one instruction, >=900 ms gap, silence while improving, automatic verification, correct physical direction, no X/Scale ping-pong, one-shot HOLD, and READY only while stable.

Until that real-device closed-loop run is completed:

```text
Status = FAIL
LIVE-P1 = PASS
P2 Implementation Gate = PASS
P2 Recalibration Implementation Gate = PASS / 48 of 48 tests
P2 Real Device Gate = FAIL / 17 terminal Episodes / 17.6% correction success
LIVE-P2 = FAIL
```

## Stop boundary

Do not merge or open a PR. Do not start Luna or any later task automatically.
