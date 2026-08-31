from __future__ import annotations

import copy
import importlib
import json
from pathlib import Path

import cv2
import httpx
import numpy as np
import pytest
from jsonschema.validators import Draft202012Validator

from app.repository import Repository
from app.scene_spatial.adapters import FakeSceneSpatialAdapter, RealSceneSpatialAdapter, ReplaySceneSpatialAdapter
from app.scene_spatial.contracts import FIRST_PARTY_AUTHORITY, frame_set_sha256, frame_sha256, validate_geometry_request
from app.scene_spatial.service import SceneSpatialService
from app.service import SessionService


ROOT = Path(__file__).resolve().parents[3]
FIXTURE = ROOT / "packages" / "scenario-fixtures" / "s01-storm-before-arrival.json"


def jpeg_frames(count: int = 4) -> list[bytes]:
    rng = np.random.default_rng(5202)
    base = rng.integers(0, 256, (480, 640), dtype=np.uint8)
    values: list[bytes] = []
    for index in range(count):
        shifted = np.roll(base, index * 4, axis=1)
        ok, encoded = cv2.imencode(".jpg", shifted, [cv2.IMWRITE_JPEG_QUALITY, 88])
        assert ok
        values.append(encoded.tobytes())
    return values


def geometry_request(scan_id: str = "scan-01", request_id: str = "geometry-01", frames: list[bytes] | None = None) -> tuple[dict, list[bytes]]:
    encoded = frames or jpeg_frames()
    selected = [
        {
            "frame_id": f"{scan_id}-frame-{index}", "timestamp_ms": index * 250,
            "relative_yaw_deg": index * 5, "orientation_source": "CONTROLLED_FIXTURE",
            "width": 640, "height": 480, "source_width": 640, "source_height": 480,
            "working_width": 640, "working_height": 480, "encoded_bytes": len(value),
            "frame_sha256": frame_sha256(value), "quality": 0.9, "file_field": f"frame_{index}",
        }
        for index, value in enumerate(encoded)
    ]
    metadata = {
        "schema_version": "0.1.0", "geometry_request_id": request_id, "scan_id": scan_id,
        "frame_set_hash": frame_set_sha256(selected), "geometry_version": "p2-backend-v0.2", "platform": "fixture",
        "camera_model_evidence": {"status": "KNOWN", "focal_source": "CONTROLLED_FIXTURE", "principal_point_assumption": "IMAGE_CENTER", "distortion_assumption": "NONE", "platform_device_profile": "TEST", "confidence": 1.0},
        "client_precheck": {"schema_version": "0.1.0", "source_scan_id": scan_id, "status": "POSSIBLE", "authority": "ROUTING_HINT_ONLY", "reason": "FIXTURE", "routing": {"backend_solve_recommended": True}},
        "selected_geometry_frames": selected,
        "privacy": {"raw_video_upload": 0, "frame_stream_upload": 0, "provider_upload": 0, "luna_upload": 0, "selected_geometry_frame_upload": "FIRST_PARTY_BACKEND_ONLY"},
    }
    return metadata, encoded


def scan_bundle(scan_id: str) -> tuple[dict, dict, dict, dict, dict]:
    scan = {"schema_version": "0.1.0", "scan_id": scan_id, "privacy": {"raw_video_uploaded": 0, "frame_stream_uploaded": 0, "provider_calls": 0, "luna_calls": 0}}
    frame_set = {"schema_version": "0.1.0", "source_scan_id": scan_id, "frame_refs": [f"{scan_id}-frame-{index}" for index in range(4)], "raw_media_persisted": False, "raw_media_uploaded": False}
    direction = {"schema_version": "0.1.0", "source_scan_id": scan_id, "basis": "RELATIVE_YAW", "nodes": [], "depth": "UNKNOWN", "metric_geometry": "NOT_SUPPORTED"}
    view = {"schema_version": "0.1.0", "source_scan_id": scan_id, "view_candidates": [{"view_id": f"{scan_id}-view-1"}], "composition_anchors": [{"anchor_id": f"{scan_id}-anchor-1"}], "authority": "P1_VIEW_CANDIDATE_EVIDENCE"}
    precheck = {"schema_version": "0.1.0", "source_scan_id": scan_id, "status": "POSSIBLE", "authority": "ROUTING_HINT_ONLY", "reason": "FIXTURE", "routing": {"backend_solve_recommended": True}}
    return scan, frame_set, direction, view, precheck


