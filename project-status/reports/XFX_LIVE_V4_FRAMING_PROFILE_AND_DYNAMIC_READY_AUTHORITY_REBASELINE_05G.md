# XFX Live V4 Framing Profile and Dynamic READY Authority Rebaseline 05G

Date: 2026-09-01  
Branch: `spike/live-physical-agent-mvp-v0.1`

## Result

`READY_FOR_MANUAL_DEVICE_TEST`

05G implementation, automated regression, production build, canonical documentation alignment, and local browser smoke are complete. OPPO device extent, representative position, and READY-revoke gates have not yet produced fresh evidence and are not reported as PASS.

## Delivered

- Explicit five-profile catalog with target-independent observed extent.
- Independent profile coverage, required regions, anchors, measurements, scale metric, and primary anchor.
- `HEAD_SIZE` and `HEAD_SHOULDER_SCALE` measurement families so Head/Head-Shoulders do not borrow hip requirements.
- Three explicit position zones and X/Y zone relations.
- Target frame, acceptable anchor zone, subject frame, and text presented together.
- Historical trial success separated from current framing readiness.
- Bounded READY exit hysteresis and explicit revoke causes.
- Bounded low-confidence temporal classification.
- 15-scenario automated/body-position browser gate.
- Scalar trace additions with no raw media or landmarks.
- 05G package canonical documents integrated; older conflicting documents marked superseded.

## Verification

```text
Automated tests = 294/294 PASS
TypeScript = PASS
Production build = PASS / 54 modules
Browser smoke = PASS / 15 scenarios / 5 profiles / 3 zones
Browser console errors = 0
External calls / Backend / Luna / Raw upload = 0 / 0 / 0 / 0
```

## Required task output

```text
TASK_RESULT = READY_FOR_MANUAL_DEVICE_TEST

FRAMING_PROFILE_CATALOG = PASS / 5
HEAD_PROFILE = HEAD + HEAD_CENTER + HEAD_SIZE
HEAD_SHOULDERS_PROFILE = HEAD+SHOULDERS + HEAD_CENTER+SHOULDER_CENTER + HEAD_SHOULDER_SCALE
UPPER_BODY_PROFILE = HEAD+SHOULDERS+UPPER_TORSO+HIPS + HEAD_TO_HIP+TORSO_CENTER
THREE_QUARTER_PROFILE = UPPER_BODY+KNEES + HEAD_TO_KNEE
FULL_BODY_PROFILE = THREE_QUARTER+ANKLES + HEAD_TO_ANKLE

HEAD_SHOULDERS_REQUIRES_HIPS = NO
DEFAULT_FULL_BODY_REQUIREMENT = NO

TARGET_FRAMING_PROFILE = PASS / EXPLICIT
CALIBRATION_REQUIREMENT_SEPARATION = PASS
X_CALIBRATION_REQUIRES_HIPS = NO
X_CALIBRATION_REQUIRES_SCALE = NO

TRIAL_SUCCESS_LATCHED = HISTORICAL EVIDENCE ONLY
CURRENT_FRAMING_READY = CURRENT UI/CAPTURE TRUTH
CURRENT_READY_REVOKE = PASS / SUBJECT+GAP+STALE+SCALE+X+Y+MOVEMENT
READY_ENTER_EXIT_SEPARATION = PASS_WITH_WARNING / DEVICE NUMERIC TUNING REQUIRED

BLOCKER_TEMPORAL_CLASSIFICATION = PASS / 1500 MS BOUNDED WAIT

BODY_EXTENT_CLASSIFICATION_GATE = PASS
TARGET_INFLUENCES_BODY_EXTENT_CLASSIFICATION = 0

POSITION_ZONE_GATE = IMPLEMENTATION PASS
LEFT_TOP = PASS
CENTER = PASS
RIGHT_BOTTOM = PASS
X_RELATION = PASS
Y_RELATION = PASS / ACTION DEFERRED TO CAMERA OPERATOR
ONE_ACTION_ONLY = PASS / PRESERVED

AUTOMATED_BODY_POSITION_MATRIX = 15/15 PASS

DEVICE_EXTENT_SWEEP = SOURCE_REQUIRED
DEVICE_POSITION_GATE = SOURCE_REQUIRED
DEVICE_READY_REVOKE = SOURCE_REQUIRED

GESTURE_GATE = DEFERRED

TARGET_VALUES_CHANGED = ADDITIVE 05G PROFILE CANDIDATES ONLY / LEGACY SIX UNCHANGED
RESPONSE_GATE = PRESERVED / NOT RE-EVALUATED BY SYNTHETIC MATRIX
MAIN_INTEGRATION = NOT_STARTED
```
