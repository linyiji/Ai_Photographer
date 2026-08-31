from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Protocol

from .contracts import PhotographyDirectorInputV01, ShotPlanCandidateV01


class PhotographyDirectorProviderMode(StrEnum):
    FAKE = "FAKE"
    REPLAY = "REPLAY"
    AI = "AI"


@dataclass(frozen=True)
class DirectorResult:
    request_id: str
    contract_version: str
    provider_mode: PhotographyDirectorProviderMode
    status: str
    candidates: tuple[ShotPlanCandidateV01, ...] = ()
    rejected: tuple[dict[str, object], ...] = ()
    provenance: dict[str, object] = field(default_factory=dict)
    error: dict[str, object] | None = None


class PhotographyDirectorPort(Protocol):
    mode: PhotographyDirectorProviderMode

    def propose(self, input_contract: PhotographyDirectorInputV01) -> list[dict[str, object]]: ...
