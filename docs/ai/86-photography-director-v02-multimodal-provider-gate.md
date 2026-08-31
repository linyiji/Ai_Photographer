# Photography Director V0.2 Multimodal Provider Gate

**Status:** `IMPLEMENTED_BOUNDARY / PROVIDER_NOT_EXERCISED`

## Three logical stages

```text
SUBJECT_UNDERSTANDING
  → SubjectProfileCandidateV01

SCENE_LIGHTING_UNDERSTANDING
  → SceneUnderstandingCandidateV01
  + LightingEvidenceCandidateV01

validated candidates + accepted View/Anchor/optional Spatial/UserIntent
  → PhotographyDirectorInputV01
  → PHOTOGRAPHY_DIRECTION
  → normalized payload
  → schema and business validation
  → DirectorResult<ShotPlanCandidateV01[]>
```

The stages may share a configured multimodal model, but they cannot share an opaque domain response. Observed facts and photography inferences are separate fields with inference-to-observation lineage.

## Runtime configuration

The gate reads provider/model identity, supported stages, timeout, and a credential environment-variable reference from runtime configuration. The credential value is never projected into domain state, telemetry, replay, reports, or validation errors. All three stages and a present credential are required before the gate is authorized.

The repository does not include a concrete provider SDK contract. A future authorized transport implements `MultimodalProviderTransport`; normalized requests and responses remain provider-neutral.

## Media policy

Subject understanding accepts exactly its approved subject image. Scene/lighting understanding accepts exactly its approved scene image. Photography direction consumes validated structured contracts and sends no image again. Every image requires an explicit `provider_send_authorized` flag and records only asset ref, MIME type, and SHA-256 in safe telemetry.

```text
RAW_VIDEO = 0
FRAME_STREAM = 0
UNSELECTED_GEOMETRY_SEQUENCE = 0
SCENE_SPATIAL_PRIVATE_STATE = 0
```

## Failure policy

Provider timeout/unavailability, malformed JSON, schema-invalid output, invalid candidate count/diversity, unsupported View or anchor, P3 assertion, missing Live target, missing cross-reasoning, and unauthorized media fail closed through `ErrorContract`. No partial candidate set becomes authority.

## Admission rule

The deterministic replay transport proves serialization, normalization, validation order, and failure handling only. It is not real-provider or photography-quality evidence. Promotion requires an authorized provider run, sanitized replay records, required subject/media coverage, and completed human photography review.
