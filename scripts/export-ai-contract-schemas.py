"""Export the provider-neutral AI infrastructure contracts to JSON Schema."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app.ai.contracts_v1 import (  # noqa: E402
    AIContextTelemetryV01,
    AIJobEventV01,
    AIJobV01,
    AILatencyWaterfallV01,
    AIMediaPolicyV01,
    AIProviderProvenanceV01,
    AIRequestEnvelopeV01,
    AIResultEnvelopeV01,
)


CONTRACTS = {
    "AIJobV01": (AIJobV01, "Provider-neutral AI job lifecycle and bounded retry state."),
    "AIRequestEnvelopeV01": (AIRequestEnvelopeV01, "Versioned, idempotent and revision-bound AI request envelope."),
    "AIResultEnvelopeV01": (AIResultEnvelopeV01, "Normalized AI result envelope that exposes candidates, provenance and latency."),
    "AIProviderProvenanceV01": (AIProviderProvenanceV01, "Provider and model provenance without credentials or provider-native payloads."),
    "AILatencyWaterfallV01": (AILatencyWaterfallV01, "End-to-end AI latency waterfall with provider and validation stages."),
    "AIContextTelemetryV01": (AIContextTelemetryV01, "Minimal-context size, evidence and stable hash telemetry."),
    "AIMediaPolicyV01": (AIMediaPolicyV01, "Capability-specific bounded media and provider-send policy."),
    "AIJobEventV01": (AIJobEventV01, "Revision-aware AI job domain event with honest named UX state."),
}


def main() -> None:
    destination = ROOT / "packages" / "contracts" / "schemas"
    for name, (model, description) in CONTRACTS.items():
        schema = model.model_json_schema(mode="validation")
        schema["$schema"] = "https://json-schema.org/draft/2020-12/schema"
        schema["$id"] = f"https://xfx.local/contracts/v1/{name}.schema.json"
        schema["title"] = name
        schema["description"] = description
        schema.setdefault("required", [])
        if "schema_version" not in schema["required"]:
            schema["required"].insert(0, "schema_version")
        path = destination / f"{name}.schema.json"
        path.write_text(json.dumps(schema, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
