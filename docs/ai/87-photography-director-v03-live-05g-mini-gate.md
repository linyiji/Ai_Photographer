# Photography Director V0.3 — Live 05G Alignment and Luna Mini Gate

## Authority boundary

Director decides **what to shoot**. Live decides **how to measure and control it**. Director contracts may express product-level framing, placement, coarse pose intent, camera relationship, lighting use, accepted scene elements and View selection. They must not expose landmarks, body-point reducers, crop classifiers, smoothing parameters, readiness thresholds, response timing, hysteresis or physical-direction mapping internals.

The accepted V0.1 and V0.2 Subject, Scene, Lighting and Director contracts remain unchanged. V0.3 adds V02 Director, ShotPlan and LiveTarget contracts because the earlier three artistic framing values cannot represent all five Live 05G product profiles without semantic ambiguity.

## LiveCapabilityCatalogV01

The Director-facing catalog exposes:

- framing profiles: `HEAD`, `HEAD_SHOULDERS`, `UPPER_BODY`, `THREE_QUARTER`, `FULL_BODY`;
- target-zone placement plus bounded normalized position;
- x/y relation support, with y-subject-action unavailable;
- current coarse body orientation execution false and detailed gesture unavailable;
- device admission `PENDING_05H`.

`HEAD_SHOULDERS` means head plus shoulders and does not imply hips. `UPPER_BODY` is the product-level head-to-hip profile. These meanings are product semantics, not measurement algorithms.

## Director context

`PhotographyDirectorInputV02` contains an already validated `PhotographyDirectorInputV01`, the Live capability catalog, an explicit context mode and bounded visual refs. It supports:

- `STRUCTURED_ONLY`: no Director-stage images;
- `STRUCTURED_PLUS_IMAGES`: zero or one authorized subject reference plus one to three authorized selected Scene/View images.

It never contains a full session dump, conversation history, raw Scene Scan, raw video, frame stream, geometry sequence, solver state, Live scalar trace or provider SDK object.

## ShotPlan and LiveTarget output

`ShotPlanCandidateV02` requires one machine-readable product framing profile, representable placement, bounded pose requirements, camera relationship, validated lighting use, accepted scene elements, short cross-reasoned rationale and `LiveTargetBlueprintV02`. In the current 05G catalog, coarse orientation and detailed gesture are suggestions only; neither can block Live readiness.

The blueprint remains product-level. A later deterministic projector may translate a selected plan into Live runtime targets. Main integration and that downstream projection are not part of this task.

## Candidate validation

Each candidate is rejected for unknown View, anchor, scene element or evidence refs; unsupported framing or placement; required detailed gesture; P3/metric/physical claims; private Live implementation leakage; weak Subject × Scene reasoning; or lighting prose unrelated to validated LightingEvidence. Candidate sets require exactly three candidates and meaningful variation across at least two dimensions.

The selective Director job controller carries the accepted AI I/O idempotency, current revision, latest-input supersession, bounded retry and promotion-time staleness rules. Completed candidates become unpromotable when a newer same-revision input becomes current.

## Real gpt-luna Mini Gate protocol

Exactly three real cases may run only when all are present: explicit provider/model configuration for logical alias `gpt-luna`, credential through approved environment indirection, structured-output and image-input support, a real transport, and exact Owner-authorized subject/scene assets. No substitute model or inferred authorization is allowed.

The planned cases are: Spatial absent Level 1; Spatial partial/insufficient; and usable Spatial if paired accepted evidence exists, otherwise a distinct second Level-1 case. Each case uses one Subject call, one combined Scene/Lighting call, and one Director call. Telemetry records media count and representation plus provider, normalization, schema, business and end-to-end latency without fabricating unavailable fields.

For this run, provider/model configuration, media-send authorization and a real transport are absent. The Mini Gate therefore stops before transport with zero provider calls. Human photography review remains pending and production is not promoted.
