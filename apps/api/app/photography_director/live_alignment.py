from __future__ import annotations

import copy
import re
from dataclasses import dataclass
from enum import StrEnum
from typing import Annotated, Any, Literal, Protocol

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from .contracts import CandidateProvenance, PhotographyDirectorInputV01


Normalized = Annotated[float, Field(ge=0.0, le=1.0)]


class StrictV03Contract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProductFramingProfile(StrEnum):
    HEAD = "HEAD"
    HEAD_SHOULDERS = "HEAD_SHOULDERS"
    UPPER_BODY = "UPPER_BODY"
    THREE_QUARTER = "THREE_QUARTER"
    FULL_BODY = "FULL_BODY"


class TargetZone(StrEnum):
    LEFT_TOP = "LEFT_TOP"
    CENTER_TOP = "CENTER_TOP"
    RIGHT_TOP = "RIGHT_TOP"
    LEFT_CENTER = "LEFT_CENTER"
    CENTER = "CENTER"
    RIGHT_CENTER = "RIGHT_CENTER"
    LEFT_BOTTOM = "LEFT_BOTTOM"
    CENTER_BOTTOM = "CENTER_BOTTOM"
    RIGHT_BOTTOM = "RIGHT_BOTTOM"


class DirectorContextMode(StrEnum):
    STRUCTURED_ONLY = "STRUCTURED_ONLY"
    STRUCTURED_PLUS_IMAGES = "STRUCTURED_PLUS_IMAGES"


class PlacementCapabilityV01(StrictV03Contract):
    model: Literal["TARGET_ZONE"] = "TARGET_ZONE"
    normalized_position_supported: Literal[True] = True
    target_zones: list[TargetZone] = Field(min_length=3)


class AxesCapabilityV01(StrictV03Contract):
    x_relation: Literal[True] = True
    y_relation: Literal[True] = True
    y_subject_action: Literal[False] = False


class PoseCapabilityV01(StrictV03Contract):
    coarse_body_orientation: bool
    detailed_gesture: Literal[False] = False


