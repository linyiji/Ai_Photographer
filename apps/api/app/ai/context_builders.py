from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Generic, TypeVar
from uuid import uuid4

from pydantic import BaseModel

from .contracts_v1 import (
    AICapability,
    AIContextTelemetryV01,
    AIRequestEnvelopeV01,
    AssetInputV01,
    CaptureAnalysisInputV01,
    EnhancementQAInputV01,
    ImageEditRequestV01,
    MEDIA_POLICIES,
    PhotographyDirectorInputV02,
    SceneLightingUnderstandingInputV01,
    SubjectUnderstandingInputV01,
    canonical_hash,
)


class ContextBuildError(ValueError):
    pass


TInput = TypeVar("TInput", bound=BaseModel)


@dataclass(frozen=True)
class BuiltAIContext:
    request: AIRequestEnvelopeV01
    assets: tuple[AssetInputV01, ...]
    stable_prefix: dict[str, Any]
    dynamic_context: dict[str, Any]


class BaseContextBuilder(Generic[TInput]):
    capability: AICapability
    input_type: type[TInput]
    stable_rules: tuple[str, ...]

    def build(
        self,
        node_input: TInput,
        *,
        active_session_revision: int,
        assets: list[AssetInputV01],
        evidence_refs: list[str],
        prompt_version: str,
        provider_adapter_version: str,
        job_id: str | None = None,
    ) -> BuiltAIContext:
        if not isinstance(node_input, self.input_type):
            raise ContextBuildError("NODE_INPUT_TYPE_MISMATCH")
        if node_input.session_revision != active_session_revision:
            raise ContextBuildError("STALE_SESSION_REVISION")
        policy = MEDIA_POLICIES[self.capability]
        self._validate_media(policy, assets)
        dynamic = self.dynamic_payload(node_input)
        stable = {
            "capability": self.capability.value,
            "reality_safety_rules": list(self.stable_rules),
            "contract_version": node_input.contract_version,
            "prompt_version": prompt_version,
            "media_policy": policy.model_dump(mode="json"),
        }
        asset_manifest = [item.model_dump(mode="json", exclude={"provider_send_authorized"}) for item in assets]
        input_material = {"stable": stable, "dynamic": dynamic, "assets": asset_manifest, "evidence_refs": sorted(evidence_refs)}
        input_hash = canonical_hash(input_material)
        stable_hash = canonical_hash(stable)
        context_bytes = len(json.dumps(input_material, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))
        telemetry = AIContextTelemetryV01(
            context_bytes=context_bytes,
            structured_field_count=self._field_count(dynamic),
            asset_count=len(assets),
            evidence_count=len(evidence_refs),
            input_hash=input_hash,
            stable_prefix_hash=stable_hash,
            prompt_cache_eligible=True,
        )
        resolved_job_id = job_id or f"ai-job-{uuid4().hex[:16]}"
        idempotency_key = canonical_hash(
            {"capability": self.capability.value, "session_revision": node_input.session_revision, "input_hash": input_hash, "prompt_version": prompt_version}
        )
        request = AIRequestEnvelopeV01(
            request_id=node_input.request_id,
            job_id=resolved_job_id,
            session_id=node_input.session_id,
            session_revision=node_input.session_revision,
            capability=self.capability,
            contract_version=node_input.contract_version,
            prompt_version=prompt_version,
            provider_adapter_version=provider_adapter_version,
            idempotency_key=idempotency_key,
            input_hash=input_hash,
            asset_refs=[item.asset_ref for item in assets],
            evidence_refs=sorted(set(evidence_refs)),
            media_policy=policy,
            context_payload={"stable": stable, "dynamic": dynamic},
            context_telemetry=telemetry,
        )
        return BuiltAIContext(request, tuple(assets), stable, dynamic)

    def dynamic_payload(self, node_input: TInput) -> dict[str, Any]:
        return node_input.model_dump(mode="json", exclude={"created_at"})

    @staticmethod
    def _validate_media(policy, assets: list[AssetInputV01]) -> None:
        if not policy.minimum_image_count <= len(assets) <= policy.maximum_image_count:
            raise ContextBuildError("AI_MEDIA_COUNT_INVALID")
        if any(not item.provider_send_authorized for item in assets):
            raise ContextBuildError("AI_MEDIA_UNAUTHORIZED")
        if any(item.asset_class not in policy.allowed_asset_classes for item in assets):
            raise ContextBuildError("AI_MEDIA_ASSET_CLASS_INVALID")
        if any(item.mime_type not in policy.allowed_mime_types for item in assets):
            raise ContextBuildError("AI_MEDIA_MIME_INVALID")
        if policy.representation != "STRUCTURED_ONLY" and any(item.representation != policy.representation for item in assets):
            raise ContextBuildError("AI_MEDIA_REPRESENTATION_INVALID")

    @classmethod
    def _field_count(cls, value: Any) -> int:
        if isinstance(value, dict):
            return len(value) + sum(cls._field_count(item) for item in value.values())
        if isinstance(value, list):
            return sum(cls._field_count(item) for item in value)
        return 0


