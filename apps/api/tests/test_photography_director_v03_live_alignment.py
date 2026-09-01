from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

from app.photography_director.contracts import PhotographyDirectorInputV01
from app.photography_director.live_alignment import (
    DirectorContextMode,
    DirectorVisualRefV01,
    FakePhotographyDirectorV03Adapter,
    LiveCapabilityCatalogV01,
    PhotographyDirectorV03Service,
    ProductFramingProfile,
    ReplayPhotographyDirectorV03Adapter,
    ShotPlanCandidateV02,
    TargetZone,
    build_v03_input,
    live_05g_capability_catalog,
    validate_v03_candidate,
)
from app.photography_director.job_control import AIJobStatus, AIRequestEnvelopeV01, DirectorJobOrchestratorV03
from app.photography_director.multimodal import MultimodalStageGateway, ProviderGateConfig, ProviderImageInput
from app.photography_director.pipeline_v03 import PrecaptureIntelligencePipelineV03, PrecaptureV03Context
from app.photography_director.prompts import PROMPT_SPECS_V03
from app.photography_director.understanding import DirectorAssemblyContextV02


ROOT = Path(__file__).resolve().parents[3]
FIXTURE_CASES = json.loads((ROOT / "packages" / "photography-director-fixtures" / "cases.json").read_text(encoding="utf-8"))["cases"]


def v03_input(index: int = 0):
    return build_v03_input(PhotographyDirectorInputV01.model_validate(FIXTURE_CASES[index]["input"]))


def fake_candidates(index: int = 0):
    source = v03_input(index)
    return source, FakePhotographyDirectorV03Adapter().propose(source)


def assembly_context(index: int = 0) -> DirectorAssemblyContextV02:
    value = FIXTURE_CASES[index]["input"]
    return DirectorAssemblyContextV02.model_validate({
        "request_id": value["request_id"], "subject_reference": value["subject_reference"],
        "view_candidates": value["view_candidates"], "composition_anchor_candidates": value["composition_anchor_candidates"],
        "spatial_evidence_optional": value["spatial_evidence_optional"], "user_intent": value["user_intent"],
        "reference_image_optional": value["reference_image_optional"],
    })


def provider_image(asset_ref: str) -> ProviderImageInput:
    content = f"controlled-{asset_ref}".encode()
    return ProviderImageInput(
        asset_ref=asset_ref, mime_type="image/png", sha256=hashlib.sha256(content).hexdigest(),
        provider_send_authorized=True, width=640, height=480, image_bytes=content,
    )


def job_request(index: int, job_id: str, revision: int = 3) -> AIRequestEnvelopeV01:
    source = v03_input(index)
    return AIRequestEnvelopeV01.from_director_input(
        request_id=f"request-{job_id}", job_id=job_id, session_id="session-v03", session_revision=revision,
        prompt_version="director-v02-live-05g", director_input=source.model_dump(mode="json"),
    )


def test_live_05g_catalog_exposes_only_product_level_truth():
    catalog = live_05g_capability_catalog()
    assert catalog.framing_profiles == list(ProductFramingProfile)
    assert {TargetZone.LEFT_TOP, TargetZone.CENTER, TargetZone.RIGHT_BOTTOM} <= set(catalog.placement.target_zones)
    assert catalog.placement.normalized_position_supported is True
    assert catalog.axes.model_dump() == {"x_relation": True, "y_relation": True, "y_subject_action": False}
    assert catalog.pose.coarse_body_orientation is False
    assert catalog.pose.detailed_gesture is False
    assert catalog.device_admission == "PENDING_05H"
    assert not any(token in json.dumps(catalog.model_dump(mode="json")) for token in ("HEAD_TO_HIP", "SHOULDER_CENTER", "HEAD_CORE", "One Euro"))


