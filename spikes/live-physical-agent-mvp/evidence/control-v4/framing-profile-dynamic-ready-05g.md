# 05G Framing Profile, Position Guidance, and Dynamic READY Evidence

Date: 2026-09-01  
Task: `XFX_LIVE_V4_FRAMING_PROFILE_AND_DYNAMIC_READY_AUTHORITY_REBASELINE_05G`

## Implementation result

- Profiles: `HEAD`, `HEAD_SHOULDERS`, `UPPER_BODY`, `THREE_QUARTER`, `FULL_BODY`.
- `HEAD_SHOULDERS_REQUIRES_HIPS = NO`.
- `DEFAULT_FULL_BODY_REQUIREMENT = NO`.
- Existing `CENTER_UPPER_BODY` retains `HEAD_TO_HIP + TORSO_CENTER`; its semantics and numeric target are not silently changed.
- Observation owns target-independent `observed_extent`.
- Target owns framing profile plus position zone.
- Profile owns independent coverage, regions, anchors, measurements, scale metric, and primary anchor.
- Zones: `LEFT_TOP`, `CENTER`, `RIGHT_BOTTOM` with explicit X/Y relations.
- Y classification is active; Y movement action remains `CAMERA_OPERATOR_DEFERRED` and no subject instruction is fabricated.
- `trial_success_latched` and `current_framing_ready` are separate trace/UI fields.
- Current READY has explicit revoke reasons and wider EXIT tolerance with a 500 ms exit hold.
- Persistent low confidence is a 1500 ms bounded temporary state, then becomes a classified user-fixable blocker rather than indefinite generic waiting.
- Gesture constraints remain deferred.

## Automated evidence

```text
npm test       = PASS / 294 of 294
npm run typecheck = PASS
npm run build  = PASS / 54 modules
```

The dedicated deterministic matrix covers all 15 combinations:

```text
5 profiles × 3 zones = 15/15 PASS
X relation = PASS
Y relation = PASS
current READY = PASS
historical trial success = PASS
one controller action at a time = preserved
```

Dynamic READY regressions prove:

- a sustained target exit revokes current READY;
- historical trial success stays latched;
- one brief outside sample does not revoke current READY;
- scalar trace records extent/profile/zone/anchor/X/Y/current/historical truth;
- `HEAD_SHOULDERS` is measurable without hips.

## Browser evidence

Built production assets were served locally and opened with:

```text
?controlPolicy=V4&v4FramingGate=05G
```

Observed page dataset and DOM:

```text
v4FramingGate = PASS
v4FramingScenarioCount = 15
v4FramingProfiles = 5
v4PositionZones = 3
HUD = PROFILE · FULL_BODY · ZONE · RIGHT_BOTTOM
READY = CURRENT TRUE / TRIAL SUCCESS TRUE
console errors = 0
```

Changing the visible evidence scenario to `HEAD_SHOULDERS × LEFT_TOP` updated the HUD to that exact Profile/Zone and returned to the unarmed start state.

## Device gate still required

Automated and browser evidence do not substitute for OPPO K11 Camera/CV testing. In one continuous camera session:

1. Extent sweep: select/use Head, Head Shoulders, Upper Body, Three Quarter, and Full Body while moving through those visible extents. Record `observed_extent`, measurement readiness, profile, primary anchor, Preview/Vision Hz, p50/p95, and thermal state.
2. Position gate: run `HEAD_SHOULDERS × LEFT_TOP`, `UPPER_BODY × CENTER`, and `THREE_QUARTER × RIGHT_BOTTOM`. Confirm X/Y relation, target/acceptable-zone clarity, one action only, and matching text/visual direction.
3. READY revoke: reach READY, then leave the target or frame. Confirm `current_framing_ready=false`, `trial_success_latched=true`, no stale READY overlay/capture permission, and successful re-acquisition.

```text
DEVICE_EXTENT_SWEEP = SOURCE_REQUIRED
DEVICE_POSITION_GATE = SOURCE_REQUIRED
DEVICE_READY_REVOKE = SOURCE_REQUIRED
RAW_MEDIA = 0
```