class SubjectContextBuilder(BaseContextBuilder[SubjectUnderstandingInputV01]):
    capability = AICapability.SUBJECT_UNDERSTANDING
    input_type = SubjectUnderstandingInputV01
    stable_rules = (
        "OBSERVED_FACTS_SEPARATE_FROM_PHOTOGRAPHY_INFERENCE",
        "INFERENCE_MUST_CITE_OBSERVATION_IDS",
        "NO_IDENTITY_PERSONALITY_ETHNICITY_HEALTH_BODY_JUDGMENT",
    )


class SceneLightingContextBuilder(BaseContextBuilder[SceneLightingUnderstandingInputV01]):
    capability = AICapability.SCENE_LIGHTING_UNDERSTANDING
    input_type = SceneLightingUnderstandingInputV01
    stable_rules = (
        "ONLY_ACCEPTED_VIEW_AND_ANCHOR_REFS",
        "NO_SAFE_STAND_WALKABILITY_GROUND_OR_METRIC_AUTHORITY",
        "SCENE_AND_LIGHTING_OUTPUTS_REMAIN_SEPARATE",
    )


class DirectorContextBuilder(BaseContextBuilder[PhotographyDirectorInputV02]):
    capability = AICapability.PHOTOGRAPHY_DIRECTOR
    input_type = PhotographyDirectorInputV02
    stable_rules = (
        "WHAT_TO_SHOOT_ONLY",
        "APPROXIMATELY_THREE_MEANINGFULLY_DISTINCT_CANDIDATES",
        "REFERENCE_ACCEPTED_EVIDENCE_AND_SUPPORTED_LIVE_CAPABILITIES",
        "NO_LIVE_MEASUREMENT_IMPLEMENTATION_OR_P3_AUTHORITY",
    )


class CaptureAnalysisContextBuilder(BaseContextBuilder[CaptureAnalysisInputV01]):
    capability = AICapability.CAPTURE_ANALYSIS
    input_type = CaptureAnalysisInputV01
    stable_rules = (
        "COMPARE_CAPTURE_TO_SELECTED_PLAN",
        "CAPTURE_CAUSALITY_CHANGE_REQUIRES_RETAKE",
        "EDIT_PLAN_ONLY_FOR_BOUNDED_REALITY_PLUS_FIXES",
    )


class ImageEditContextBuilder(BaseContextBuilder[ImageEditRequestV01]):
    capability = AICapability.IMAGE_EDIT
    input_type = ImageEditRequestV01
    stable_rules = (
        "EXECUTE_APPROVED_EDIT_PLAN_ONLY",
        "PRESERVE_IDENTITY_CLOTHING_POSE_SCENE_WEATHER_VIEWPOINT",
        "NO_FREE_FORM_MAKE_PRETTIER",
    )


class EnhancementQAContextBuilder(BaseContextBuilder[EnhancementQAInputV01]):
    capability = AICapability.ENHANCEMENT_QA
    input_type = EnhancementQAInputV01
    stable_rules = (
        "COMPARE_ORIGINAL_AND_ENHANCED",
        "CHECK_PRESERVE_CONSTRAINTS_AND_EDIT_PLAN_COMPLIANCE",
        "NO_SILENT_ACCEPTANCE",
    )
