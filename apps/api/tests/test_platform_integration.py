from __future__ import annotations

import hashlib
import importlib
from pathlib import Path

import httpx
import pytest

from app.lab.engine import ReplayEngine
from app.platform.runtime import PlatformAdapterRegistry
from app.platform.storage import DevelopmentLocalStorageAdapter
from app.repository import Repository
from app.service import DomainError


ROOT = Path(__file__).resolve().parents[3]
CATALOG = ROOT / "packages" / "platform" / "catalog.json"
FIXTURE = ROOT / "packages" / "scenario-fixtures" / "s01-storm-before-arrival.json"
M03_MATRIX = ROOT / "packages" / "scenario-fixtures" / "m03-scenario-matrix-v2.json"
M04_MATRIX = ROOT / "packages" / "scenario-fixtures" / "m04-platform-scenarios-v1.json"
PNG = b"\x89PNG\r\n\x1a\n" + b"xfx-m04-deterministic-image" * 4


@pytest.fixture()
async def client(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH", str(tmp_path / "m04.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT", str(tmp_path / "assets"))
    monkeypatch.delenv("XFX_LAB_MODE", raising=False)
    import app.main as main
    importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://test") as value:
        yield value


async def action(client, session_id, name, index, payload=None):
    return await client.post(f"/sessions/{session_id}/actions", headers={"Idempotency-Key": f"m04-{index}"}, json={"action": name, "payload": payload or {}})


async def progress_to_capture(client):
    session_id = (await client.post("/sessions")).json()["session_id"]
    commands = [
        ("SELECT_SHOOTING_RELATION", {"shooting_relation": "FRIEND"}),
        ("CONFIRM_DEVICE_MODE", {"device_mode": "SINGLE"}),
        ("ACCEPT_REALITY", {}),
        ("GENERATE_TARGETS", {}),
        ("SELECT_TARGET", {"candidate_id": "target-cinematic"}),
        ("ACCEPT_SHOT_DIRECTION", {}),
        ("ENTER_CAPTURE_WINDOW", {}),
    ]
    for index, (name, payload) in enumerate(commands):
        response = await action(client, session_id, name, index, payload)
        assert response.status_code == 200, response.text
    return session_id


def test_registry_consumes_all_locked_catalog_capabilities():
    registry = PlatformAdapterRegistry(CATALOG)
    assert len(registry.capability_names) == 12
    assert {item["capability_name"] for item in registry.descriptors("H5")} == set(registry.capability_names)


def test_h5_support_is_honest_and_fake_live_remains_selected():
    registry = PlatformAdapterRegistry(CATALOG)
    descriptors = {item["capability_name"]: item for item in registry.descriptors("H5")}
    assert descriptors["NetworkAdapter"]["support_level"] == "SUPPORTED"
    assert descriptors["AlbumAdapter"]["support_level"] == "PARTIAL"
    assert descriptors["PaymentAdapter"]["support_level"] == "UNSUPPORTED"
    live = next(item for item in registry.selection("H5") if item["capability_name"] == "LiveGuidanceCapability")
    assert live["implementation_type"] == "FAKE"


@pytest.mark.parametrize("capability", ["NetworkAdapter", "HapticAdapter", "ShareAdapter", "AlbumAdapter", "CameraAdapter", "SceneScanAdapter", "StorageAdapter"])
def test_wechat_facades_are_not_claimed_as_device_proven(capability):
    descriptor = next(item for item in PlatformAdapterRegistry(CATALOG).descriptors("WECHAT") if item["capability_name"] == capability)
    assert descriptor["support_level"] == "UNVERIFIED_REAL_DEVICE"


@pytest.mark.parametrize("scenario_id", [item["scenario_id"] for item in __import__("json").loads(M04_MATRIX.read_text(encoding="utf-8"))["scenarios"]])
def test_platform_scenario_matrix_is_deterministic(tmp_path, scenario_id):
    engine = ReplayEngine(tmp_path / "lab", FIXTURE, M03_MATRIX, M04_MATRIX, CATALOG)
    assert engine.run_platform_scenario(scenario_id)["status"] == "PASS"


def test_platform_replay_trace_records_provenance(tmp_path):
    engine = ReplayEngine(tmp_path / "lab", FIXTURE, M03_MATRIX, M04_MATRIX, CATALOG)
    result = engine.run("S01_HAPPY_PATH", platform_profile="H5_NO_SHARE")
    assert result["evaluation_status"] == "PASS"
    assert all({"platform", "capability_name", "adapter_id", "support_level", "result"} <= set(step["platform"]) for step in result["trace"])


@pytest.mark.anyio
async def test_valid_multipart_upload_metadata_hash_and_download(client):
    response = await client.post("/assets/uploads", files={"file": ("capture.png", PNG, "image/png")})
    assert response.status_code == 201, response.text
    asset = response.json()
    assert asset["sha256"] == hashlib.sha256(PNG).hexdigest()
    assert asset["storage_ref"] == f"local-asset://{asset['asset_id']}"
    assert not any(token in asset["storage_ref"] for token in ("D:\\", "..", "\\\\"))
    downloaded = await client.get(f"/assets/{asset['asset_id']}/content")
    assert downloaded.status_code == 200
    assert downloaded.content == PNG
    assert downloaded.headers["content-type"].startswith("image/png")


@pytest.mark.anyio
@pytest.mark.parametrize(
    "filename,content,mime",
    [
        ("empty.png", b"", "image/png"),
        ("wrong.png", b"not-png", "image/png"),
        ("mismatch.jpg", PNG, "image/png"),
        ("capture.gif", b"GIF89a", "image/gif"),
        ("windows-path.png", PNG, "image/jpeg"),
    ],
)
async def test_invalid_uploads_fail_without_persisting(client, filename, content, mime):
    response = await client.post("/assets/uploads", files={"file": (filename, content, mime)})
    assert response.status_code in {413, 422}
    assert response.json()["error"]["error_code"] == "INVALID_ASSET"


@pytest.mark.anyio
async def test_oversize_is_rejected(client):
    import app.main as main
    main.asset_storage.max_bytes = 16
    response = await client.post("/assets/uploads", files={"file": ("capture.png", PNG, "image/png")})
    assert response.status_code == 413
    assert response.json()["error"]["error_code"] == "INVALID_ASSET"


@pytest.mark.parametrize("unsafe", ["../secret", "C:\\Windows\\win.ini", "\\\\server\\share", "%2e%2e%2fsecret", "upload-xyz"])
def test_storage_identity_blocks_traversal_and_absolute_paths(tmp_path, unsafe):
    storage = DevelopmentLocalStorageAdapter(tmp_path / "assets", Repository(tmp_path / "db.sqlite3"))
    with pytest.raises(DomainError) as caught:
        storage.content(unsafe)
    assert caught.value.code == "INVALID_ASSET"


@pytest.mark.anyio
async def test_real_binary_capture_and_final_download_preserve_lineage(client):
    uploaded = (await client.post("/assets/uploads", files={"file": ("capture.png", PNG, "image/png")})).json()
    session_id = await progress_to_capture(client)
    capture = await action(client, session_id, "CREATE_CAPTURE", 7, {"uploaded_asset_id": uploaded["asset_id"]})
    assert capture.status_code == 200, capture.text
    for index, (name, payload) in enumerate([("ACCEPT", {}), ("ACCEPT_REALITY_PLUS", {}), ("SAVE_ADJUSTMENT_RECIPE", {"contrast": 14})], start=8):
        assert (await action(client, session_id, name, index, payload)).status_code == 200
    readback = (await client.get(f"/sessions/{session_id}")).json()
    assert readback["workflow_stage"] == "FINAL"
    assert readback["state"]["capture"]["uploaded_asset_id"] == uploaded["asset_id"]
    assert readback["state"]["capture"]["checksum"]["value"] == uploaded["sha256"]
    assert [item["kind"] for item in readback["assets"]] == ["CAPTURE", "FINAL", "REALITY_PLUS"] or len(readback["assets"]) == 3
    capture_asset = next(item for item in readback["assets"] if item["kind"] == "CAPTURE")
    final_asset = next(item for item in readback["assets"] if item["kind"] == "FINAL")
    assert capture_asset["lineage"]["source_asset_id"] == uploaded["asset_id"]
    assert final_asset["lineage"]["source_asset_id"] == "asset-reality-plus-001"
    final = await client.get(f"/sessions/{session_id}/final/content")
    assert final.status_code == 200
    assert final.content == PNG
    assert final.headers["x-xfx-transformation"] == "DETERMINISTIC_FAKE_REALITY_PLUS"


@pytest.mark.anyio
async def test_unknown_uploaded_asset_does_not_advance_capture(client):
    session_id = await progress_to_capture(client)
    response = await action(client, session_id, "CREATE_CAPTURE", 7, {"uploaded_asset_id": "upload-000000000000000000000000"})
    assert response.status_code == 422
    readback = (await client.get(f"/sessions/{session_id}")).json()
    assert readback["workflow_stage"] == "CAPTURE"
    assert readback["revision"] == 7
    assert readback["assets"] == []


@pytest.mark.anyio
async def test_fixture_final_cannot_masquerade_as_real_binary(client):
    session_id = await progress_to_capture(client)
    assert (await action(client, session_id, "CREATE_CAPTURE", 7)).status_code == 200
    for index, name in enumerate(["ACCEPT", "ACCEPT_REALITY_PLUS", "SAVE_ADJUSTMENT_RECIPE"], start=8):
        assert (await action(client, session_id, name, index)).status_code == 200
    response = await client.get(f"/sessions/{session_id}/final/content")
    assert response.status_code == 404
    assert response.json()["error"]["error_code"] == "ASSET_NOT_FOUND"


@pytest.mark.anyio
async def test_multiple_sessions_preserve_scoped_candidates_and_asset_lineage(client):
    first_upload = (await client.post("/assets/uploads", files={"file": ("first.png", PNG, "image/png")})).json()
    second_upload = (await client.post("/assets/uploads", files={"file": ("second.png", PNG, "image/png")})).json()
    session_ids = []
    for run, upload in enumerate((first_upload, second_upload)):
        session_id = await progress_to_capture(client)
        assert (await client.post(f"/sessions/{session_id}/actions", headers={"Idempotency-Key": f"multi-{run}"}, json={"action": "CREATE_CAPTURE", "payload": {"uploaded_asset_id": upload["asset_id"]}})).status_code == 200
        session_ids.append(session_id)
    for session_id, upload in zip(session_ids, (first_upload, second_upload), strict=True):
        readback = (await client.get(f"/sessions/{session_id}")).json()
        assert len(readback["candidates"]) == 4
        assert len(readback["assets"]) == 1
        assert readback["assets"][0]["lineage"]["source_asset_id"] == upload["asset_id"]