def evidence(scan_id: str, status: str) -> dict:
    return {
        "schema": "xfx.spatial-evidence", "schema_version": "0.2.0", "source_scan_id": scan_id,
        "status": status, "status_authority": FIRST_PARTY_AUTHORITY, "confidence": 0.5 if status == "PARTIAL" else 0.0,
        "geometry_type": "SPARSE_RELATIVE" if status == "PARTIAL" else "UNKNOWN", "metric_scale_available": False,
        "limitations": ["NON_METRIC", "P3_AFFORDANCE_NOT_STARTED"], "evidence_refs": [f"{scan_id}-frame-0"], "reason_codes": ["FIXTURE"],
    }


@pytest.mark.parametrize("provider", [FakeSceneSpatialAdapter(), ReplaySceneSpatialAdapter()])
def test_main_runs_with_fake_and_replay_providers(provider):
    request, frames = geometry_request()
    result, cache = SceneSpatialService(provider).analyze(request, frames)
    assert cache == "CACHE_MISS"
    assert result.provider_mode.value in {"FAKE", "REPLAY"}
    assert result.spatial_evidence["status"] in {"PARTIAL", "INSUFFICIENT"}


def test_real_provider_and_scene_spatial_standalone_execute_without_main_ui():
    request, frames = geometry_request()
    result, cache = SceneSpatialService(RealSceneSpatialAdapter()).analyze(request, frames)
    assert cache == "CACHE_MISS"
    assert result.provider_mode.value == "REAL"
    assert result.spatial_evidence["status"] in {"INSUFFICIENT", "PARTIAL", "USABLE"}
    assert result.spatial_evidence["status_authority"] == FIRST_PARTY_AUTHORITY


def test_cache_identity_excludes_intent_and_request_identity():
    first, frames = geometry_request(request_id="request-a")
    service = SceneSpatialService(FakeSceneSpatialAdapter())
    result_a, cache_a = service.analyze(first, frames)
    second = copy.deepcopy(first)
    second["geometry_request_id"] = "request-b"
    second["future_home_intent"] = "different-intent-does-not-change-geometry"
    result_b, cache_b = service.analyze(second, frames)
    assert (cache_a, cache_b) == ("CACHE_MISS", "CACHE_HIT")
    assert result_a.spatial_evidence["source_scan_id"] == result_b.spatial_evidence["source_scan_id"]
    assert result_b.spatial_evidence["diagnostics"]["geometry_request_id"] == "request-b"


def test_binary_hash_privacy_and_backend_960_limit_are_enforced():
    request, frames = geometry_request()
    request["selected_geometry_frames"][0]["working_width"] = 960
    request["selected_geometry_frames"][0]["working_height"] = 540
    request["frame_set_hash"] = frame_set_sha256(request["selected_geometry_frames"])
    assert validate_geometry_request(request, frames)["privacy"]["provider_upload"] == 0
    request["selected_geometry_frames"][0]["working_width"] = 961
    request["frame_set_hash"] = frame_set_sha256(request["selected_geometry_frames"])
    with pytest.raises(ValueError, match="GEOMETRY_WORKING_RESOLUTION_OUT_OF_BOUNDS"):
        validate_geometry_request(request, frames)


def test_session_p1_is_immediate_p2_is_optional_and_failure_is_not_insufficient(tmp_path: Path):
    service = SessionService(Repository(tmp_path / "sessions.sqlite3"), FIXTURE)
    session = service.create()
    scan_id = "scan-active"
    committed = service.commit_scene_scan(session["session_id"], *scan_bundle(scan_id))
    spatial = committed["state"]["scene_spatial"]
    assert committed["workflow_stage"] == "ENTRY"
    assert spatial["view_evidence"]["view_candidates"]
    assert spatial["geometry_job"]["status"] == "PENDING"
    assert spatial["view_path_usable"] is True
    assert service.request_geometry(session["session_id"], scan_id, "request-insufficient") is True
    assert service.apply_spatial_evidence(session["session_id"], scan_id, "request-insufficient", evidence(scan_id, "INSUFFICIENT")) is True
    insufficient = service.get(session["session_id"])
    assert insufficient["state"]["scene_spatial"]["spatial_evidence"]["status"] == "INSUFFICIENT"
    assert service.request_geometry(session["session_id"], scan_id, "request-failed") is True
    assert service.fail_geometry(session["session_id"], scan_id, "request-failed", "TRANSPORT_TIMEOUT") is True
    failed = service.get(session["session_id"])
    assert failed["state"]["scene_spatial"]["geometry_job"]["status"] == "FAILED"
    assert failed["state"]["scene_spatial"]["geometry_job"]["outcome"] == "NOT_PRODUCED"
    assert failed["state"]["scene_spatial"]["spatial_evidence"] is None
    assert failed["state"]["scene_spatial"]["view_path_usable"] is True
    failed_event = next(item for item in reversed(failed["events"]) if item["event_type"] == "GEOMETRY_FAILED")
    assert failed_event["payload"]["spatial_evidence"] == "NOT_PRODUCED"


