from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any, Mapping, Protocol

from pydantic import BaseModel, ConfigDict, Field, ValidationError


class MultimodalStage(StrEnum):
    SUBJECT_UNDERSTANDING = "SUBJECT_UNDERSTANDING"
    SCENE_LIGHTING_UNDERSTANDING = "SCENE_LIGHTING_UNDERSTANDING"
    PHOTOGRAPHY_DIRECTION = "PHOTOGRAPHY_DIRECTION"


class ProviderGateConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    provider_id: str
    model_id: str
    model_version: str
    secret_env_reference: str
    credential_present: bool
    supported_stages: list[MultimodalStage]
    timeout_seconds: float = Field(gt=0, le=120)

    @classmethod
    def from_environment(cls, environment: Mapping[str, str] | None = None) -> "ProviderGateConfig | None":
        values = environment if environment is not None else os.environ
        names = ("XFX_DIRECTOR_PROVIDER_ID", "XFX_DIRECTOR_MODEL_ID", "XFX_DIRECTOR_MODEL_VERSION", "XFX_DIRECTOR_SECRET_ENV")
        if not all(values.get(name) for name in names):
            return None
        secret_ref = values["XFX_DIRECTOR_SECRET_ENV"]
        supported = [MultimodalStage(item.strip()) for item in values.get("XFX_DIRECTOR_STAGES", ",".join(item.value for item in MultimodalStage)).split(",") if item.strip()]
        return cls(
            provider_id=values["XFX_DIRECTOR_PROVIDER_ID"], model_id=values["XFX_DIRECTOR_MODEL_ID"], model_version=values["XFX_DIRECTOR_MODEL_VERSION"],
            secret_env_reference=secret_ref, credential_present=bool(values.get(secret_ref)), supported_stages=supported,
            timeout_seconds=float(values.get("XFX_DIRECTOR_TIMEOUT_SECONDS", "45")),
        )

    @property
    def authorized(self) -> bool:
        return self.credential_present and set(self.supported_stages) == set(MultimodalStage)

    def safe_projection(self) -> dict[str, Any]:
        return {
            "provider_id": self.provider_id, "model_id": self.model_id, "model_version": self.model_version,
            "credential_source": "ENV", "credential_present": self.credential_present,
            "supported_stages": [item.value for item in self.supported_stages], "timeout_seconds": self.timeout_seconds,
            "authorized": self.authorized,
        }


class ProviderImageInput(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, extra="forbid")
    asset_ref: str = Field(min_length=1, max_length=240)
    mime_type: str = Field(pattern=r"^image/(?:jpeg|png|webp)$")
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    provider_send_authorized: bool
    image_bytes: bytes = Field(repr=False, exclude=True)


@dataclass(frozen=True)
class MultimodalProviderRequest:
    request_id: str
    stage: MultimodalStage
    structured_context: dict[str, Any]
    images: tuple[ProviderImageInput, ...]
    prompt_spec: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class MultimodalProviderResponse:
    structured_output: dict[str, Any] | str
    provider_request_id: str | None = None
    usage: dict[str, int | float] = field(default_factory=dict)
    estimated_cost: float | None = None


class MultimodalProviderTransport(Protocol):
    def execute(self, request: MultimodalProviderRequest) -> MultimodalProviderResponse: ...


class ProviderCallError(Exception):
    def __init__(self, classification: str, message: str, retryable: bool = False):
        super().__init__(message)
        self.classification = classification
        self.retryable = retryable


def error_contract(code: str, category: str, retryable: bool, context: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": "1.0.0", "error_code": code, "category": category, "severity": "ERROR", "retryable": retryable,
        "user_message_key": f"errors.{code.lower()}", "developer_context": context, "session_id": None, "correlation_id": context.get("request_id"), "cause": None,
    }


@dataclass(frozen=True)
class StageExecutionResult:
    stage: MultimodalStage
    status: str
    candidate: BaseModel | None
    error: dict[str, Any] | None
    record: dict[str, Any]


