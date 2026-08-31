from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


Normalized = Annotated[float, Field(ge=0.0, le=1.0)]


class StrictContract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SpatialStatus(StrEnum):
    PARTIAL = "PARTIAL"
    INSUFFICIENT = "INSUFFICIENT"
    USABLE = "USABLE"


class Framing(StrEnum):
    ENVIRONMENTAL_FULL_BODY = "ENVIRONMENTAL_FULL_BODY"
    THREE_QUARTER_LIFESTYLE = "THREE_QUARTER_LIFESTYLE"
    CLOSE_EMOTIONAL_PORTRAIT = "CLOSE_EMOTIONAL_PORTRAIT"


class SubjectReference(StrictContract):
    asset_ref: str = Field(min_length=1, max_length=160)
    evidence_kind: Literal["CONTROLLED_SYNTHETIC", "CAPTURED_REFERENCE"]


class SubjectProfile(StrictContract):
    clothing_type: str = Field(min_length=1, max_length=120)
    dominant_colors: list[str] = Field(min_length=1, max_length=4)
    secondary_colors: list[str] = Field(default_factory=list, max_length=4)
    accessories: list[str] = Field(default_factory=list, max_length=8)
    visible_styling: list[str] = Field(default_factory=list, max_length=8)
    pose_feasibility_considerations: list[str] = Field(default_factory=list, max_length=8)
    evidence_refs: list[str] = Field(min_length=1, max_length=12)


class SceneUnderstanding(StrictContract):
    scene_type: str = Field(min_length=1, max_length=120)
    usable_visual_elements: list[str] = Field(min_length=1, max_length=12)
    background_complexity: Literal["SIMPLE", "MODERATE", "COMPLEX"]
    evidence_refs: list[str] = Field(min_length=1, max_length=16)


class ViewCandidate(StrictContract):
    view_ref: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=300)
    usable_elements: list[str] = Field(min_length=1, max_length=12)
    background_complexity: Literal["SIMPLE", "MODERATE", "COMPLEX"]
    lighting_relationship: str = Field(min_length=1, max_length=240)
    evidence_refs: list[str] = Field(min_length=1, max_length=16)


class CompositionAnchorCandidate(StrictContract):
    anchor_ref: str = Field(min_length=1, max_length=160)
    view_ref: str = Field(min_length=1, max_length=160)
    semantic_element: str = Field(min_length=1, max_length=120)
    x: Normalized
    y: Normalized
    confidence: Normalized


class LightingEvidence(StrictContract):
    lighting_type: Literal["SIDE", "FLAT", "BACKLIGHT", "MIXED"]
    direction: str = Field(min_length=1, max_length=120)
    intensity: Literal["LOW", "MODERATE", "STRONG"]
    risks: list[str] = Field(default_factory=list, max_length=8)
    evidence_refs: list[str] = Field(min_length=1, max_length=12)


class SpatialEvidenceOptional(StrictContract):
    status: SpatialStatus
    metric_scale_available: bool
    relative_geometry: list[str] = Field(default_factory=list, max_length=12)
    limitations: list[str] = Field(min_length=1, max_length=12)
    evidence_refs: list[str] = Field(default_factory=list, max_length=16)


class UserIntent(StrictContract):
    mood: str = Field(min_length=1, max_length=120)
    priorities: list[str] = Field(min_length=1, max_length=8)
    preferred_framing: Framing | None = None
    exclusions: list[str] = Field(default_factory=list, max_length=8)


class ReferenceImageOptional(StrictContract):
    asset_ref: str = Field(min_length=1, max_length=160)
    usage: Literal["MOOD_ONLY", "COMPOSITION_REFERENCE"]


class PhotographyDirectorInputV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    request_id: str = Field(min_length=1, max_length=160)
    subject_reference: SubjectReference
    subject_profile: SubjectProfile
    scene_understanding: SceneUnderstanding
    view_candidates: list[ViewCandidate] = Field(min_length=1, max_length=8)
    composition_anchor_candidates: list[CompositionAnchorCandidate] = Field(min_length=1, max_length=16)
    lighting_evidence: LightingEvidence
    spatial_evidence_optional: SpatialEvidenceOptional | None = None
    user_intent: UserIntent
    reference_image_optional: ReferenceImageOptional | None = None

    @model_validator(mode="after")
    def references_are_consistent(self) -> "PhotographyDirectorInputV01":
        view_refs = {item.view_ref for item in self.view_candidates}
        if len(view_refs) != len(self.view_candidates):
            raise ValueError("DUPLICATE_VIEW_REF")
        for anchor in self.composition_anchor_candidates:
            if anchor.view_ref not in view_refs:
                raise ValueError("ANCHOR_VIEW_REF_UNKNOWN")
        return self


