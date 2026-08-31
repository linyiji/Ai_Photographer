from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any


SUPPORT_LEVELS = {"SUPPORTED", "PARTIAL", "UNSUPPORTED", "UNVERIFIED_REAL_DEVICE"}
IMPLEMENTATION_TYPES = {"FAKE", "REAL", "EXPERIMENTAL", "UNAVAILABLE"}
PLATFORM_PROFILES = {
    "H5_FULL": {},
    "H5_NO_SHARE": {"ShareAdapter": ("UNSUPPORTED", "Web Share API unavailable")},
    "H5_OFFLINE": {"NetworkAdapter": ("SUPPORTED", "Browser reports offline")},
    "WECHAT_UNVERIFIED": {},
    "NO_HAPTIC": {"HapticAdapter": ("UNSUPPORTED", "Vibration unavailable")},
    "NO_ALBUM": {"AlbumAdapter": ("UNSUPPORTED", "System album unavailable")},
    "CAMERA_UNAVAILABLE": {"CameraAdapter": ("UNSUPPORTED", "Camera unavailable")},
    "STORAGE_FAILURE": {"StorageAdapter": ("UNSUPPORTED", "Deterministic Lab storage failure")},
}


class PlatformAdapterRegistry:
    """Runtime implementation metadata subordinate to the locked M01 catalog."""

    def __init__(self, catalog_path: Path):
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        self.catalog_version = catalog["catalog_version"]
        self.capability_names = [item["name"] for item in catalog["capabilities"]]

    def descriptors(self, platform: str, profile: str | None = None) -> list[dict[str, Any]]:
        platform = platform.upper()
        if platform not in {"H5", "WECHAT", "TEST", "LAB"}:
            platform = "TEST"
        selected_profile = profile or ("WECHAT_UNVERIFIED" if platform == "WECHAT" else "H5_FULL")
        if selected_profile not in PLATFORM_PROFILES:
            raise ValueError(f"Unknown platform profile: {selected_profile}")
        descriptors = [self._descriptor(name, platform) for name in self.capability_names]
        overrides = PLATFORM_PROFILES[selected_profile]
        for descriptor in descriptors:
            if descriptor["capability_name"] in overrides:
                level, reason = overrides[descriptor["capability_name"]]
                descriptor["support_level"] = level
                descriptor["availability"] = level != "UNSUPPORTED"
                descriptor["reason"] = reason
        return descriptors

    def selection(self, platform: str) -> list[dict[str, Any]]:
        descriptors = self.descriptors(platform)
        selected = []
        for descriptor in descriptors:
            implementation_type = "REAL" if descriptor["support_level"] == "SUPPORTED" else "EXPERIMENTAL" if descriptor["support_level"] in {"PARTIAL", "UNVERIFIED_REAL_DEVICE"} else "UNAVAILABLE"
            selected.append({**descriptor, "selected_adapter": descriptor["adapter_id"], "implementation_type": implementation_type, "source_track": descriptor["provenance"]["implementation_source"], "acceptance_level": descriptor["support_level"]})
        selected.append({"capability_name": "LiveGuidanceCapability", "selected_adapter": "fake-live-guidance-m02", "implementation_type": "FAKE", "support_level": "SUPPORTED", "source_track": "MAIN_M02", "acceptance_level": "DETERMINISTIC_REGRESSION", "platform": platform.upper(), "version": "1.0.0"})
        return selected

    @staticmethod
    def normalize_error(kind: str, *, retryable: bool = False) -> dict[str, Any]:
        aliases = {
            "PERMISSION_DENIED": ("PERMISSION_DENIED", "DEVICE"),
            "UNSUPPORTED": ("PLATFORM_UNSUPPORTED", "PLATFORM"),
            "CANCELLED": ("USER_CANCELLED", "PLATFORM"),
            "TIMEOUT": ("PLATFORM_TIMEOUT", "PLATFORM"),
            "NETWORK_UNAVAILABLE": ("NETWORK_UNAVAILABLE", "NETWORK"),
            "STORAGE_FAILURE": ("STORAGE_FAILURE", "STORAGE"),
            "INVALID_ASSET": ("INVALID_ASSET", "VALIDATION"),
            "SHARE_FAILURE": ("SHARE_FAILURE", "PLATFORM"),
            "CAMERA_FAILURE": ("CAMERA_FAILURE", "DEVICE"),
        }
        code, category = aliases.get(kind, ("PLATFORM_FAILURE", "PLATFORM"))
        return {"schema_version": "1.0.0", "error_code": code, "category": category, "severity": "ERROR", "retryable": retryable, "user_message_key": code.lower(), "developer_context": {}, "session_id": None, "correlation_id": None, "cause": None}

    def _descriptor(self, name: str, platform: str) -> dict[str, Any]:
        h5 = {
            "NetworkAdapter": ("SUPPORTED", "Browser online state and authorized transport", "h5-network-v1"),
            "HapticAdapter": ("PARTIAL", "Vibration API when available", "h5-haptic-v1"),
            "ShareAdapter": ("PARTIAL", "Web Share API when available", "h5-share-v1"),
            "AlbumAdapter": ("PARTIAL", "Browser download only; not system album save", "h5-download-v1"),
            "CameraAdapter": ("UNVERIFIED_REAL_DEVICE", "Single-shot chooser/camera implementation", "h5-still-camera-v1"),
            "SceneScanAdapter": ("SUPPORTED", "Development harness for portable Scene Scan evidence", "h5-scene-scan-v0.2"),
            "StorageAdapter": ("SUPPORTED", "Development local storage through authorized API", "development-local-storage-v1"),
            "VoiceOutputAdapter": ("PARTIAL", "Optional browser speech synthesis; not Voice Track", "h5-voice-output-v1"),
            "DeviceMotionAdapter": ("PARTIAL", "Browser support and permission vary", "h5-device-motion-shell-v1"),
        }
        wechat = {
            name: ("UNVERIFIED_REAL_DEVICE", "Compile-safe Taro facade; device acceptance required", f"wechat-{name.removesuffix('Adapter').lower()}-v1")
            for name in {"NetworkAdapter", "HapticAdapter", "ShareAdapter", "AlbumAdapter", "CameraAdapter", "SceneScanAdapter", "StorageAdapter"}
        }
        support = wechat if platform == "WECHAT" else h5
        level, reason, adapter_id = support.get(name, ("UNSUPPORTED", "Not configured in M04", f"unavailable-{name.removesuffix('Adapter').lower()}"))
        scene_scan = name == "SceneScanAdapter"
        descriptor = {"capability_name": name, "adapter_id": adapter_id, "adapter_version": "0.2.0" if scene_scan else "1.0.0", "platform": platform, "availability": level != "UNSUPPORTED", "support_level": level, "reason": reason, "provenance": {"implementation_source": "MAIN_SCENE_SPATIAL_V02" if scene_scan else "MAIN_M04", "catalog_version": self.catalog_version, "runtime_support": level}}
        assert descriptor["support_level"] in SUPPORT_LEVELS
        return deepcopy(descriptor)
