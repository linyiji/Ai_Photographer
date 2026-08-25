from __future__ import annotations
import importlib,os
from pathlib import Path
import httpx,pytest

@pytest.fixture()
async def client(tmp_path:Path):
    os.environ["XFX_DATABASE_PATH"]=str(tmp_path/"test.sqlite3")
    import app.main as main
    importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app),base_url="http://test") as value:yield value

async def act(client,sid,action,key,payload=None):return await client.post(f"/sessions/{sid}/actions",headers={"Idempotency-Key":key},json={"action":action,"payload":payload or {}})

@pytest.mark.anyio
async def test_s01_full_flow_network_and_persistence(client):
    sid=(await client.post("/sessions")).json()["session_id"]
    steps=[("SELECT_SHOOTING_RELATION",{"shooting_relation":"FRIEND"}),("CONFIRM_DEVICE_MODE",{"device_mode":"SINGLE"}),("ACCEPT_REALITY",{}),("GENERATE_TARGETS",{}),("SELECT_TARGET",{"candidate_id":"target-cinematic"}),("ACCEPT_SHOT_DIRECTION",{}),("ENTER_CAPTURE_WINDOW",{}),("CREATE_CAPTURE",{}),("ACCEPT",{}),("ACCEPT_REALITY_PLUS",{}),("SAVE_ADJUSTMENT_RECIPE",{"contrast":14})]
    for index,(action,payload) in enumerate(steps):
        response=await act(client,sid,action,f"flow-{index}",payload);assert response.status_code==200,response.text
    readback=(await client.get(f"/sessions/{sid}")).json();assert readback["workflow_stage"]=="FINAL";assert readback["state"]["selected_target"]["id"]=="target-cinematic";assert len(readback["assets"])==3;assert len(readback["events"])==12

@pytest.mark.anyio
async def test_idempotency_and_retake_preservation(client):
    sid=(await client.post("/sessions")).json()["session_id"]
    for index,action in enumerate(["SELECT_SHOOTING_RELATION","CONFIRM_DEVICE_MODE","ACCEPT_REALITY","GENERATE_TARGETS"]):assert (await act(client,sid,action,f"setup-{index}")).status_code==200
    await act(client,sid,"SELECT_TARGET","select",{"candidate_id":"target-cinematic"});await act(client,sid,"ACCEPT_SHOT_DIRECTION","shot");await act(client,sid,"ENTER_CAPTURE_WINDOW","live");await act(client,sid,"CREATE_CAPTURE","capture")
    first=await act(client,sid,"RETAKE_MICRO","retake");second=await act(client,sid,"RETAKE_MICRO","retake");assert first.json()==second.json()
    state=(await client.get(f"/sessions/{sid}")).json()["state"];assert state["reality"] and state["selected_target"] and state["shot"]

@pytest.mark.anyio
async def test_invalid_transition_uses_error_contract_shape(client):
    sid=(await client.post("/sessions")).json()["session_id"];response=await act(client,sid,"CREATE_CAPTURE","bad");assert response.status_code==409;assert set(response.json()["error"])=={"code","message","retryable","correlation_id"}

@pytest.mark.anyio
async def test_m01_workflow_and_capability_seams_are_consumed(client):
    import app.main as main
    assert main.service.workflow["authority_status"]=="LOCKED_M01"
    assert len(main.service.transitions)==len(main.service.workflow["transitions"])
    assert set(main.service.capabilities)=={"reality","target","shot","live","capture","qa","reality_plus","voice","agent"}
