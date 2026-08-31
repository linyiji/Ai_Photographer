from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .contracts import (
    CompositionAnchorCandidate,
    LightingEvidence,
    PhotographyDirectorInputV01,
    ReferenceImageOptional,
    SceneUnderstanding,
    SpatialEvidenceOptional,
    SubjectProfile,
    SubjectReference,
    UserIntent,
    ViewCandidate,
)


class StrictCandidate(BaseModel):
    model_config = ConfigDict(extra="forbid")


class PhotographyInference(StrictCandidate):
    inference_id: str = Field(min_length=1, max_length=160)
    claim: str = Field(min_length=1, max_length=320)
    based_on_observation_ids: list[str] = Field(min_length=1, max_length=12)
    confidence: float = Field(ge=0.0, le=1.0)


class SubjectObservedFacts(StrictCandidate):
    observation_ids: list[str] = Field(min_length=1, max_length=24)
    clothing_categories: list[str] = Field(min_length=1, max_length=8)
    dominant_colors: list[str] = Field(min_length=1, max_length=4)
    secondary_colors: list[str] = Field(default_factory=list, max_length=4)
    color_relationship: str = Field(min_length=1, max_length=200)
    visible_accessories: list[str] = Field(default_factory=list, max_length=8)
    visible_styling: list[str] = Field(default_factory=list, max_length=8)
    silhouette_observations: list[str] = Field(default_factory=list, max_length=8)
    pose_feasibility_observations: list[str] = Field(default_factory=list, max_length=8)
    evidence_refs: list[str] = Field(min_length=1, max_length=16)


class SubjectProfileCandidateV01(StrictCandidate):
    schema_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str = Field(min_length=1, max_length=160)
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    observed: SubjectObservedFacts
    photography_inferences: list[PhotographyInference] = Field(default_factory=list, max_length=12)
    confidence: float = Field(ge=0.0, le=1.0)

    @model_validator(mode="after")
    def inference_lineage_is_valid(self) -> "SubjectProfileCandidateV01":
        observed_ids = set(self.observed.observation_ids)
        if any(not set(item.based_on_observation_ids) <= observed_ids for item in self.photography_inferences):
            raise ValueError("SUBJECT_INFERENCE_WITHOUT_OBSERVATION")
        forbidden = re.compile(r"\b(identity|personality|precise age|beauty|attractiveness|body rating|ethnicity|health)\b", re.IGNORECASE)
        serialized_observed = " ".join(
            self.observed.clothing_categories
            + self.observed.dominant_colors
            + self.observed.secondary_colors
            + self.observed.visible_accessories
            + self.observed.visible_styling
            + self.observed.silhouette_observations
            + self.observed.pose_feasibility_observations
        )
        if forbidden.search(serialized_observed):
            raise ValueError("UNSUPPORTED_SUBJECT_OBSERVATION")
        return self


class ViewInterpretation(StrictCandidate):
    view_ref: str = Field(min_length=1, max_length=160)
    interpretation: str = Field(min_length=1, max_length=320)
    evidence_refs: list[str] = Field(min_length=1, max_length=12)


class SceneObservedFacts(StrictCandidate):
    observation_ids: list[str] = Field(min_length=1, max_length=24)
    scene_category: str = Field(min_length=1, max_length=120)
    usable_visual_elements: list[str] = Field(min_length=1, max_length=12)
    background_complexity: Literal["SIMPLE", "MODERATE", "COMPLEX"]
    foreground_background_relationships: list[str] = Field(default_factory=list, max_length=8)
    open_space_depth_cues: list[str] = Field(default_factory=list, max_length=8)
    visual_distractions: list[str] = Field(default_factory=list, max_length=8)
    view_interpretations: list[ViewInterpretation] = Field(min_length=1, max_length=8)
    evidence_refs: list[str] = Field(min_length=1, max_length=20)


class SceneUnderstandingCandidateV01(StrictCandidate):
    schema_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str = Field(min_length=1, max_length=160)
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    observed: SceneObservedFacts
    photography_inferences: list[PhotographyInference] = Field(default_factory=list, max_length=12)
    confidence: float = Field(ge=0.0, le=1.0)

    @model_validator(mode="after")
    def physical_authority_is_forbidden(self) -> "SceneUnderstandingCandidateV01":
        observed_ids = set(self.observed.observation_ids)
        if any(not set(item.based_on_observation_ids) <= observed_ids for item in self.photography_inferences):
            raise ValueError("SCENE_INFERENCE_WITHOUT_OBSERVATION")
        text = " ".join(
            [self.observed.scene_category]
            + self.observed.usable_visual_elements
            + self.observed.foreground_background_relationships
            + self.observed.open_space_depth_cues
            + self.observed.visual_distractions
            + [item.interpretation for item in self.observed.view_interpretations]
            + [item.claim for item in self.photography_inferences]
        )
        if re.search(r"\b(?:safe stand|physically safe|walkable|ground supports|\d+(?:\.\d+)?\s*(?:m|meters?)\s+away)\b", text, re.IGNORECASE):
            raise ValueError("UNSUPPORTED_P3_SCENE_CLAIM")
        return self