class MultimodalStageGateway:
    def __init__(self, config: ProviderGateConfig | None, transport: MultimodalProviderTransport | None):
        self.config = config
        self.transport = transport

    def execute(self, request: MultimodalProviderRequest, output_type: type[BaseModel]) -> StageExecutionResult:
        started = time.perf_counter()
        image_manifest = [{"asset_ref": item.asset_ref, "mime_type": item.mime_type, "sha256": item.sha256} for item in request.images]
        base_record: dict[str, Any] = {
            "request_id": request.request_id, "stage": request.stage.value, "provider_id": self.config.provider_id if self.config else "NOT_CONFIGURED",
            "model": f"{self.config.model_id}@{self.config.model_version}" if self.config else "NOT_CONFIGURED",
            "provider_image_input_count": len(request.images), "provider_raw_video": 0, "provider_frame_stream": 0, "image_manifest": image_manifest,
            "usage": {}, "estimated_cost": None, "provider_request_id": None,
            "prompt_id": request.prompt_spec.get("prompt_id", "NOT_CONFIGURED"), "prompt_version": request.prompt_spec.get("version", "NOT_CONFIGURED"),
        }
        if self.config is None or not self.config.authorized or self.transport is None:
            error = error_contract("DIRECTOR_PROVIDER_NOT_CONFIGURED", "PROVIDER", False, {"request_id": request.request_id, "stage": request.stage.value})
            return self._finish(request.stage, "MANUAL_REVIEW_REQUIRED", None, error, base_record, started)
        if request.stage not in self.config.supported_stages:
            error = error_contract("DIRECTOR_STAGE_UNSUPPORTED", "PROVIDER", False, {"request_id": request.request_id, "stage": request.stage.value})
            return self._finish(request.stage, "FAIL", None, error, base_record, started)
        if any(not image.provider_send_authorized for image in request.images):
            error = error_contract("DIRECTOR_MEDIA_NOT_AUTHORIZED", "AUTHORITY", False, {"request_id": request.request_id, "stage": request.stage.value})
            return self._finish(request.stage, "FAIL", None, error, base_record, started)
        try:
            response = self.transport.execute(request)
            payload = json.loads(response.structured_output) if isinstance(response.structured_output, str) else response.structured_output
            candidate = output_type.model_validate(payload)
            base_record.update({"usage": dict(response.usage), "estimated_cost": response.estimated_cost, "provider_request_id": response.provider_request_id})
            return self._finish(request.stage, "PASS", candidate, None, base_record, started)
        except json.JSONDecodeError:
            error = error_contract("DIRECTOR_PROVIDER_MALFORMED_JSON", "VALIDATION", False, {"request_id": request.request_id, "stage": request.stage.value})
        except ValidationError as exc:
            error = error_contract("DIRECTOR_PROVIDER_SCHEMA_INVALID", "VALIDATION", False, {"request_id": request.request_id, "stage": request.stage.value, "validation_errors": [{"type": item["type"], "loc": list(item["loc"])} for item in exc.errors()]})
        except ProviderCallError as exc:
            classification = exc.classification if exc.classification in {"TIMEOUT", "PROVIDER_UNAVAILABLE", "RATE_LIMIT", "NETWORK"} else "PROVIDER_ERROR"
            code = {
                "TIMEOUT": "DIRECTOR_PROVIDER_TIMEOUT",
                "PROVIDER_UNAVAILABLE": "DIRECTOR_PROVIDER_UNAVAILABLE",
                "RATE_LIMIT": "DIRECTOR_PROVIDER_RATE_LIMIT",
                "NETWORK": "DIRECTOR_PROVIDER_NETWORK",
                "PROVIDER_ERROR": "DIRECTOR_PROVIDER_ERROR",
            }[classification]
            error = error_contract(code, "NETWORK" if classification in {"TIMEOUT", "NETWORK"} else "PROVIDER", exc.retryable, {"request_id": request.request_id, "stage": request.stage.value})
        return self._finish(request.stage, "FAIL", None, error, base_record, started)

    @staticmethod
    def _finish(stage: MultimodalStage, status: str, candidate: BaseModel | None, error: dict[str, Any] | None, record: dict[str, Any], started: float) -> StageExecutionResult:
        safe_record = {**record, "status": status, "latency_ms": round((time.perf_counter() - started) * 1000, 3)}
        return StageExecutionResult(stage, status, candidate, error, safe_record)


class ReplayMultimodalTransport:
    """Sanitized structured-output replay. It stores no media bytes or secrets."""

    def __init__(self, recordings: dict[tuple[str, MultimodalStage], MultimodalProviderResponse | ProviderCallError]):
        self.recordings = recordings

    def execute(self, request: MultimodalProviderRequest) -> MultimodalProviderResponse:
        value = self.recordings.get((request.request_id, request.stage))
        if value is None:
            raise ProviderCallError("PROVIDER_UNAVAILABLE", "Replay recording unavailable", retryable=False)
        if isinstance(value, ProviderCallError):
            raise value
        return value


class DirectorCandidateSetOutputV01(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: str = Field(pattern=r"^0\.1\.0$")
    candidates: list[dict[str, Any]] = Field(min_length=1, max_length=4)
