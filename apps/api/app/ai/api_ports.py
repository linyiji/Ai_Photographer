from __future__ import annotations

from typing import Protocol

from .contracts_v1 import AIJobEventV01, AIJobV01, AIRequestEnvelopeV01, DomainCandidateEnvelopeV01
from .orchestrator import AIJobOrchestrator


class AICommandPort(Protocol):
    def create_job(self, request: AIRequestEnvelopeV01) -> tuple[AIJobV01, bool]: ...
    def cancel_job(self, job_id: str) -> AIJobV01: ...
    def promote_candidate(self, candidate_id: str, session_id: str, active_revision: int, promotion_gate: str) -> DomainCandidateEnvelopeV01: ...


class AIQueryPort(Protocol):
    def get_job(self, job_id: str) -> AIJobV01: ...
    def get_candidate(self, candidate_id: str) -> DomainCandidateEnvelopeV01: ...


class AIEventPort(Protocol):
    def events_after(self, offset: int = 0) -> list[AIJobEventV01]: ...


class InProcessAIPortSurface:
    """API-shaped in-process surface; it is not wired into Main routes in this task."""

    def __init__(self, orchestrator: AIJobOrchestrator):
        self.orchestrator = orchestrator

    def create_job(self, request: AIRequestEnvelopeV01) -> tuple[AIJobV01, bool]:
        return self.orchestrator.submit(request)

    def cancel_job(self, job_id: str) -> AIJobV01:
        return self.orchestrator.cancel(job_id)

    def promote_candidate(self, candidate_id: str, session_id: str, active_revision: int, promotion_gate: str) -> DomainCandidateEnvelopeV01:
        return self.orchestrator.promote_candidate(candidate_id, session_id=session_id, active_revision=active_revision, promotion_gate=promotion_gate)

    def get_job(self, job_id: str) -> AIJobV01:
        return self.orchestrator.jobs[job_id]

    def get_candidate(self, candidate_id: str) -> DomainCandidateEnvelopeV01:
        return self.orchestrator.candidates[candidate_id]

    def events_after(self, offset: int = 0) -> list[AIJobEventV01]:
        return list(self.orchestrator.events[offset:])
