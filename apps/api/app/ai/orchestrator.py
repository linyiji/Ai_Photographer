from __future__ import annotations

import time
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from .contracts_v1 import (
    AICapability,
    AIJobEventV01,
    AIJobStatus,
    AIJobV01,
    AILatencyWaterfallV01,
    AIRequestEnvelopeV01,
    AIResultEnvelopeV01,
    AIStageUXState,
    DomainCandidateEnvelopeV01,
    LATENCY_CLASS_BY_CAPABILITY,
)
from .provider_ports import LunaProviderPort, ImageEditProviderPort, ProviderPortError
from .validation_pipeline import CandidateValidationPipeline, ValidationSpec


TERMINAL = {AIJobStatus.COMPLETED, AIJobStatus.FAILED, AIJobStatus.SUPERSEDED, AIJobStatus.CANCELLED}
TRANSITIONS = {
    AIJobStatus.QUEUED: {AIJobStatus.PREPARING, AIJobStatus.CANCELLED, AIJobStatus.SUPERSEDED},
    AIJobStatus.PREPARING: {AIJobStatus.RUNNING, AIJobStatus.FAILED, AIJobStatus.CANCELLED, AIJobStatus.SUPERSEDED},
    AIJobStatus.RUNNING: {AIJobStatus.VALIDATING, AIJobStatus.FAILED, AIJobStatus.CANCELLED, AIJobStatus.SUPERSEDED},
    AIJobStatus.VALIDATING: {AIJobStatus.COMPLETED, AIJobStatus.FAILED, AIJobStatus.SUPERSEDED},
}


def normalized_error(code: str, capability: AICapability, retryable: bool, category: str = "PROVIDER") -> dict[str, Any]:
    return {
        "schema_version": "1.0.0",
        "error_code": code,
        "category": category,
        "severity": "ERROR",
        "retryable": retryable,
        "user_message_key": f"errors.{code.lower()}",
        "developer_context": {"capability": capability.value},
        "session_id": None,
        "correlation_id": None,
        "cause": None,
    }