@pytest.mark.parametrize("profile", list(ProductFramingProfile))
def test_all_five_product_framing_profiles_validate(profile):
    source, candidates = fake_candidates()
    raw = copy.deepcopy(candidates[0])
    raw["framing_profile"] = profile.value
    raw["live_target_blueprint"]["framing_profile"] = profile.value
    candidate, errors = validate_v03_candidate(raw, source)
    assert candidate is not None
    assert errors == []


def test_head_shoulders_does_not_imply_hips_or_private_measurement_detail():
    source, candidates = fake_candidates()
    raw = copy.deepcopy(candidates[0])
    raw["framing_profile"] = "HEAD_SHOULDERS"
    raw["live_target_blueprint"]["framing_profile"] = "HEAD_SHOULDERS"
    candidate, errors = validate_v03_candidate(raw, source)
    assert errors == []
    serialized = json.dumps(candidate.model_dump(mode="json"))
    assert "HIPS" not in serialized
    for private in ("MediaPipe", "HEAD_TO_HIP", "SHOULDER_CENTER", "HEAD_CORE", "One Euro", "READY threshold", "hysteresis"):
        assert private not in serialized


@pytest.mark.parametrize("zone", [TargetZone.LEFT_TOP, TargetZone.CENTER, TargetZone.RIGHT_BOTTOM])
def test_live_acceptance_target_zones_are_representable(zone):
    source, candidates = fake_candidates()
    raw = copy.deepcopy(candidates[0])
    raw["subject_placement"]["zone"] = zone.value
    raw["live_target_blueprint"]["subject_placement"]["zone"] = zone.value
    _, errors = validate_v03_candidate(raw, source)
    assert errors == []


def test_generalized_normalized_placement_is_representable():
    source, candidates = fake_candidates()
    raw = copy.deepcopy(candidates[0])
    placement = {
        "model": "NORMALIZED_POSITION", "zone": None, "normalized_position": {"x": 0.37, "y": 0.61},
        "composition_anchor_ref": raw["subject_placement"]["composition_anchor_ref"], "description": "Place subject at a bounded off-center position",
    }
    raw["subject_placement"] = placement
    raw["live_target_blueprint"]["subject_placement"] = copy.deepcopy(placement)
    candidate, errors = validate_v03_candidate(raw, source)
    assert candidate.subject_placement.normalized_position.x == 0.37
    assert errors == []


def test_required_detailed_gesture_is_rejected_but_optional_suggestion_is_allowed():
    source, candidates = fake_candidates()
    required = copy.deepcopy(candidates[0])
    gesture = {"body_area": "HANDS", "instruction": "Make a V sign", "capability": "DETAILED_GESTURE", "execution": "REQUIRED_EXECUTABLE"}
    required["pose_requirements"] = [gesture]
    required["live_target_blueprint"]["pose_constraints"] = [copy.deepcopy(gesture)]
    _, errors = validate_v03_candidate(required, source)
    assert any("UNSUPPORTED_DETAILED_GESTURE_REQUIREMENT" in error for error in errors)
    optional = copy.deepcopy(required)
    optional["pose_requirements"][0]["execution"] = "OPTIONAL_SUGGESTION"
    optional["live_target_blueprint"]["pose_constraints"][0]["execution"] = "OPTIONAL_SUGGESTION"
    _, errors = validate_v03_candidate(optional, source)
    assert errors == []


def test_current_05g_coarse_orientation_cannot_be_a_required_blocking_constraint():
    source, candidates = fake_candidates()
    raw = copy.deepcopy(candidates[0])
    raw["pose_requirements"][0]["execution"] = "REQUIRED_EXECUTABLE"
    raw["live_target_blueprint"]["pose_constraints"][0]["execution"] = "REQUIRED_EXECUTABLE"
    _, errors = validate_v03_candidate(raw, source)
    assert "LIVE:COARSE_BODY_ORIENTATION_UNSUPPORTED" in errors