class LiveCapabilityCatalogV01(StrictV03Contract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    catalog_version: str = Field(min_length=1, max_length=80)
    framing_profiles: list[ProductFramingProfile] = Field(min_length=5, max_length=5)
    placement: PlacementCapabilityV01
    axes: AxesCapabilityV01 = Field(default_factory=AxesCapabilityV01)
    pose: PoseCapabilityV01
    device_admission: Literal["PENDING_05H"] = "PENDING_05H"

    @model_validator(mode="after")
    def product_semantics_are_complete(self) -> "LiveCapabilityCatalogV01":
        if set(self.framing_profiles) != set(ProductFramingProfile):
            raise ValueError("LIVE_CATALOG_FRAMING_PROFILE_SET_INVALID")
        required_zones = {TargetZone.LEFT_TOP, TargetZone.CENTER, TargetZone.RIGHT_BOTTOM}
        if not required_zones <= set(self.placement.target_zones):
            raise ValueError("LIVE_CATALOG_ACCEPTANCE_ZONES_MISSING")
        return self


def live_05g_capability_catalog() -> LiveCapabilityCatalogV01:
    return LiveCapabilityCatalogV01(
        catalog_version="live-v4-05g-director-v01",
        framing_profiles=list(ProductFramingProfile),
        placement=PlacementCapabilityV01(target_zones=list(TargetZone)),
        pose=PoseCapabilityV01(coarse_body_orientation=False),
    )


class DirectorVisualRefV01(StrictV03Contract):
    asset_ref: str = Field(min_length=1, max_length=240)
    role: Literal["SUBJECT_REFERENCE", "SCENE_VIEW"]
    provider_send_authorized: Literal[True]


class PhotographyDirectorInputV02(StrictV03Contract):
    """V01 validated context plus explicit Live 05G product capability and media mode."""

    schema_version: Literal["0.2.0"] = "0.2.0"
    accepted_context_v01: PhotographyDirectorInputV01
    live_capability_catalog: LiveCapabilityCatalogV01
    context_mode: DirectorContextMode
    optional_visual_refs: list[DirectorVisualRefV01] = Field(default_factory=list, max_length=4)

    @model_validator(mode="after")
    def media_budget_matches_mode(self) -> "PhotographyDirectorInputV02":
        if self.context_mode == DirectorContextMode.STRUCTURED_ONLY and self.optional_visual_refs:
            raise ValueError("DIRECTOR_STRUCTURED_ONLY_HAS_IMAGES")
        subjects = sum(item.role == "SUBJECT_REFERENCE" for item in self.optional_visual_refs)
        scenes = sum(item.role == "SCENE_VIEW" for item in self.optional_visual_refs)
        if self.context_mode == DirectorContextMode.STRUCTURED_PLUS_IMAGES and not (subjects <= 1 and 1 <= scenes <= 3):
            raise ValueError("DIRECTOR_IMAGE_CONTEXT_BUDGET_INVALID")
        return self


class NormalizedPositionV01(StrictV03Contract):
    x: Normalized
    y: Normalized


class SubjectPlacementV02(StrictV03Contract):
    model: Literal["TARGET_ZONE", "NORMALIZED_POSITION"]
    zone: TargetZone | None = None
    normalized_position: NormalizedPositionV01 | None = None
    composition_anchor_ref: str | None = Field(default=None, max_length=160)
    description: str = Field(min_length=1, max_length=160)

    @model_validator(mode="after")
    def exactly_one_representation(self) -> "SubjectPlacementV02":
        if self.model == "TARGET_ZONE" and (self.zone is None or self.normalized_position is not None):
            raise ValueError("TARGET_ZONE_PLACEMENT_INVALID")
        if self.model == "NORMALIZED_POSITION" and (self.normalized_position is None or self.zone is not None):
            raise ValueError("NORMALIZED_PLACEMENT_INVALID")
        return self


class PoseRequirementV02(StrictV03Contract):
    body_area: Literal["HEAD", "SHOULDERS", "BODY_ORIENTATION", "GAZE", "ARMS", "HANDS", "LEGS", "FEET"]
    instruction: str = Field(min_length=1, max_length=200)
    capability: Literal["COARSE_BODY_ORIENTATION", "DETAILED_GESTURE"]
    execution: Literal["REQUIRED_EXECUTABLE", "OPTIONAL_SUGGESTION"]

    @model_validator(mode="after")
    def unsupported_gesture_cannot_block(self) -> "PoseRequirementV02":
        if self.capability == "DETAILED_GESTURE" and self.execution != "OPTIONAL_SUGGESTION":
            raise ValueError("UNSUPPORTED_DETAILED_GESTURE_REQUIREMENT")
        return self


class CameraRelationshipV02(StrictV03Contract):
    direction: str = Field(min_length=1, max_length=200)
    approximate_height: Literal["EYE_LEVEL", "CHEST_LEVEL", "WAIST_LEVEL", "UNSPECIFIED"]
    metric_distance: Literal["UNSPECIFIED"] = "UNSPECIFIED"
    physical_standpoint: Literal["NOT_ASSERTED"] = "NOT_ASSERTED"
    physical_safety: Literal["NOT_ASSESSED"] = "NOT_ASSESSED"


class LiveTargetBlueprintV02(StrictV03Contract):
    schema_version: Literal["0.2.0"] = "0.2.0"
    framing_profile: ProductFramingProfile
    subject_placement: SubjectPlacementV02
    pose_constraints: list[PoseRequirementV02] = Field(min_length=1, max_length=8)
    camera_constraints: CameraRelationshipV02


class ShotPlanCandidateV02(StrictV03Contract):
    schema_version: Literal["0.2.0"] = "0.2.0"
    candidate_id: str = Field(min_length=1, max_length=160)
    disposition: Literal["CANDIDATE"] = "CANDIDATE"
    selection_status: Literal["NOT_SELECTED"] = "NOT_SELECTED"
    concept: str = Field(min_length=1, max_length=180)
    view_ref: str = Field(min_length=1, max_length=160)
    framing_profile: ProductFramingProfile
    subject_placement: SubjectPlacementV02
    pose_requirements: list[PoseRequirementV02] = Field(min_length=1, max_length=8)
    camera_relationship: CameraRelationshipV02
    lighting_use: str = Field(min_length=1, max_length=240)
    subject_scene_fit: str = Field(min_length=1, max_length=280)
    scene_elements_used: list[str] = Field(min_length=1, max_length=8)
    short_rationale: str = Field(min_length=1, max_length=320)
    warnings: list[str] = Field(default_factory=list, max_length=12)
    live_target_blueprint: LiveTargetBlueprintV02
    provenance: CandidateProvenance

    @model_validator(mode="after")
    def blueprint_matches_plan(self) -> "ShotPlanCandidateV02":
        blueprint = self.live_target_blueprint
        if blueprint.framing_profile != self.framing_profile:
            raise ValueError("BLUEPRINT_FRAMING_PROFILE_MISMATCH")
        if blueprint.subject_placement != self.subject_placement:
            raise ValueError("BLUEPRINT_PLACEMENT_MISMATCH")
        if blueprint.pose_constraints != self.pose_requirements:
            raise ValueError("BLUEPRINT_POSE_REQUIREMENTS_MISMATCH")
        if blueprint.camera_constraints != self.camera_relationship:
            raise ValueError("BLUEPRINT_CAMERA_RELATIONSHIP_MISMATCH")
        return self

    def card_projection(self) -> dict[str, str]:
        return {
            "concept": self.concept,
            "framing_label": self.framing_profile.value,
            "view_ref": self.view_ref,
            "subject_placement": self.subject_placement.description,
            "pose_instruction": self.pose_requirements[0].instruction,
            "short_rationale": self.short_rationale,
        }


class DirectorCandidateSetOutputV02(StrictV03Contract):
    schema_version: Literal["0.2.0"] = "0.2.0"
    candidates: list[dict[str, Any]] = Field(min_length=1, max_length=4)


PRIVATE_LIVE_PATTERNS = re.compile(
    r"MediaPipe|landmark\s*(?:ID|index)|HEAD_TO_HIP|SHOULDER_CENTER|HEAD_CORE|One Euro|READY threshold|response gate|hysteresis|crop classifier|physical direction mapper",
    re.IGNORECASE,
)
P3_PATTERNS = re.compile(
    r"\b(?:safe stand|physically safe|walkable|stand exactly|\d+(?:\.\d+)?\s*(?:m|meters?)\s+(?:away|from))\b",
    re.IGNORECASE,
)


def _accepted_evidence(source: PhotographyDirectorInputV02) -> set[str]:
    context = source.accepted_context_v01
    refs = set(context.subject_profile.evidence_refs + context.scene_understanding.evidence_refs + context.lighting_evidence.evidence_refs)
    for view in context.view_candidates:
        refs.update(view.evidence_refs)
    if context.spatial_evidence_optional:
        refs.update(context.spatial_evidence_optional.evidence_refs)
    return refs


def validate_v03_candidate(raw: dict[str, Any], source: PhotographyDirectorInputV02) -> tuple[ShotPlanCandidateV02 | None, list[str]]:
    try:
        candidate = ShotPlanCandidateV02.model_validate(raw)
    except ValidationError as exc:
        errors = []
        for item in exc.errors():
            detail = str(item.get("ctx", {}).get("error", ""))
            errors.append(f"CONTRACT:{item['type']}:{'.'.join(map(str, item['loc']))}:{detail}")
        return None, errors
    errors: list[str] = []
    context = source.accepted_context_v01
    catalog = source.live_capability_catalog
    if candidate.view_ref not in {item.view_ref for item in context.view_candidates}:
        errors.append("REALITY:UNKNOWN_VIEW_REF")
    if not set(candidate.scene_elements_used) <= set(context.scene_understanding.usable_visual_elements):
        errors.append("REALITY:UNSUPPORTED_SCENE_ELEMENT")
    if not set(candidate.provenance.evidence_refs) <= _accepted_evidence(source):
        errors.append("REALITY:UNKNOWN_EVIDENCE_REF")
    if candidate.framing_profile not in catalog.framing_profiles:
        errors.append("LIVE:UNSUPPORTED_FRAMING_PROFILE")
    placement = candidate.subject_placement
    if placement.model == "TARGET_ZONE" and placement.zone not in catalog.placement.target_zones:
        errors.append("LIVE:UNKNOWN_TARGET_ZONE")
    if placement.model == "NORMALIZED_POSITION" and not catalog.placement.normalized_position_supported:
        errors.append("LIVE:NORMALIZED_PLACEMENT_UNSUPPORTED")
    if placement.composition_anchor_ref:
        anchors = {item.anchor_ref: item.view_ref for item in context.composition_anchor_candidates}
        if placement.composition_anchor_ref not in anchors:
            errors.append("REALITY:UNKNOWN_COMPOSITION_ANCHOR_REF")
        elif anchors[placement.composition_anchor_ref] != candidate.view_ref:
            errors.append("REALITY:ANCHOR_VIEW_MISMATCH")
    if any(item.capability == "DETAILED_GESTURE" and item.execution == "REQUIRED_EXECUTABLE" for item in candidate.pose_requirements):
        errors.append("LIVE:UNSUPPORTED_DETAILED_GESTURE_REQUIREMENT")
    if any(item.capability == "COARSE_BODY_ORIENTATION" and item.execution == "REQUIRED_EXECUTABLE" for item in candidate.pose_requirements) and not catalog.pose.coarse_body_orientation:
        errors.append("LIVE:COARSE_BODY_ORIENTATION_UNSUPPORTED")
    all_text = " ".join(
        [candidate.concept, candidate.camera_relationship.direction, candidate.lighting_use, candidate.subject_scene_fit, candidate.short_rationale]
        + [item.instruction for item in candidate.pose_requirements]
        + candidate.warnings
    )
    if PRIVATE_LIVE_PATTERNS.search(all_text):
        errors.append("LIVE:PRIVATE_MEASUREMENT_IMPLEMENTATION_LEAK")
    if P3_PATTERNS.search(all_text):
        errors.append("P3:UNSUPPORTED_PHYSICAL_AUTHORITY")
    subject_terms = [context.subject_profile.clothing_type.lower(), *[item.lower() for item in context.subject_profile.dominant_colors]]
    reasoning = f"{candidate.subject_scene_fit} {candidate.short_rationale}".lower()
    if not any(term in reasoning for term in subject_terms) or not any(item.lower() in reasoning for item in candidate.scene_elements_used):
        errors.append("DIRECTOR:SUBJECT_SCENE_CROSS_REASONING_INVALID")
    light_terms = [context.lighting_evidence.lighting_type.lower(), context.lighting_evidence.direction.lower()]
    if not any(term in candidate.lighting_use.lower() for term in light_terms):
        errors.append("DIRECTOR:LIGHTING_REASONING_INVALID")
    return candidate, sorted(set(errors))


def validate_v03_candidate_set(candidates: list[ShotPlanCandidateV02]) -> list[str]:
    errors: list[str] = []
    if len(candidates) != 3:
        errors.append("CANDIDATE_SET:COUNT_NOT_THREE")
    if len({item.candidate_id for item in candidates}) != len(candidates):
        errors.append("CANDIDATE_SET:DUPLICATE_ID")
    dimensions = [
        len({item.view_ref for item in candidates}),
        len({item.framing_profile for item in candidates}),
        len({(item.subject_placement.model, item.subject_placement.zone, str(item.subject_placement.normalized_position)) for item in candidates}),
        len({tuple(item.scene_elements_used) for item in candidates}),
        len({item.lighting_use for item in candidates}),
    ]
    if sum(value > 1 for value in dimensions) < 2:
        errors.append("CANDIDATE_SET:INSUFFICIENT_MEANINGFUL_DIVERSITY")
    return errors


class PhotographyDirectorV03Port(Protocol):
    mode: str

    def propose(self, source: PhotographyDirectorInputV02) -> list[dict[str, Any]]: ...


@dataclass(frozen=True)
class DirectorV03Result:
    request_id: str
    status: str
    candidates: tuple[ShotPlanCandidateV02, ...]
    rejected: tuple[dict[str, Any], ...]
    provider_mode: str
    error: dict[str, Any] | None = None


class PhotographyDirectorV03Service:
    def __init__(self, adapter: PhotographyDirectorV03Port):
        self.adapter = adapter

    def propose(self, raw_input: dict[str, Any]) -> DirectorV03Result:
        request_id = str(raw_input.get("accepted_context_v01", {}).get("request_id", "UNKNOWN"))
        try:
            source = PhotographyDirectorInputV02.model_validate(raw_input)
        except ValidationError as exc:
            return DirectorV03Result(request_id, "INVALID_INPUT", (), (), self.adapter.mode, {"code": "DIRECTOR_V03_INPUT_INVALID", "details": exc.errors(include_url=False)})
        try:
            raw_candidates = self.adapter.propose(source)
        except Exception as exc:
            return DirectorV03Result(request_id, "FAILED", (), (), self.adapter.mode, {"code": type(exc).__name__.upper(), "message": str(exc)})
        accepted: list[ShotPlanCandidateV02] = []
        rejected: list[dict[str, Any]] = []
        for index, raw in enumerate(raw_candidates):
            candidate, errors = validate_v03_candidate(raw, source)
            if candidate is None or errors:
                rejected.append({"index": index, "candidate_id": raw.get("candidate_id"), "errors": errors})
            else:
                accepted.append(candidate)
        set_errors = validate_v03_candidate_set(accepted)
        if set_errors:
            rejected.append({"index": "SET", "candidate_id": None, "errors": set_errors})
        if rejected:
            return DirectorV03Result(request_id, "VALIDATION_FAILED", (), tuple(rejected), self.adapter.mode, {"code": "DIRECTOR_V03_CANDIDATE_VALIDATION_FAILED"})
        return DirectorV03Result(request_id, "CANDIDATES_READY", tuple(accepted), (), self.adapter.mode)


PROFILE_CONCEPTS = {
    ProductFramingProfile.HEAD: "Close head portrait with concentrated expression",
    ProductFramingProfile.HEAD_SHOULDERS: "Head-and-shoulders portrait with restrained context",
    ProductFramingProfile.UPPER_BODY: "Head-to-hip upper-body portrait",
    ProductFramingProfile.THREE_QUARTER: "Knee-up environmental portrait",
    ProductFramingProfile.FULL_BODY: "Full-body portrait connected to the place",
}
PROFILE_HEIGHT = {
    ProductFramingProfile.HEAD: "EYE_LEVEL",
    ProductFramingProfile.HEAD_SHOULDERS: "EYE_LEVEL",
    ProductFramingProfile.UPPER_BODY: "CHEST_LEVEL",
    ProductFramingProfile.THREE_QUARTER: "CHEST_LEVEL",
    ProductFramingProfile.FULL_BODY: "WAIST_LEVEL",
}


class FakePhotographyDirectorV03Adapter:
    """Deterministic product-semantics fake; no provider or Live runtime calls."""

    mode = "FAKE"

    def propose(self, source: PhotographyDirectorInputV02) -> list[dict[str, Any]]:
        context = source.accepted_context_v01
        preferred = {
            "ENVIRONMENTAL_FULL_BODY": ProductFramingProfile.FULL_BODY,
            "THREE_QUARTER_LIFESTYLE": ProductFramingProfile.THREE_QUARTER,
            "CLOSE_EMOTIONAL_PORTRAIT": ProductFramingProfile.HEAD_SHOULDERS,
        }.get(context.user_intent.preferred_framing.value if context.user_intent.preferred_framing else "")
        profiles = [preferred, ProductFramingProfile.THREE_QUARTER, ProductFramingProfile.HEAD_SHOULDERS, ProductFramingProfile.UPPER_BODY, ProductFramingProfile.FULL_BODY]
        selected: list[ProductFramingProfile] = []
        for profile in profiles:
            if profile and profile not in selected:
                selected.append(profile)
            if len(selected) == 3:
                break
        zones = [TargetZone.LEFT_TOP, TargetZone.CENTER, TargetZone.RIGHT_BOTTOM]
        return [self._candidate(source, profile, zones[index], index) for index, profile in enumerate(selected)]

    def _candidate(self, source: PhotographyDirectorInputV02, profile: ProductFramingProfile, zone: TargetZone, index: int) -> dict[str, Any]:
        context = source.accepted_context_v01
        view = context.view_candidates[index % len(context.view_candidates)]
        anchor = next(item for item in context.composition_anchor_candidates if item.view_ref == view.view_ref)
        element = view.usable_elements[index % len(view.usable_elements)]
        placement = {
            "model": "TARGET_ZONE", "zone": zone.value, "normalized_position": None,
            "composition_anchor_ref": anchor.anchor_ref, "description": f"Place the subject in {zone.value.lower().replace('_', ' ')}",
        }
        pose = [{
            "body_area": "BODY_ORIENTATION", "instruction": "Use a slight body turn relative to camera",
            "capability": "COARSE_BODY_ORIENTATION", "execution": "OPTIONAL_SUGGESTION",
        }]
        camera = {
            "direction": f"Use the accepted {view.view_ref} relationship without asserting a physical stand point",
            "approximate_height": PROFILE_HEIGHT[profile], "metric_distance": "UNSPECIFIED",
            "physical_standpoint": "NOT_ASSERTED", "physical_safety": "NOT_ASSESSED",
        }
        evidence = list(dict.fromkeys([
            *context.subject_profile.evidence_refs, *context.scene_understanding.evidence_refs,
            *context.lighting_evidence.evidence_refs, *view.evidence_refs,
            *((context.spatial_evidence_optional.evidence_refs if context.spatial_evidence_optional else [])),
        ]))
        clothing = context.subject_profile.clothing_type
        color = context.subject_profile.dominant_colors[0]
        light = context.lighting_evidence
        warnings = ["PHYSICAL_SAFETY_NOT_ASSESSED", "METRIC_DISTANCE_UNSPECIFIED"]
        if context.spatial_evidence_optional is None:
            warnings.append("SPATIAL_EVIDENCE_ABSENT_LEVEL1")
        elif context.spatial_evidence_optional.status in {"PARTIAL", "INSUFFICIENT"}:
            warnings.append(f"SPATIAL_EVIDENCE_{context.spatial_evidence_optional.status.value}")
        return {
            "schema_version": "0.2.0", "candidate_id": f"{context.request_id}-v03-{index + 1}",
            "disposition": "CANDIDATE", "selection_status": "NOT_SELECTED", "concept": PROFILE_CONCEPTS[profile],
            "view_ref": view.view_ref, "framing_profile": profile.value, "subject_placement": placement,
            "pose_requirements": pose, "camera_relationship": camera,
            "lighting_use": f"Use the validated {light.lighting_type.lower()} light from {light.direction}; retain bounded exposure warnings.",
            "subject_scene_fit": f"The {clothing} in {color} is composed with {element} as one subject-scene relationship.",
            "scene_elements_used": [element],
            "short_rationale": f"The {clothing} and {element} support the requested {context.user_intent.mood} mood with an explicit {profile.value} frame.",
            "warnings": warnings,
            "live_target_blueprint": {
                "schema_version": "0.2.0", "framing_profile": profile.value, "subject_placement": placement,
                "pose_constraints": pose, "camera_constraints": camera,
            },
            "provenance": {"provider_mode": "FAKE", "request_id": context.request_id, "evidence_refs": evidence},
        }


class ReplayPhotographyDirectorV03Adapter:
    mode = "REPLAY"

    def __init__(self, recordings: dict[str, list[dict[str, Any]]]):
        self.recordings = copy.deepcopy(recordings)

    def propose(self, source: PhotographyDirectorInputV02) -> list[dict[str, Any]]:
        request_id = source.accepted_context_v01.request_id
        if request_id not in self.recordings:
            raise LookupError("DIRECTOR_V03_REPLAY_NOT_FOUND")
        result = copy.deepcopy(self.recordings[request_id])
        for candidate in result:
            candidate["provenance"]["provider_mode"] = "REPLAY"
        return result


def build_v03_input(
    accepted_context_v01: PhotographyDirectorInputV01,
    *,
    context_mode: DirectorContextMode = DirectorContextMode.STRUCTURED_ONLY,
    optional_visual_refs: list[DirectorVisualRefV01] | None = None,
    catalog: LiveCapabilityCatalogV01 | None = None,
) -> PhotographyDirectorInputV02:
    return PhotographyDirectorInputV02(
        accepted_context_v01=accepted_context_v01,
        live_capability_catalog=catalog or live_05g_capability_catalog(),
        context_mode=context_mode,
        optional_visual_refs=optional_visual_refs or [],
    )
