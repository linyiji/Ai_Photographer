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

## Fresh OPPO revalidation

- Trace: `live-p2-v4-v4_center_upper_body-1788165652825.json`.
- SHA-256: `A1CDCE40B7626976CC02ABCE9E0022DC104CD8E647AB74336C60A28ABE380E64`.
- Rows / duration: `406 / 61.38 s`.
- Subject detected ratio: `99.49%`; subject lock: `385 LOCKED`, `16 LOST`, `4 REACQUIRING`, `1 HELD`.
- Observed coverage summaries: `HEAD_SHOULDERS 219`, `UPPER_BODY 142`, `THREE_QUARTER 26`, `PARTIAL_OR_AMBIGUOUS 2`, `UNKNOWN 17`.
- Valid bilateral hips: `146` rows; valid bilateral shoulders: `326` rows.
- `TORSO_CENTER=GOOD`: `134` rows.
- `measurement_ready=true`: `0`; `ACQUIRE_REQUIRED_BODY`: `389` rows.
- Privacy: frame storage / landmark export / raw upload / backend / provider / Luna = `0/0/0/0/0/0`.

## New device defect and STOP

The 05D region helper used `!group.bilateral_valid` as a generic fallback when any global edge was asserted. `HEAD_CORE` is intentionally a multi-landmark centroid group rather than a bilateral pair. Consequently, all `168` rows with `GLOBAL_BOTTOM_CROP=true` classified HEAD as `EDGE_CROPPED/BOTTOM`, even when the head centroid was finite and far from the bottom edge. All `146` rows with valid bilateral shoulders and hips inherited this false HEAD bottom crop. `134` rows had `TORSO_CENTER=GOOD` but `HEAD_TO_HIP=INVALID`.

This is a new measurement defect. 05D device result is `FAIL`; multi-target testing remains stopped.

## Required judgment order

Future remediation must preserve and expose five separate records before producing guidance:

1. **Recognition:** was a subject detected and is the lock usable?
2. **Observed extent:** which semantic regions are actually accepted, partial, low-confidence or edge-cropped?
3. **Target requirement:** which anchors/regions/measurements does the selected target require?
4. **Target gap:** required minus observed, with a concrete reason per missing measurement.
5. **Control/presentation:** only then choose acquisition copy or a corrective action.

The UI must not collapse internal measurement names into a generic instruction before showing what the system currently recognizes.