class AIJobOrchestrator:
    """Standalone in-memory authority baseline. Main integration is intentionally absent."""

    TRANSIENT_PROVIDER_ERRORS = {"AI_PROVIDER_TIMEOUT", "AI_PROVIDER_UNAVAILABLE", "AI_PROVIDER_RATE_LIMIT", "AI_PROVIDER_NETWORK"}

    def __init__(self) -> None:
        self.jobs: dict[str, AIJobV01] = {}
        self.requests: dict[str, AIRequestEnvelopeV01] = {}
        self.results: dict[str, AIResultEnvelopeV01] = {}
        self.candidates: dict[str, DomainCandidateEnvelopeV01] = {}
        self.events: list[AIJobEventV01] = []
        self._idempotency: dict[str, str] = {}
        self._latest_job: dict[tuple[str, AICapability], str] = {}
        self._active_revision: dict[str, int] = {}
        self._active_input: dict[tuple[str, AICapability], str] = {}

    def set_active_revision(self, session_id: str, revision: int) -> None:
        prior = self._active_revision.get(session_id, -1)
        if revision < prior:
            raise ValueError("SESSION_REVISION_REGRESSION")
        self._active_revision[session_id] = revision
        for (job_session, _), job_id in list(self._latest_job.items()):
            job = self.jobs[job_id]
            if job_session == session_id and job.session_revision < revision and job.status not in TERMINAL:
                self._supersede(job, None, "SESSION_REVISION_ADVANCED")

    def submit(self, request: AIRequestEnvelopeV01) -> tuple[AIJobV01, bool]:
        existing_id = self._idempotency.get(request.idempotency_key)
        if existing_id:
            existing_request = self.requests[existing_id]
            if existing_request.input_hash != request.input_hash or existing_request.capability != request.capability:
                raise ValueError("IDEMPOTENCY_KEY_MISMATCH")
            return self.jobs[existing_id], True
        active_revision = self._active_revision.get(request.session_id, request.session_revision)
        self._active_revision.setdefault(request.session_id, active_revision)
        job = AIJobV01(
            job_id=request.job_id,
            request_id=request.request_id,
            session_id=request.session_id,
            session_revision=request.session_revision,
            capability=request.capability,
            latency_class=LATENCY_CLASS_BY_CAPABILITY[request.capability],
            contract_version=request.contract_version,
            prompt_version=request.prompt_version,
            input_hash=request.input_hash,
            idempotency_key=request.idempotency_key,
        )
        self.jobs[job.job_id] = job
        self.requests[job.job_id] = request
        self._idempotency[request.idempotency_key] = job.job_id
        key = (request.session_id, request.capability)
        prior_id = self._latest_job.get(key)
        if prior_id and self.jobs[prior_id].status not in TERMINAL:
            self._supersede(self.jobs[prior_id], job.job_id, "LATEST_INPUT_WINS")
        self._latest_job[key] = job.job_id
        self._active_input[key] = request.input_hash
        if request.session_revision != active_revision:
            self._supersede(job, None, "STALE_SESSION_REVISION")
        else:
            self._emit(job, "ai.job.queued")
        return job, False

    def execute(
        self,
        job_id: str,
        provider: LunaProviderPort | ImageEditProviderPort,
        validation_spec: ValidationSpec,
        *,
        business_context: dict[str, Any],
    ) -> AIResultEnvelopeV01:
        job = self.jobs[job_id]
        request = self.requests[job_id]
        started = time.perf_counter()
        if job.status == AIJobStatus.SUPERSEDED:
            return self._superseded_result(job, request)
        self._transition(job, AIJobStatus.PREPARING, "CONTEXT_READY")
        self._transition(job, AIJobStatus.RUNNING, "PROVIDER_EXECUTION")
        response = None
        while True:
            try:
                response = provider.execute(request)
                break
            except ProviderPortError as exc:
                can_retry = exc.retryable and exc.code in self.TRANSIENT_PROVIDER_ERRORS and job.retry_count < job.max_retries
                if can_retry:
                    job.retry_count += 1
                    self._emit(job, "ai.job.retrying", {"retry_count": job.retry_count, "error_code": exc.code})
                    continue
                error = normalized_error(exc.code, job.capability, exc.retryable)
                return self._fail(job, request, error, started)
        self._transition(job, AIJobStatus.VALIDATING, "OUTPUT_VALIDATION")
        candidate_id = f"candidate-{uuid4().hex[:16]}"
        outcome = CandidateValidationPipeline().validate(
            response.structured_output,
            validation_spec,
            candidate_id=candidate_id,
            producer_id=response.provenance.provider_id,
            evidence_refs=request.evidence_refs,
            business_context=business_context,
        )
        active_key = (job.session_id, job.capability)
        if job.session_revision != self._active_revision[job.session_id] or job.input_hash != self._active_input.get(active_key):
            self._supersede(job, None, "RESULT_STALE_BEFORE_PROMOTION")
            return self._superseded_result(job, request)
        latency = AILatencyWaterfallV01(
            queue_ms=response.queue_ms,
            upload_ms=response.upload_ms,
            provider_ms=response.provider_ms,
            normalize_ms=outcome.normalize_ms,
            validate_ms=round(outcome.schema_validate_ms + outcome.business_validate_ms, 3),
            schema_validate_ms=outcome.schema_validate_ms,
            business_validate_ms=outcome.business_validate_ms,
            end_to_end_ms=round((time.perf_counter() - started) * 1000, 3),
        )
        if outcome.status != "PASS" or outcome.candidate is None:
            first_error = outcome.errors[0].split(":", 1)[0] if outcome.errors else "AI_BUSINESS_VALIDATION_FAILED"
            error_code = first_error if first_error.startswith(("AI_PROVIDER_", "AI_UNKNOWN_")) else "AI_BUSINESS_VALIDATION_FAILED"
            error = normalized_error(error_code, job.capability, False, "VALIDATION")
            error["developer_context"]["errors"] = list(outcome.errors)
            return self._fail(job, request, error, started, latency)
        self.candidates[outcome.candidate.candidate_id] = outcome.candidate
        result_id = f"ai-result-{uuid4().hex[:16]}"
        result = AIResultEnvelopeV01(
            result_id=result_id,
            job_id=job.job_id,
            request_id=job.request_id,
            session_id=job.session_id,
            session_revision=job.session_revision,
            capability=job.capability,
            input_hash=job.input_hash,
            status="CANDIDATE_READY",
            candidate_refs=[outcome.candidate.candidate_id],
            normalized_output=outcome.normalized_output,
            provenance=response.provenance,
            latency=latency,
            context_telemetry=request.context_telemetry,
        )
        self.results[result_id] = result
        job.result_ref = result_id
        self._transition(job, AIJobStatus.COMPLETED, "CANDIDATE_READY")
        return result

    def cancel(self, job_id: str) -> AIJobV01:
        job = self.jobs[job_id]
        if job.status in TERMINAL:
            return job
        self._transition(job, AIJobStatus.CANCELLED, "CANCELLED")
        return job

    def promote_candidate(self, candidate_id: str, *, session_id: str, active_revision: int, promotion_gate: str) -> DomainCandidateEnvelopeV01:
        candidate = self.candidates[candidate_id]
        matching_result = next(result for result in self.results.values() if candidate_id in result.candidate_refs)
        active_key = (matching_result.session_id, matching_result.capability)
        if (
            matching_result.session_id != session_id
            or matching_result.session_revision != active_revision
            or self._active_revision.get(session_id) != active_revision
            or self._active_input.get(active_key) != matching_result.input_hash
        ):
            candidate.disposition = "SUPERSEDED"
            raise ValueError("AI_RESULT_SUPERSEDED")
        if candidate.promotion_gate != promotion_gate:
            raise ValueError("PROMOTION_GATE_MISMATCH")
        candidate.disposition = "ACCEPTED"
        return candidate

    def _transition(self, job: AIJobV01, target: AIJobStatus, stage: str) -> None:
        if target not in TRANSITIONS.get(job.status, set()):
            raise ValueError(f"AI_JOB_TRANSITION_INVALID:{job.status.value}->{target.value}")
        job.status = target
        job.stage = stage
        if target == AIJobStatus.RUNNING:
            job.started_at = datetime.now(UTC)
        if target in TERMINAL:
            job.completed_at = datetime.now(UTC)
        self._emit(job, f"ai.job.{target.value.lower()}")

    def _supersede(self, job: AIJobV01, superseded_by: str | None, reason: str) -> None:
        if job.status in TERMINAL:
            return
        job.status = AIJobStatus.SUPERSEDED
        job.stage = "SUPERSEDED"
        job.completed_at = datetime.now(UTC)
        job.superseded_by_job_id = superseded_by
        self._emit(job, "ai.job.superseded", {"reason": reason, "superseded_by_job_id": superseded_by})

    def _fail(self, job: AIJobV01, request: AIRequestEnvelopeV01, error: dict[str, Any], started: float, latency: AILatencyWaterfallV01 | None = None) -> AIResultEnvelopeV01:
        result_id = f"ai-result-{uuid4().hex[:16]}"
        resolved_latency = latency or AILatencyWaterfallV01(end_to_end_ms=round((time.perf_counter() - started) * 1000, 3))
        result = AIResultEnvelopeV01(
            result_id=result_id, job_id=job.job_id, request_id=job.request_id, session_id=job.session_id,
            session_revision=job.session_revision, capability=job.capability, input_hash=job.input_hash,
            status="FAILED", error=error, latency=resolved_latency, context_telemetry=request.context_telemetry,
        )
        self.results[result_id] = result
        job.result_ref = result_id
        job.error = error
        self._transition(job, AIJobStatus.FAILED, "FAILED")
        return result

    def _superseded_result(self, job: AIJobV01, request: AIRequestEnvelopeV01) -> AIResultEnvelopeV01:
        result = AIResultEnvelopeV01(
            result_id=f"ai-result-{uuid4().hex[:16]}", job_id=job.job_id, request_id=job.request_id,
            session_id=job.session_id, session_revision=job.session_revision, capability=job.capability,
            input_hash=job.input_hash, status="SUPERSEDED", error=normalized_error("AI_RESULT_SUPERSEDED", job.capability, False, "WORKFLOW"),
            latency=AILatencyWaterfallV01(), context_telemetry=request.context_telemetry,
        )
        self.results[result.result_id] = result
        return result

    def _emit(self, job: AIJobV01, event_type: str, payload: dict[str, Any] | None = None) -> None:
        self.events.append(
            AIJobEventV01(
                event_id=f"ai-event-{uuid4().hex[:16]}", event_type=event_type, job_id=job.job_id,
                session_id=job.session_id, session_revision=job.session_revision, capability=job.capability,
                status=job.status, ux_state=ux_state_for(job.capability, job.status), payload=payload or {},
            )
        )


def ux_state_for(capability: AICapability, status: AIJobStatus) -> AIStageUXState:
    if status == AIJobStatus.FAILED:
        return AIStageUXState.FAILED
    if capability == AICapability.PHOTOGRAPHY_DIRECTOR and status == AIJobStatus.VALIDATING:
        return AIStageUXState.DIRECTOR_VALIDATING
    if capability == AICapability.PHOTOGRAPHY_DIRECTOR and status == AIJobStatus.COMPLETED:
        return AIStageUXState.PLANS_READY
    return {
        AICapability.SUBJECT_UNDERSTANDING: AIStageUXState.SUBJECT_ANALYZING,
        AICapability.SCENE_LIGHTING_UNDERSTANDING: AIStageUXState.SCENE_LIGHT_ANALYZING,
        AICapability.PHOTOGRAPHY_DIRECTOR: AIStageUXState.DIRECTOR_GENERATING,
        AICapability.CAPTURE_ANALYSIS: AIStageUXState.CAPTURE_CHECKING,
        AICapability.IMAGE_EDIT: AIStageUXState.REALITY_PLUS_EDITING,
        AICapability.ENHANCEMENT_QA: AIStageUXState.REALITY_PLUS_VALIDATING,
    }[capability]
