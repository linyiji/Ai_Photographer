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


PROMPT_SPECS_V03: dict[MultimodalStage, dict[str, Any]] = {
    **{stage: {**spec, "instructions": list(spec["instructions"])} for stage, spec in PROMPT_SPECS.items()},
    MultimodalStage.PHOTOGRAPHY_DIRECTION: {
        "prompt_id": "xfx-director-photography-direction-v02-live-05g",
        "version": "0.2.0",
        "expected_schema": "DirectorCandidateSetOutputV02",
        "instructions": [
            "Use only validated PhotographyDirectorInputV02 context and create exactly three meaningfully distinct ShotPlanCandidateV02 objects.",
            "Choose one explicit supported framing_profile: HEAD, HEAD_SHOULDERS, UPPER_BODY, THREE_QUARTER, or FULL_BODY.",
            "HEAD_SHOULDERS means head plus shoulders and does not require hips; UPPER_BODY is the head-to-hip product profile.",
            "Express placement through a supported TARGET_ZONE or bounded normalized position and preserve accepted View and scene-element refs.",
            "Use subject, scene, and lighting evidence together; generic input-independent photography prose is invalid.",
            "Detailed hand gesture may be an optional suggestion only and must never be a required executable constraint.",
            "Describe what to shoot; never expose landmarks, reducers, crop classifiers, smoothing, thresholds, timing, hysteresis, or direction-mapper internals.",
            "Keep every result CANDIDATE and NOT_SELECTED and make no P3, metric distance, physical standpoint, or safety claim.",
        ],
    },
}


def prompt_spec(stage: MultimodalStage) -> dict[str, Any]:
    return {**PROMPT_SPECS[stage], "instructions": list(PROMPT_SPECS[stage]["instructions"])}


def prompt_spec_v03(stage: MultimodalStage) -> dict[str, Any]:
    return {**PROMPT_SPECS_V03[stage], "instructions": list(PROMPT_SPECS_V03[stage]["instructions"])}
