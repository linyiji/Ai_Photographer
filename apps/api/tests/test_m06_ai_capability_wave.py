from __future__ import annotations

import importlib
import json
from pathlib import Path

import httpx
import pytest

from app.ai import (
    AICapabilityLab,
    AIProviderGateway,
    CaptureQAAdapter,
    CaptureQAEvaluator,
    CaptureQAShadowService,
    FixtureAIProvider,
    ModelRegistry,
    PromptRegistry,
    ProviderConfig,
)
from app.ai.models import AIProviderRequest
from app.service import DomainError


ROOT = Path(__file__).resolve().parents[3]
PROMPTS = ROOT / "apps" / "api" / "app" / "ai" / "registry" / "prompts.json"
MODELS = ROOT / "apps" / "api" / "app" / "ai" / "registry" / "models.json"
CASES = ROOT / "packages" / "scenario-fixtures" / "m06-capture-qa-evaluation-v1.json"
PNG = b"\x89PNG\r\n\x1a\n" + b"xfx-m06-controlled-capture" * 4


@pytest.fixture()
async def client(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH", str(tmp_path / "m06.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT", str(tmp_path / "assets"))
    monkeypatch.setenv("XFX_PRODUCT_MODE", "INTERNAL_DEMO")
    monkeypatch.delenv("XFX_LAB_MODE", raising=False)
    import app.main as main

    importlib.reload(main)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=main.app),
        base_url="http://test",
    ) as value:
        yield value, main


@pytest.fixture()
async def lab_client(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH", str(tmp_path / "m06-lab.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT", str(tmp_path / "assets"))
    monkeypatch.setenv("XFX_LAB_MODE", "1")
    monkeypatch.setenv("XFX_LAB_ROOT", str(tmp_path / "lab"))
    monkeypatch.setenv("XFX_ENVIRONMENT", "development")
    import app.main as main

    importlib.reload(main)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=main.app),
        base_url="http://test",
    ) as value:
        yield value


def registries():
    return PromptRegistry(PROMPTS), ModelRegistry(MODELS)


def request(signal: str = "already_good") -> AIProviderRequest:
    prompts, models = registries()
    return AIProviderRequest(
        capability="QA",
        prompt=prompts.get("capture-qa-shadow"),
        model=models.get("fixture-capture-qa-v1"),
        input_asset_ids=["repo-asset://m06/test.jpg"],
        context={"fixture_signal": signal},
        image_bytes=b"\xff\xd8\xffcontrolled",
        mime_type="image/jpeg",
    )


async def command(client, session_id, index, name, payload=None):
    return await client.post(
        f"/sessions/{session_id}/actions",
        headers={"Idempotency-Key": f"m06-{index}-{name}"},
        json={"action": name, "payload": payload or {}},
    )


async def to_capture(client):
    session_id = (await client.post("/sessions")).json()["session_id"]
    actions = [
        ("SELECT_SHOOTING_RELATION", {"shooting_relation": "FRIEND"}),
        ("CONFIRM_DEVICE_MODE", {"device_mode": "SINGLE"}),
        ("ACCEPT_REALITY", {}),
        ("GENERATE_TARGETS", {}),
        ("SELECT_TARGET", {"candidate_id": "target-cinematic"}),
        ("ACCEPT_SHOT_DIRECTION", {}),
        ("ENTER_CAPTURE_WINDOW", {}),
    ]
    for index, (name, payload) in enumerate(actions):
        assert (await command(client, session_id, index, name, payload)).status_code == 200
    return session_id


def test_provider_config_requires_explicit_identity_model_and_env_credential():
    missing = ProviderConfig.from_environment({})
    assert missing.configured is False
    assert missing.safe_projection()["credential_source"] == "NOT_CONFIGURED"
    configured = ProviderConfig.from_environment(
        {
            "XFX_AI_PROVIDER_ID": "provider-a",
            "XFX_AI_MODEL_ID": "vision-a",
            "XFX_AI_MODEL_VERSION": "2026-08",
            "XFX_AI_SECRET_ENV": "PROVIDER_A_KEY",
            "PROVIDER_A_KEY": "top-secret",
            "XFX_AI_CAPABILITIES": "QA",
        }
    )
    assert configured.configured is True
    projection = configured.safe_projection()
    assert projection["credential_source"] == "ENV"
    assert "top-secret" not in json.dumps(projection)


