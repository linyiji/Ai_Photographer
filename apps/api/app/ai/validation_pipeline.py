from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Any, Callable, Literal

from pydantic import BaseModel, ValidationError

from .contracts_v1 import DomainCandidateEnvelopeV01


BusinessValidator = Callable[[BaseModel, dict[str, Any]], list[str]]


@dataclass(frozen=True)
class ValidationSpec:
    output_type: type[BaseModel]
    candidate_kind: Literal["REALITY_OBSERVATION", "TARGET", "QA", "ENHANCEMENT"]
    promotion_gate: str
    business_validator: BusinessValidator


@dataclass(frozen=True)
class ValidationOutcome:
    status: str
    candidate: DomainCandidateEnvelopeV01 | None
    errors: tuple[str, ...]
    normalized_output: dict[str, Any] | None
    normalize_ms: float
    schema_validate_ms: float
    business_validate_ms: float


class CandidateValidationPipeline:
    def validate(
        self,
        raw_output: dict[str, Any] | str | None,
        spec: ValidationSpec,
        *,
        candidate_id: str,
        producer_id: str,
        evidence_refs: list[str],
        business_context: dict[str, Any],
        confidence: float | None = None,
    ) -> ValidationOutcome:
        normalize_started = time.perf_counter()
        try:
            if raw_output is None:
                raise ValueError("AI_PROVIDER_OUTPUT_MISSING")
            normalized = json.loads(raw_output) if isinstance(raw_output, str) else json.loads(json.dumps(raw_output))
            if not isinstance(normalized, dict):
                raise ValueError("AI_PROVIDER_OUTPUT_NOT_OBJECT")
        except (json.JSONDecodeError, ValueError) as exc:
            return ValidationOutcome("FAILED", None, ("AI_PROVIDER_MALFORMED_JSON" if isinstance(exc, json.JSONDecodeError) else str(exc),), None, self._elapsed(normalize_started), 0, 0)
        normalize_ms = self._elapsed(normalize_started)
        schema_started = time.perf_counter()
        try:
            parsed = spec.output_type.model_validate(normalized)
        except ValidationError as exc:
            errors = tuple(f"AI_PROVIDER_SCHEMA_INVALID:{'.'.join(map(str, item['loc']))}:{item['type']}" for item in exc.errors())
            return ValidationOutcome("FAILED", None, errors, normalized, normalize_ms, self._elapsed(schema_started), 0)
        schema_ms = self._elapsed(schema_started)
        business_started = time.perf_counter()
        errors = tuple(sorted(set(spec.business_validator(parsed, business_context))))
        business_ms = self._elapsed(business_started)
        if errors:
            return ValidationOutcome("FAILED", None, errors, normalized, normalize_ms, schema_ms, business_ms)
        candidate = DomainCandidateEnvelopeV01(
            candidate_id=candidate_id,
            candidate_kind=spec.candidate_kind,
            producer={"producer_id": producer_id, "producer_type": "AI_CAPABILITY"},
            confidence=confidence,
            evidence_refs=sorted(set(evidence_refs)),
            payload=parsed.model_dump(mode="json"),
            disposition="CANDIDATE",
            promotion_gate=spec.promotion_gate,
        )
        return ValidationOutcome("PASS", candidate, (), normalized, normalize_ms, schema_ms, business_ms)

    @staticmethod
    def _elapsed(started: float) -> float:
        return round((time.perf_counter() - started) * 1000, 3)


def no_business_errors(output: BaseModel, context: dict[str, Any]) -> list[str]:
    return []


def evidence_ref_validator(output: BaseModel, context: dict[str, Any]) -> list[str]:
    known = set(context.get("known_evidence_refs", []))
    serialized = output.model_dump(mode="json")
    refs: list[str] = []

    def collect(value: Any) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                if key == "evidence_refs" and isinstance(item, list):
                    refs.extend(str(ref) for ref in item)
                else:
                    collect(item)
        elif isinstance(value, list):
            for item in value:
                collect(item)

    collect(serialized)
    return [f"AI_UNKNOWN_EVIDENCE_REF:{ref}" for ref in refs if ref not in known]
