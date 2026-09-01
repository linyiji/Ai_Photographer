from __future__ import annotations

import json
from pathlib import Path

import pytest
from pydantic import BaseModel, ConfigDict

from app.ai.api_ports import InProcessAIPortSurface
from app.ai.context_builders import (
    CaptureAnalysisContextBuilder,
    ContextBuildError,
    DirectorContextBuilder,
    EnhancementQAContextBuilder,
    ImageEditContextBuilder,
    SceneLightingContextBuilder,
    SubjectContextBuilder,
)
from app.ai.contracts_v1 import (
    AICapability,
    AIJobStatus,
    AIStageUXState,
    AssetInputV01,
    CaptureAnalysisInputV01,
    CaptureQACandidateV01,
    EnhancementQAInputV01,
    ImageEditRequestV01,
    LiveCapabilityCatalogV01,
    PhotographyDirectorInputV02,
    RealityPlusAssetCandidateV01,
    SceneLightingUnderstandingInputV01,
    SubjectUnderstandingInputV01,
    canonical_hash,
)
from app.ai.orchestrator import AIJobOrchestrator
from app.ai.provider_ports import FakeImageEditProvider, FakeLunaProvider, ProviderPortError, ReplayProvider
from app.ai.validation_pipeline import CandidateValidationPipeline, ValidationSpec, evidence_ref_validator, no_business_errors


ROOT = Path(__file__).resolve().parents[3]


def asset(ref: str, asset_class: str = "AI_ANALYSIS_PREVIEW", representation: str = "AI_ANALYSIS_PREVIEW", authorized: bool = True) -> AssetInputV01:
    return AssetInputV01(
        asset_ref=ref, asset_class=asset_class, mime_type="image/jpeg", sha256="a" * 64,
        width=1024, height=768, representation=representation, provider_send_authorized=authorized,
    )


def capture_input(plan: str = "shotplan://1", revision: int = 4) -> CaptureAnalysisInputV01:
    return CaptureAnalysisInputV01(
        session_id="session-1", session_revision=revision, request_id=f"capture-request-{plan[-1]}",
        capture_asset_ref="asset://capture-1", selected_shot_plan_ref=plan, live_target_ref="livetarget://1",
        subject_profile_ref="subject://1", scene_understanding_ref="scene://1",
    )


def capture_context(plan: str = "shotplan://1", revision: int = 4):
    return CaptureAnalysisContextBuilder().build(
        capture_input(plan, revision), active_session_revision=revision,
        assets=[asset("asset://capture-preview", "CAPTURE_MASTER")], evidence_refs=["evidence://capture-1"],
        prompt_version="capture-analysis-v1", provider_adapter_version="fake-v1",
    )


def qa_output(ref: str = "evidence://capture-1") -> dict:
    return {
        "contract_version": "0.1.0", "candidate_id": "qa-provider-candidate", "disposition": "CANDIDATE",
        "decision": "ACCEPT", "problems": [], "evidence_refs": [ref], "confidence": 0.95,
    }


def qa_spec(validator=evidence_ref_validator) -> ValidationSpec:
    return ValidationSpec(CaptureQACandidateV01, "QA", "CAPTURE_QA_PROMOTION_GATE_V01", validator)


