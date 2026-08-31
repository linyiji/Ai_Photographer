from __future__ import annotations

import copy
from typing import Any

from .contracts import Framing, PhotographyDirectorInputV01
from .port import PhotographyDirectorProviderMode


BODY_PARTS = {
    Framing.ENVIRONMENTAL_FULL_BODY: ["HEAD", "SHOULDERS", "TORSO", "ARMS", "HANDS", "LEGS", "FEET"],
    Framing.THREE_QUARTER_LIFESTYLE: ["HEAD", "SHOULDERS", "TORSO", "ARMS", "HANDS", "LEGS"],
    Framing.CLOSE_EMOTIONAL_PORTRAIT: ["HEAD", "SHOULDERS"],
}
ANCHORS = {
    Framing.ENVIRONMENTAL_FULL_BODY: ("BODY_CENTER", 0.42, 0.54, "CHEST_LEVEL"),
    Framing.THREE_QUARTER_LIFESTYLE: ("TORSO_CENTER", 0.58, 0.52, "CHEST_LEVEL"),
    Framing.CLOSE_EMOTIONAL_PORTRAIT: ("EYES", 0.50, 0.42, "EYE_LEVEL"),
}
CONCEPTS = {
    Framing.ENVIRONMENTAL_FULL_BODY: "Environmental full-body portrait showing subject and place",
    Framing.THREE_QUARTER_LIFESTYLE: "Three-quarter lifestyle portrait with an active scene relationship",
    Framing.CLOSE_EMOTIONAL_PORTRAIT: "Closer emotional portrait with restrained background context",
}


