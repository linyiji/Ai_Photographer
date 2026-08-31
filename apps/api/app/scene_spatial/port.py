from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Any, Protocol


class SceneSpatialProviderMode(StrEnum):
    REAL = "REAL"
    FAKE = "FAKE"
    REPLAY = "REPLAY"


@dataclass(frozen=True)
class SceneSpatialResult:
    geometry_request_id: str
    spatial_evidence: dict[str, Any]
    provider_mode: SceneSpatialProviderMode
    timing_ms: dict[str, float]


class SceneSpatialPort(Protocol):
    """Replaceable capability boundary visible to Main application code."""

    mode: SceneSpatialProviderMode

    def analyze(self, request: dict[str, Any], encoded_frames: list[bytes]) -> SceneSpatialResult: ...
