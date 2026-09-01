from __future__ import annotations

import copy
from dataclasses import dataclass, field
from typing import Any, Callable, Protocol

from .contracts_v1 import (
    AICapability,
    AIProviderProvenanceV01,
    AIRequestEnvelopeV01,
    ProviderMode,
)


class ProviderPortError(Exception):
    def __init__(self, code: str, *, retryable: bool = False):
        super().__init__(code)
        self.code = code
        self.retryable = retryable


@dataclass(frozen=True)
class NormalizedProviderResponseV01:
    structured_output: dict[str, Any] | str | None
    provenance: AIProviderProvenanceV01
    provider_ms: float = 0.0
    upload_ms: float = 0.0
    queue_ms: float = 0.0
    usage: dict[str, int | float] = field(default_factory=dict)
    estimated_cost: float | None = None
    cache_status: str = "NOT_SUPPORTED"


class LunaProviderPort(Protocol):
    mode: ProviderMode

    def execute(self, request: AIRequestEnvelopeV01) -> NormalizedProviderResponseV01: ...


class ImageEditProviderPort(Protocol):
    mode: ProviderMode

    def execute(self, request: AIRequestEnvelopeV01) -> NormalizedProviderResponseV01: ...


ReplayOutput = dict[str, Any] | str | None
FixtureHandler = ReplayOutput | Callable[[AIRequestEnvelopeV01], ReplayOutput]


def _provenance(mode: ProviderMode, capability: AICapability, prompt_version: str, request_id: str) -> AIProviderProvenanceV01:
    return AIProviderProvenanceV01(
        mode=mode,
        provider_id="XFX_FAKE_PROVIDER" if mode == ProviderMode.FAKE else "XFX_REPLAY_PROVIDER",
        model_id=f"{mode.value.lower()}-{capability.value.lower()}",
        model_snapshot="deterministic-v1",
        provider_adapter_version="ai-provider-port-v0.1.0",
        prompt_version=prompt_version,
        supports_structured_output=True,
        supports_prompt_cache=False,
        supports_usage_reporting=False,
        supports_cost_reporting=False,
        provider_request_id=f"{mode.value.lower()}-{request_id}",
    )


class FakeLunaProvider:
    mode = ProviderMode.FAKE

    def __init__(self, handlers: dict[AICapability, FixtureHandler] | None = None, faults: dict[AICapability, ProviderPortError] | None = None):
        self.handlers = handlers or {}
        self.faults = faults or {}
        self.call_count = 0

    def execute(self, request: AIRequestEnvelopeV01) -> NormalizedProviderResponseV01:
        if request.capability == AICapability.IMAGE_EDIT:
            raise ProviderPortError("AI_PROVIDER_CAPABILITY_UNSUPPORTED")
        self.call_count += 1
        if request.capability in self.faults:
            raise self.faults[request.capability]
        handler = self.handlers.get(request.capability)
        if handler is None:
            raise ProviderPortError("AI_FAKE_FIXTURE_NOT_FOUND")
        output = handler(request) if callable(handler) else copy.deepcopy(handler)
        return NormalizedProviderResponseV01(output, _provenance(self.mode, request.capability, request.prompt_version, request.request_id))


class FakeImageEditProvider:
    mode = ProviderMode.FAKE

    def __init__(self, handler: FixtureHandler | None = None, fault: ProviderPortError | None = None):
        self.handler = handler
        self.fault = fault
        self.call_count = 0

    def execute(self, request: AIRequestEnvelopeV01) -> NormalizedProviderResponseV01:
        self.call_count += 1
        if request.capability != AICapability.IMAGE_EDIT:
            raise ProviderPortError("AI_PROVIDER_CAPABILITY_UNSUPPORTED")
        if self.fault:
            raise self.fault
        if self.handler is None:
            raise ProviderPortError("AI_FAKE_FIXTURE_NOT_FOUND")
        output = self.handler(request) if callable(self.handler) else copy.deepcopy(self.handler)
        return NormalizedProviderResponseV01(output, _provenance(self.mode, request.capability, request.prompt_version, request.request_id))


class ReplayProvider:
    mode = ProviderMode.REPLAY

    def __init__(self, recordings: dict[tuple[AICapability, str], ReplayOutput], faults: dict[tuple[AICapability, str], ProviderPortError] | None = None):
        self.recordings = copy.deepcopy(recordings)
        self.faults = faults or {}
        self.call_count = 0

    def execute(self, request: AIRequestEnvelopeV01) -> NormalizedProviderResponseV01:
        self.call_count += 1
        key = (request.capability, request.input_hash)
        if key in self.faults:
            raise self.faults[key]
        if key not in self.recordings:
            raise ProviderPortError("AI_REPLAY_NOT_FOUND")
        return NormalizedProviderResponseV01(
            copy.deepcopy(self.recordings[key]),
            _provenance(self.mode, request.capability, request.prompt_version, request.request_id),
        )
