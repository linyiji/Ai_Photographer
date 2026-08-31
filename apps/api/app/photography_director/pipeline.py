from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .contracts import ShotPlanCandidateV01
from .multimodal import (
    DirectorCandidateSetOutputV01,
    MultimodalProviderRequest,
    MultimodalStage,
    MultimodalStageGateway,
    ProviderImageInput,
    StageExecutionResult,
    error_contract,
)
from .port import PhotographyDirectorProviderMode
from .prompts import prompt_spec
from .service import PhotographyDirectorService
from .understanding import (
    DirectorAssemblyContextV02,
    SceneLightingUnderstandingOutputV01,
    SubjectProfileCandidateV01,
    assemble_director_input,
)


class _NormalizedAIOutputAdapter:
    mode = PhotographyDirectorProviderMode.AI

    def __init__(self, candidates: list[dict[str, Any]]):
        self.candidates = candidates

    def propose(self, input_contract):
        return self.candidates


@dataclass(frozen=True)
class PrecapturePipelineResult:
    request_id: str
    status: str
    subject_candidate: SubjectProfileCandidateV01 | None
    scene_candidate: Any | None
    lighting_candidate: Any | None
    assembled_director_input: dict[str, Any] | None
    shot_plan_candidates: tuple[ShotPlanCandidateV01, ...]
    stage_records: tuple[dict[str, Any], ...]
    error: dict[str, Any] | None


class PrecaptureIntelligencePipeline:
    """Three-stage orchestration only; it has no Main, Live, or Scene Spatial state."""

    def __init__(self, gateway: MultimodalStageGateway):
        self.gateway = gateway

    def execute(
        self,
        context: DirectorAssemblyContextV02,
        subject_image: ProviderImageInput,
        scene_image: ProviderImageInput,
    ) -> PrecapturePipelineResult:
        records: list[dict[str, Any]] = []
        subject_result = self.gateway.execute(
            MultimodalProviderRequest(context.request_id, MultimodalStage.SUBJECT_UNDERSTANDING, {"subject_reference": context.subject_reference.model_dump(mode="json")}, (subject_image,), prompt_spec(MultimodalStage.SUBJECT_UNDERSTANDING)),
            SubjectProfileCandidateV01,
        )
        records.append(subject_result.record)
        if subject_result.status != "PASS":
            return self._failed(context.request_id, records, subject_result)
        scene_result = self.gateway.execute(
            MultimodalProviderRequest(
                context.request_id,
                MultimodalStage.SCENE_LIGHTING_UNDERSTANDING,
                {"view_candidates": [item.model_dump(mode="json") for item in context.view_candidates], "composition_anchor_candidates": [item.model_dump(mode="json") for item in context.composition_anchor_candidates]},
                (scene_image,),
                prompt_spec(MultimodalStage.SCENE_LIGHTING_UNDERSTANDING),
            ),
            SceneLightingUnderstandingOutputV01,
        )
        records.append(scene_result.record)
        if scene_result.status != "PASS":
            return self._failed(context.request_id, records, scene_result, subject_result.candidate)
        scene_lighting = scene_result.candidate
        evidence_errors = self._understanding_evidence_errors(context, subject_image, scene_image, subject_result.candidate, scene_lighting)
        if evidence_errors:
            error = error_contract("UNDERSTANDING_EVIDENCE_REF_UNKNOWN", "VALIDATION", False, {"request_id": context.request_id, "errors": evidence_errors})
            return PrecapturePipelineResult(context.request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, None, (), tuple(records), error)
        try:
            director_input = assemble_director_input(
                context,
                subject_result.candidate,
                scene_lighting.scene_understanding_candidate,
                scene_lighting.lighting_evidence_candidate,
            )
        except ValueError as exc:
            error = error_contract("DIRECTOR_INPUT_ASSEMBLY_INVALID", "VALIDATION", False, {"request_id": context.request_id, "reason": str(exc)})
            return PrecapturePipelineResult(context.request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, None, (), tuple(records), error)
        direction_result = self.gateway.execute(
            MultimodalProviderRequest(context.request_id, MultimodalStage.PHOTOGRAPHY_DIRECTION, {"director_input": director_input.model_dump(mode="json")}, (), prompt_spec(MultimodalStage.PHOTOGRAPHY_DIRECTION)),
            DirectorCandidateSetOutputV01,
        )
        records.append(direction_result.record)
        if direction_result.status != "PASS":
            return self._failed(context.request_id, records, direction_result, subject_result.candidate, scene_lighting)
        director = PhotographyDirectorService(_NormalizedAIOutputAdapter(direction_result.candidate.candidates)).propose(director_input.model_dump(mode="json"))
        if director.status != "CANDIDATES_READY":
            error = error_contract(
                "DIRECTOR_CANDIDATE_VALIDATION_FAILED", "VALIDATION", False,
                {"request_id": context.request_id, "rejected": list(director.rejected)},
            )
            return PrecapturePipelineResult(context.request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, director_input.model_dump(mode="json"), (), tuple(records), error)
        cross_errors = self._cross_reasoning_errors(director_input, director.candidates)
        if cross_errors:
            error = error_contract("DIRECTOR_CROSS_REASONING_INVALID", "VALIDATION", False, {"request_id": context.request_id, "errors": cross_errors})
            return PrecapturePipelineResult(context.request_id, "FAIL", subject_result.candidate, scene_lighting.scene_understanding_candidate, scene_lighting.lighting_evidence_candidate, director_input.model_dump(mode="json"), (), tuple(records), error)
        return PrecapturePipelineResult(
            context.request_id, "PASS", subject_result.candidate, scene_lighting.scene_understanding_candidate,
            scene_lighting.lighting_evidence_candidate, director_input.model_dump(mode="json"), director.candidates, tuple(records), None,
        )

    @staticmethod
    def _cross_reasoning_errors(director_input, candidates) -> list[str]:
        subject_terms = [director_input.subject_profile.clothing_type.lower(), *[item.lower() for item in director_input.subject_profile.dominant_colors]]
        errors = []
        for candidate in candidates:
            text = " ".join([candidate.subject_fit, candidate.rationale, candidate.lighting_use]).lower()
            if not any(term in text for term in subject_terms):
                errors.append(f"{candidate.candidate_id}:SUBJECT_NOT_USED")
            if not any(element.lower() in text for element in candidate.scene_elements_used):
                errors.append(f"{candidate.candidate_id}:SCENE_NOT_CROSS_REASONED")
        return errors

    @staticmethod
    def _understanding_evidence_errors(context, subject_image, scene_image, subject_candidate, scene_lighting) -> list[str]:
        subject_allowed = {subject_image.asset_ref, context.subject_reference.asset_ref}
        scene_allowed = {scene_image.asset_ref}
        for view in context.view_candidates:
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
    def _failed(request_id: str, records: list[dict[str, Any]], stage: StageExecutionResult, subject=None, scene_lighting=None) -> PrecapturePipelineResult:
        scene = scene_lighting.scene_understanding_candidate if scene_lighting else None
        lighting = scene_lighting.lighting_evidence_candidate if scene_lighting else None
        return PrecapturePipelineResult(request_id, stage.status, subject, scene, lighting, None, (), tuple(records), stage.error)
