from __future__ import annotations

from datetime import datetime
from typing import Any, Protocol

from pydantic import BaseModel, ConfigDict, Field


class PromptSpec(BaseModel):
    prompt_id: str
    version: str
    capability: str
    expected_schema: str
    reality_rules: list[str]
    safety_rules: list[str]
    fallback_behavior: str


class ModelSpec(BaseModel):
    model_spec_id: str
    provider_id: str
    model_id: str
    model_version: str
    image_support: bool
    structured_output_support: bool
    status: str


class AIProviderRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    capability: str
    prompt: PromptSpec
    model: ModelSpec
    input_asset_ids: list[str]
    context: dict[str, Any] = Field(default_factory=dict)
    image_bytes: bytes = Field(repr=False, exclude=True)
    mime_type: str


class AIProviderResponse(BaseModel):
    provider_request_id: str | None = None
    model_identifier: str
    structured_output: dict[str, Any]
    usage: dict[str, int | float] = Field(default_factory=dict)
    estimated_cost: float | None = None


class AIExecutionRecord(BaseModel):
    execution_id: str
    session_id: str | None
    capability: str
    provider_id: str
    model_id: str
    model_version: str
    prompt_version: str
    started_at: datetime
    ended_at: datetime
    latency_ms: float
    result_status: str
    retry_count: int
    input_asset_ids: list[str]
    output_candidate_id: str | None
    provider_request_id: str | None
    usage: dict[str, int | float]
    estimated_cost: float | None
    error_classification: str | None


class CandidateResult(BaseModel):
    candidate: dict[str, Any] | None
    execution: AIExecutionRecord
    validation_status: str
    validation_errors: list[str] = Field(default_factory=list)


class AIProvider(Protocol):
    provider_id: str
    model: ModelSpec

    def execute(self, request: AIProviderRequest) -> AIProviderResponse: ...


class AICapabilityAdapter(Protocol):
    capability: str

    def parse_candidate(
        self,
        response: AIProviderResponse,
        request: AIProviderRequest,
    ) -> tuple[dict[str, Any] | None, list[str]]: ...

