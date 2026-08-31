# V4 Target-scoped Crop Evidence — 05D

## Accepted source

- 05C device result: FAIL.
- Trace: `live-p2-v4-v4_center_upper_body-1788163637473.json`.
- Source rows: 427; decisive THREE_QUARTER rows: 27.
- Root cause: `GLOBAL_BOTTOM_CROP_OVERAPPLIED_TO_TARGET_MEASUREMENTS`.
- No raw camera frame/video was copied into this fixture or repository.

## Remediation

- Global bottom crop remains explicit in `BodyVisibilityGraphV01.global_bottom_cropped`, warning telemetry and scalar trace.
- Region crop is derived from the required region's own edge evidence.
- `MeasurementDefinitionV01` binds each measurement to its own anchors, regions and crop dependencies.
- The resolver no longer adds a target-independent `REAL_BOTTOM_CROP` blocker.
- Target values, response gate and VERIFY logic are unchanged.

## Deterministic results

- TypeScript: PASS.
- Automated regression: 264/264 PASS.
- Production build: PASS, 46 modules.
- Same observation matrix:
  - Upper Body + valid hips + lower crop: measurement ready.
  - Three Quarter + valid knees + ankles out: measurement ready.
  - Full Body + ankles out: not ready.
- True hip/knee/ankle endpoint crop still invalidates the respective measurement.
- Sanitized 05C fixture: raw_media=false; hip center y=0.846; Center Upper Body leaves ACQUIRE_REQUIRED_BODY.

## Browser gate

- Route: `http://127.0.0.1:4174/?v4CropGate=05C`.
- Browser dataset: `v4CropGate=PASS`, `v4CropStage=ADJUST_SCALE`, `v4CropGlobalBottom=true`.
- Camera/provider/backend/Luna are not used by the replay.

## Remaining gate

A fresh bounded OPPO K11 Center Upper Body scalar trace is required. The expected device proof is `MEASUREMENT_READY_OBSERVED=YES` and `ACQUIRE_REQUIRED_BODY_RELEASED=YES`; READY is not required. Multi-target device testing remains stopped.
