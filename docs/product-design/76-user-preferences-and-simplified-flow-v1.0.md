# User Preferences and Simplified Flow V1.0

## Status

```text
Authority Scope = FRONTEND PRESENTATION / INTERACTION ONLY
Workflow Authority = packages/workflow/workflow-v1.json / UNCHANGED
Session Authority = Backend PhotographySession / UNCHANGED
```

`UserPreferences` is device-local frontend state. It reduces repeat decisions but is never a Workflow, DomainEvent, Asset, or Session Authority.

## Persisted preferences

```text
shooting_relation_default
device_mode_default
camera_facing_default
voice_guidance_enabled
haptic_enabled
composition_grid_enabled
auto_processing_enabled
open_fine_tune_after_processing
```

The storage key is versioned as `xfx-user-preferences-v1`. Values are normalized on read and write. Missing, corrupt, or partial storage falls back to conservative defaults.

## Session UI override

Quick Settings may temporarily override camera facing, voice, haptic, and composition grid for the current UI session. Overrides are reset whenever a new or explicitly resumed PhotographySession is prepared. They are not sent to the backend and cannot change Workflow.

## Legal auto advance

The frontend orchestrator calls only existing action contracts in their existing legal order:

```text
SELECT_SHOOTING_RELATION
CONFIRM_DEVICE_MODE
ACCEPT_REALITY
GENERATE_TARGETS
SELECT_TARGET
ACCEPT_SHOT_DIRECTION
ENTER_CAPTURE_WINDOW
```

After explicit local-photo confirmation:

```text
CREATE_CAPTURE
ACCEPT
SKIP_FINE_TUNE
```

Each action is separately committed and read back by the backend. On failure, orchestration stops at the last committed stage and exposes recovery; it does not synthesize a state or skip a backend action.

## Preserved confirmations and boundaries

- Resume is explicit; the app never silently opens an active Session.
- Camera permission is requested only after `打开相机`.
- A still remains local through preview and retake.
- Before `使用这张`: upload, CaptureAsset, and revision advance are all zero.
- `使用这张` remains the explicit upload and workflow confirmation.
- Import is progressive fallback, shown only after camera failure or an explicit fallback request.
- Production remains blocked while runtime readiness is false.
- Fine Tune remains a governed unavailable entry; no result is fabricated.
