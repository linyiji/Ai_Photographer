from __future__ import annotations

import json
from pathlib import Path
from statistics import median

from .gateway import AIProviderGateway
from .models import AIProviderRequest
from .qa import CaptureQAAdapter
from .registry import ModelRegistry, PromptRegistry


class CaptureQAEvaluator:
    def __init__(
        self,
        cases_path: Path,
        gateway: AIProviderGateway,
        prompts: PromptRegistry,
        models: ModelRegistry,
    ):
        self.cases_path = cases_path
        self.cases = json.loads(cases_path.read_text(encoding="utf-8"))["cases"]
        self.gateway = gateway
        self.prompts = prompts
        self.models = models
        self.adapter = CaptureQAAdapter()

    def run(self) -> dict:
        rows = []
        for item in self.cases:
            request = AIProviderRequest(
                capability="QA",
                prompt=self.prompts.get("capture-qa-shadow"),
                model=self.models.get("fixture-capture-qa-v1"),
                input_asset_ids=[item["asset_ref"]],
                context={"fixture_signal": item["fixture_signal"], "case_id": item["case_id"]},
                image_bytes=b"\xff\xd8\xffxfx-m06-controlled-fixture",
                mime_type="image/jpeg",
            )
            result = self.gateway.execute(self.adapter, request)
            payload = result.candidate["payload"] if result.candidate else {}
            observations = set(payload.get("observations", []))
            must_detect = set(item["oracle"]["must_detect"])
            must_not_invent = set(item["oracle"]["must_not_invent"])
            rows.append(
                {
                    "case_id": item["case_id"],
                    "schema_valid": result.validation_status == "PASS",
                    "expected_disposition": item["oracle"]["expected_disposition"],
                    "actual_disposition": payload.get("technical_result"),
                    "must_detect_pass": must_detect <= observations,
                    "invented": sorted(must_not_invent & observations),
                    "critical": item["oracle"]["critical"],
                    "retake_expected": item["oracle"]["expected_disposition"].startswith("RETAKE")
                    or item["oracle"]["expected_disposition"] == "REPLAN",
                    "retake_actual": str(payload.get("technical_result", "")).startswith("RETAKE")
                    or payload.get("technical_result") == "REPLAN",
                    "latency_ms": result.execution.latency_ms,
                }
            )
        count = len(rows)
        critical_detect = [row for row in rows if row["critical"]]
        retake = [row for row in rows if row["retake_expected"]]
        non_retake = [row for row in rows if not row["retake_expected"]]
        latencies = sorted(row["latency_ms"] for row in rows)
        p95_index = max(0, min(len(latencies) - 1, int(len(latencies) * 0.95) - 1))
        metrics = {
            "case_count": count,
            "schema_valid_rate": sum(row["schema_valid"] for row in rows) / count,
            "disposition_accuracy": sum(
                row["expected_disposition"] == row["actual_disposition"] for row in rows
            )
            / count,
            "critical_must_detect_recall": (
                sum(row["must_detect_pass"] for row in critical_detect) / len(critical_detect)
            ),
            "must_not_invent_violation_rate": sum(bool(row["invented"]) for row in rows) / count,
            "retake_false_positive_rate": (
                sum(row["retake_actual"] for row in non_retake) / len(non_retake)
            ),
            "retake_false_negative_count": sum(not row["retake_actual"] for row in retake),
            "latency_p50_ms": median(latencies),
            "latency_p95_ms": latencies[p95_index],
            "fixture_provider_calls": count,
            "real_provider_calls": 0,
            "estimated_cost": 0.0,
        }
        gates = {
            "schema_valid_rate": metrics["schema_valid_rate"] == 1.0,
            "disposition_accuracy": metrics["disposition_accuracy"] >= 0.85,
            "critical_must_detect_recall": metrics["critical_must_detect_recall"] >= 0.9,
            "invented_reality_facts": metrics["must_not_invent_violation_rate"] == 0,
            "critical_retake_false_negative": metrics["retake_false_negative_count"] == 0,
        }
        return {
            "suite_version": "1.0.0",
            "provider_class": "DETERMINISTIC_FIXTURE_ONLY",
            "metrics": metrics,
            "gates": gates,
            "status": "PASS" if all(gates.values()) else "FAIL",
            "rows": rows,
        }
