from __future__ import annotations

import importlib
from pathlib import Path

import httpx
import pytest

from app.lab.engine import ReplayEngine


ROOT=Path(__file__).resolve().parents[3]
FIXTURE=ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json"
M03=ROOT/"packages"/"scenario-fixtures"/"m03-scenario-matrix-v2.json"
M04=ROOT/"packages"/"scenario-fixtures"/"m04-platform-scenarios-v1.json"
M05=ROOT/"packages"/"scenario-fixtures"/"m05-user-flow-scenarios-v1.json"
CATALOG=ROOT/"packages"/"platform"/"catalog.json"
PNG=b"\x89PNG\r\n\x1a\n"+b"xfx-m05-confirmed-still"*4


@pytest.fixture()
async def client(tmp_path:Path,monkeypatch):
    monkeypatch.setenv("XFX_DATABASE_PATH",str(tmp_path/"m05.sqlite3"))
    monkeypatch.setenv("XFX_ASSET_ROOT",str(tmp_path/"assets"))
    monkeypatch.setenv("XFX_PRODUCT_MODE","INTERNAL_DEMO")
    monkeypatch.delenv("XFX_LAB_MODE",raising=False)
    import app.main as main
    importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app),base_url="http://test") as value:
        yield value


async def command(client,sid,index,name,payload=None,key=None):
    return await client.post(f"/sessions/{sid}/actions",headers={"Idempotency-Key":key or f"m05-{index}"},json={"action":name,"payload":payload or {}})


async def to_capture(client):
    sid=(await client.post("/sessions")).json()["session_id"]
    actions=[("SELECT_SHOOTING_RELATION",{"shooting_relation":"FRIEND"}),("CONFIRM_DEVICE_MODE",{"device_mode":"SINGLE"}),("ACCEPT_REALITY",{}),("GENERATE_TARGETS",{}),("SELECT_TARGET",{"candidate_id":"target-cinematic"}),("ACCEPT_SHOT_DIRECTION",{}),("ENTER_CAPTURE_WINDOW",{})]
    for index,(name,payload) in enumerate(actions):assert (await command(client,sid,index,name,payload)).status_code==200
    return sid


@pytest.mark.anyio
async def test_runtime_readiness_discloses_internal_fakes_and_blocks_production(client):
    internal=(await client.get("/runtime/readiness?mode=INTERNAL_DEMO")).json()
    production=(await client.get("/runtime/readiness?mode=PRODUCTION")).json()
    assert internal["ready"] is True and internal["fake_ai_present"] is True
    assert production["ready"] is False and production["public_production_ready"] is False
    assert {"reality","target","shot","live","qa","reality_plus","fine_tune"}<=set(production["blocking_capabilities"])
    assert production["capabilities"]["workflow"]["implementation"]=="REAL"


@pytest.mark.anyio
async def test_sessions_are_explicitly_projected_as_active_or_completed(client):
    active_id=(await client.post("/sessions")).json()["session_id"]
    active=(await client.get("/sessions?classification=ACTIVE")).json()
    assert active[0]["session_id"]==active_id and active[0]["status"]=="ACTIVE"
    assert (await client.get("/sessions?classification=STALE")).status_code==422


@pytest.mark.anyio
async def test_local_candidate_and_retake_do_not_upload_or_advance(client):
    sid=await to_capture(client)
    before=(await client.get(f"/sessions/{sid}")).json()
    import app.main as main
    with main.repository.connect() as connection:upload_count=connection.execute("SELECT COUNT(*) FROM stored_assets").fetchone()[0]
    after=(await client.get(f"/sessions/{sid}")).json()
    assert upload_count==0
    assert before["workflow_stage"]==after["workflow_stage"]=="CAPTURE"
    assert before["revision"]==after["revision"]==7 and after["assets"]==[]


@pytest.mark.anyio
async def test_confirmed_upload_and_duplicate_confirmation_commit_once(client):
    sid=await to_capture(client)
    uploaded=(await client.post("/assets/uploads",files={"file":("confirmed.png",PNG,"image/png")})).json()
    key="capture-confirm-local-candidate-1"
    first=await command(client,sid,7,"CREATE_CAPTURE",{"uploaded_asset_id":uploaded["asset_id"]},key)
    second=await command(client,sid,7,"CREATE_CAPTURE",{"uploaded_asset_id":uploaded["asset_id"]},key)
    assert first.status_code==second.status_code==200
    readback=(await client.get(f"/sessions/{sid}")).json()
    assert readback["workflow_stage"]=="QA" and readback["revision"]==8
    assert len(readback["assets"])==1
    assert [event["event_type"] for event in readback["events"]].count("CREATE_CAPTURE_COMMITTED")==1


@pytest.mark.anyio
async def test_refresh_readback_after_target_capture_qa_and_final_and_works(client):
    sid=await to_capture(client)
    capture_stage=(await client.get(f"/sessions/{sid}")).json();assert capture_stage["workflow_stage"]=="CAPTURE"
    uploaded=(await client.post("/assets/uploads",files={"file":("confirmed.png",PNG,"image/png")})).json()
    assert (await command(client,sid,7,"CREATE_CAPTURE",{"uploaded_asset_id":uploaded["asset_id"]})).status_code==200
    assert (await client.get(f"/sessions/{sid}")).json()["workflow_stage"]=="QA"
    assert (await command(client,sid,8,"ACCEPT")).status_code==200
    assert (await command(client,sid,9,"SKIP_FINE_TUNE")).status_code==200
    final=(await client.get(f"/sessions/{sid}")).json();assert final["workflow_stage"]=="FINAL"
    works=(await client.get("/sessions?classification=COMPLETED")).json()
    assert works[0]["session_id"]==sid and works[0]["thumbnail_asset_id"]==uploaded["asset_id"] and works[0]["final_asset_id"]==uploaded["asset_id"]
    content=await client.get(f"/sessions/{sid}/final/content");assert content.status_code==200 and content.content==PNG


def test_m05_replay_matrix_has_twelve_passing_user_scenarios(tmp_path):
    engine=ReplayEngine(tmp_path/"lab",FIXTURE,M03,M04,CATALOG,M05)
    scenarios=engine.user_flow_scenarios();assert len(scenarios)==12
    results=[engine.run_user_flow_scenario(item["scenario_id"]) for item in scenarios]
    assert all(result["status"]=="PASS" for result in results)
    retake=next(result for result in results if result["scenario_id"]=="CAPTURE_RETAKE_BEFORE_CONFIRM")
    assert retake["raw_media_uploaded"]==0
