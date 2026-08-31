from __future__ import annotations

from typing import Any

from .multimodal import MultimodalStage


PROMPT_SPECS: dict[MultimodalStage, dict[str, Any]] = {
    MultimodalStage.SUBJECT_UNDERSTANDING: {
        "prompt_id": "xfx-director-subject-understanding-v01",
        "version": "0.1.0",
        "expected_schema": "SubjectProfileCandidateV01",
        "instructions": [
            "Report only visible photography-relevant clothing, color, accessories, styling, silhouette, and pose-feasibility observations.",
            "Separate observed facts from photography inferences and cite observation IDs for every inference.",
            "Do not infer identity, precise age, personality, beauty, health, ethnicity, or unrelated body judgments.",
        ],
    },
    MultimodalStage.SCENE_LIGHTING_UNDERSTANDING: {
        "prompt_id": "xfx-director-scene-lighting-understanding-v01",
        "version": "0.1.0",
        "expected_schema": "SceneLightingUnderstandingOutputV01",
        "instructions": [
            "Use only the supplied scene image, accepted View candidates, composition anchors, and evidence refs.",
            "Return separate SceneUnderstandingCandidateV01 and LightingEvidenceCandidateV01 objects.",
            "Do not assert walkability, physical safety, ground support, metric distance, weather, or time unless directly evidenced.",
        ],
    },
    MultimodalStage.PHOTOGRAPHY_DIRECTION: {
        "prompt_id": "xfx-director-photography-direction-v01",
        "version": "0.1.0",
        "expected_schema": "DirectorCandidateSetOutputV01",
        "instructions": [
            "Use the validated PhotographyDirectorInputV01 and produce approximately three distinct ShotPlanCandidateV01 objects.",
            "Cross-reason about subject styling, scene elements, pose feasibility, negative space, and lighting direction.",
            "Keep every result CANDIDATE and NOT_SELECTED, include LiveTargetBlueprintV01, and make no P3 or physical safety claim.",
        ],
    },
}


def prompt_spec(stage: MultimodalStage) -> dict[str, Any]:
    return {**PROMPT_SPECS[stage], "instructions": list(PROMPT_SPECS[stage]["instructions"])}
