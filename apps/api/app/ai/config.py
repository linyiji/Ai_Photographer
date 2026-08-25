from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class ProviderConfig:
    provider_id: str | None
    model_id: str | None
    model_version: str | None
    base_url: str | None
    secret_env_reference: str | None
    timeout_seconds: float
    max_retries: int
    supported_capabilities: tuple[str, ...]
    credential_present: bool

    @classmethod
    def from_environment(cls, environment: Mapping[str, str] | None = None) -> "ProviderConfig":
        values = environment if environment is not None else os.environ
        secret_reference = values.get("XFX_AI_SECRET_ENV")
        credential_present = bool(secret_reference and values.get(secret_reference))
        capabilities = tuple(
            item.strip().upper()
            for item in values.get("XFX_AI_CAPABILITIES", "QA").split(",")
            if item.strip()
        )
        return cls(
            provider_id=values.get("XFX_AI_PROVIDER_ID"),
            model_id=values.get("XFX_AI_MODEL_ID"),
            model_version=values.get("XFX_AI_MODEL_VERSION"),
            base_url=values.get("XFX_AI_BASE_URL"),
            secret_env_reference=secret_reference,
            timeout_seconds=float(values.get("XFX_AI_TIMEOUT_SECONDS", "20")),
            max_retries=max(0, min(int(values.get("XFX_AI_MAX_RETRIES", "1")), 2)),
            supported_capabilities=capabilities,
            credential_present=credential_present,
        )

    @property
    def configured(self) -> bool:
        return bool(
            self.provider_id
            and self.model_id
            and self.model_version
            and self.secret_env_reference
            and self.credential_present
            and "QA" in self.supported_capabilities
        )

    def safe_projection(self) -> dict:
        return {
            "provider_id": self.provider_id or "NOT_CONFIGURED",
            "model_id": self.model_id or "NOT_CONFIGURED",
            "model_version": self.model_version or "NOT_CONFIGURED",
            "base_url_configured": bool(self.base_url),
            "credential_source": "ENV" if self.secret_env_reference else "NOT_CONFIGURED",
            "credential_present": self.credential_present,
            "timeout_seconds": self.timeout_seconds,
            "max_retries": self.max_retries,
            "supported_capabilities": list(self.supported_capabilities),
            "configured": self.configured,
        }

    @staticmethod
    def redact(value: str, environment: Mapping[str, str] | None = None) -> str:
        values = environment if environment is not None else os.environ
        result = value
        for name, secret in values.items():
            if ("KEY" in name or "TOKEN" in name or "SECRET" in name) and secret:
                result = result.replace(secret, "[REDACTED]")
        return result
