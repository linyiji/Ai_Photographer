from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

from app.photography_director.adapters import FakePhotographyDirectorAdapter
from app.photography_director.contracts import PhotographyDirectorInputV01
from app.photography_director.multimodal import (
    MultimodalProviderResponse,
    MultimodalStage,
    MultimodalStageGateway,
    ProviderCallError,
    ProviderGateConfig,
    ProviderImageInput,
    ReplayMultimodalTransport,
)
from app.photography_director.pipeline import PrecaptureIntelligencePipeline
from app.photography_director.prompts import PROMPT_SPECS
from app.photography_director.understanding import (
    DirectorAssemblyContextV02,
    LightingEvidenceCandidateV01,
    SceneLightingUnderstandingOutputV01,
    SceneUnderstandingCandidateV01,
    SubjectProfileCandidateV01,
    assemble_director_input,
)


ROOT = Path(__file__).resolve().parents[3]
V01_CASE = json.loads((ROOT / "packages" / "photography-director-fixtures" / "cases.json").read_text(encoding="utf-8"))["cases"][0]["input"]
ERROR_SCHEMA = json.loads((ROOT / "packages" / "contracts" / "schemas" / "ErrorContract.schema.json").read_text(encoding="utf-8"))


def config() -> ProviderGateConfig:
    return ProviderGateConfig(
        provider_id="CONTROLLED_TEST_TRANSPORT", model_id="multimodal-test", model_version="0",
        secret_env_reference="TEST_ONLY", credential_present=True, supported_stages=list(MultimodalStage), timeout_seconds=10,
    )


def context() -> DirectorAssemblyContextV02:
    return DirectorAssemblyContextV02.model_validate({
        "request_id": V01_CASE["request_id"], "subject_reference": V01_CASE["subject_reference"],
        "view_candidates": V01_CASE["view_candidates"], "composition_anchor_candidates": V01_CASE["composition_anchor_candidates"],
        "spatial_evidence_optional": V01_CASE["spatial_evidence_optional"], "user_intent": V01_CASE["user_intent"],
        "reference_image_optional": V01_CASE["reference_image_optional"],
    })


def image(asset_ref: str) -> ProviderImageInput:
    value = f"controlled-{asset_ref}".encode()
    return ProviderImageInput(asset_ref=asset_ref, mime_type="image/png", sha256=hashlib.sha256(value).hexdigest(), provider_send_authorized=True, image_bytes=value)


def subject_output() -> dict:
    return {
        "schema_version": "0.1.0", "candidate_id": "subject-candidate-01", "disposition": "CANDIDATE", "confidence": 0.9,
        "observed": {
            "observation_ids": ["subject-obs-clothing", "subject-obs-color", "subject-obs-pose"],
            "clothing_categories": ["long red coat"], "dominant_colors": ["deep red"], "secondary_colors": ["black"],
            "color_relationship": "deep red outer layer with black accents", "visible_accessories": ["small black bag"],
            "visible_styling": ["clean silhouette"], "silhouette_observations": ["long vertical outer layer"],
            "pose_feasibility_observations": ["avoid wide arm extension"], "evidence_refs": ["subject-image"],
        },
        "photography_inferences": [{"inference_id": "subject-inf-01", "claim": "saturated red may separate from a muted background", "based_on_observation_ids": ["subject-obs-color"], "confidence": 0.8}],
    }