@pytest.mark.parametrize("index", range(4), ids=lambda index: FIXTURE_CASES[index]["case_id"])
def test_absent_partial_insufficient_and_usable_spatial_keep_level1_director_valid(index):
    source = v03_input(index)
    result = PhotographyDirectorV03Service(FakePhotographyDirectorV03Adapter()).propose(source.model_dump(mode="json"))
    assert result.status == "CANDIDATES_READY"
    assert len(result.candidates) == 3
    assert len({item.framing_profile for item in result.candidates}) == 3
    assert len({item.subject_placement.zone for item in result.candidates}) == 3
    assert all(item.disposition == "CANDIDATE" and item.selection_status == "NOT_SELECTED" for item in result.candidates)
    assert all(all(pose.execution == "OPTIONAL_SUGGESTION" for pose in item.pose_requirements) for item in result.candidates)


def test_v03_replay_is_deterministic_and_provider_neutral():
    source, candidates = fake_candidates()
    recording = {source.accepted_context_v01.request_id: candidates}
    first = PhotographyDirectorV03Service(ReplayPhotographyDirectorV03Adapter(recording)).propose(source.model_dump(mode="json"))
    second = PhotographyDirectorV03Service(ReplayPhotographyDirectorV03Adapter(recording)).propose(source.model_dump(mode="json"))
    assert first.status == second.status == "CANDIDATES_READY"
    assert [item.model_dump(mode="json") for item in first.candidates] == [item.model_dump(mode="json") for item in second.candidates]
    assert all(item.provenance.provider_mode == "REPLAY" for item in first.candidates)
    assert "image_bytes" not in repr(recording)


def test_cross_reasoning_unknown_refs_p3_and_private_live_details_fail_closed():
    source, candidates = fake_candidates()
    cross = copy.deepcopy(candidates[0]); cross["subject_scene_fit"] = "Generic portrait"; cross["short_rationale"] = "Generic portrait"
    _, errors = validate_v03_candidate(cross, source)
    assert "DIRECTOR:SUBJECT_SCENE_CROSS_REASONING_INVALID" in errors
    evidence = copy.deepcopy(candidates[0]); evidence["provenance"]["evidence_refs"] = ["invented-evidence"]
    _, errors = validate_v03_candidate(evidence, source)
    assert "REALITY:UNKNOWN_EVIDENCE_REF" in errors
    p3 = copy.deepcopy(candidates[0]); p3["camera_relationship"]["direction"] = "Stand exactly at a safe stand point"
    p3["live_target_blueprint"]["camera_constraints"] = copy.deepcopy(p3["camera_relationship"])
    _, errors = validate_v03_candidate(p3, source)
    assert "P3:UNSUPPORTED_PHYSICAL_AUTHORITY" in errors
    private = copy.deepcopy(candidates[0]); private["short_rationale"] += " Use HEAD_TO_HIP and One Euro parameters."
    _, errors = validate_v03_candidate(private, source)
    assert "LIVE:PRIVATE_MEASUREMENT_IMPLEMENTATION_LEAK" in errors


@pytest.mark.parametrize("kind,expected", [
    ("view", "REALITY:UNKNOWN_VIEW_REF"),
    ("anchor", "REALITY:UNKNOWN_COMPOSITION_ANCHOR_REF"),
    ("framing", "CONTRACT:"),
    ("zone", "CONTRACT:"),
    ("missing_blueprint", "CONTRACT:"),
])
def test_v03_contract_and_reality_failure_matrix(kind, expected):
    source, candidates = fake_candidates()
    raw = copy.deepcopy(candidates[0])
    if kind == "view":
        raw["view_ref"] = "invented-view"
    elif kind == "anchor":
        raw["subject_placement"]["composition_anchor_ref"] = "invented-anchor"
        raw["live_target_blueprint"]["subject_placement"]["composition_anchor_ref"] = "invented-anchor"
    elif kind == "framing":
        raw["framing_profile"] = "WAIST_UP"
        raw["live_target_blueprint"]["framing_profile"] = "WAIST_UP"
    elif kind == "zone":
        raw["subject_placement"]["zone"] = "AESTHETIC_MAGIC_ZONE"
        raw["live_target_blueprint"]["subject_placement"]["zone"] = "AESTHETIC_MAGIC_ZONE"
    elif kind == "missing_blueprint":
        del raw["live_target_blueprint"]
    _, errors = validate_v03_candidate(raw, source)
    assert any(expected in error for error in errors)


