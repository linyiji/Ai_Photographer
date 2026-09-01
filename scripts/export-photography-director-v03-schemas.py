"""Export Live 05G-aligned Director V0.3 contracts."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app.photography_director.live_alignment import (  # noqa: E402
    LiveCapabilityCatalogV01,
    LiveTargetBlueprintV02,
    PhotographyDirectorInputV02,
    ShotPlanCandidateV02,
)


CONTRACTS = {
    "LiveCapabilityCatalogV01": (LiveCapabilityCatalogV01, "Director-facing Live 05G product capability without measurement implementation details.", "0.1.0"),
    "PhotographyDirectorInputV02": (PhotographyDirectorInputV02, "Validated V0.1 Director context plus Live 05G capability and explicit bounded image mode.", "0.2.0"),
    "ShotPlanCandidateV02": (ShotPlanCandidateV02, "Candidate shot plan using explicit Live 05G framing and representable placement semantics.", "0.2.0"),
    "LiveTargetBlueprintV02": (LiveTargetBlueprintV02, "Product-level projection blueprint without Live private measurement algorithms.", "0.2.0"),
}


def main() -> None:
    destination = ROOT / "packages" / "contracts" / "schemas"
    for name, (model, description, version) in CONTRACTS.items():
        schema = model.model_json_schema(mode="validation")
        schema.update({
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": f"https://xfx.local/contracts/v1/{name}.schema.json",
            "title": name,
            "description": description,
        })
        schema.setdefault("required", [])
        if "schema_version" not in schema["required"]:
            schema["required"].insert(0, "schema_version")
        assert schema["properties"]["schema_version"]["const"] == version
        (destination / f"{name}.schema.json").write_text(json.dumps(schema, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