def scene_lighting_output() -> dict:
    return {
        "schema_version": "0.1.0",
        "scene_understanding_candidate": {
            "schema_version": "0.1.0", "candidate_id": "scene-candidate-01", "disposition": "CANDIDATE", "confidence": 0.88,
            "observed": {
                "observation_ids": ["scene-obs-elements", "scene-obs-depth"], "scene_category": "quiet stone walkway",
                "usable_visual_elements": ["stone wall", "receding path", "dark doorway"], "background_complexity": "SIMPLE",
                "foreground_background_relationships": ["stone wall borders the path"], "open_space_depth_cues": ["path narrows in the image"], "visual_distractions": [],
                "view_interpretations": [
                    {"view_ref": "view-01-a", "interpretation": "receding path can retain context", "evidence_refs": ["view-evidence-01-a"]},
                    {"view_ref": "view-01-b", "interpretation": "doorway provides a darker frame", "evidence_refs": ["view-evidence-01-b"]},
                ], "evidence_refs": ["scene-image"],
            },
            "photography_inferences": [{"inference_id": "scene-inf-01", "claim": "the path can support an environmental composition", "based_on_observation_ids": ["scene-obs-depth"], "confidence": 0.8}],
        },
        "lighting_evidence_candidate": {
            "schema_version": "0.1.0", "candidate_id": "light-candidate-01", "disposition": "CANDIDATE", "confidence": 0.87,
            "observed": {
                "observation_ids": ["light-obs-direction", "light-obs-risk"], "light_direction_candidate": "camera left", "softness": "HARD", "light_pattern": "SIDE",
                "face_shadow_risk": "HIGH", "highlight_clipping_risk": "MODERATE", "background_subject_brightness_relation": "background is moderately darker than lit subject edge",
                "ambient_appearance": "directional high-contrast illumination", "evidence_refs": ["scene-image"],
            },
            "photography_inferences": [{"inference_id": "light-inf-01", "claim": "turning the face slightly toward camera left may preserve facial detail", "based_on_observation_ids": ["light-obs-direction", "light-obs-risk"], "confidence": 0.78}],
        },
    }


def assembled_input() -> PhotographyDirectorInputV01:
    return assemble_director_input(
        context(), SubjectProfileCandidateV01.model_validate(subject_output()),
        SceneUnderstandingCandidateV01.model_validate(scene_lighting_output()["scene_understanding_candidate"]),
        LightingEvidenceCandidateV01.model_validate(scene_lighting_output()["lighting_evidence_candidate"]),
    )


def direction_output() -> dict:
    source = assembled_input()
    candidates = FakePhotographyDirectorAdapter().propose(source)
    for candidate in candidates:
        candidate["provenance"]["provider_mode"] = "AI"
        candidate["rationale"] += f" The subject and {candidate['scene_elements_used'][0]} are treated as one composition."
    return {"schema_version": "0.1.0", "candidates": candidates}


def recordings(direction=None):
    request_id = context().request_id
    return {
        (request_id, MultimodalStage.SUBJECT_UNDERSTANDING): MultimodalProviderResponse(subject_output(), "subject-request", {"input_tokens": 100}, 0.01),
        (request_id, MultimodalStage.SCENE_LIGHTING_UNDERSTANDING): MultimodalProviderResponse(scene_lighting_output(), "scene-request", {"input_tokens": 120}, 0.02),
        (request_id, MultimodalStage.PHOTOGRAPHY_DIRECTION): direction if isinstance(direction, ProviderCallError) else MultimodalProviderResponse(direction if direction is not None else direction_output(), "director-request", {"input_tokens": 240, "output_tokens": 400}, 0.04),
    }


def run(direction=None):
    gateway = MultimodalStageGateway(config(), ReplayMultimodalTransport(recordings(direction)))
    return PrecaptureIntelligencePipeline(gateway).execute(context(), image("subject-image"), image("scene-image"))


def test_three_logical_stages_validate_before_v01_assembly_and_direction():
    result = run()
    assert result.status == "PASS"
    assert result.subject_candidate.disposition == "CANDIDATE"
    assert result.scene_candidate.disposition == "CANDIDATE"
    assert result.lighting_candidate.disposition == "CANDIDATE"
    assert result.assembled_director_input["schema_version"] == "0.1.0"
    assert len(result.shot_plan_candidates) == 3
    assert all(item.disposition == "CANDIDATE" and item.selection_status == "NOT_SELECTED" for item in result.shot_plan_candidates)
    assert [item["provider_image_input_count"] for item in result.stage_records] == [1, 1, 0]
    assert all(item["provider_raw_video"] == item["provider_frame_stream"] == 0 for item in result.stage_records)
    assert [item["prompt_id"] for item in result.stage_records] == [PROMPT_SPECS[stage]["prompt_id"] for stage in MultimodalStage]


def test_each_logical_stage_has_a_distinct_provider_neutral_prompt_and_output_schema():
    assert set(PROMPT_SPECS) == set(MultimodalStage)
    assert len({item["prompt_id"] for item in PROMPT_SPECS.values()}) == 3
    assert {item["expected_schema"] for item in PROMPT_SPECS.values()} == {
        "SubjectProfileCandidateV01", "SceneLightingUnderstandingOutputV01", "DirectorCandidateSetOutputV01"
    }