@pytest.mark.parametrize("kind", ["one_candidate", "duplicate_candidates"])
def test_v03_candidate_set_count_and_duplicate_fail_closed(kind):
    source, candidates = fake_candidates()
    recording = copy.deepcopy(candidates[:1])
    if kind == "duplicate_candidates":
        recording = [copy.deepcopy(candidates[0]) for _ in range(3)]
    result = PhotographyDirectorV03Service(ReplayPhotographyDirectorV03Adapter({source.accepted_context_v01.request_id: recording})).propose(source.model_dump(mode="json"))
    assert result.status == "VALIDATION_FAILED"
    joined = json.dumps(result.rejected)
    assert "COUNT_NOT_THREE" in joined if kind == "one_candidate" else "DUPLICATE_ID" in joined


def test_context_mode_enforces_bounded_authorized_director_images():
    accepted = PhotographyDirectorInputV01.model_validate(FIXTURE_CASES[0]["input"])
    with pytest.raises(ValueError, match="DIRECTOR_IMAGE_CONTEXT_BUDGET_INVALID"):
        build_v03_input(accepted, context_mode=DirectorContextMode.STRUCTURED_PLUS_IMAGES)
    refs = [
        DirectorVisualRefV01(asset_ref="subject://approved", role="SUBJECT_REFERENCE", provider_send_authorized=True),
        DirectorVisualRefV01(asset_ref="scene://approved", role="SCENE_VIEW", provider_send_authorized=True),
    ]
    source = build_v03_input(accepted, context_mode=DirectorContextMode.STRUCTURED_PLUS_IMAGES, optional_visual_refs=refs)
    assert len(source.optional_visual_refs) == 2
    assert sum(item.role == "SUBJECT_REFERENCE" for item in source.optional_visual_refs) == 1


def test_v03_pipeline_stops_before_transport_without_configuration_or_valid_media_budget():
    pipeline = PrecaptureIntelligencePipelineV03(MultimodalStageGateway(None, None))
    structured = PrecaptureV03Context(assembly_context=assembly_context())
    blocked = pipeline.execute(structured, provider_image("subject"), (provider_image("scene"),))
    assert blocked.status == "MANUAL_REVIEW_REQUIRED"
    assert blocked.error["error_code"] == "DIRECTOR_PROVIDER_NOT_CONFIGURED"
    assert len(blocked.stage_records) == 1
    invalid = PrecaptureV03Context(assembly_context=assembly_context(), context_mode="STRUCTURED_PLUS_IMAGES")
    rejected = pipeline.execute(invalid, provider_image("subject"), (provider_image("scene"),))
    assert rejected.status == "FAIL"
    assert rejected.error["error_code"] == "DIRECTOR_IMAGE_CONTEXT_BUDGET_INVALID"
    assert rejected.stage_records == ()


def test_real_mini_gate_config_requires_explicit_image_and_structured_output_support():
    base = dict(
        provider_id="configured-provider", model_id="configured-model", model_version="snapshot",
        secret_env_reference="SECRET_INDIRECTION", credential_present=True,
        supported_stages=list(PROMPT_SPECS_V03), timeout_seconds=30,
    )
    assert ProviderGateConfig(**base).authorized is True
    assert ProviderGateConfig(**base).real_mini_gate_authorized is False
    admitted = ProviderGateConfig(**base, supports_image_input=True, supports_structured_output=True)
    assert admitted.real_mini_gate_authorized is True
    safe = json.dumps(admitted.safe_projection())
    assert "SECRET_INDIRECTION" not in safe
    pipeline = PrecaptureIntelligencePipelineV03(MultimodalStageGateway(ProviderGateConfig(**base), object()))
    blocked = pipeline.execute(PrecaptureV03Context(assembly_context=assembly_context()), provider_image("subject"), (provider_image("scene"),))
    assert blocked.status == "MANUAL_REVIEW_REQUIRED"
    assert blocked.error["error_code"] == "DIRECTOR_REAL_MINI_GATE_NOT_AUTHORIZED"
    assert blocked.stage_records == ()


