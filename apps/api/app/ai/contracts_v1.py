from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


def utc_now() -> datetime:
    return datetime.now(UTC)


def canonical_hash(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


class StrictContract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AICapability(StrEnum):
    SUBJECT_UNDERSTANDING = "SUBJECT_UNDERSTANDING"
    SCENE_LIGHTING_UNDERSTANDING = "SCENE_LIGHTING_UNDERSTANDING"
    PHOTOGRAPHY_DIRECTOR = "PHOTOGRAPHY_DIRECTOR"
    CAPTURE_ANALYSIS = "CAPTURE_ANALYSIS"
    IMAGE_EDIT = "IMAGE_EDIT"
    ENHANCEMENT_QA = "ENHANCEMENT_QA"


class AIJobStatus(StrEnum):
    QUEUED = "QUEUED"
    PREPARING = "PREPARING"
    RUNNING = "RUNNING"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SUPERSEDED = "SUPERSEDED"
    CANCELLED = "CANCELLED"


class LatencyClass(StrEnum):
    HOT_LOCAL = "HOT_LOCAL"
    INTERACTIVE_AI = "INTERACTIVE_AI"
    BACKGROUND_PRECOMPUTE = "BACKGROUND_PRECOMPUTE"
    BACKGROUND_AI = "BACKGROUND_AI"


class ProviderMode(StrEnum):
    FAKE = "FAKE"
    REPLAY = "REPLAY"
    REAL = "REAL"


class AIStageUXState(StrEnum):
    IDLE = "IDLE"
    SUBJECT_ANALYZING = "SUBJECT_ANALYZING"
    SCENE_LIGHT_ANALYZING = "SCENE_LIGHT_ANALYZING"
    DIRECTOR_GENERATING = "DIRECTOR_GENERATING"
    DIRECTOR_VALIDATING = "DIRECTOR_VALIDATING"
    PLANS_READY = "PLANS_READY"
    CAPTURE_CHECKING = "CAPTURE_CHECKING"
    REALITY_PLUS_PLANNING = "REALITY_PLUS_PLANNING"
    REALITY_PLUS_EDITING = "REALITY_PLUS_EDITING"
    REALITY_PLUS_VALIDATING = "REALITY_PLUS_VALIDATING"
    FAILED = "FAILED"


class AIMediaPolicyV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    capability: AICapability
    minimum_image_count: int = Field(ge=0, le=3)
    maximum_image_count: int = Field(ge=0, le=3)
    allowed_asset_classes: list[str] = Field(default_factory=list, max_length=8)
    allowed_mime_types: list[Literal["image/jpeg", "image/png", "image/webp"]] = Field(default_factory=list)
    representation: Literal["STRUCTURED_ONLY", "AI_ANALYSIS_PREVIEW", "EDIT_MASTER"]
    raw_video_allowed: Literal[False] = False
    frame_stream_allowed: Literal[False] = False
    geometry_sequence_allowed: Literal[False] = False
    provider_send_authority_required: Literal[True] = True

    @model_validator(mode="after")
    def image_count_is_ordered(self) -> "AIMediaPolicyV01":
        if self.minimum_image_count > self.maximum_image_count:
            raise ValueError("MEDIA_COUNT_RANGE_INVALID")
        return self


class AIProviderProvenanceV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    mode: ProviderMode
    provider_id: str = Field(min_length=1, max_length=120)
    model_id: str = Field(min_length=1, max_length=160)
    model_snapshot: str = Field(min_length=1, max_length=160)
    provider_adapter_version: str = Field(min_length=1, max_length=80)
    prompt_version: str = Field(min_length=1, max_length=80)
    supports_structured_output: bool
    supports_prompt_cache: bool
    supports_usage_reporting: bool
    supports_cost_reporting: bool
    provider_request_id: str | None = Field(default=None, max_length=200)


class AILatencyWaterfallV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    client_prepare_ms: float = Field(default=0, ge=0)
    media_resolve_ms: float = Field(default=0, ge=0)
    upload_ms: float = Field(default=0, ge=0)
    queue_ms: float = Field(default=0, ge=0)
    provider_ms: float = Field(default=0, ge=0)
    normalize_ms: float = Field(default=0, ge=0)
    validate_ms: float = Field(default=0, ge=0)
    schema_validate_ms: float = Field(default=0, ge=0)
    business_validate_ms: float = Field(default=0, ge=0)
    persist_ms: float = Field(default=0, ge=0)
    event_delivery_ms: float = Field(default=0, ge=0)
    render_ms: float = Field(default=0, ge=0)
    end_to_end_ms: float = Field(default=0, ge=0)


class AIContextTelemetryV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    context_bytes: int = Field(ge=0)
    structured_field_count: int = Field(ge=0)
    asset_count: int = Field(ge=0, le=3)
    evidence_count: int = Field(ge=0)
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    stable_prefix_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    prompt_cache_eligible: bool


class AssetInputV01(StrictContract):
    asset_ref: str = Field(min_length=1, max_length=240)
    asset_class: str = Field(min_length=1, max_length=80)
    mime_type: Literal["image/jpeg", "image/png", "image/webp"]
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    representation: Literal["AI_ANALYSIS_PREVIEW", "EDIT_MASTER"]
    provider_send_authorized: bool


class AIRequestEnvelopeV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    request_id: str = Field(min_length=1, max_length=160)
    job_id: str = Field(min_length=1, max_length=160)
    session_id: str = Field(min_length=1, max_length=160)
    session_revision: int = Field(ge=0)
    capability: AICapability
    contract_version: str = Field(min_length=1, max_length=40)
    prompt_version: str = Field(min_length=1, max_length=80)
    provider_adapter_version: str = Field(min_length=1, max_length=80)
    idempotency_key: str = Field(pattern=r"^[0-9a-f]{64}$")
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    asset_refs: list[str] = Field(default_factory=list, max_length=3)
    evidence_refs: list[str] = Field(default_factory=list, max_length=64)
    media_policy: AIMediaPolicyV01
    context_payload: dict[str, Any]
    context_telemetry: AIContextTelemetryV01
    created_at: datetime = Field(default_factory=utc_now)


class AIResultEnvelopeV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    result_id: str = Field(min_length=1, max_length=160)
    job_id: str = Field(min_length=1, max_length=160)
    request_id: str = Field(min_length=1, max_length=160)
    session_id: str = Field(min_length=1, max_length=160)
    session_revision: int = Field(ge=0)
    capability: AICapability
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    status: Literal["CANDIDATE_READY", "FAILED", "SUPERSEDED"]
    candidate_refs: list[str] = Field(default_factory=list)
    normalized_output: dict[str, Any] | None = None
    error: dict[str, Any] | None = None
    provenance: AIProviderProvenanceV01 | None = None
    latency: AILatencyWaterfallV01
    context_telemetry: AIContextTelemetryV01
    created_at: datetime = Field(default_factory=utc_now)


class AIJobV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    job_id: str = Field(min_length=1, max_length=160)
    request_id: str = Field(min_length=1, max_length=160)
    session_id: str = Field(min_length=1, max_length=160)
    session_revision: int = Field(ge=0)
    capability: AICapability
    latency_class: LatencyClass
    status: AIJobStatus = AIJobStatus.QUEUED
    stage: str = "QUEUED"
    contract_version: str
    prompt_version: str
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    idempotency_key: str = Field(pattern=r"^[0-9a-f]{64}$")
    retry_count: int = Field(default=0, ge=0, le=1)
    max_retries: int = Field(default=1, ge=0, le=1)
    result_ref: str | None = None
    error: dict[str, Any] | None = None
    created_at: datetime = Field(default_factory=utc_now)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    superseded_by_job_id: str | None = None


class AIJobEventV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    event_id: str = Field(min_length=1, max_length=160)
    event_type: str = Field(pattern=r"^ai\.[a-z0-9_.]+$")
    job_id: str
    session_id: str
    session_revision: int = Field(ge=0)
    capability: AICapability
    status: AIJobStatus
    ux_state: AIStageUXState
    payload: dict[str, Any] = Field(default_factory=dict)
    occurred_at: datetime = Field(default_factory=utc_now)


class DomainCandidateEnvelopeV01(StrictContract):
    schema_version: Literal["1.0.0"] = "1.0.0"
    candidate_id: str
    candidate_kind: Literal["REALITY_OBSERVATION", "TARGET", "QA", "ENHANCEMENT"]
    created_at: datetime = Field(default_factory=utc_now)
    producer: dict[str, str]
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_refs: list[str] = Field(default_factory=list)
    payload: dict[str, Any]
    disposition: Literal["CANDIDATE", "VALIDATING", "ACCEPTED", "REJECTED", "SUPERSEDED"] = "CANDIDATE"
    promotion_gate: str | None = None


class NodeInputBase(StrictContract):
    contract_version: Literal["0.1.0"] = "0.1.0"
    session_id: str
    session_revision: int = Field(ge=0)
    request_id: str
    created_at: datetime = Field(default_factory=utc_now)


class SubjectUnderstandingInputV01(NodeInputBase):
    subject_asset_ref: str


class SceneLightingUnderstandingInputV01(NodeInputBase):
    scene_view_asset_refs: list[str] = Field(min_length=1, max_length=3)
    view_refs: list[str] = Field(min_length=1, max_length=3)
    composition_anchor_refs: list[str] = Field(default_factory=list, max_length=16)
    spatial_evidence_ref: str | None = None

    @model_validator(mode="after")
    def views_have_images(self) -> "SceneLightingUnderstandingInputV01":
        if len(self.scene_view_asset_refs) != len(self.view_refs):
            raise ValueError("SCENE_VIEW_ASSET_REF_COUNT_MISMATCH")
        return self


class LiveCapabilityCatalogV01(StrictContract):
    contract_version: Literal["0.1.0"] = "0.1.0"
    catalog_version: str
    framing_profiles: list[Literal["HEAD", "HEAD_SHOULDERS", "UPPER_BODY", "THREE_QUARTER", "FULL_BODY"]] = Field(min_length=1)
    placement_model: Literal["TARGET_ZONE"] = "TARGET_ZONE"
    target_zones: list[Literal["LEFT_TOP", "CENTER_TOP", "RIGHT_TOP", "LEFT_CENTER", "CENTER", "RIGHT_CENTER"]] = Field(min_length=1)
    coarse_body_orientation: bool
    detailed_gesture: Literal[False] = False
    live_runtime_version: str


class PhotographyDirectorInputV02(NodeInputBase):
    subject_profile_ref: str
    scene_understanding_ref: str
    lighting_evidence_ref: str
    spatial_evidence_ref: str | None = None
    user_intent: dict[str, Any]
    live_capability_catalog: LiveCapabilityCatalogV01
    compact_director_input_v01: dict[str, Any]
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")


class CaptureAnalysisInputV01(NodeInputBase):
    capture_asset_ref: str
    selected_shot_plan_ref: str
    live_target_ref: str
    subject_profile_ref: str
    scene_understanding_ref: str


class QAProblemV01(StrictContract):
    problem_code: str
    problem_class: Literal["RETAKE_REQUIRED", "REALITY_PLUS_FIXABLE", "ACCEPTABLE"]
    evidence_refs: list[str] = Field(min_length=1)
    description: str


class CaptureQACandidateV01(StrictContract):
    contract_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    decision: Literal["RETAKE", "ACCEPT", "ACCEPT_WITH_ENHANCEMENT"]
    problems: list[QAProblemV01]
    evidence_refs: list[str] = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)


