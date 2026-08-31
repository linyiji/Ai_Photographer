# 05E Five-layer Observation / Requirement / Gap Evidence

## Accepted starting failure

The accepted 05D OPPO trace contained 406 rows, 99.49% subject detection, 385 locked rows, 146 rows with bilateral-valid hips and 134 rows with `TORSO_CENTER=GOOD`, yet measurement readiness was 0. The flattened path applied global bottom crop through `!group.bilateral_valid`; because `HEAD_CORE` is multi-point and intentionally non-bilateral, 168 rows falsely classified the head as bottom-cropped and invalidated `HEAD_TO_HIP`.

## Canonical schema

```text
Camera / Pose
  -> SubjectRecognitionStateV01
  -> ObservedBodyStateV01
       + TargetMeasurementRequirementV01
  -> TargetObservationGapV01
  -> Constraint Resolver / LivePresentationModelV02
```

The trace now emits these four pre-control records as nested scalar JSON. Legacy flat scalar fields remain for bounded compatibility. `raw_media=false`; no frame, video or full landmark stream is stored.

## Group and crop classification

| Group | Type | Reduction | `bilateral_valid=false` means crop? |
|---|---|---|---|
| HEAD_CORE | MULTI_POINT | CENTROID | No |
| SHOULDERS | BILATERAL_PAIR | PAIR_CENTER | No; local evidence decides crop |
| HIPS | BILATERAL_PAIR | PAIR_CENTER | No; local evidence decides crop |
| KNEES | BILATERAL_PAIR | PAIR_CENTER | No; local evidence decides crop |
| ANKLES | BILATERAL_PAIR | PAIR_CENTER | No; local evidence decides crop |

Global top/bottom crop remains truthful observation metadata. A semantic region is edge-cropped only when valid local points for that region lie at the asserted edge. Automated group-type × crop tests report `NON_BILATERAL_FALSE_CROP=0`.

## Observation, requirement and gap matrices

One identical Pose observation produces an identical `ObservedBodyStateV01` for all tested targets (`TARGET_INFLUENCES_OBSERVED_BODY_STATE=0`). Targets separately project requirements. For good head/shoulders/hips/knees and missing ankles:

| Target requirement | Resulting gap |
|---|---|
| Upper Body: HEAD_TO_HIP + TORSO_CENTER | READY |
| Three Quarter: knee-capable measurement | READY |
| Full Body: ankle-capable measurement | NOT_READY |

No close-portrait-specific measurement is fabricated because the current V4 target catalog does not yet define `HEAD_SIZE` or `EYE_LINE`.

Gap blockers use bounded reasons and explicit actionability. A system measurement defect produces zero user movement instructions.

## Presentation examples

- Partial: `已识别到人物。当前看到头部和双肩，双髋还没有形成有效测量。` Movement is appended only for a justified user-fixable gap.
- Ready measurement: `已识别到人物。头部、双肩和双髋测量有效，正在判断人物大小和位置。`
- System defect: measurement is paused; no farther/closer/left/right instruction is emitted.

Normal copy contains zero internal measurement/reduction enum names.

## 05D sanitized regression

Fixture facts: global bottom crop true, `HEAD_CORE` multi-point centroid valid, shoulders valid, hips valid and `TORSO_CENTER=GOOD`. Results: HEAD is not edge-cropped solely by the global flag, `HEAD_TO_HIP=GOOD`, Center Upper Body gap is ready, and the resolver leaves `ACQUIRE_REQUIRED_BODY`.

## Automated and browser results

- Full tests: 273/273 PASS.
- TypeScript: PASS.
- Production build: PASS, 49 modules.
- Browser route `?v4CropGate=05C&v=05e`: PASS.
- Browser state: subject detected, observed coverage `THREE_QUARTER`, target gap ready, next stage `ADJUST_SCALE`, global bottom crop preserved.
- Browser normal copy recognizes the person and valid head/shoulder/hip measurement before saying it is judging size and position.

## Device disposition

Fresh OPPO Center Upper Body evidence has not yet been exercised against 05E. Device status is `MANUAL_REVIEW_REQUIRED`. Exactly one Center Upper Body run is allowed next; multi-target testing and target-value tuning remain stopped.

Privacy counters: provider 0, backend per-frame 0, Luna 0, raw upload 0.
