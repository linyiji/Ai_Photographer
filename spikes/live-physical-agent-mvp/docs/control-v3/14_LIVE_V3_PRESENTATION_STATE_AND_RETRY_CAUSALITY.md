# Live V3 Presentation State and Retry Causality

Date: `2026-08-29`

Status: `IMPLEMENTED / AUTOMATED_AND_BROWSER_PASS / DEVICE_REVALIDATION_REQUIRED`

## Boundary

This correction adds a one-way `LivePresentationStateV01` projection over current V3 controller truth. It does not add a controller state machine or change Camera, Pose, semantic measurement, filtering, target, deadband, READY timing, settle thresholds, outcome taxonomy, or the one-small-step architecture.

```text
Controller snapshot
  + current active Episode
  + current Stage
  + current retry state
  + current READY hold
        ↓
LivePresentationStateV01
        ↓
Primary instruction + visual overlay
```

Presentation never mutates or authorizes Controller behavior.

## Presentation states

The bounded set is:

- `DISARMED`
- `ACQUIRING`
- `ACTION_REQUIRED`
- `WAITING_FOR_RESPONSE`
- `WAITING_FOR_SETTLE`
- `EVALUATING`
- `STAGE_TRANSITION`
- `VERIFYING_READY`
- `RETRY_REQUIRED`
- `PAUSED`
- `READY`

Episode outcomes remain debug/Trace diagnostics. `TARGET_REACHED`, `IMPROVED`, `NO_EFFECT`, `WRONG_DIRECTION`, and `INVALIDATED` never enter normal primary or overlay copy.

## Action semantics

- `active_action`: the current ControlEpoch action while the user response is still expected.
- `retry_action_candidate`: an action recomputed from a newer, fresh, stable current measurement and issued under a new ControlEpoch.
- `last_episode_action`: historical diagnostic only.

Historical actions and outcomes cannot directly drive primary copy.

## Retry contract

The retry barrier prevents reuse of the same settled measurement. It is released by a strictly newer state version that is fresh, stable, and non-invalid. It no longer requires spontaneous user motion or a scalar delta after the prior Episode has settled.

After release, the controller reselects the current Stage and derives the action from the current Relation. A retry is a new ordinary action and therefore creates a new ControlEpoch. WRONG_DIRECTION never mechanically reverses or repeats `last_episode_action`.

## Preserved constants

- stage persistence: `250 ms`
- response grace: `900 ms`
- settle window: `375 ms`
- Episode timeout: `4500 ms`
- READY stable candidate: `600 ms`
- material normalized improvement: `0.18`
- material ratio: `15%`
- target center/tolerance and semantic scale calibration: unchanged

## Device boundary

Automated and browser evidence does not promote V3 or complete OPPO acceptance. The next authorized step remains the fresh prospective OPPO FRAMING_ONLY, X_ONLY, COMBINED, and ALREADY_SATISFIED gate.