class EditOperationV01(StrictContract):
    operation_type: Literal["FACE_SHADOW_LIFT", "WHITE_BALANCE_ADJUST", "EXPOSURE_ADJUST", "COLOR_ADJUST", "MINOR_PERSPECTIVE", "BOUNDED_CROP", "LEVEL"]
    intensity: Literal["LOW", "MODERATE"]
    target_region_ref: str | None = None


class RealityPlusEditPlanCandidateV01(StrictContract):
    contract_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    allowed_edits: list[EditOperationV01] = Field(min_length=1, max_length=8)
    preserve_constraints: list[Literal["IDENTITY", "CLOTHING", "POSE", "SCENE", "WEATHER", "VIEWPOINT"]] = Field(min_length=6)
    forbidden_operations: list[str] = Field(min_length=1)
    source_qa_candidate_ref: str
    evidence_refs: list[str] = Field(min_length=1)


class ImageEditRequestV01(NodeInputBase):
    edit_master_asset_ref: str
    edit_plan_ref: str
    mask_asset_refs: list[str] = Field(default_factory=list, max_length=2)
    preserve_constraints: list[str] = Field(min_length=1)


class RealityPlusAssetCandidateV01(StrictContract):
    contract_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    source_asset_ref: str
    derived_asset_ref: str
    edit_plan_ref: str
    lineage_hash: str = Field(pattern=r"^[0-9a-f]{64}$")


