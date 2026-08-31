from __future__ import annotations

import hashlib
import json
import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


GEOMETRY_VERSION = "p2-backend-v0.2"
FIRST_PARTY_AUTHORITY = "FIRST_PARTY_BACKEND_GEOMETRY_SOLVER"


class SpatialPrecheckBody(BaseModel):
    model_config = ConfigDict(extra="allow")
    schema_version: str = "0.1.0"
    source_scan_id: str
    status: str
    authority: str
    reason: str = "UNSPECIFIED"
    routing: dict[str, Any] = Field(default_factory=dict)


class CameraModelEvidenceBody(BaseModel):
    model_config = ConfigDict(extra="allow")
    status: str
    focal_source: str = "UNKNOWN"
    principal_point_assumption: str = "UNKNOWN"
    distortion_assumption: str = "UNKNOWN"
    platform_device_profile: str = "UNKNOWN"
    confidence: float = 0.0


class SelectedGeometryFrameBody(BaseModel):
    model_config = ConfigDict(extra="allow")
    frame_id: str
    timestamp_ms: float
    relative_yaw_deg: float
    orientation_source: str
    width: int
    height: int
    source_width: int
    source_height: int
    working_width: int
    working_height: int
    encoded_bytes: int
    frame_sha256: str
    quality: float
    file_field: str


class SceneGeometryRequestBody(BaseModel):
    model_config = ConfigDict(extra="allow")
    schema_version: str = "0.1.0"
    geometry_request_id: str
    scan_id: str
    frame_set_hash: str
    geometry_version: str
    platform: str
    camera_model_evidence: CameraModelEvidenceBody
    client_precheck: SpatialPrecheckBody
    selected_geometry_frames: list[SelectedGeometryFrameBody]
    privacy: dict[str, Any]


def frame_sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def frame_set_sha256(metadata: list[dict[str, Any]]) -> str:
    canonical = [[frame["frame_id"], str(frame["frame_sha256"]).lower()] for frame in metadata]
    payload = json.dumps(canonical, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def validate_geometry_request(metadata: dict[str, Any], frames: list[bytes]) -> dict[str, Any]:
    parsed = SceneGeometryRequestBody.model_validate(metadata)
    request = parsed.model_dump()
    if parsed.geometry_version != GEOMETRY_VERSION:
        raise ValueError("GEOMETRY_VERSION_UNSUPPORTED")
    if not 1 <= len(parsed.geometry_request_id) <= 160 or not 1 <= len(parsed.scan_id) <= 160:
        raise ValueError("GEOMETRY_IDENTITY_INVALID")
    if re.fullmatch(r"[0-9a-fA-F]{64}", parsed.frame_set_hash) is None:
        raise ValueError("FRAME_SET_HASH_INVALID")
    if not 3 <= len(frames) <= 8 or len(frames) != len(parsed.selected_geometry_frames):
        raise ValueError("GEOMETRY_FRAME_COUNT_OUT_OF_BOUNDS")
    selected = request["selected_geometry_frames"]
    for frame, encoded in zip(selected, frames, strict=True):
        if frame_sha256(encoded) != frame["frame_sha256"].lower() or len(encoded) != frame["encoded_bytes"]:
            raise ValueError("FRAME_BINARY_HASH_MISMATCH")
        # Clients target a 640 px working edge; the accepted backend hard limit is 960 px.
        if max(frame["working_width"], frame["working_height"]) > 960 or min(frame["working_width"], frame["working_height"]) <= 0:
            raise ValueError("GEOMETRY_WORKING_RESOLUTION_OUT_OF_BOUNDS")
    if frame_set_sha256(selected) != parsed.frame_set_hash.lower():
        raise ValueError("FRAME_SET_HASH_MISMATCH")
    if parsed.camera_model_evidence.status not in {"KNOWN", "ESTIMATED_VALIDATED", "UNKNOWN"}:
        raise ValueError("CAMERA_MODEL_EVIDENCE_INVALID")
    if parsed.client_precheck.status not in {"UNRELIABLE", "NO_SIGNAL", "POSSIBLE"} or parsed.client_precheck.authority != "ROUTING_HINT_ONLY":
        raise ValueError("SPATIAL_PRECHECK_AUTHORITY_INVALID")
    expected_privacy = {
        "raw_video_upload": 0,
        "frame_stream_upload": 0,
        "provider_upload": 0,
        "luna_upload": 0,
        "selected_geometry_frame_upload": "FIRST_PARTY_BACKEND_ONLY",
    }
    if any(parsed.privacy.get(key) != value for key, value in expected_privacy.items()):
        raise ValueError("GEOMETRY_PRIVACY_CONTRACT_VIOLATION")
    return request