def test_secret_redaction_removes_secret_values(monkeypatch):
    monkeypatch.setenv("M06_TEST_API_KEY", "fixture-secret")
    assert ProviderConfig.redact("Authorization: fixture-secret") == "Authorization: [REDACTED]"


def test_prompt_and_model_registry_are_versioned_and_structured():
    prompts, models = registries()
    prompt = prompts.get("capture-qa-shadow")
    model = models.get("fixture-capture-qa-v1")
    assert prompt.version == "1.0.0" and prompt.capability == "QA"
    assert prompt.expected_schema.endswith("CandidateEnvelope.schema.json")
    assert model.image_support and model.structured_output_support


def test_gateway_records_non_secret_provenance_and_valid_candidate():
    _, models = registries()
    provider = FixtureAIProvider(models.get("fixture-capture-qa-v1"))
    gateway = AIProviderGateway(provider)
    result = gateway.execute(CaptureQAAdapter(), request(), session_id="session-test")
    assert result.validation_status == "PASS"
    assert result.candidate["disposition"] == "CANDIDATE"
    assert result.execution.session_id == "session-test"
    assert result.execution.provider_id == "XFX_FIXTURE_PROVIDER"
    assert result.execution.prompt_version == "1.0.0"
    assert "image_bytes" not in json.dumps(gateway.safe_records())


@pytest.mark.parametrize(
    ("fault", "classification", "expected_calls"),
    [
        ("PROVIDER_TIMEOUT", "TIMEOUT", 2),
        ("PROVIDER_RATE_LIMIT", "RATE_LIMIT", 2),
        ("PROVIDER_UNAVAILABLE", "PROVIDER_UNAVAILABLE", 2),
        ("PROVIDER_AUTH", "AUTH", 1),
    ],
)
def test_gateway_normalizes_faults_and_bounds_retries(fault, classification, expected_calls):
    _, models = registries()
    provider = FixtureAIProvider(models.get("fixture-capture-qa-v1"), fault=fault)
    result = AIProviderGateway(provider, max_retries=1).execute(CaptureQAAdapter(), request())
    assert result.validation_status == "FAIL"
    assert result.execution.error_classification == classification
    assert provider.call_count == expected_calls


def test_invalid_structured_output_is_controlled_and_not_promoted():
    _, models = registries()
    provider = FixtureAIProvider(
        models.get("fixture-capture-qa-v1"),
        fault="PROVIDER_INVALID_OUTPUT",
    )
    result = AIProviderGateway(provider).execute(CaptureQAAdapter(), request())
    assert result.validation_status == "FAIL"
    assert result.candidate is None
    assert "invalid_technical_result" in result.validation_errors


def test_controlled_evaluation_has_twenty_plus_cases_and_passes_fixture_gates():
    prompts, models = registries()
    provider = FixtureAIProvider(models.get("fixture-capture-qa-v1"))
    result = CaptureQAEvaluator(
        CASES,
        AIProviderGateway(provider),
        prompts,
        models,
    ).run()
    metrics = result["metrics"]
    assert metrics["case_count"] == 22
    assert metrics["schema_valid_rate"] == 1.0
    assert metrics["disposition_accuracy"] >= 0.85
    assert metrics["critical_must_detect_recall"] >= 0.9
    assert metrics["must_not_invent_violation_rate"] == 0
    assert metrics["retake_false_negative_count"] == 0
    assert metrics["real_provider_calls"] == 0
    assert result["status"] == "PASS"


