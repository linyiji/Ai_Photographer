from __future__ import annotations

import copy
import hashlib
from typing import Any

from .contracts import validate_geometry_request
from .port import SceneSpatialPort, SceneSpatialResult


class SceneSpatialService:
    """Provider-neutral application service with versioned geometry identity."""

    def __init__(self, provider: SceneSpatialPort):
        self.provider = provider
        self._result_cache: dict[str, SceneSpatialResult] = {}

    @staticmethod
    def cache_key(request: dict[str, Any]) -> str:
        identity = "|".join((request["scan_id"], request["frame_set_hash"], request["geometry_version"]))
        return hashlib.sha256(identity.encode("utf-8")).hexdigest()

    def analyze(self, metadata: dict[str, Any], encoded_frames: list[bytes]) -> tuple[SceneSpatialResult, str]:
        request = validate_geometry_request(metadata, encoded_frames)
        key = self.cache_key(request)
        cached = self._result_cache.get(key)
        if cached is not None:
            replay = SceneSpatialResult(
                geometry_request_id=request["geometry_request_id"],
                spatial_evidence={**copy.deepcopy(cached.spatial_evidence), "diagnostics": {**cached.spatial_evidence.get("diagnostics", {}), "geometry_request_id": request["geometry_request_id"]}},
                provider_mode=cached.provider_mode,
                timing_ms={**cached.timing_ms, "cache_ms": 0.0, "solver_ms": 0.0},
            )
            return replay, "CACHE_HIT"
        result = self.provider.analyze(request, encoded_frames)
        self._result_cache[key] = copy.deepcopy(result)
        return result, "CACHE_MISS"
