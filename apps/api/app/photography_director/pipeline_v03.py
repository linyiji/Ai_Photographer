from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from .live_alignment import (
    DirectorCandidateSetOutputV02,
    DirectorContextMode,
    DirectorVisualRefV01,
    LiveCapabilityCatalogV01,
    PhotographyDirectorInputV02,
    PhotographyDirectorV03Service,
    ShotPlanCandidateV02,
    build_v03_input,
    live_05g_capability_catalog,
)
from .multimodal import (
    MultimodalProviderRequest,
    MultimodalStage,
    MultimodalStageGateway,
    ProviderImageInput,
    StageExecutionResult,
    error_contract,
)
from .prompts import prompt_spec_v03
from .understanding import (
    DirectorAssemblyContextV02,
    LightingEvidenceCandidateV01,
    SceneLightingUnderstandingOutputV01,
    SceneUnderstandingCandidateV01,
    SubjectProfileCandidateV01,
    assemble_director_input,
)


class PrecaptureV03Context(BaseModel):
    model_config = ConfigDict(extra="forbid")
    assembly_context: DirectorAssemblyContextV02
    live_capability_catalog: LiveCapabilityCatalogV01 = Field(default_factory=live_05g_capability_catalog)
    context_mode: DirectorContextMode = DirectorContextMode.STRUCTURED_ONLY
    director_visual_refs: list[DirectorVisualRefV01] = Field(default_factory=list, max_length=4)


class _NormalizedV03OutputAdapter:
    mode = "AI"

    def __init__(self, candidates: list[dict[str, Any]]):
        self.candidates = candidates

    def propose(self, source: PhotographyDirectorInputV02) -> list[dict[str, Any]]:
        return self.candidates


@dataclass(frozen=True)
class PrecaptureV03Result:
    request_id: str
    status: str
    subject_candidate: SubjectProfileCandidateV01 | None
    scene_candidate: SceneUnderstandingCandidateV01 | None
    lighting_candidate: LightingEvidenceCandidateV01 | None
    director_input: PhotographyDirectorInputV02 | None
    shot_plan_candidates: tuple[ShotPlanCandidateV02, ...]
    stage_records: tuple[dict[str, Any], ...]
    error: dict[str, Any] | None


