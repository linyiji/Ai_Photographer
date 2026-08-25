from __future__ import annotations

from .gateway import AIProviderGateway
from .models import AIProviderRequest
from .providers import FixtureAIProvider
from .qa import CaptureQAAdapter
from .registry import ModelRegistry, PromptRegistry


class AICapabilityLab:
    MODES = (
        "FAKE_ONLY",
        "SHADOW_REAL",
        "REAL_SELECTED",
        "PROVIDER_UNAVAILABLE",
        "PROVIDER_TIMEOUT",
        "PROVIDER_INVALID_OUTPUT",
        "PROVIDER_RATE_LIMIT",
    )

    def __init__(self, prompts: PromptRegistry, models: ModelRegistry, provider_config: dict):
        self.prompts = prompts
        self.models = models
        self.provider_config = provider_config

    def descriptors(self) -> list[dict]:
        return [
            {
                "mode": mode,
                "explicit_enable_required": mode != "FAKE_ONLY",
                "normal_replay_provider_calls": 0,
            }
            for mode in self.MODES
        ]

    def run(self, mode: str, fixture_signal: str = "already_good") -> dict:
        if mode not in self.MODES:
            raise ValueError(f"Unknown AI Lab mode: {mode}")
        if mode == "FAKE_ONLY":
            return {
                "mode": mode,
                "status": "PASS",
                "selected_adapter": "FAKE_INTERNAL_ONLY",
                "provider_calls": 0,
            }
        if mode == "REAL_SELECTED":
            return {
                "mode": mode,
                "status": "SOURCE_REQUIRED",
                "selected_adapter": "FAKE_INTERNAL_ONLY",
                "provider_calls": 0,
                "provider_config": self.provider_config,
            }
        fault = mode if mode.startswith("PROVIDER_") else None
        provider = FixtureAIProvider(self.models.get("fixture-capture-qa-v1"), fault=fault)
        gateway = AIProviderGateway(provider, max_retries=1)
        request = AIProviderRequest(
            capability="QA",
            prompt=self.prompts.get("capture-qa-shadow"),
            model=self.models.get("fixture-capture-qa-v1"),
            input_asset_ids=["repo-asset://m06/controlled-lab.jpg"],
            context={"fixture_signal": fixture_signal},
            image_bytes=b"\xff\xd8\xffxfx-m06-lab",
            mime_type="image/jpeg",
        )
        result = gateway.execute(CaptureQAAdapter(), request)
        return {
            "mode": mode,
            "status": "PASS" if mode == "SHADOW_REAL" and result.validation_status == "PASS" else "CONTROLLED_FAILURE",
            "selected_adapter": "FAKE_INTERNAL_ONLY",
            "provider_calls": provider.call_count,
            "shadow_state_mutation": 0,
            "candidate_result": result.model_dump(mode="json"),
        }
