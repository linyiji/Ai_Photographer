from __future__ import annotations

import importlib
from pathlib import Path

import httpx
import pytest


@pytest.fixture()
async def client(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH", str(tmp_path / "wechat-baseline.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT", str(tmp_path / "assets"))
    monkeypatch.setenv("XFX_PRODUCT_MODE", "INTERNAL_DEMO")
    import app.main as main

    importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://test") as value:
        yield value


HOME = {"schema_version": "0.1.0", "reliability": "EXTERNAL_CONTEXT", "city_code": "440100", "city_name": "广州", "weather": "SUNNY", "landmark_asset_id": "guangzhou-tower-home-v1"}


@pytest.mark.anyio
@pytest.mark.parametrize("payload", [
    {"schema_version": "0.1.0", "entry_source": "LIVE", "home_context": HOME},
    {"schema_version": "0.1.0", "entry_source": "REFERENCE", "home_context": HOME, "reference_asset_id": "upload-reference-001"},
    {"schema_version": "0.1.0", "entry_source": "RECOMMENDED_METHOD", "home_context": HOME, "intent_seed": {"method_id": "walk_capture", "title": "轻松行走抓拍", "tag": "自然"}},
])
async def test_three_home_entries_create_one_authoritative_session_and_reconcile(payload, client):
    response = await client.post("/sessions", json=payload)
    assert response.status_code == 201
    session = response.json()
    assert session["state"]["entry_input"]["entry_source"] == payload["entry_source"]
    reconcile = session["state"]["context_reconcile"]
    assert reconcile["ordering"] == ["OBSERVED", "USER_INTENT", "EXTERNAL_CONTEXT", "DECORATIVE"]
    assert reconcile["landmark_authority"] == "DECORATIVE_ONLY"
    assert "landmark_asset_id:DECORATIVE_ONLY" in reconcile["discarded"]
    assert len([event for event in session["events"] if event["event_type"] == "CONTEXT_RECONCILED"]) == 1


@pytest.mark.anyio
async def test_entry_contract_rejects_missing_reference_or_intent(client):
    reference = await client.post("/sessions", json={"schema_version": "0.1.0", "entry_source": "REFERENCE"})
    recommended = await client.post("/sessions", json={"schema_version": "0.1.0", "entry_source": "RECOMMENDED_METHOD"})
    assert reference.status_code == recommended.status_code == 422
    assert reference.json()["error"]["error_code"] == "INVALID_SESSION_ENTRY"
    assert recommended.json()["error"]["error_code"] == "INVALID_SESSION_ENTRY"