def test_new_scan_supersedes_old_geometry_without_cross_attachment(tmp_path: Path):
    service = SessionService(Repository(tmp_path / "sessions.sqlite3"), FIXTURE)
    session_id = service.create()["session_id"]
    service.commit_scene_scan(session_id, *scan_bundle("scan-old"))
    service.request_geometry(session_id, "scan-old", "request-old")
    service.commit_scene_scan(session_id, *scan_bundle("scan-new"))
    assert service.apply_spatial_evidence(session_id, "scan-old", "request-old", evidence("scan-old", "PARTIAL")) is False
    current = service.get(session_id)
    assert current["state"]["scene_spatial"]["active_scan_id"] == "scan-new"
    assert current["state"]["scene_spatial"]["spatial_evidence"] is None
    assert current["state"]["scene_spatial"]["history"][0]["scan_id"] == "scan-old"
    assert any(item["event_type"] == "GEOMETRY_SUPERSEDED" for item in current["events"])


def test_module_private_state_and_main_import_boundaries_are_isolated():
    main_sources = [ROOT / "apps" / "api" / "app" / "main.py", ROOT / "apps" / "api" / "app" / "service.py", ROOT / "apps" / "client" / "src" / "sceneSpatial" / "coordinator.ts"]
    forbidden = ("cv2", "goodFeaturesToTrack", "calcOpticalFlowPyrLK", "findEssentialMat", "recoverPose", "triangulatePoints", "GeometrySolver")
    assert all(token not in path.read_text(encoding="utf-8") for path in main_sources for token in forbidden)
    capability_sources = list((ROOT / "apps" / "api" / "app" / "scene_spatial").glob("*.py"))
    assert all("workflow_stage" not in path.read_text(encoding="utf-8") for path in capability_sources)
    assert all("state[\"scene_spatial\"]" not in path.read_text(encoding="utf-8") for path in capability_sources)


def test_scene_spatial_contract_catalog_and_schemas_are_valid():
    contract_root = ROOT / "packages" / "contracts"
    catalog = json.loads((contract_root / "catalog.json").read_text(encoding="utf-8"))
    entries = [item for item in catalog["contracts"] if item["domain"] == "SCENE_SPATIAL" or item["name"] == "SceneSpatialSessionStateV01"]
    assert len(entries) == 8
    for entry in entries:
        schema = json.loads((contract_root / entry["path"]).read_text(encoding="utf-8"))
        assert schema["$id"] == entry["schema_id"]
        Draft202012Validator.check_schema(schema)


@pytest.mark.anyio
async def test_existing_fastapi_connects_scan_session_and_fake_geometry(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH", str(tmp_path / "api.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT", str(tmp_path / "assets"))
    monkeypatch.setenv("SCENE_SPATIAL_MODE", "FAKE")
    import app.main as main
    importlib.reload(main)
    request, frames = geometry_request()
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://test") as client:
        session_id = (await client.post("/sessions")).json()["session_id"]
        scan, frame_set, direction, view, precheck = scan_bundle(request["scan_id"])
        committed = await client.post(f"/sessions/{session_id}/scene-spatial/scans", json={"scene_scan": scan, "frame_set": frame_set, "direction_map": direction, "view_evidence": view, "spatial_precheck": precheck})
        assert committed.status_code == 200, committed.text
        files = {"metadata": (None, json.dumps(request), "application/json")}
        files.update({item["file_field"]: (f"{item['frame_id']}.jpg", value, "image/jpeg") for item, value in zip(request["selected_geometry_frames"], frames, strict=True)})
        analyzed = await client.post(f"/sessions/{session_id}/scene-spatial/geometry", files=files)
        assert analyzed.status_code == 200, analyzed.text
        result = analyzed.json()
        assert result["provider_mode"] == "FAKE"
        assert result["spatial_evidence"]["status"] == "PARTIAL"
        assert result["session"]["state"]["scene_spatial"]["geometry_job"]["outcome"] == "SPATIAL_EVIDENCE"
