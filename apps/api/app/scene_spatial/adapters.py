from __future__ import annotations

import copy
from typing import Any

from .contracts import FIRST_PARTY_AUTHORITY
from .port import SceneSpatialProviderMode, SceneSpatialResult
from .solver import GeometrySolver


def _bounded_evidence(request: dict[str, Any], status: str, reason: str) -> dict[str, Any]:
    return {
        "schema": "xfx.spatial-evidence",
        "schema_version": "0.2.0",
        "source_scan_id": request["scan_id"],
        "status": status,
        "status_authority": FIRST_PARTY_AUTHORITY,
        "confidence": 0.5 if status == "PARTIAL" else 0.0,
        "geometry_type": "SPARSE_RELATIVE" if status == "PARTIAL" else "UNKNOWN",
        "metric_scale_available": False,
        "relative_camera_motion": {"rotation": "UNKNOWN", "translation_direction": "UNKNOWN", "evidence_class": "UNKNOWN", "metric_distance": "UNKNOWN", "coordinate_convention": "CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD"},
        "relative_depth_summary": {"source": "NONE", "categories": [], "status": "UNKNOWN"},
        "geometry_coverage": 0.0,
        "visibility_evidence": {"status": "UNKNOWN", "note": "NO_VALIDATED_GEOMETRY"},
        "occlusion_evidence": {"status": "UNKNOWN", "note": "NO_VALIDATED_GEOMETRY"},
        "limitations": ["NON_METRIC", "NO_PHYSICAL_SAFETY_AUTHORITY", "P3_AFFORDANCE_NOT_STARTED"],
        "evidence_refs": [frame["frame_id"] for frame in request["selected_geometry_frames"]],
        "reason_codes": [reason],
        "diagnostics": {"geometry_request_id": request["geometry_request_id"]},
    }


class RealSceneSpatialAdapter:
    mode = SceneSpatialProviderMode.REAL

    def __init__(self) -> None:
        self._solver = GeometrySolver()

    def analyze(self, request: dict[str, Any], encoded_frames: list[bytes]) -> SceneSpatialResult:
        evidence, timing = self._solver.analyze(request, encoded_frames)
        return SceneSpatialResult(request["geometry_request_id"], evidence, self.mode, timing)


class FakeSceneSpatialAdapter:
    mode = SceneSpatialProviderMode.FAKE

    def analyze(self, request: dict[str, Any], encoded_frames: list[bytes]) -> SceneSpatialResult:
        return SceneSpatialResult(request["geometry_request_id"], _bounded_evidence(request, "PARTIAL", "FAKE_DETERMINISTIC_EVIDENCE"), self.mode, {"solver_ms": 0.0})


class ReplaySceneSpatialAdapter:
    mode = SceneSpatialProviderMode.REPLAY

    def __init__(self, fixtures: dict[str, dict[str, Any]] | None = None) -> None:
        self._fixtures = copy.deepcopy(fixtures or {})

    def analyze(self, request: dict[str, Any], encoded_frames: list[bytes]) -> SceneSpatialResult:
        evidence = copy.deepcopy(self._fixtures.get(request["scan_id"]) or _bounded_evidence(request, "INSUFFICIENT", "REPLAY_FIXTURE_NOT_FOUND"))
        evidence["source_scan_id"] = request["scan_id"]
        evidence.setdefault("diagnostics", {})["geometry_request_id"] = request["geometry_request_id"]
        return SceneSpatialResult(request["geometry_request_id"], evidence, self.mode, {"solver_ms": 0.0})


def build_scene_spatial_adapter(mode: str, replay_fixtures: dict[str, dict[str, Any]] | None = None):
    normalized = mode.upper()
    if normalized == SceneSpatialProviderMode.REAL:
        return RealSceneSpatialAdapter()
    if normalized == SceneSpatialProviderMode.FAKE:
        return FakeSceneSpatialAdapter()
    if normalized == SceneSpatialProviderMode.REPLAY:
        return ReplaySceneSpatialAdapter(replay_fixtures)
    raise ValueError(f"SCENE_SPATIAL_MODE_UNSUPPORTED:{mode}")