def test_v03_prompt_uses_product_semantics_and_forbids_live_private_algorithm_language():
    direction = PROMPT_SPECS_V03[next(stage for stage in PROMPT_SPECS_V03 if stage.value == "PHOTOGRAPHY_DIRECTION")]
    text = " ".join(direction["instructions"])
    assert all(profile.value in text for profile in ProductFramingProfile)
    assert "HEAD_SHOULDERS means head plus shoulders and does not require hips" in text
    assert "never expose landmarks" in text


def test_director_job_idempotency_stale_revision_supersession_and_bounded_retry():
    orchestrator = DirectorJobOrchestratorV03(); orchestrator.set_active_revision("session-v03", 3)
    first_request = job_request(0, "job-1")
    first, duplicate_a = orchestrator.submit(first_request)
    same, duplicate_b = orchestrator.submit(first_request)
    assert same.job_id == first.job_id and (duplicate_a, duplicate_b) == (False, True)
    second, _ = orchestrator.submit(job_request(1, "job-2"))
    assert first.status == AIJobStatus.SUPERSEDED and first.superseded_by_job_id == second.job_id
    stale, _ = orchestrator.submit(job_request(2, "job-stale", revision=2))
    assert stale.status == AIJobStatus.SUPERSEDED
    assert second.status == AIJobStatus.QUEUED
    assert DirectorJobOrchestratorV03.bounded_retry_allowed(second, retryable=True) is True
    assert DirectorJobOrchestratorV03.bounded_retry_allowed(second, retryable=True) is False


def test_completed_result_cannot_promote_after_newer_same_revision_input():
    orchestrator = DirectorJobOrchestratorV03(); orchestrator.set_active_revision("session-v03", 3)
    first, _ = orchestrator.submit(job_request(0, "job-complete"))
    orchestrator.start(first.job_id); orchestrator.begin_validation(first.job_id); orchestrator.complete(first.job_id, ["candidate-1"])
    orchestrator.assert_promotable(first.job_id)
    orchestrator.submit(job_request(1, "job-newer"))
    with pytest.raises(ValueError, match="AI_RESULT_SUPERSEDED"):
        orchestrator.assert_promotable(first.job_id)


def test_v03_contracts_are_cataloged_and_json_schemas_validate_examples():
    catalog = json.loads((ROOT / "packages" / "contracts" / "catalog.json").read_text(encoding="utf-8"))
    entries = {item["name"]: item for item in catalog["contracts"]}
    source, candidates = fake_candidates()
    examples = {
        "LiveCapabilityCatalogV01": source.live_capability_catalog.model_dump(mode="json"),
        "PhotographyDirectorInputV02": source.model_dump(mode="json"),
        "ShotPlanCandidateV02": ShotPlanCandidateV02.model_validate(candidates[0]).model_dump(mode="json"),
        "LiveTargetBlueprintV02": candidates[0]["live_target_blueprint"],
    }
    for name, example in examples.items():
        entry = entries[name]
        schema = json.loads((ROOT / "packages" / "contracts" / entry["path"]).read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema).validate(example)
        assert schema["$id"] == entry["schema_id"]
        assert schema["properties"]["schema_version"]["const"] == entry["version"]


def test_v03_package_does_not_import_or_mutate_main_live_or_scene_spatial_runtime():
    source = (ROOT / "apps" / "api" / "app" / "photography_director" / "live_alignment.py").read_text(encoding="utf-8")
    forbidden = ("app.main", "SessionService", "LiveShotRuntime", "SceneSpatialService", "GeometrySolver", "cv2", "mediapipe")
    assert all(token not in source for token in forbidden)
