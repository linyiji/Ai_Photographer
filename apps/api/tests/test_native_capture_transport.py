from __future__ import annotations

import importlib
from pathlib import Path
import httpx
import pytest


@pytest.fixture()
async def client(tmp_path:Path,monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH",str(tmp_path/"native.sqlite3"));monkeypatch.setenv("XFX_ASSET_ROOT",str(tmp_path/"assets"));monkeypatch.delenv("XFX_LAB_MODE",raising=False)
    import app.main as main
    importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app),base_url="http://test") as value:yield value


def jpeg(size:int)->bytes:return b"\xff\xd8\xff"+b"\0"*(size-3)


@pytest.mark.anyio
@pytest.mark.parametrize("size",[7*1024*1024,9*1024*1024,20*1024*1024])
async def test_native_jpeg_payload_classes_reach_origin_and_persist(client,size):
    response=await client.post("/assets/uploads",files={"file":("native.jpg",jpeg(size),"image/jpeg")},headers={"Idempotency-Key":f"native-{size}"})
    assert response.status_code==201 and response.headers["X-XFX-Origin-Reached"]=="1"
    metadata=response.json();assert metadata["size_bytes"]==size
    assert (await client.get(f"/assets/{metadata['asset_id']}")).status_code==200


@pytest.mark.anyio
async def test_lost_response_retry_replays_same_asset_without_duplicate_authority(client):
    payload=jpeg(7*1024*1024);headers={"Idempotency-Key":"candidate-session-a-local-1"}
    first=await client.post("/assets/uploads",files={"file":("native.jpg",payload,"image/jpeg")},headers=headers)
    second=await client.post("/assets/uploads",files={"file":("native.jpg",payload,"image/jpeg")},headers=headers)
    assert first.status_code==second.status_code==201;assert first.json()["asset_id"]==second.json()["asset_id"]
    assert second.headers["X-XFX-Idempotent-Replay"]=="1"
    import app.main as main
    with main.repository.connect() as connection:assert connection.execute("SELECT COUNT(*) FROM stored_assets").fetchone()[0]==1


@pytest.mark.anyio
async def test_over_max_native_payload_is_deterministically_rejected(client):
    response=await client.post("/assets/uploads",files={"file":("native.jpg",jpeg(20*1024*1024+1),"image/jpeg")},headers={"Idempotency-Key":"too-large"})
    assert response.status_code==413 and response.json()["error"]["error_code"]=="INVALID_ASSET"
