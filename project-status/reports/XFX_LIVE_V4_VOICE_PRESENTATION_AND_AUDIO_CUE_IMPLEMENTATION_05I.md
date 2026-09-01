# XFX Live V4 Voice Presentation & Audio Cue Implementation 05I

Date: 2026-09-01
Track: `PARALLEL_LIVE`
Branch: `spike/live-physical-agent-mvp-v0.1`

## Result

`PASS_WITH_WARNING`

The additive 05I Presentation runtime is implemented and validated. A single
current Presentation semantic now drives Text/Visual/Voice. Voice is causal,
deduplicated, stale-cancellable, asynchronous, scalar-only in telemetry, and
has no control-side authority.

The warning is gate separation, not an implementation failure: the automated
in-app browser lacks SpeechSynthesis, so actual audible output is pending the
later OPPO combined gate. The Authority explicitly forbids starting that gate
automatically.

## Delivered

- Typed voice presentation model and authorized Chinese phrase catalog
- `VoiceCueEngine` with priority, dedupe, epoch policy, cancellation and expiry
- Browser SpeechSynthesis adapter with capability detection and `zh-CN`
- Fake adapter and deterministic browser scenarios
- Voice ON/OFF control, lifecycle cancellation, and scalar telemetry
- Canonical Authority documents 26–30
- Complete Live regression, H5/WeApp builds, and browser smoke

## Non-regression boundary

No measurement, target, control, response, outcome, READY, target threshold,
or preview/green-frame projection algorithm was changed. Provider, Luna,
backend, audio recording, and audio upload remain 0. Main integration was not
started.

## Verification

```text
AUTOMATED_TESTS = 309/309 PASS
TYPESCRIPT = PASS
LIVE_PRODUCTION_BUILD = PASS / 58 MODULES
H5_BUILD = PASS_WITH_WARNING / EXISTING 299 KIB ENTRY SIZE
WEAPP_BUILD = PASS
BROWSER_SMOKE = PASS_WITH_WARNING / SPEECHSYNTHESIS UNAVAILABLE, FALLBACK PASS
CONSOLE_ERRORS = 0
05G_FRAMING_REGRESSION = PASS
```

Detailed evidence:
`spikes/live-physical-agent-mvp/evidence/control-v4/voice-presentation-05i.md`

## Next gate

```text
OPPO_VOICE_DEVICE_GATE = NOT_STARTED
PROJECTION_DEVICE_GATE = PENDING / EXISTING_DEFECT_EVIDENCE
COMBINED_05H_VOICE_GATE = NOT_STARTED
```

No next task or device gate was started.