class ImagePlanePlacement(StrictContract):
    composition_anchor_ref: str
    subject_anchor: Literal["EYES", "FACE_CENTER", "TORSO_CENTER", "BODY_CENTER"]
    x: Normalized
    y: Normalized


class TargetTolerances(StrictContract):
    anchor_x: Annotated[float, Field(gt=0.0, le=0.25)]
    anchor_y: Annotated[float, Field(gt=0.0, le=0.25)]
    scale: Annotated[float, Field(gt=0.0, le=0.35)]


class SecondaryConstraint(StrictContract):
    constraint_type: Literal["HEADROOM", "BODY_VISIBILITY", "BACKGROUND_RELATIONSHIP", "HORIZON", "OCCLUSION"]
    instruction: str = Field(min_length=1, max_length=240)


class PoseConstraint(StrictContract):
    body_area: Literal["HEAD", "SHOULDERS", "TORSO", "ARMS", "HANDS", "LEGS", "FEET", "GAZE"]
    instruction: str = Field(min_length=1, max_length=240)


class CameraConstraints(StrictContract):
    direction: str = Field(min_length=1, max_length=240)
    approximate_height: Literal["EYE_LEVEL", "CHEST_LEVEL", "WAIST_LEVEL", "UNSPECIFIED"]
    metric_distance: Literal["UNSPECIFIED"] = "UNSPECIFIED"
    physical_standpoint: Literal["NOT_ASSERTED"] = "NOT_ASSERTED"
    physical_safety: Literal["NOT_ASSESSED"] = "NOT_ASSESSED"


class LiveTargetBlueprintV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    required_body_parts: list[Literal["HEAD", "SHOULDERS", "TORSO", "ARMS", "HANDS", "LEGS", "FEET"]] = Field(min_length=1)
    scale_target_concept: Framing
    primary_semantic_anchor: Literal["EYES", "FACE_CENTER", "TORSO_CENTER", "BODY_CENTER"]
    anchor_x: Normalized
    anchor_y: Normalized
    tolerances: TargetTolerances
    secondary_constraints: list[SecondaryConstraint] = Field(min_length=1)
    pose_constraints: list[PoseConstraint] = Field(min_length=1)
    camera_constraints: CameraConstraints


class Feasibility(StrictContract):
    status: Literal["EXECUTABLE", "EXECUTABLE_WITH_WARNINGS", "NOT_EXECUTABLE"]
    assessment_scope: Literal["IMAGE_PLANE_AND_SEMANTIC"] = "IMAGE_PLANE_AND_SEMANTIC"
    evidence_refs: list[str] = Field(min_length=1)
    limitations: list[str] = Field(min_length=1)


class CandidateProvenance(StrictContract):
    provider_mode: Literal["FAKE", "REPLAY", "AI"]
    request_id: str
    evidence_refs: list[str] = Field(min_length=1)


class ShotPlanCandidateV01(StrictContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    candidate_id: str = Field(min_length=1, max_length=160)
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    selection_status: Literal["NOT_SELECTED"] = "NOT_SELECTED"
    photo_concept: str = Field(min_length=1, max_length=240)
    view_ref: str
    framing: Framing
    required_body_parts: list[str] = Field(min_length=1)
    image_plane_placement: ImagePlanePlacement
    pose_plan: list[str] = Field(min_length=1, max_length=12)
    camera_direction: str = Field(min_length=1, max_length=240)
    approximate_camera_height: Literal["EYE_LEVEL", "CHEST_LEVEL", "WAIST_LEVEL", "UNSPECIFIED"]
    lighting_use: str = Field(min_length=1, max_length=320)
    subject_fit: str = Field(min_length=1, max_length=320)
    scene_elements_used: list[str] = Field(min_length=1, max_length=8)
    rationale: str = Field(min_length=1, max_length=500)
    feasibility: Feasibility
    warnings: list[str] = Field(min_length=1, max_length=12)
    live_target_blueprint: LiveTargetBlueprintV01
    provenance: CandidateProvenance

    @model_validator(mode="after")
    def blueprint_matches_candidate(self) -> "ShotPlanCandidateV01":
        blueprint = self.live_target_blueprint
        if self.required_body_parts != blueprint.required_body_parts:
            raise ValueError("BLUEPRINT_BODY_PARTS_MISMATCH")
        if self.framing != blueprint.scale_target_concept:
            raise ValueError("BLUEPRINT_SCALE_TARGET_MISMATCH")
        if (self.image_plane_placement.x, self.image_plane_placement.y) != (blueprint.anchor_x, blueprint.anchor_y):
            raise ValueError("BLUEPRINT_ANCHOR_MISMATCH")
        return self