class FakePhotographyDirectorAdapter:
    """Deterministic fixture adapter; it makes no external provider calls."""

    mode = PhotographyDirectorProviderMode.FAKE

    def propose(self, input_contract: PhotographyDirectorInputV01) -> list[dict[str, object]]:
        views = input_contract.view_candidates
        anchors_by_view: dict[str, list[Any]] = {}
        for anchor in input_contract.composition_anchor_candidates:
            anchors_by_view.setdefault(anchor.view_ref, []).append(anchor)
        order = [
            Framing.ENVIRONMENTAL_FULL_BODY,
            Framing.THREE_QUARTER_LIFESTYLE,
            Framing.CLOSE_EMOTIONAL_PORTRAIT,
        ]
        preferred = input_contract.user_intent.preferred_framing
        if preferred in order:
            order = [preferred, *[item for item in order if item != preferred]]
        return [self._candidate(input_contract, framing, index, views[index % len(views)], anchors_by_view) for index, framing in enumerate(order)]

    def _candidate(self, source: PhotographyDirectorInputV01, framing: Framing, index: int, view: Any, anchors_by_view: dict[str, list[Any]]) -> dict[str, object]:
        anchors = anchors_by_view[view.view_ref]
        composition_anchor = anchors[index % len(anchors)]
        semantic_anchor, x, y, height = ANCHORS[framing]
        spatial = source.spatial_evidence_optional
        lighting = source.lighting_evidence
        warnings = ["PHYSICAL_SAFETY_NOT_ASSESSED", "PHYSICAL_STANDPOINT_NOT_ASSERTED", "METRIC_DISTANCE_UNSPECIFIED"]
        if spatial is None:
            warnings.append("SPATIAL_EVIDENCE_ABSENT_LEVEL1_VIEW_ONLY")
        elif spatial.status == "INSUFFICIENT":
            warnings.append("SPATIAL_EVIDENCE_INSUFFICIENT_VIEW_PATH_RETAINED")
        elif spatial.status == "PARTIAL":
            warnings.append("SPATIAL_EVIDENCE_PARTIAL_NON_METRIC")
        if lighting.lighting_type == "BACKLIGHT" or lighting.risks:
            warnings.append("LIGHTING_RISK_REQUIRES_LIVE_VERIFICATION")
        feasibility_status = "EXECUTABLE_WITH_WARNINGS" if warnings else "EXECUTABLE"
        scene_element = view.usable_elements[index % len(view.usable_elements)]
        all_evidence = list(dict.fromkeys([
            *source.subject_profile.evidence_refs,
            *source.scene_understanding.evidence_refs,
            *view.evidence_refs,
            *source.lighting_evidence.evidence_refs,
            *((spatial.evidence_refs if spatial else [])),
        ]))
        poses = self._pose_plan(framing, source.subject_profile.pose_feasibility_considerations)
        secondary = self._secondary_constraints(framing, scene_element, source.scene_understanding.background_complexity)
        pose_constraints = [{"body_area": area, "instruction": instruction} for area, instruction in self._pose_constraints(framing)]
        lighting_use = self._lighting_use(lighting.lighting_type, lighting.direction)
        return {
            "schema_version": "0.1.0",
            "candidate_id": f"{source.request_id}-candidate-{index + 1}",
            "disposition": "CANDIDATE",
            "selection_status": "NOT_SELECTED",
            "photo_concept": CONCEPTS[framing],
            "view_ref": view.view_ref,
            "framing": framing.value,
            "required_body_parts": BODY_PARTS[framing],
            "image_plane_placement": {"composition_anchor_ref": composition_anchor.anchor_ref, "subject_anchor": semantic_anchor, "x": x, "y": y},
            "pose_plan": poses,
            "camera_direction": f"Use {view.view_ref}; align the frame with {scene_element} while preserving the described view relationship.",
            "approximate_camera_height": height,
            "lighting_use": lighting_use,
            "subject_fit": f"The {source.subject_profile.clothing_type} and dominant {', '.join(source.subject_profile.dominant_colors)} palette remain visible; pose constraints use only supplied feasibility evidence.",
            "scene_elements_used": [scene_element],
            "rationale": f"Supports a {source.user_intent.mood} result and the priority {source.user_intent.priorities[0]} through a {framing.value.lower().replace('_', ' ')} alternative grounded in {view.view_ref}.",
            "feasibility": {"status": feasibility_status, "assessment_scope": "IMAGE_PLANE_AND_SEMANTIC", "evidence_refs": all_evidence, "limitations": warnings},
            "warnings": warnings,
            "live_target_blueprint": {
                "schema_version": "0.1.0",
                "required_body_parts": BODY_PARTS[framing],
                "scale_target_concept": framing.value,
                "primary_semantic_anchor": semantic_anchor,
                "anchor_x": x,
                "anchor_y": y,
                "tolerances": {"anchor_x": 0.08, "anchor_y": 0.08, "scale": 0.12},
                "secondary_constraints": secondary,
                "pose_constraints": pose_constraints,
                "camera_constraints": {"direction": f"Face toward the subject from the accepted {view.view_ref} view relationship.", "approximate_height": height, "metric_distance": "UNSPECIFIED", "physical_standpoint": "NOT_ASSERTED", "physical_safety": "NOT_ASSESSED"},
            },
            "provenance": {"provider_mode": self.mode.value, "request_id": source.request_id, "evidence_refs": all_evidence},
        }

    @staticmethod
    def _pose_plan(framing: Framing, considerations: list[str]) -> list[str]:
        base = {
            Framing.ENVIRONMENTAL_FULL_BODY: ["Use a stable relaxed stance", "Keep hands visibly separated from the torso where comfortable"],
            Framing.THREE_QUARTER_LIFESTYLE: ["Turn shoulders slightly relative to camera", "Use a small natural hand action"],
            Framing.CLOSE_EMOTIONAL_PORTRAIT: ["Keep shoulders relaxed", "Direct gaze near the lens or toward the key light"],
        }[framing]
        return [*base, *[f"Respect supplied feasibility note: {item}" for item in considerations[:2]]]

    @staticmethod
    def _pose_constraints(framing: Framing) -> list[tuple[str, str]]:
        if framing == Framing.ENVIRONMENTAL_FULL_BODY:
            return [("FEET", "Keep both feet visible within frame"), ("HANDS", "Keep required hands visible and clear of major occlusion")]
        if framing == Framing.THREE_QUARTER_LIFESTYLE:
            return [("TORSO", "Maintain the slight shoulder turn"), ("HANDS", "Preserve the planned natural hand action")]
        return [("HEAD", "Keep face orientation consistent with the light plan"), ("GAZE", "Hold the planned gaze direction")]

    @staticmethod
    def _secondary_constraints(framing: Framing, scene_element: str, complexity: str) -> list[dict[str, str]]:
        constraints = [
            {"constraint_type": "BACKGROUND_RELATIONSHIP", "instruction": f"Preserve a visible relationship to {scene_element}"},
            {"constraint_type": "HEADROOM", "instruction": "Keep bounded headroom without cropping required body parts"},
        ]
        if complexity == "COMPLEX":
            constraints.append({"constraint_type": "OCCLUSION", "instruction": "Keep face and required body parts clear of complex background edges"})
        if framing == Framing.ENVIRONMENTAL_FULL_BODY:
            constraints.append({"constraint_type": "BODY_VISIBILITY", "instruction": "Retain head through feet in frame"})
        return constraints

    @staticmethod
    def _lighting_use(lighting_type: str, direction: str) -> str:
        return {
            "SIDE": f"Use the supplied side light from {direction} to shape the face and clothing; verify shadow detail.",
            "FLAT": f"Use the supplied flat light from {direction} for even subject visibility; create depth through scene layering.",
            "BACKLIGHT": f"Use the supplied backlight from {direction} as separation while Live verifies face exposure and flare.",
            "MIXED": f"Use the supplied mixed light from {direction} selectively; verify color and exposure consistency in Live.",
        }[lighting_type]


class ReplayPhotographyDirectorAdapter:
    mode = PhotographyDirectorProviderMode.REPLAY

    def __init__(self, recordings: dict[str, list[dict[str, Any]]]):
        self._recordings = copy.deepcopy(recordings)

    def propose(self, input_contract: PhotographyDirectorInputV01) -> list[dict[str, object]]:
        if input_contract.request_id not in self._recordings:
            raise LookupError("DIRECTOR_REPLAY_NOT_FOUND")
        result = copy.deepcopy(self._recordings[input_contract.request_id])
        for candidate in result:
            candidate["provenance"]["provider_mode"] = self.mode.value
        return result
