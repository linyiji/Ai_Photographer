from __future__ import annotations

import re

from pydantic import ValidationError

from .contracts import PhotographyDirectorInputV01, ShotPlanCandidateV01


FORBIDDEN_CLAIM_PATTERNS = {
    "EXACT_COORDINATE_CLAIM": re.compile(r"\b(?:stand|camera)\s+(?:exactly\s+)?at\s+(?:coordinate|x\s*=|y\s*=)", re.IGNORECASE),
    "PHYSICAL_SAFETY_CLAIM": re.compile(r"\b(?:this\s+(?:place|location)|it)\s+is\s+(?:physically\s+)?safe\b", re.IGNORECASE),
    "WALKABILITY_CLAIM": re.compile(r"\bwalk\s+(?:here|there|to|toward|onto)\b", re.IGNORECASE),
    "METRIC_DISTANCE_CLAIM": re.compile(r"\b(?:exactly\s+)?\d+(?:\.\d+)?\s*(?:m|meter|meters)\s+(?:away|from)\b", re.IGNORECASE),
    "UNSUPPORTED_SUBJECT_INFERENCE": re.compile(r"\b(?:identity|ethnicity|precise age|body type judgment|attractiveness score)\b", re.IGNORECASE),
}


def _all_text(candidate: ShotPlanCandidateV01) -> str:
    return " ".join(
        [candidate.photo_concept, candidate.camera_direction, candidate.lighting_use, candidate.subject_fit, candidate.rationale]
        + candidate.pose_plan
        + candidate.warnings
        + candidate.feasibility.limitations
        + [item.instruction for item in candidate.live_target_blueprint.secondary_constraints]
        + [item.instruction for item in candidate.live_target_blueprint.pose_constraints]
    )


def validate_candidate(raw: dict[str, object], source: PhotographyDirectorInputV01) -> tuple[ShotPlanCandidateV01 | None, list[str]]:
    try:
        candidate = ShotPlanCandidateV01.model_validate(raw)
    except ValidationError as exc:
        return None, [f"CONTRACT:{item['type']}:{'.'.join(map(str, item['loc']))}" for item in exc.errors()]
    errors: list[str] = []
    views = {item.view_ref for item in source.view_candidates}
    anchors = {item.anchor_ref: item.view_ref for item in source.composition_anchor_candidates}
    if candidate.view_ref not in views:
        errors.append("REALITY:UNKNOWN_VIEW_REF")
    anchor_ref = candidate.image_plane_placement.composition_anchor_ref
    if anchor_ref not in anchors:
        errors.append("REALITY:UNKNOWN_COMPOSITION_ANCHOR_REF")
    elif anchors[anchor_ref] != candidate.view_ref:
        errors.append("REALITY:ANCHOR_VIEW_MISMATCH")
    known_elements = set(source.scene_understanding.usable_visual_elements)
    if not set(candidate.scene_elements_used) <= known_elements:
        errors.append("REALITY:UNSUPPORTED_SCENE_ELEMENT")
    text = _all_text(candidate)
    for code, pattern in FORBIDDEN_CLAIM_PATTERNS.items():
        if pattern.search(text):
            errors.append(f"SAFETY:{code}")
    camera = candidate.live_target_blueprint.camera_constraints
    if (camera.metric_distance, camera.physical_standpoint, camera.physical_safety) != ("UNSPECIFIED", "NOT_ASSERTED", "NOT_ASSESSED"):
        errors.append("P3:UNSUPPORTED_CAMERA_AUTHORITY")
    if candidate.disposition != "CANDIDATE" or candidate.selection_status != "NOT_SELECTED":
        errors.append("GOVERNANCE:AUTOMATIC_SELECTION_FORBIDDEN")
    return candidate, sorted(set(errors))


def validate_candidate_set(candidates: list[ShotPlanCandidateV01]) -> list[str]:
    errors: list[str] = []
    if not 2 <= len(candidates) <= 4:
        errors.append("CANDIDATE_SET:COUNT_NOT_APPROXIMATELY_THREE")
    if len({item.candidate_id for item in candidates}) != len(candidates):
        errors.append("CANDIDATE_SET:DUPLICATE_ID")
    diversity_keys = {(item.framing, item.live_target_blueprint.scale_target_concept, item.photo_concept) for item in candidates}
    if len(diversity_keys) < min(3, len(candidates)):
        errors.append("CANDIDATE_SET:INSUFFICIENT_SEMANTIC_DIVERSITY")
    return errors
