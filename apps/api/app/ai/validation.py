from __future__ import annotations

from typing import Any


ALLOWED_RESULTS = {
    "ACCEPT",
    "ACCEPT_WITH_REPAIR",
    "RETAKE_MICRO",
    "RETAKE_POSE",
    "RETAKE_FRAMING",
    "RETAKE_POSITION",
    "REPLAN",
}
FORBIDDEN_REALITY_FACTS = {
    "identity",
    "ethnicity",
    "health",
    "emotion",
    "intent",
    "precise_location",
    "protected_attribute",
}


def validate_qa_output(output: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if set(output) - {"technical_result", "technical_reasons", "observations", "confidence"}:
        errors.append("unexpected_fields")
    if output.get("technical_result") not in ALLOWED_RESULTS:
        errors.append("invalid_technical_result")
    reasons = output.get("technical_reasons")
    if not isinstance(reasons, list) or not reasons or not all(isinstance(item, str) and item for item in reasons):
        errors.append("invalid_technical_reasons")
    observations = output.get("observations")
    if not isinstance(observations, list) or not all(isinstance(item, str) and item for item in observations):
        errors.append("invalid_observations")
    if isinstance(observations, list) and FORBIDDEN_REALITY_FACTS.intersection(observations):
        errors.append("invented_reality_fact")
    confidence = output.get("confidence")
    if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
        errors.append("invalid_confidence")
    return errors


def validate_candidate_envelope(candidate: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = {
        "schema_version",
        "candidate_id",
        "candidate_kind",
        "created_at",
        "producer",
        "payload",
        "disposition",
    }
    if required - set(candidate):
        errors.append("candidate_required_fields")
    if candidate.get("schema_version") != "1.0.0":
        errors.append("candidate_schema_version")
    if candidate.get("candidate_kind") != "QA":
        errors.append("candidate_kind")
    if candidate.get("disposition") != "CANDIDATE":
        errors.append("candidate_disposition")
    producer = candidate.get("producer")
    if not isinstance(producer, dict) or producer.get("producer_type") != "AI_CAPABILITY":
        errors.append("candidate_producer")
    if isinstance(candidate.get("payload"), dict):
        errors.extend(validate_qa_output(candidate["payload"]))
    else:
        errors.append("candidate_payload")
    return sorted(set(errors))
