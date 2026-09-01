"""Generate sanitized deterministic V0.3 alignment evidence for exactly three planned gate shapes."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app.photography_director.contracts import PhotographyDirectorInputV01  # noqa: E402
from app.photography_director.live_alignment import (  # noqa: E402
    FakePhotographyDirectorV03Adapter,
    PhotographyDirectorV03Service,
    build_v03_input,
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    cases = json.loads((ROOT / "packages" / "photography-director-fixtures" / "cases.json").read_text(encoding="utf-8"))["cases"][:3]
    rows = []
    for item in cases:
        source = build_v03_input(PhotographyDirectorInputV01.model_validate(item["input"]))
        result = PhotographyDirectorV03Service(FakePhotographyDirectorV03Adapter()).propose(source.model_dump(mode="json"))
        rows.append({
            "case_id": item["case_id"],
            "evidence_class": "CONTROLLED_SYNTHETIC_DETERMINISTIC_NOT_REAL_PROVIDER",
            "spatial_status": source.accepted_context_v01.spatial_evidence_optional.status.value if source.accepted_context_v01.spatial_evidence_optional else "ABSENT",
            "status": result.status,
            "candidate_count": len(result.candidates),
            "framing_profiles": [candidate.framing_profile.value for candidate in result.candidates],
            "target_zones": [candidate.subject_placement.zone.value for candidate in result.candidates],
            "view_refs": [candidate.view_ref for candidate in result.candidates],
            "card_projections": [candidate.card_projection() for candidate in result.candidates],
            "provider_calls": 0,
        })
    payload = {
        "schema_version": "0.1.0",
        "task_id": "XFX_AI_PHOTOGRAPHY_DIRECTOR_V03_LIVE_05G_ALIGNMENT_AND_REAL_LUNA_MINI_PROVIDER_GATE_03",
        "real_provider_evidence": False,
        "rows": rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
