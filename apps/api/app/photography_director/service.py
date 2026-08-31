from __future__ import annotations

from pydantic import ValidationError

from .contracts import PhotographyDirectorInputV01
from .port import DirectorResult, PhotographyDirectorPort
from .validation import validate_candidate, validate_candidate_set


class PhotographyDirectorService:
    """Validation and governance boundary. It owns no Main or Live state."""

    def __init__(self, adapter: PhotographyDirectorPort):
        self.adapter = adapter

    def propose(self, raw_input: dict[str, object]) -> DirectorResult:
        request_id = str(raw_input.get("request_id", "UNKNOWN"))
        try:
            source = PhotographyDirectorInputV01.model_validate(raw_input)
        except ValidationError as exc:
            return DirectorResult(request_id, "0.1.0", self.adapter.mode, "INVALID_INPUT", error={"code": "DIRECTOR_INPUT_INVALID", "details": exc.errors(include_url=False)})
        try:
            raw_candidates = self.adapter.propose(source)
        except Exception as exc:
            return DirectorResult(source.request_id, "0.1.0", self.adapter.mode, "FAILED", error={"code": type(exc).__name__.upper(), "message": str(exc)})
        accepted = []
        rejected: list[dict[str, object]] = []
        for index, raw in enumerate(raw_candidates):
            candidate, errors = validate_candidate(raw, source)
            if candidate is None or errors:
                rejected.append({"index": index, "candidate_id": raw.get("candidate_id"), "errors": errors})
            else:
                accepted.append(candidate)
        set_errors = validate_candidate_set(accepted)
        if set_errors:
            rejected.append({"index": "SET", "candidate_id": None, "errors": set_errors})
        status = "CANDIDATES_READY" if not rejected else "VALIDATION_FAILED"
        return DirectorResult(
            source.request_id,
            "0.1.0",
            self.adapter.mode,
            status,
            tuple(accepted) if status == "CANDIDATES_READY" else (),
            tuple(rejected),
            {"external_provider_calls": 0, "selection_performed": False, "spatial_level": source.spatial_evidence_optional.status.value if source.spatial_evidence_optional else "ABSENT"},
            None if status == "CANDIDATES_READY" else {"code": "DIRECTOR_CANDIDATE_VALIDATION_FAILED"},
        )