def test_all_required_context_builders_enforce_minimal_media_and_hash_telemetry():
    subject = SubjectContextBuilder().build(
        SubjectUnderstandingInputV01(session_id="s", session_revision=1, request_id="subject-r", subject_asset_ref="asset://subject"),
        active_session_revision=1, assets=[asset("asset://subject", "SUBJECT_REFERENCE")], evidence_refs=[], prompt_version="subject-v1", provider_adapter_version="fake-v1",
    )
    scene = SceneLightingContextBuilder().build(
        SceneLightingUnderstandingInputV01(session_id="s", session_revision=1, request_id="scene-r", scene_view_asset_refs=["asset://scene"], view_refs=["view://1"], composition_anchor_refs=["anchor://1"]),
        active_session_revision=1, assets=[asset("asset://scene", "SCENE_VIEW")], evidence_refs=["view://1", "anchor://1"], prompt_version="scene-v1", provider_adapter_version="fake-v1",
    )
    catalog = LiveCapabilityCatalogV01(catalog_version="live-v4", framing_profiles=["HEAD_SHOULDERS", "FULL_BODY"], target_zones=["LEFT_TOP", "CENTER"], coarse_body_orientation=True, live_runtime_version="V4")
    director_payload = {"schema_version": "0.1.0", "bounded": True}
    director = DirectorContextBuilder().build(
        PhotographyDirectorInputV02(session_id="s", session_revision=1, request_id="director-r", subject_profile_ref="subject://1", scene_understanding_ref="scene://1", lighting_evidence_ref="light://1", user_intent={"vibe": "natural"}, live_capability_catalog=catalog, compact_director_input_v01=director_payload, input_hash=canonical_hash(director_payload)),
        active_session_revision=1, assets=[], evidence_refs=["subject://1", "scene://1", "light://1"], prompt_version="director-v1", provider_adapter_version="fake-v1",
    )
    edit = ImageEditContextBuilder().build(
        ImageEditRequestV01(session_id="s", session_revision=1, request_id="edit-r", edit_master_asset_ref="asset://edit", edit_plan_ref="editplan://1", preserve_constraints=["IDENTITY"]),
        active_session_revision=1, assets=[asset("asset://edit", "EDIT_MASTER", "EDIT_MASTER")], evidence_refs=["editplan://1"], prompt_version="image-edit-v1", provider_adapter_version="fake-v1",
    )
    enhancement = EnhancementQAContextBuilder().build(
        EnhancementQAInputV01(session_id="s", session_revision=1, request_id="enhance-r", original_asset_ref="asset://original", enhanced_candidate_asset_ref="asset://enhanced", edit_plan_ref="editplan://1"),
        active_session_revision=1, assets=[asset("asset://original", "CAPTURE_MASTER"), asset("asset://enhanced", "REALITY_PLUS_CANDIDATE")], evidence_refs=["editplan://1"], prompt_version="enhance-v1", provider_adapter_version="fake-v1",
    )
    contexts = [subject, scene, director, capture_context(revision=1), edit, enhancement]
    assert [item.request.capability for item in contexts] == list(AICapability)
    assert [item.request.context_telemetry.asset_count for item in contexts] == [1, 1, 0, 1, 1, 2]
    assert all(len(item.request.input_hash) == 64 and item.request.context_telemetry.context_bytes > 0 for item in contexts)
    assert all("PhotographySession" not in json.dumps(item.request.context_payload) for item in contexts)


def test_context_builder_rejects_unauthorized_media_stale_revision_and_wrong_counts():
    node = SubjectUnderstandingInputV01(session_id="s", session_revision=2, request_id="r", subject_asset_ref="asset://subject")
    builder = SubjectContextBuilder()
    with pytest.raises(ContextBuildError, match="AI_MEDIA_UNAUTHORIZED"):
        builder.build(node, active_session_revision=2, assets=[asset("asset://subject", "SUBJECT_REFERENCE", authorized=False)], evidence_refs=[], prompt_version="v1", provider_adapter_version="v1")
    with pytest.raises(ContextBuildError, match="STALE_SESSION_REVISION"):
        builder.build(node, active_session_revision=3, assets=[asset("asset://subject", "SUBJECT_REFERENCE")], evidence_refs=[], prompt_version="v1", provider_adapter_version="v1")
    with pytest.raises(ContextBuildError, match="AI_MEDIA_COUNT_INVALID"):
        builder.build(node, active_session_revision=2, assets=[], evidence_refs=[], prompt_version="v1", provider_adapter_version="v1")


