from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


def canonical_hash(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


class StrictJobContract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AIJobStatus(StrEnum):
    QUEUED = "QUEUED"
    PREPARING = "PREPARING"
    RUNNING = "RUNNING"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SUPERSEDED = "SUPERSEDED"
    CANCELLED = "CANCELLED"


class AIRequestEnvelopeV01(StrictJobContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    request_id: str
    job_id: str
    session_id: str
    session_revision: int = Field(ge=0)
    capability: Literal["PHOTOGRAPHY_DIRECTOR"] = "PHOTOGRAPHY_DIRECTOR"
    contract_version: Literal["0.2.0"] = "0.2.0"
    prompt_version: str
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    idempotency_key: str = Field(pattern=r"^[0-9a-f]{64}$")
    context_payload: dict[str, Any]

    @classmethod
    def from_director_input(cls, *, request_id: str, job_id: str, session_id: str, session_revision: int, prompt_version: str, director_input: dict[str, Any]) -> "AIRequestEnvelopeV01":
        input_hash = canonical_hash(director_input)
        idempotency_key = canonical_hash({
            "capability": "PHOTOGRAPHY_DIRECTOR", "session_revision": session_revision,
            "input_hash": input_hash, "prompt_version": prompt_version,
        })
        return cls(
            request_id=request_id, job_id=job_id, session_id=session_id, session_revision=session_revision,
            prompt_version=prompt_version, input_hash=input_hash, idempotency_key=idempotency_key,
            context_payload=director_input,
        )


class AIJobV01(StrictJobContract):
    schema_version: Literal["0.1.0"] = "0.1.0"
    job_id: str
    request_id: str
    session_id: str
    session_revision: int = Field(ge=0)
    capability: Literal["PHOTOGRAPHY_DIRECTOR"] = "PHOTOGRAPHY_DIRECTOR"
    status: AIJobStatus = AIJobStatus.QUEUED
    input_hash: str = Field(pattern=r"^[0-9a-f]{64}$")
    idempotency_key: str = Field(pattern=r"^[0-9a-f]{64}$")
    retry_count: int = Field(default=0, ge=0, le=1)
    max_retries: int = Field(default=1, ge=0, le=1)
    result_candidate_ids: list[str] = Field(default_factory=list)
    superseded_by_job_id: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None


class DirectorJobOrchestratorV03:
    """Selective migration of accepted AI I/O idempotency and supersession semantics."""

    TERMINAL = {AIJobStatus.COMPLETED, AIJobStatus.FAILED, AIJobStatus.SUPERSEDED, AIJobStatus.CANCELLED}

    def __init__(self) -> None:
        self.jobs: dict[str, AIJobV01] = {}
        self.requests: dict[str, AIRequestEnvelopeV01] = {}
        self._idempotency: dict[str, str] = {}
        self._active_revision: dict[str, int] = {}
        self._active_input: dict[str, str] = {}
        self._latest_job: dict[str, str] = {}

    def set_active_revision(self, session_id: str, revision: int) -> None:
        previous = self._active_revision.get(session_id, -1)
        if revision < previous:
            raise ValueError("SESSION_REVISION_REGRESSION")
        self._active_revision[session_id] = revision
        for job in self.jobs.values():
            if job.session_id == session_id and job.session_revision < revision and job.status not in self.TERMINAL:
                self._supersede(job, None)

    def submit(self, request: AIRequestEnvelopeV01) -> tuple[AIJobV01, bool]:
        existing_id = self._idempotency.get(request.idempotency_key)
        if existing_id:
            existing_request = self.requests[existing_id]
            if existing_request.input_hash != request.input_hash:
                raise ValueError("IDEMPOTENCY_KEY_MISMATCH")
            return self.jobs[existing_id], True
        active_revision = self._active_revision.setdefault(request.session_id, request.session_revision)
        job = AIJobV01(
            job_id=request.job_id, request_id=request.request_id, session_id=request.session_id,
            session_revision=request.session_revision, input_hash=request.input_hash, idempotency_key=request.idempotency_key,
        )
        self.jobs[job.job_id] = job
        self.requests[job.job_id] = request
        self._idempotency[request.idempotency_key] = job.job_id
        if request.session_revision != active_revision:
            self._supersede(job, None)
            return job, False
        previous_id = self._latest_job.get(request.session_id)
        if previous_id and self.jobs[previous_id].status not in self.TERMINAL:
            self._supersede(self.jobs[previous_id], job.job_id)
        self._latest_job[request.session_id] = job.job_id
        self._active_input[request.session_id] = request.input_hash
        return job, False

    def start(self, job_id: str) -> AIJobV01:
        job = self.jobs[job_id]
        if job.status != AIJobStatus.QUEUED:
            raise ValueError("AI_JOB_NOT_QUEUED")
        job.status = AIJobStatus.RUNNING
        return job

    def begin_validation(self, job_id: str) -> AIJobV01:
        job = self.jobs[job_id]
        if job.status != AIJobStatus.RUNNING:
            raise ValueError("AI_JOB_NOT_RUNNING")
        job.status = AIJobStatus.VALIDATING
        return job

    def complete(self, job_id: str, candidate_ids: list[str]) -> AIJobV01:
        job = self.jobs[job_id]
        current = self._active_revision.get(job.session_id)
        if job.status != AIJobStatus.VALIDATING:
            raise ValueError("AI_JOB_NOT_VALIDATING")
        if job.session_revision != current or job.input_hash != self._active_input.get(job.session_id):
            self._supersede(job, None)
            return job
        job.status = AIJobStatus.COMPLETED
        job.result_candidate_ids = list(candidate_ids)
        job.completed_at = datetime.now(UTC)
        return job

    def assert_promotable(self, job_id: str) -> None:
        job = self.jobs[job_id]
        if (
            job.status != AIJobStatus.COMPLETED
            or job.session_revision != self._active_revision.get(job.session_id)
            or job.input_hash != self._active_input.get(job.session_id)
        ):
            raise ValueError("AI_RESULT_SUPERSEDED")

    @staticmethod
    def bounded_retry_allowed(job: AIJobV01, *, retryable: bool) -> bool:
        if retryable and job.retry_count < job.max_retries:
            job.retry_count += 1
            return True
        return False

    @staticmethod
    def _supersede(job: AIJobV01, superseded_by: str | None) -> None:
        job.status = AIJobStatus.SUPERSEDED
        job.superseded_by_job_id = superseded_by
        job.completed_at = datetime.now(UTC)
