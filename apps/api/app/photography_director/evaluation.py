from __future__ import annotations

import json
from pathlib import Path
from statistics import mean
from typing import Any

from .adapters import FakePhotographyDirectorAdapter
from .contracts import PhotographyDirectorInputV01, ShotPlanCandidateV01
from .service import PhotographyDirectorService


DIMENSIONS = [
    "REALITY_FIDELITY",
    "SUBJECT_FIT",
    "SCENE_FIT",
    "LIGHTING_USE",
    "SHOT_DIVERSITY",
    "EXECUTABILITY",
    "LIVE_TARGET_COMPLETENESS",
    "SAFETY",
    "CONTRACT_VALIDITY",
]


class PhotographyDirectorEvaluator:
    """Deterministic contract evaluator. It does not claim model quality evidence."""

    def __init__(self, fixture_path: Path):
        self.fixture_path = fixture_path

    def run(self) -> dict[str, Any]:
        suite = json.loads(self.fixture_path.read_text(encoding="utf-8"))
        rows = [self._evaluate_case(item) for item in suite["cases"]]
        aggregate = {dimension: round(mean(row["scores"][dimension] for row in rows), 2) for dimension in DIMENSIONS}
        matrix_tags = {tag for item in suite["cases"] for tag in item["matrix_tags"]}
        required_matrix = {
            "SCENE_SIMPLE", "SCENE_COMPLEX", "STRONG_SIDE_LIGHT", "FLAT_LIGHT", "BACKLIGHT_RISK",
            "SPATIAL_ABSENT", "SPATIAL_PARTIAL", "SPATIAL_INSUFFICIENT", "SPATIAL_USABLE",
        }
        gates = {
            "all_cases_ready": all(row["director_status"] == "CANDIDATES_READY" for row in rows),
            "exactly_three_candidates": all(row["candidate_count"] == 3 for row in rows),
            "minimum_dimension_score": min(aggregate.values()) >= 4.0,
            "fixture_matrix_coverage": required_matrix <= matrix_tags,
            "external_provider_calls": sum(row["external_provider_calls"] for row in rows) == 0,
            "automatic_selections": sum(row["automatic_selections"] for row in rows) == 0,
            "p3_forbidden_claims": sum(row["p3_forbidden_claims"] for row in rows) == 0,
        }
        return {
            "suite_version": suite["suite_version"],
            "evidence_class": "CONTROLLED_SYNTHETIC_DETERMINISTIC",
            "rating_scale": {"minimum": 0, "maximum": 5},
            "status": "PASS" if all(gates.values()) else "FAIL",
            "gates": gates,
            "aggregate_scores": aggregate,
            "human_review": [
                {"dimension": "SUBJECT_FIT", "status": "PENDING", "question": "Does each plan flatter the supplied visible styling without unsupported subject inference?"},
                {"dimension": "SCENE_FIT", "status": "PENDING", "question": "Does each plan use the accepted scene elements coherently?"},
                {"dimension": "LIGHTING_USE", "status": "PENDING", "question": "Are the lighting choices photographically convincing under the supplied evidence?"},
                {"dimension": "SHOT_DIVERSITY", "status": "PENDING", "question": "Are the three alternatives meaningfully different rather than token variants?"},
            ],
            "limitations": [
                "NO_REAL_SUBJECT_OR_SCENE_QUALITY_EVIDENCE",
                "NO_EXTERNAL_AI_PROVIDER_EXERCISED",
                "SUBJECTIVE_HUMAN_REVIEW_PENDING",
                "P3_AFFORDANCE_NOT_STARTED",
            ],
            "rows": rows,
        }

    @staticmethod
    def _evaluate_case(item: dict[str, Any]) -> dict[str, Any]:
        source = PhotographyDirectorInputV01.model_validate(item["input"])
        result = PhotographyDirectorService(FakePhotographyDirectorAdapter()).propose(item["input"])
        candidates = list(result.candidates)
        view_refs = {view.view_ref for view in source.view_candidates}
        anchor_refs = {anchor.anchor_ref for anchor in source.composition_anchor_candidates}
        subject_tokens = [source.subject_profile.clothing_type, *source.subject_profile.dominant_colors]
        reality_ok = all(
            candidate.view_ref in view_refs
            and candidate.image_plane_placement.composition_anchor_ref in anchor_refs
            and set(candidate.scene_elements_used) <= set(source.scene_understanding.usable_visual_elements)
            for candidate in candidates
        )
        subject_ok = all(all(token in candidate.subject_fit for token in subject_tokens) for candidate in candidates)
        scene_ok = all(candidate.scene_elements_used for candidate in candidates)
        light_word = source.lighting_evidence.lighting_type.lower()
        lighting_ok = all(light_word in candidate.lighting_use.lower() and source.lighting_evidence.evidence_refs[0] in candidate.provenance.evidence_refs for candidate in candidates)
        diversity_ok = len({candidate.framing for candidate in candidates}) == 3 and len({candidate.photo_concept for candidate in candidates}) == 3
        executable_ok = all(candidate.feasibility.status in {"EXECUTABLE", "EXECUTABLE_WITH_WARNINGS"} for candidate in candidates)
        live_complete = all(
            candidate.live_target_blueprint.required_body_parts
            and candidate.live_target_blueprint.secondary_constraints
            and candidate.live_target_blueprint.pose_constraints
            for candidate in candidates
        )
        safety_ok = all(
            candidate.live_target_blueprint.camera_constraints.metric_distance == "UNSPECIFIED"
            and candidate.live_target_blueprint.camera_constraints.physical_standpoint == "NOT_ASSERTED"
            and candidate.live_target_blueprint.camera_constraints.physical_safety == "NOT_ASSESSED"
            for candidate in candidates
        )
        contract_ok = result.status == "CANDIDATES_READY" and len(candidates) == 3 and all(isinstance(candidate, ShotPlanCandidateV01) for candidate in candidates)
        checks = {
            "REALITY_FIDELITY": reality_ok,
            "SUBJECT_FIT": subject_ok,
            "SCENE_FIT": scene_ok,
            "LIGHTING_USE": lighting_ok,
            "SHOT_DIVERSITY": diversity_ok,
            "EXECUTABILITY": executable_ok,
            "LIVE_TARGET_COMPLETENESS": live_complete,
            "SAFETY": safety_ok,
            "CONTRACT_VALIDITY": contract_ok,
        }
        return {
            "case_id": item["case_id"],
            "matrix_tags": item["matrix_tags"],
            "director_status": result.status,
            "spatial_status": result.provenance.get("spatial_level"),
            "candidate_count": len(candidates),
            "candidate_ids": [candidate.candidate_id for candidate in candidates],
            "framings": [candidate.framing.value for candidate in candidates],
            "scores": {dimension: 5 if checks[dimension] else 0 for dimension in DIMENSIONS},
            "external_provider_calls": result.provenance.get("external_provider_calls", 0),
            "automatic_selections": sum(candidate.selection_status != "NOT_SELECTED" for candidate in candidates),
            "p3_forbidden_claims": 0 if safety_ok else 1,
            "warnings": sorted({warning for candidate in candidates for warning in candidate.warnings}),
            "candidates": [candidate.model_dump(mode="json") for candidate in candidates],
        }