def test_fake_happy_path_creates_candidate_but_requires_explicit_promotion():
    built = capture_context()
    orchestrator = AIJobOrchestrator()
    orchestrator.set_active_revision("session-1", 4)
    job, replayed = orchestrator.submit(built.request)
    assert replayed is False and job.status == AIJobStatus.QUEUED
    provider = FakeLunaProvider({AICapability.CAPTURE_ANALYSIS: qa_output()})
    result = orchestrator.execute(job.job_id, provider, qa_spec(), business_context={"known_evidence_refs": ["evidence://capture-1"]})
    assert result.status == "CANDIDATE_READY"
    candidate = orchestrator.candidates[result.candidate_refs[0]]
    assert candidate.disposition == "CANDIDATE"
    promoted = orchestrator.promote_candidate(candidate.candidate_id, session_id="session-1", active_revision=4, promotion_gate="CAPTURE_QA_PROMOTION_GATE_V01")
    assert promoted.disposition == "ACCEPTED"
    assert provider.call_count == 1


def test_replay_is_deterministic_and_contains_normalized_output_only():
    built = capture_context()
    provider = ReplayProvider({(AICapability.CAPTURE_ANALYSIS, built.request.input_hash): qa_output()})
    outputs = []
    for _ in range(2):
        orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4)
        job, _ = orchestrator.submit(built.request.model_copy(update={"job_id": f"job-{_}"}))
        result = orchestrator.execute(job.job_id, provider, qa_spec(), business_context={"known_evidence_refs": ["evidence://capture-1"]})
        outputs.append(result.normalized_output)
    assert outputs[0] == outputs[1] == qa_output()
    assert provider.call_count == 2
    assert "image_bytes" not in repr(provider.recordings)


def test_fake_image_edit_port_returns_candidate_not_domain_authority():
    node = ImageEditRequestV01(
        session_id="session-edit", session_revision=2, request_id="edit-r", edit_master_asset_ref="asset://edit",
        edit_plan_ref="editplan://approved", preserve_constraints=["IDENTITY", "CLOTHING", "POSE", "SCENE", "WEATHER", "VIEWPOINT"],
    )
    built = ImageEditContextBuilder().build(
        node, active_session_revision=2, assets=[asset("asset://edit", "EDIT_MASTER", "EDIT_MASTER")],
        evidence_refs=["editplan://approved"], prompt_version="edit-v1", provider_adapter_version="fake-v1",
    )
    output = {
        "contract_version": "0.1.0", "candidate_id": "rp-provider-candidate", "disposition": "CANDIDATE",
        "source_asset_ref": "asset://edit", "derived_asset_ref": "asset://derived",
        "edit_plan_ref": "editplan://approved", "lineage_hash": "c" * 64,
    }
    orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-edit", 2)
    job, _ = orchestrator.submit(built.request)
    spec = ValidationSpec(RealityPlusAssetCandidateV01, "ENHANCEMENT", "REALITY_PLUS_ASSET_PROMOTION_GATE_V01", no_business_errors)
    result = orchestrator.execute(job.job_id, FakeImageEditProvider(output), spec, business_context={})
    assert result.status == "CANDIDATE_READY"
    assert orchestrator.candidates[result.candidate_refs[0]].disposition == "CANDIDATE"


def test_transient_timeout_retries_once_then_fails_with_error_contract():
    built = capture_context(); orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4); job, _ = orchestrator.submit(built.request)
    provider = FakeLunaProvider(faults={AICapability.CAPTURE_ANALYSIS: ProviderPortError("AI_PROVIDER_TIMEOUT", retryable=True)})
    result = orchestrator.execute(job.job_id, provider, qa_spec(), business_context={"known_evidence_refs": []})
    assert result.status == "FAILED"
    assert result.error["error_code"] == "AI_PROVIDER_TIMEOUT"
    assert orchestrator.jobs[job.job_id].retry_count == 1
    assert provider.call_count == 2


