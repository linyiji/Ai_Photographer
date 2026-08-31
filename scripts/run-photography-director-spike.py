from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

from app.photography_director.evaluation import PhotographyDirectorEvaluator  # noqa: E402


def main() -> int:
    fixture_path = ROOT / "packages" / "photography-director-fixtures" / "cases.json"
    result = PhotographyDirectorEvaluator(fixture_path).run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
