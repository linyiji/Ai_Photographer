from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CapabilityReadiness:
    implementation: str
    status: str
    note: str


class ProductRuntimeReadiness:
    """Central product truth for runtime-mode capability disclosure."""

    MODES = {"DEVELOPMENT", "INTERNAL_DEMO", "PRODUCTION"}

    def __init__(self, mode: str = "INTERNAL_DEMO") -> None:
        normalized = mode.upper()
        self.mode = normalized if normalized in self.MODES else "INTERNAL_DEMO"

    def projection(self, requested_mode: str | None = None) -> dict:
        mode = (requested_mode or self.mode).upper()
        if mode not in self.MODES:
            raise ValueError(f"Unknown product runtime mode: {mode}")
        capabilities = {
            "workflow": CapabilityReadiness("REAL", "READY", "SQLite-backed Workflow V1"),
            "asset_storage": CapabilityReadiness("REAL", "DEVELOPMENT_ONLY", "Development local binary storage"),
            "camera": CapabilityReadiness("EXPERIMENTAL", "REAL_DEVICE_GATE_REQUIRED", "H5 still capture and import fallback"),
            "reality": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "Deterministic scenario capability"),
            "target": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "Deterministic candidate generation"),
            "shot": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "Deterministic shot planning"),
            "live": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "Live P0 is not integrated"),
            "qa": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "Deterministic evaluation"),
            "reality_plus": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "No real provider integration"),
            "fine_tune": CapabilityReadiness("FAKE_INTERNAL_ONLY", "NOT_PRODUCTION_READY", "Recipe projection only"),
            "final_actions": CapabilityReadiness("REAL", "PARTIAL", "Readback and download are real; sharing is capability-dependent"),
        }
        ready = mode != "PRODUCTION"
        blockers = [] if ready else [name for name, item in capabilities.items() if item.implementation != "REAL" or item.status not in {"READY", "PARTIAL"}]
        return {
            "schema_version": "1.0.0",
            "mode": mode,
            "ready": ready,
            "public_production_ready": False,
            "disclosure": "INTERNAL_DEMO" if mode == "INTERNAL_DEMO" else mode,
            "capabilities": {name: vars(item) for name, item in capabilities.items()},
            "blocking_capabilities": blockers,
            "fake_ai_present": any(item.implementation == "FAKE_INTERNAL_ONLY" for item in capabilities.values()),
        }