@pytest.mark.parametrize("output,expected", [
    ("{bad", "AI_PROVIDER_MALFORMED_JSON"),
    ({"contract_version": "0.1.0"}, "AI_PROVIDER_SCHEMA_INVALID"),
    (qa_output("evidence://invented"), "AI_UNKNOWN_EVIDENCE_REF"),
])
def test_malformed_schema_invalid_and_unknown_evidence_fail_validation(output, expected):
    outcome = CandidateValidationPipeline().validate(output, qa_spec(), candidate_id="candidate-1", producer_id="fake", evidence_refs=[], business_context={"known_evidence_refs": ["evidence://capture-1"]})
    assert outcome.status == "FAILED"
    assert any(expected in error for error in outcome.errors)


@pytest.mark.parametrize("output,expected", [
    ("{bad", "AI_PROVIDER_MALFORMED_JSON"),
    ({"contract_version": "0.1.0"}, "AI_PROVIDER_SCHEMA_INVALID"),
    (qa_output("evidence://invented"), "AI_UNKNOWN_EVIDENCE_REF"),
])
def test_orchestrator_preserves_normalized_validation_error_code(output, expected):
    built = capture_context(); orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4)
    job, _ = orchestrator.submit(built.request)
    provider = FakeLunaProvider({AICapability.CAPTURE_ANALYSIS: output})
    result = orchestrator.execute(job.job_id, provider, qa_spec(), business_context={"known_evidence_refs": ["evidence://capture-1"]})
    assert result.status == "FAILED"
    assert result.error["error_code"] == expected


class ViewOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    view_ref: str


def test_invalid_view_ref_is_a_business_validation_failure():
    spec = ValidationSpec(ViewOutput, "TARGET", "VIEW_GATE", lambda output, context: [] if output.view_ref in context["known_view_refs"] else ["AI_UNKNOWN_VIEW_REF"])
    outcome = CandidateValidationPipeline().validate({"view_ref": "view://invented"}, spec, candidate_id="c", producer_id="fake", evidence_refs=[], business_context={"known_view_refs": ["view://1"]})
    assert outcome.errors == ("AI_UNKNOWN_VIEW_REF",)


def test_duplicate_idempotency_key_returns_same_job_without_new_event_or_call():
    built = capture_context(); orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4)
    first, replayed_a = orchestrator.submit(built.request)
    event_count = len(orchestrator.events)
    second, replayed_b = orchestrator.submit(built.request)
    assert first.job_id == second.job_id
    assert (replayed_a, replayed_b) == (False, True)
    assert len(orchestrator.events) == event_count


def test_latest_input_supersedes_older_job_and_stale_result_cannot_promote():
    first_context = capture_context("shotplan://1")
    second_context = capture_context("shotplan://2")
    orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4)
    first, _ = orchestrator.submit(first_context.request)
    second, _ = orchestrator.submit(second_context.request)
    assert first.status == AIJobStatus.SUPERSEDED
    assert first.superseded_by_job_id == second.job_id
    result = orchestrator.execute(first.job_id, FakeLunaProvider({AICapability.CAPTURE_ANALYSIS: qa_output()}), qa_spec(), business_context={"known_evidence_refs": ["evidence://capture-1"]})
    assert result.status == "SUPERSEDED"


def test_completed_candidate_cannot_promote_after_newer_same_revision_input():
    first_context = capture_context("shotplan://1")
    orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4)
    first, _ = orchestrator.submit(first_context.request)
    result = orchestrator.execute(first.job_id, FakeLunaProvider({AICapability.CAPTURE_ANALYSIS: qa_output()}), qa_spec(), business_context={"known_evidence_refs": ["evidence://capture-1"]})
    candidate_id = result.candidate_refs[0]
    second_context = capture_context("shotplan://2")
    orchestrator.submit(second_context.request)
    with pytest.raises(ValueError, match="AI_RESULT_SUPERSEDED"):
        orchestrator.promote_candidate(candidate_id, session_id="session-1", active_revision=4, promotion_gate="CAPTURE_QA_PROMOTION_GATE_V01")
    assert orchestrator.candidates[candidate_id].disposition == "SUPERSEDED"