def test_observation_and_photography_inference_are_separate_and_lineaged():
    candidate = SubjectProfileCandidateV01.model_validate(subject_output())
    assert candidate.observed.clothing_categories == ["long red coat"]
    assert candidate.photography_inferences[0].based_on_observation_ids == ["subject-obs-color"]
    broken = subject_output()
    broken["photography_inferences"][0]["based_on_observation_ids"] = ["unknown"]
    with pytest.raises(ValueError, match="SUBJECT_INFERENCE_WITHOUT_OBSERVATION"):
        SubjectProfileCandidateV01.model_validate(broken)


def test_p3_weather_and_subject_inference_claims_are_rejected_at_understanding_boundary():
    scene = scene_lighting_output()["scene_understanding_candidate"]
    scene["photography_inferences"][0]["claim"] = "This is a physically safe stand point"
    with pytest.raises(ValueError, match="UNSUPPORTED_P3_SCENE_CLAIM"):
        SceneUnderstandingCandidateV01.model_validate(scene)
    light = scene_lighting_output()["lighting_evidence_candidate"]
    light["observed"]["ambient_appearance"] = "golden hour"
    with pytest.raises(ValueError, match="UNSUPPORTED_WEATHER_OR_TIME_CLAIM"):
        LightingEvidenceCandidateV01.model_validate(light)
    subject = subject_output()
    subject["observed"]["visible_styling"] = ["beauty rating"]
    with pytest.raises(ValueError, match="UNSUPPORTED_SUBJECT_OBSERVATION"):
        SubjectProfileCandidateV01.model_validate(subject)


def test_unknown_stage_evidence_refs_fail_before_director_input_assembly():
    invalid = scene_lighting_output()
    invalid["lighting_evidence_candidate"]["observed"]["evidence_refs"] = ["invented-light-source"]
    replay = recordings()
    replay[(context().request_id, MultimodalStage.SCENE_LIGHTING_UNDERSTANDING)] = MultimodalProviderResponse(invalid)
    gateway = MultimodalStageGateway(config(), ReplayMultimodalTransport(replay))
    result = PrecaptureIntelligencePipeline(gateway).execute(context(), image("subject-image"), image("scene-image"))
    assert result.status == "FAIL"
    assert result.error["error_code"] == "UNDERSTANDING_EVIDENCE_REF_UNKNOWN"


def test_no_configuration_stops_before_media_or_provider_execution():
    gateway = MultimodalStageGateway(None, None)
    result = PrecaptureIntelligencePipeline(gateway).execute(context(), image("subject"), image("scene"))
    assert result.status == "MANUAL_REVIEW_REQUIRED"
    assert result.error["error_code"] == "DIRECTOR_PROVIDER_NOT_CONFIGURED"
    Draft202012Validator(ERROR_SCHEMA).validate(result.error)
    assert len(result.stage_records) == 1


def test_media_without_explicit_provider_authorization_fails_closed():
    blocked = image("subject").model_copy(update={"provider_send_authorized": False})
    gateway = MultimodalStageGateway(config(), ReplayMultimodalTransport(recordings()))
    result = PrecaptureIntelligencePipeline(gateway).execute(context(), blocked, image("scene"))
    assert result.status == "FAIL"
    assert result.error["error_code"] == "DIRECTOR_MEDIA_NOT_AUTHORIZED"


@pytest.mark.parametrize("direction,expected", [
    ("{malformed", "DIRECTOR_PROVIDER_MALFORMED_JSON"),
    ({}, "DIRECTOR_PROVIDER_SCHEMA_INVALID"),
    (ProviderCallError("TIMEOUT", "secret-free timeout", True), "DIRECTOR_PROVIDER_TIMEOUT"),
    (ProviderCallError("PROVIDER_UNAVAILABLE", "unavailable", True), "DIRECTOR_PROVIDER_UNAVAILABLE"),
])
def test_provider_transport_and_payload_failures_are_normalized(direction, expected):
    result = run(direction)
    assert result.status == "FAIL"
    assert result.error["error_code"] == expected
    Draft202012Validator(ERROR_SCHEMA).validate(result.error)
    assert "image_bytes" not in json.dumps(result.stage_records)