class EnhancementQAInputV01(NodeInputBase):
    original_asset_ref: str
    enhanced_candidate_asset_ref: str
    edit_plan_ref: str


class EnhancementViolationV01(StrictContract):
    violation_type: Literal["IDENTITY", "CLOTHING", "POSE", "SCENE", "WEATHER", "VIEWPOINT", "PLAN_OVERREACH"]
    evidence_refs: list[str] = Field(min_length=1)


class EnhancementQACandidateV01(StrictContract):
    contract_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    decision: Literal["PASS", "REJECT", "RETRY_ALLOWED"]
    violations: list[EnhancementViolationV01]
    edit_plan_compliant: bool
    evidence_refs: list[str] = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)


LATENCY_CLASS_BY_CAPABILITY = {
    AICapability.SUBJECT_UNDERSTANDING: LatencyClass.BACKGROUND_PRECOMPUTE,
    AICapability.SCENE_LIGHTING_UNDERSTANDING: LatencyClass.BACKGROUND_PRECOMPUTE,
    AICapability.PHOTOGRAPHY_DIRECTOR: LatencyClass.INTERACTIVE_AI,
    AICapability.CAPTURE_ANALYSIS: LatencyClass.INTERACTIVE_AI,
    AICapability.IMAGE_EDIT: LatencyClass.BACKGROUND_AI,
    AICapability.ENHANCEMENT_QA: LatencyClass.BACKGROUND_AI,
}