class PrecaptureIntelligencePipelineV03:
    """Three physical-call pre-capture pipeline; isolated from Main, Live runtime, and Scene Spatial internals."""

    def __init__(self, gateway: MultimodalStageGateway):
        self.gateway = gateway

    def execute(
        self,
        context: PrecaptureV03Context,
        subject_image: ProviderImageInput,
        scene_images: tuple[ProviderImageInput, ...],
        director_images: tuple[ProviderImageInput, ...] = (),
    ) -> PrecaptureV03Result:
        request_id = context.assembly_context.request_id
        records: list[dict[str, Any]] = []
        if self.gateway.config is not None and not self.gateway.config.real_mini_gate_authorized:
            return self._manual_failure(request_id, "DIRECTOR_REAL_MINI_GATE_NOT_AUTHORIZED", records)
        if not 1 <= len(scene_images) <= 3:
            return self._local_failure(request_id, "DIRECTOR_SCENE_MEDIA_BUDGET_INVALID", records)
        expected_director_refs = sorted(item.asset_ref for item in context.director_visual_refs)
        actual_director_refs = sorted(item.asset_ref for item in director_images)
        if expected_director_refs != actual_director_refs:
            return self._local_failure(request_id, "DIRECTOR_VISUAL_REF_RESOLUTION_MISMATCH", records)
        subject_refs = sum(item.role == "SUBJECT_REFERENCE" for item in context.director_visual_refs)
        scene_refs = sum(item.role == "SCENE_VIEW" for item in context.director_visual_refs)
        invalid_structured = context.context_mode == DirectorContextMode.STRUCTURED_ONLY and context.director_visual_refs
        invalid_images = context.context_mode == DirectorContextMode.STRUCTURED_PLUS_IMAGES and not (subject_refs <= 1 and 1 <= scene_refs <= 3)
        if invalid_structured or invalid_images:
            return self._local_failure(request_id, "DIRECTOR_IMAGE_CONTEXT_BUDGET_INVALID", records)
        subject_result = self.gateway.execute(
            MultimodalProviderRequest(
                request_id, MultimodalStage.SUBJECT_UNDERSTANDING,
                {"subject_reference": context.assembly_context.subject_reference.model_dump(mode="json")},
                (subject_image,), prompt_spec_v03(MultimodalStage.SUBJECT_UNDERSTANDING),
            ),
            SubjectProfileCandidateV01,
        )
        records.append(subject_result.record)
        if subject_result.status != "PASS":
            return self._stage_failure(request_id, records, subject_result)
        scene_result = self.gateway.execute(
            MultimodalProviderRequest(
                request_id, MultimodalStage.SCENE_LIGHTING_UNDERSTANDING,
                {
                    "view_candidates": [item.model_dump(mode="json") for item in context.assembly_context.view_candidates],
                    "composition_anchor_candidates": [item.model_dump(mode="json") for item in context.assembly_context.composition_anchor_candidates],
                    "spatial_evidence": context.assembly_context.spatial_evidence_optional.model_dump(mode="json") if context.assembly_context.spatial_evidence_optional else None,
                },
                scene_images, prompt_spec_v03(MultimodalStage.SCENE_LIGHTING_UNDERSTANDING),
            ),
            SceneLightingUnderstandingOutputV01,
        )
        records.append(scene_result.record)
        if scene_result.status != "PASS":
            return self._stage_failure(request_id, records, scene_result, subject_result.candidate)
        scene_lighting = scene_result.candidate
        evidence_errors = self._evidence_errors(context, subject_image, scene_images, subject_result.candidate, scene_lighting)
        if evidence_errors:
            error = error_contract("UNDERSTANDING_EVIDENCE_REF_UNKNOWN", "VALIDATION", False, {"request_id": request_id, "errors": evidence_errors})
            return PrecaptureV03Result(request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, None, (), tuple(records), error)
        try:
            accepted_v01 = assemble_director_input(
                context.assembly_context, subject_result.candidate,
                scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate,
            )
            director_input = build_v03_input(
                accepted_v01, context_mode=context.context_mode,
                optional_visual_refs=context.director_visual_refs, catalog=context.live_capability_catalog,
            )
        except ValueError as exc:
            error = error_contract("DIRECTOR_V03_INPUT_ASSEMBLY_INVALID", "VALIDATION", False, {"request_id": request_id, "reason": str(exc)})
            return PrecaptureV03Result(request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, None, (), tuple(records), error)
        direction_result = self.gateway.execute(
            MultimodalProviderRequest(
                request_id, MultimodalStage.PHOTOGRAPHY_DIRECTION,
                {"director_input": director_input.model_dump(mode="json")},
                director_images, prompt_spec_v03(MultimodalStage.PHOTOGRAPHY_DIRECTION),
            ),
            DirectorCandidateSetOutputV02,
        )
        records.append(direction_result.record)
        if direction_result.status != "PASS":
            return self._stage_failure(request_id, records, direction_result, subject_result.candidate, scene_lighting)
        director_result = PhotographyDirectorV03Service(_NormalizedV03OutputAdapter(direction_result.candidate.candidates)).propose(director_input.model_dump(mode="json"))
        if director_result.status != "CANDIDATES_READY":
            error = error_contract("DIRECTOR_V03_CANDIDATE_VALIDATION_FAILED", "VALIDATION", False, {"request_id": request_id, "rejected": list(director_result.rejected)})
            return PrecaptureV03Result(request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, director_input, (), tuple(records), error)
        return PrecaptureV03Result(
            request_id, "PASS", subject_result.candidate, scene_lighting.scene_understanding_candidate,
            scene_lighting.lighting_evidence_candidate, director_input, director_result.candidates, tuple(records), None,
        )

    @staticmethod
    def _evidence_errors(context, subject_image, scene_images, subject_candidate, scene_lighting) -> list[str]:
        subject_allowed = {subject_image.asset_ref, context.assembly_context.subject_reference.asset_ref}
        scene_allowed = {item.asset_ref for item in scene_images}
        for view in context.assembly_context.view_candidates:
            scene_allowed.update(view.evidence_refs)
        errors = []
        if not set(subject_candidate.observed.evidence_refs) <= subject_allowed:
            errors.append("SUBJECT_EVIDENCE_REF_UNKNOWN")
        if not set(scene_lighting.scene_understanding_candidate.observed.evidence_refs) <= scene_allowed:
            errors.append("SCENE_EVIDENCE_REF_UNKNOWN")
        if not set(scene_lighting.lighting_evidence_candidate.observed.evidence_refs) <= scene_allowed:
            errors.append("LIGHTING_EVIDENCE_REF_UNKNOWN")
        for interpretation in scene_lighting.scene_understanding_candidate.observed.view_interpretations:
            if not set(interpretation.evidence_refs) <= scene_allowed:
                errors.append(f"VIEW_EVIDENCE_REF_UNKNOWN:{interpretation.view_ref}")
        return errors

    @staticmethod
    def _local_failure(request_id: str, code: str, records: list[dict[str, Any]]) -> PrecaptureV03Result:
        error = error_contract(code, "AUTHORITY", False, {"request_id": request_id})
        return PrecaptureV03Result(request_id, "FAIL", None, None, None, None, (), tuple(records), error)

    @staticmethod
    def _manual_failure(request_id: str, code: str, records: list[dict[str, Any]]) -> PrecaptureV03Result:
        error = error_contract(code, "AUTHORITY", False, {"request_id": request_id})
        return PrecaptureV03Result(request_id, "MANUAL_REVIEW_REQUIRED", None, None, None, None, (), tuple(records), error)

    @staticmethod
    def _stage_failure(request_id: str, records: list[dict[str, Any]], stage: StageExecutionResult, subject=None, scene_lighting=None) -> PrecaptureV03Result:
        scene = scene_lighting.scene_understanding_candidate if scene_lighting else None
        lighting = scene_lighting.lighting_evidence_candidate if scene_lighting else None
        return PrecaptureV03Result(request_id, stage.status, subject, scene, lighting, None, (), tuple(records), stage.error)