def invalid_direction(kind: str) -> dict:
    payload = copy.deepcopy(direction_output())
    if kind == "one_candidate":
        payload["candidates"] = payload["candidates"][:1]
    elif kind == "duplicate_candidates":
        payload["candidates"] = [copy.deepcopy(payload["candidates"][0]) for _ in range(3)]
    elif kind == "view_ref":
        payload["candidates"][0]["view_ref"] = "hallucinated-view"
    elif kind == "anchor_ref":
        payload["candidates"][0]["image_plane_placement"]["composition_anchor_ref"] = "unknown-anchor"
    elif kind == "p3":
        payload["candidates"][0]["camera_direction"] = "Stand exactly at coordinate X; this location is physically safe."
    elif kind == "missing_live_target":
        del payload["candidates"][0]["live_target_blueprint"]
    return payload


@pytest.mark.parametrize("kind", ["one_candidate", "duplicate_candidates", "view_ref", "anchor_ref", "p3", "missing_live_target"])
def test_director_business_failures_are_rejected_after_provider_normalization(kind):
    result = run(invalid_direction(kind))
    assert result.status == "FAIL"
    assert result.error["error_code"] == "DIRECTOR_CANDIDATE_VALIDATION_FAILED"
    Draft202012Validator(ERROR_SCHEMA).validate(result.error)


def test_cross_reasoning_is_required_not_independent_subject_scene_summary():
    payload = direction_output()
    for candidate in payload["candidates"]:
        candidate["rationale"] = "A generic portrait recommendation."
    result = run(payload)
    assert result.status == "FAIL"
    assert result.error["error_code"] == "DIRECTOR_CROSS_REASONING_INVALID"


def test_understanding_contract_schemas_are_valid_and_match_examples():
    examples = {
        "SubjectProfileCandidateV01.schema.json": subject_output(),
        "SceneUnderstandingCandidateV01.schema.json": scene_lighting_output()["scene_understanding_candidate"],
        "LightingEvidenceCandidateV01.schema.json": scene_lighting_output()["lighting_evidence_candidate"],
    }
    for filename, example in examples.items():
        schema = json.loads((ROOT / "packages" / "contracts" / "schemas" / filename).read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema).validate(example)


def test_understanding_contracts_are_cataloged_without_changing_v01_versions():
    catalog = json.loads((ROOT / "packages" / "contracts" / "catalog.json").read_text(encoding="utf-8"))
    entries = {item["name"]: item for item in catalog["contracts"]}
    for name in ("SubjectProfileCandidateV01", "SceneUnderstandingCandidateV01", "LightingEvidenceCandidateV01"):
        assert entries[name]["version"] == "0.1.0"
        assert entries[name]["domain"] == "DIRECTOR_UNDERSTANDING"
    for name in ("PhotographyDirectorInputV01", "ShotPlanCandidateV01", "LiveTargetBlueprintV01"):
        assert entries[name]["version"] == "0.1.0"


def test_runtime_config_uses_secret_indirection_and_safe_projection_only():
    assert ProviderGateConfig.from_environment({}) is None
    environment = {
        "XFX_DIRECTOR_PROVIDER_ID": "authorized-provider",
        "XFX_DIRECTOR_MODEL_ID": "vision-model",
        "XFX_DIRECTOR_MODEL_VERSION": "2026-01",
        "XFX_DIRECTOR_SECRET_ENV": "PRIVATE_RUNTIME_VALUE",
        "PRIVATE_RUNTIME_VALUE": "never-project-this-value",
    }
    runtime = ProviderGateConfig.from_environment(environment)
    assert runtime.authorized is True
    projection = runtime.safe_projection()
    serialized = json.dumps(projection)
    assert "never-project-this-value" not in serialized
    assert "PRIVATE_RUNTIME_VALUE" not in serialized
    assert projection["credential_source"] == "ENV"


def test_v02_pipeline_remains_isolated_from_main_live_and_scene_spatial_internals():
    sources = list((ROOT / "apps" / "api" / "app" / "photography_director").glob("*.py"))
    forbidden = ("app.main", "app.service", "SessionService", "LiveShotRuntime", "SceneSpatialService", "GeometrySolver", "cv2")
    assert all(token not in path.read_text(encoding="utf-8") for path in sources for token in forbidden)