@pytest.mark.anyio
async def test_shadow_uses_confirmed_asset_and_does_not_mutate_session(client):
    http, main = client
    session_id = await to_capture(http)
    upload = (
        await http.post(
            "/assets/uploads",
            files={"file": ("controlled.png", PNG, "image/png")},
        )
    ).json()
    assert (
        await command(
            http,
            session_id,
            7,
            "CREATE_CAPTURE",
            {"uploaded_asset_id": upload["asset_id"]},
        )
    ).status_code == 200
    before = (await http.get(f"/sessions/{session_id}")).json()
    prompts, models = registries()
    provider = FixtureAIProvider(models.get("fixture-capture-qa-v1"))
    shadow = CaptureQAShadowService(
        main.service,
        main.asset_storage,
        AIProviderGateway(provider),
        prompts,
        models,
    )
    result = shadow.run(session_id, "blur")
    after = (await http.get(f"/sessions/{session_id}")).json()
    assert result["shadow_state_mutation"] == 0
    assert result["candidate_result"]["candidate"]["payload"]["technical_result"] == "RETAKE_MICRO"
    assert before == after
    assert upload["asset_id"] in result["candidate_result"]["execution"]["input_asset_ids"]


@pytest.mark.anyio
async def test_shadow_rejects_unconfirmed_asset_before_provider_call(client):
    http, main = client
    session_id = await to_capture(http)
    prompts, models = registries()
    provider = FixtureAIProvider(models.get("fixture-capture-qa-v1"))
    shadow = CaptureQAShadowService(
        main.service,
        main.asset_storage,
        AIProviderGateway(provider),
        prompts,
        models,
    )
    with pytest.raises(DomainError) as error:
        shadow.run(session_id)
    assert error.value.code == "UNCONFIRMED_ASSET"
    assert provider.call_count == 0


@pytest.mark.anyio
async def test_runtime_truth_keeps_fake_qa_selected_without_provider(client):
    http, _ = client
    capabilities = (await http.get("/capabilities")).json()
    readiness = (await http.get("/runtime/readiness?mode=INTERNAL_DEMO")).json()
    assert capabilities["qa_selected_adapter"] == "FAKE_INTERNAL_ONLY"
    assert capabilities["real_provider_configured"] is False
    assert readiness["capabilities"]["qa"]["implementation"] == "FAKE_INTERNAL_ONLY"
    assert readiness["public_production_ready"] is False


@pytest.mark.anyio
async def test_ai_lab_modes_are_explicit_and_default_replay_is_provider_free(lab_client):
    modes = (await lab_client.get("/__lab__/ai-capability-modes")).json()
    assert {item["mode"] for item in modes} == set(AICapabilityLab.MODES)
    assert all(item["normal_replay_provider_calls"] == 0 for item in modes)
    fake = (await lab_client.post("/__lab__/ai-capability-modes/FAKE_ONLY/run")).json()
    real = (await lab_client.post("/__lab__/ai-capability-modes/REAL_SELECTED/run")).json()
    shadow = (await lab_client.post("/__lab__/ai-capability-modes/SHADOW_REAL/run")).json()
    assert fake["provider_calls"] == 0 and fake["status"] == "PASS"
    assert real["provider_calls"] == 0 and real["status"] == "SOURCE_REQUIRED"
    assert shadow["status"] == "PASS" and shadow["shadow_state_mutation"] == 0


@pytest.mark.anyio
@pytest.mark.parametrize(
    "mode",
    [
        "PROVIDER_UNAVAILABLE",
        "PROVIDER_TIMEOUT",
        "PROVIDER_INVALID_OUTPUT",
        "PROVIDER_RATE_LIMIT",
    ],
)
async def test_ai_lab_faults_are_controlled(lab_client, mode):
    result = (await lab_client.post(f"/__lab__/ai-capability-modes/{mode}/run")).json()
    assert result["status"] == "CONTROLLED_FAILURE"
    assert result["selected_adapter"] == "FAKE_INTERNAL_ONLY"
    assert result["shadow_state_mutation"] == 0