class LightingObservedFacts(StrictCandidate):
    observation_ids: list[str] = Field(min_length=1, max_length=16)
    light_direction_candidate: str = Field(min_length=1, max_length=120)
    softness: Literal["SOFT", "MODERATE", "HARD", "UNKNOWN"]
    light_pattern: Literal["FLAT", "SIDE", "BACKLIGHT", "MIXED", "UNKNOWN"]
    face_shadow_risk: Literal["LOW", "MODERATE", "HIGH", "UNKNOWN"]
    highlight_clipping_risk: Literal["LOW", "MODERATE", "HIGH", "UNKNOWN"]
    background_subject_brightness_relation: str = Field(min_length=1, max_length=200)
    ambient_appearance: str | None = Field(default=None, max_length=200)
    evidence_refs: list[str] = Field(min_length=1, max_length=16)


class LightingEvidenceCandidateV01(StrictCandidate):
    schema_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str = Field(min_length=1, max_length=160)
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    observed: LightingObservedFacts
    photography_inferences: list[PhotographyInference] = Field(default_factory=list, max_length=8)
    confidence: float = Field(ge=0.0, le=1.0)

    @model_validator(mode="after")
    def unsupported_ambient_claims_are_forbidden(self) -> "LightingEvidenceCandidateV01":
        observed_ids = set(self.observed.observation_ids)
        if any(not set(item.based_on_observation_ids) <= observed_ids for item in self.photography_inferences):
            raise ValueError("LIGHTING_INFERENCE_WITHOUT_OBSERVATION")
        text = " ".join(filter(None, [self.observed.ambient_appearance, *[item.claim for item in self.photography_inferences]]))
        if re.search(r"\b(?:sunset|golden hour|blue sky|rainy|stormy|snowing)\b", text, re.IGNORECASE):
            raise ValueError("UNSUPPORTED_WEATHER_OR_TIME_CLAIM")
        return self


class SceneLightingUnderstandingOutputV01(StrictCandidate):
    schema_version: Literal["0.1.0"] = "0.1.0"
    scene_understanding_candidate: SceneUnderstandingCandidateV01
    lighting_evidence_candidate: LightingEvidenceCandidateV01


class DirectorAssemblyContextV02(StrictCandidate):
    request_id: str = Field(min_length=1, max_length=160)
    subject_reference: SubjectReference
    view_candidates: list[ViewCandidate] = Field(min_length=1, max_length=8)
    composition_anchor_candidates: list[CompositionAnchorCandidate] = Field(min_length=1, max_length=16)
    spatial_evidence_optional: SpatialEvidenceOptional | None = None
    user_intent: UserIntent
    reference_image_optional: ReferenceImageOptional | None = None


def assemble_director_input(
    context: DirectorAssemblyContextV02,
    subject_candidate: SubjectProfileCandidateV01,
    scene_candidate: SceneUnderstandingCandidateV01,
    lighting_candidate: LightingEvidenceCandidateV01,
) -> PhotographyDirectorInputV01:
    view_refs = {item.view_ref for item in context.view_candidates}
    interpreted_views = {item.view_ref for item in scene_candidate.observed.view_interpretations}
    if interpreted_views != view_refs:
        raise ValueError("SCENE_CANDIDATE_VIEW_COVERAGE_MISMATCH")
    subject = subject_candidate.observed
    scene = scene_candidate.observed
    light = lighting_candidate.observed
    risk_values = []
    if light.face_shadow_risk in {"MODERATE", "HIGH"}:
        risk_values.append(f"face shadow risk {light.face_shadow_risk.lower()}")
    if light.highlight_clipping_risk in {"MODERATE", "HIGH"}:
        risk_values.append(f"highlight clipping risk {light.highlight_clipping_risk.lower()}")
    intensity = "STRONG" if light.softness == "HARD" else "MODERATE" if light.softness in {"SOFT", "MODERATE"} else "LOW"
    return PhotographyDirectorInputV01.model_validate(
        {
            "schema_version": "0.1.0",
            "request_id": context.request_id,
            "subject_reference": context.subject_reference.model_dump(mode="json"),
            "subject_profile": SubjectProfile(
                clothing_type=", ".join(subject.clothing_categories),
                dominant_colors=subject.dominant_colors,
                secondary_colors=subject.secondary_colors,
                accessories=subject.visible_accessories,
                visible_styling=[*subject.visible_styling, *subject.silhouette_observations],
                pose_feasibility_considerations=subject.pose_feasibility_observations,
                evidence_refs=subject.evidence_refs,
            ).model_dump(mode="json"),
            "scene_understanding": SceneUnderstanding(
                scene_type=scene.scene_category,
                usable_visual_elements=scene.usable_visual_elements,
                background_complexity=scene.background_complexity,
                evidence_refs=scene.evidence_refs,
            ).model_dump(mode="json"),
            "view_candidates": [item.model_dump(mode="json") for item in context.view_candidates],
            "composition_anchor_candidates": [item.model_dump(mode="json") for item in context.composition_anchor_candidates],
            "lighting_evidence": LightingEvidence(
                lighting_type=light.light_pattern if light.light_pattern != "UNKNOWN" else "FLAT",
                direction=light.light_direction_candidate,
                intensity=intensity,
                risks=risk_values,
                evidence_refs=light.evidence_refs,
            ).model_dump(mode="json"),
            "spatial_evidence_optional": context.spatial_evidence_optional.model_dump(mode="json") if context.spatial_evidence_optional else None,
            "user_intent": context.user_intent.model_dump(mode="json"),
            "reference_image_optional": context.reference_image_optional.model_dump(mode="json") if context.reference_image_optional else None,
        }
    )