MEDIA_POLICIES = {
    AICapability.SUBJECT_UNDERSTANDING: AIMediaPolicyV01(capability=AICapability.SUBJECT_UNDERSTANDING, minimum_image_count=1, maximum_image_count=1, allowed_asset_classes=["SUBJECT_REFERENCE", "AI_ANALYSIS_PREVIEW"], allowed_mime_types=["image/jpeg", "image/png", "image/webp"], representation="AI_ANALYSIS_PREVIEW"),
    AICapability.SCENE_LIGHTING_UNDERSTANDING: AIMediaPolicyV01(capability=AICapability.SCENE_LIGHTING_UNDERSTANDING, minimum_image_count=1, maximum_image_count=3, allowed_asset_classes=["SCENE_VIEW", "AI_ANALYSIS_PREVIEW"], allowed_mime_types=["image/jpeg", "image/png", "image/webp"], representation="AI_ANALYSIS_PREVIEW"),
    AICapability.PHOTOGRAPHY_DIRECTOR: AIMediaPolicyV01(capability=AICapability.PHOTOGRAPHY_DIRECTOR, minimum_image_count=0, maximum_image_count=0, allowed_asset_classes=[], allowed_mime_types=[], representation="STRUCTURED_ONLY"),
    AICapability.CAPTURE_ANALYSIS: AIMediaPolicyV01(capability=AICapability.CAPTURE_ANALYSIS, minimum_image_count=1, maximum_image_count=2, allowed_asset_classes=["CAPTURE_MASTER", "SUBJECT_REFERENCE", "AI_ANALYSIS_PREVIEW"], allowed_mime_types=["image/jpeg", "image/png", "image/webp"], representation="AI_ANALYSIS_PREVIEW"),
    AICapability.IMAGE_EDIT: AIMediaPolicyV01(capability=AICapability.IMAGE_EDIT, minimum_image_count=1, maximum_image_count=3, allowed_asset_classes=["EDIT_MASTER", "MASK"], allowed_mime_types=["image/jpeg", "image/png", "image/webp"], representation="EDIT_MASTER"),
    AICapability.ENHANCEMENT_QA: AIMediaPolicyV01(capability=AICapability.ENHANCEMENT_QA, minimum_image_count=2, maximum_image_count=2, allowed_asset_classes=["CAPTURE_MASTER", "REALITY_PLUS_CANDIDATE", "AI_ANALYSIS_PREVIEW"], allowed_mime_types=["image/jpeg", "image/png", "image/webp"], representation="AI_ANALYSIS_PREVIEW"),
}