def test_revision_advance_supersedes_queued_work_and_old_revision_is_rejected():
    built = capture_context(revision=4); orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4)
    job, _ = orchestrator.submit(built.request)
    orchestrator.set_active_revision("session-1", 5)
    assert job.status == AIJobStatus.SUPERSEDED
    stale = capture_context(revision=4).request.model_copy(update={"job_id": "stale-job", "idempotency_key": "b" * 64})
    stale_job, _ = orchestrator.submit(stale)
    assert stale_job.status == AIJobStatus.SUPERSEDED


def test_api_style_ports_expose_command_query_event_without_main_routes():
    built = capture_context(); orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4); ports = InProcessAIPortSurface(orchestrator)
    job, _ = ports.create_job(built.request)
    assert ports.get_job(job.job_id).job_id == job.job_id
    assert ports.events_after()[0].event_type == "ai.job.queued"
    assert ports.cancel_job(job.job_id).status == AIJobStatus.CANCELLED


def test_latency_waterfall_and_real_stage_ux_events_are_emitted_without_percentages():
    built = capture_context(); orchestrator = AIJobOrchestrator(); orchestrator.set_active_revision("session-1", 4); job, _ = orchestrator.submit(built.request)
    result = orchestrator.execute(job.job_id, FakeLunaProvider({AICapability.CAPTURE_ANALYSIS: qa_output()}), qa_spec(), business_context={"known_evidence_refs": ["evidence://capture-1"]})
    latency = result.latency.model_dump()
    assert {"provider_ms", "validate_ms", "schema_validate_ms", "business_validate_ms", "end_to_end_ms"} <= set(latency)
    assert latency["validate_ms"] == round(latency["schema_validate_ms"] + latency["business_validate_ms"], 3)
    assert all(value >= 0 for key, value in latency.items() if key != "schema_version")
    assert all(event.ux_state in AIStageUXState for event in orchestrator.events)
    assert all("percent" not in json.dumps(event.model_dump(mode="json")).lower() for event in orchestrator.events)


def test_no_real_provider_or_hot_camera_live_ai_coupling_exists():
    provider_source = (ROOT / "apps" / "api" / "app" / "ai" / "provider_ports.py").read_text(encoding="utf-8")
    for token in ("requests.", "httpx.", "openai.", "anthropic.", "google.generativeai", "Authorization", "Bearer "):
        assert token not in provider_source
    hot_paths = [
        ROOT / "apps" / "client" / "src" / "platform" / "wechatCameraState.ts",
        ROOT / "apps" / "client" / "src" / "platform" / "captureViewport.ts",
        ROOT / "apps" / "api" / "app" / "scene_spatial" / "solver.py",
    ]
    forbidden = ("FakeLunaProvider", "ReplayProvider", "LunaProviderPort", "ImageEditProviderPort", "AIJobOrchestrator")
    assert all(token not in path.read_text(encoding="utf-8") for path in hot_paths for token in forbidden)


def test_common_ai_contracts_are_versioned_and_cataloged():
    catalog = json.loads((ROOT / "packages" / "contracts" / "catalog.json").read_text(encoding="utf-8"))
    entries = [item for item in catalog["contracts"] if item["domain"] == "AI_INFRASTRUCTURE"]
    expected = {
        "AIJobV01", "AIRequestEnvelopeV01", "AIResultEnvelopeV01", "AIProviderProvenanceV01",
        "AILatencyWaterfallV01", "AIContextTelemetryV01", "AIMediaPolicyV01", "AIJobEventV01",
    }
    assert {item["name"] for item in entries} == expected
    for item in entries:
        schema = json.loads((ROOT / "packages" / "contracts" / item["path"]).read_text(encoding="utf-8"))
        assert schema["$schema"] == catalog["schema_dialect"]
        assert schema["$id"] == item["schema_id"]
        assert schema["title"] == item["name"]
        assert schema["description"]
        assert schema["properties"]["schema_version"]["const"] == item["version"]
        assert "schema_version" in schema["required"]
