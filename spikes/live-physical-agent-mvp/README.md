# XFX Live Physical Agent — LIVE-P2 Visual Servo Spike

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

## Control Policy V2 and visual servo

Each ordinary instruction now owns an immutable fresh `ControlEpoch`. READY is terminal for both success and passive confirmation; only explicit re-arm can create another trial. X/Scale remains committed through the active Episode, and replanning requires a newer post-terminal perception state. Measurement age over 180 ms, decision age over 160 ms, and the first reacquisition state suppress new direction issuance.

Controller action is calculated only in non-mirrored sensor coordinates. Front-preview mirroring changes the rendered arrow sign, never the physical action or Chinese copy. Scalar Trace V2 records the causal epoch, camera/mirror state, measurement/decision ages, freshness, suppression, and latency without raw media.

The functional overlay now uses one clear target frame, one stabilized subject corner box, one short cue, distinct STOP/READY, and grid OFF by default. Display smoothing is independent of control and reports current/p50/p95/max latency. DEFAULT is the acceptance theme; LINE_DOG remains an equivalent candidate. See `docs/control-policy-v2.md`, `docs/ready-terminal-lifecycle.md`, and `docs/control-vs-display-observation.md`.

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
- Local action library includes `MOVE_LEFT`, `MOVE_RIGHT`, `MOVE_CLOSER`, `MOVE_FARTHER`, non-directional one-shot braking `STOP_HERE`, and final one-shot `HOLD`.
- Sensor image-right maps to the facing subject's physical left. Front-preview mirroring never enters action calculation.
- Y is measured but explicitly exempted by the included presets because no validated vertical action exists.
- Minimum instruction gap is `1200 ms`; WAITING keeps Camera/Vision/Delta live but blocks ordinary instruction emission.
- Verification classifies SUCCESS, IMPROVING, NO_EFFECT, or WRONG_DIRECTION after movement stabilizes. A 1.5-normalized corridor and conservative 350 ms velocity prediction can issue one `STOP_HERE` without adding an ordinary Episode.
- READY after Episode SUCCESS uses the existing 600 ms stable window. Geometry after a non-SUCCESS terminal requires 1200 ms passive confirmation and records a distinct source; prior failure counters are not rewritten.
- The primary instruction/status overlay is centered in the lower-middle camera area. WAITING never retains the previous ordinary action copy; it shows silent movement/verification state instead.
- Each emitted action remains readable for 1100 ms without incrementing or re-emitting it; a local reset control exits fail-safe recovery without restarting Camera/Pose.
- Repeated local failures enter `LOCAL_RECOVERY_REQUIRED`. Stable input automatically resumes after 1200 ms; “继续本机引导” remains a manual fallback. Both preserve metrics, Trace, and monotonic Episode numbering; recovery never escalates to Luna.

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

Use a trusted HTTPS tunnel without bypassing certificate warnings. First complete the three-trial OPPO K11 Gate 1 in `evidence/control-policy-v2/oppo-k11-gate1.md`: wrong physical direction, post-READY ordinary actions, obvious oscillation, and persistent subject-box instability must all be zero. Only then run Gate 2 with at least 10 fresh trials and at least 30 naturally produced terminal Episodes. The unchanged Correction Success gate is `>=80%`.

Current Control Policy V2 state:

```text
Status = READY_FOR_MANUAL_DEVICE_TEST
LIVE-P1 = PASS
P2 Implementation Gate = PASS
Automated Gate = PASS / 162 of 162 tests
Browser Replay = PASS
P2 Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P2 Final Gate = NOT_YET_REEVALUATED
```

The accepted 59-Episode / 33.9% sample remains preserved only as this task's starting baseline. It is not a V2 result and cannot satisfy Gate 1 or Gate 2.

## Stop boundary

Do not merge or open a PR. Do not start Luna or any later task automatically.
