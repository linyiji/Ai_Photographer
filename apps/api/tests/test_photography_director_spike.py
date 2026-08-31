from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

from app.photography_director.adapters import FakePhotographyDirectorAdapter, ReplayPhotographyDirectorAdapter
from app.photography_director.contracts import PhotographyDirectorInputV01
from app.photography_director.evaluation import DIMENSIONS, PhotographyDirectorEvaluator
from app.photography_director.service import PhotographyDirectorService


ROOT = Path(__file__).resolve().parents[3]
FIXTURES = ROOT / "packages" / "photography-director-fixtures" / "cases.json"
CONTRACTS = ROOT / "packages" / "contracts" / "schemas"


def cases() -> list[dict]:
    return json.loads(FIXTURES.read_text(encoding="utf-8"))["cases"]


@pytest.mark.parametrize("case", cases(), ids=lambda item: item["case_id"])
def test_fake_director_returns_three_realistic_distinct_executable_candidates(case):
    result = PhotographyDirectorService(FakePhotographyDirectorAdapter()).propose(case["input"])
    assert result.status == "CANDIDATES_READY"
    assert len(result.candidates) == 3
    assert {item.framing.value for item in result.candidates} == {
        "ENVIRONMENTAL_FULL_BODY", "THREE_QUARTER_LIFESTYLE", "CLOSE_EMOTIONAL_PORTRAIT"
    }
    assert all(item.disposition == "CANDIDATE" and item.selection_status == "NOT_SELECTED" for item in result.candidates)
    assert all(item.feasibility.status == "EXECUTABLE_WITH_WARNINGS" for item in result.candidates)
    assert result.provenance["external_provider_calls"] == 0
    assert result.provenance["selection_performed"] is False


def test_level1_partial_insufficient_and_usable_spatial_all_remain_usable():
    results = {
        case["input"].get("spatial_evidence_optional", {}).get("status", "ABSENT") if case["input"].get("spatial_evidence_optional") else "ABSENT":
        PhotographyDirectorService(FakePhotographyDirectorAdapter()).propose(case["input"])
        for case in cases()
    }
    assert set(results) == {"ABSENT", "PARTIAL", "INSUFFICIENT", "USABLE"}
    assert all(result.status == "CANDIDATES_READY" and len(result.candidates) == 3 for result in results.values())


def test_replay_path_is_deterministic_and_provider_neutral():
    source = cases()[0]["input"]
    fake = PhotographyDirectorService(FakePhotographyDirectorAdapter()).propose(source)
    recording = {source["request_id"]: [item.model_dump(mode="json") for item in fake.candidates]}
    replay = PhotographyDirectorService(ReplayPhotographyDirectorAdapter(recording)).propose(source)
    assert replay.status == "CANDIDATES_READY"
    assert replay.provider_mode.value == "REPLAY"
    assert [item.photo_concept for item in replay.candidates] == [item.photo_concept for item in fake.candidates]
    assert all(item.provenance.provider_mode == "REPLAY" for item in replay.candidates)


@pytest.mark.parametrize("mutation,expected", [
    (lambda item: item["view_candidates"].clear(), "INVALID_INPUT"),
    (lambda item: item["subject_profile"].update({"identity": "invented"}), "INVALID_INPUT"),
    (lambda item: item["composition_anchor_candidates"][0].update({"view_ref": "unknown"}), "INVALID_INPUT"),
])
def test_input_contract_rejects_unbounded_or_inconsistent_evidence(mutation, expected):
    payload = copy.deepcopy(cases()[0]["input"])
    mutation(payload)
    result = PhotographyDirectorService(FakePhotographyDirectorAdapter()).propose(payload)
    assert result.status == expected


def test_candidate_validation_rejects_p3_claims():
    source = cases()[0]["input"]
    raw = FakePhotographyDirectorAdapter().propose(PhotographyDirectorInputV01.model_validate(source))
    raw[0]["camera_direction"] = "Stand exactly at coordinate X and walk here; this location is physically safe."
    replay = PhotographyDirectorService(ReplayPhotographyDirectorAdapter({source["request_id"]: raw})).propose(source)
    assert replay.status == "VALIDATION_FAILED"
    joined = json.dumps(replay.rejected)
    assert "EXACT_COORDINATE_CLAIM" in joined
    assert "WALKABILITY_CLAIM" in joined
    assert "PHYSICAL_SAFETY_CLAIM" in joined


def test_candidate_validation_rejects_automatic_selection_and_weak_set():
    source = cases()[0]["input"]
    raw = FakePhotographyDirectorAdapter().propose(PhotographyDirectorInputV01.model_validate(source))
    selected = copy.deepcopy(raw)
    selected[0]["selection_status"] = "SELECTED"
    selected_result = PhotographyDirectorService(ReplayPhotographyDirectorAdapter({source["request_id"]: selected})).propose(source)
    assert selected_result.status == "VALIDATION_FAILED"
    assert "literal_error" in json.dumps(selected_result.rejected)
    weak_set = PhotographyDirectorService(ReplayPhotographyDirectorAdapter({source["request_id"]: raw[:1]})).propose(source)
    assert weak_set.status == "VALIDATION_FAILED"
    assert "COUNT_NOT_APPROXIMATELY_THREE" in json.dumps(weak_set.rejected)


def test_missing_replay_is_a_normalized_failure_without_candidates():
    source = cases()[0]["input"]
    result = PhotographyDirectorService(ReplayPhotographyDirectorAdapter({})).propose(source)
    assert result.status == "FAILED"
    assert result.candidates == ()
    assert result.error["code"] == "LOOKUPERROR"


def test_contract_schemas_validate_fixture_inputs_and_outputs():
    input_schema = json.loads((CONTRACTS / "PhotographyDirectorInputV01.schema.json").read_text(encoding="utf-8"))
    candidate_schema = json.loads((CONTRACTS / "ShotPlanCandidateV01.schema.json").read_text(encoding="utf-8"))
    blueprint_schema = json.loads((CONTRACTS / "LiveTargetBlueprintV01.schema.json").read_text(encoding="utf-8"))
    for schema in (input_schema, candidate_schema, blueprint_schema):
        Draft202012Validator.check_schema(schema)
    registry = Registry().with_resource(blueprint_schema["$id"], Resource.from_contents(blueprint_schema))
    for case in cases():
        Draft202012Validator(input_schema).validate(case["input"])
        result = PhotographyDirectorService(FakePhotographyDirectorAdapter()).propose(case["input"])
        for candidate in result.candidates:
            payload = candidate.model_dump(mode="json")
            Draft202012Validator(candidate_schema, registry=registry).validate(payload)
            Draft202012Validator(blueprint_schema).validate(payload["live_target_blueprint"])


def test_evaluation_matrix_and_all_deterministic_gates_pass():
    result = PhotographyDirectorEvaluator(FIXTURES).run()
    assert result["status"] == "PASS"
    assert all(result["gates"].values())
    assert set(result["aggregate_scores"]) == set(DIMENSIONS)
    assert min(result["aggregate_scores"].values()) == 5
    assert all(item["status"] == "PENDING" for item in result["human_review"])


def test_director_package_has_no_main_live_workflow_or_scene_spatial_mutation():
    sources = list((ROOT / "apps" / "api" / "app" / "photography_director").glob("*.py"))
    forbidden = ("app.main", "app.service", "WorkflowState", "SessionService", "state[", "LiveShotRuntime", "SceneSpatialService")
    assert all(token not in path.read_text(encoding="utf-8") for path in sources for token in forbidden)
