from __future__ import annotations

import time
from datetime import UTC, datetime
from uuid import uuid4

from .config import ProviderConfig
from .models import (
    AICapabilityAdapter,
    AIExecutionRecord,
    AIProvider,
    AIProviderRequest,
    CandidateResult,
)
from .providers import ProviderFailure


class AIProviderGateway:
    SAFE_TRANSIENT_ERRORS = {"TIMEOUT", "RATE_LIMIT", "PROVIDER_UNAVAILABLE", "NETWORK"}

    def __init__(self, provider: AIProvider, max_retries: int = 1):
        self.provider = provider
        self.max_retries = max(0, min(max_retries, 2))
        self.records: list[AIExecutionRecord] = []

    def execute(
        self,
        adapter: AICapabilityAdapter,
        request: AIProviderRequest,
        session_id: str | None = None,
    ) -> CandidateResult:
        started_at = datetime.now(UTC)
        started = time.perf_counter()
        response = None
        candidate = None
        errors: list[str] = []
        error_classification = None
        retries = 0
        status = "FAIL"
        while True:
            try:
                response = self.provider.execute(request)
                candidate, errors = adapter.parse_candidate(response, request)
                status = "PASS" if not errors else "INVALID_OUTPUT"
                error_classification = None if not errors else "INVALID_OUTPUT"
                break
            except ProviderFailure as exc:
                error_classification = exc.classification
                errors = [ProviderConfig.redact(str(exc))]
                if (
                    exc.retryable
                    and exc.classification in self.SAFE_TRANSIENT_ERRORS
                    and retries < self.max_retries
                ):
                    retries += 1
                    continue
                status = "FAIL"
                break
        ended_at = datetime.now(UTC)
        record = AIExecutionRecord(
            execution_id=f"ai-exec-{uuid4().hex[:16]}",
            session_id=session_id,
            capability=adapter.capability,
            provider_id=self.provider.provider_id,
            model_id=request.model.model_id,
            model_version=request.model.model_version,
            prompt_version=request.prompt.version,
            started_at=started_at,
            ended_at=ended_at,
            latency_ms=round((time.perf_counter() - started) * 1000, 3),
            result_status=status,
            retry_count=retries,
            input_asset_ids=list(request.input_asset_ids),
            output_candidate_id=candidate.get("candidate_id") if candidate else None,
            provider_request_id=response.provider_request_id if response else None,
            usage=response.usage if response else {},
            estimated_cost=response.estimated_cost if response else None,
            error_classification=error_classification,
        )
        self.records.append(record)
        return CandidateResult(
            candidate=candidate,
            execution=record,
            validation_status="PASS" if candidate and not errors else "FAIL",
            validation_errors=errors,
        )

    def safe_records(self) -> list[dict]:
        return [item.model_dump(mode="json") for item in self.records]
