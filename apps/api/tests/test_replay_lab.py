from __future__ import annotations
import importlib,json,os
from pathlib import Path
import httpx,pytest
from app.lab.engine import ReplayEngine,SUPPORTED_FAULTS
from app.repository import Repository
from app.service import DomainError,SessionService

ROOT=Path(__file__).resolve().parents[3]
FIXTURE=ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json"
MATRIX=ROOT/"packages"/"scenario-fixtures"/"m03-scenario-matrix-v2.json"

@pytest.fixture()
def engine(tmp_path):return ReplayEngine(tmp_path/"lab",FIXTURE,MATRIX)

def test_manifest_v2_is_versioned_and_expands_required_fields(engine):
    scenarios=engine.scenarios();assert engine.matrix["manifest_version"]=="2.0.0";assert len(scenarios)==12
    required={"scenario_id","scenario_version","title","purpose","entry_mode","initial_conditions","fixture_assets","capability_outputs","action_plan","expected_stage_sequence","expected_event_types","expected_asset_lineage","expected_final_disposition","expected_warnings","allowed_nondeterminism","fault_plan","evaluation_rules"}
    assert all(required<=set(item) for item in scenarios)
    assert not any(":" in ref[:3] or ref.startswith("/") for item in scenarios for ref in item["fixture_assets"])

@pytest.mark.parametrize("scenario_id",["S01_HAPPY_PATH","S01_RELOAD_RESUME","S01_PARTIAL_RETAKE_MICRO","S01_PARTIAL_RETAKE_POSITION","TARGET_FIRST_ENTRY","DUPLICATE_ACTION_IDEMPOTENCY","ILLEGAL_TRANSITION_REJECTED","CAPABILITY_TIMEOUT_RECOVERY","INVALID_CANDIDATE_REJECTED","PERSISTENCE_ROLLBACK","MISSING_ASSET_REFERENCE","REALITY_PLUS_FAILURE_RECOVERY"])
def test_scenario_matrix(scenario_id,engine):
    result=engine.run(scenario_id,"FAULT_INJECTED" if scenario_id not in {"S01_HAPPY_PATH","S01_RELOAD_RESUME","S01_PARTIAL_RETAKE_MICRO","S01_PARTIAL_RETAKE_POSITION","TARGET_FIRST_ENTRY","DUPLICATE_ACTION_IDEMPOTENCY"} else "FROM_SCRATCH")
    assert result["evaluation_status"]=="PASS";assert result["diff"]==[{"path":"$","status":"MATCH"}]

def test_multi_run_semantic_determinism(engine):
    for scenario in ["S01_HAPPY_PATH","S01_PARTIAL_RETAKE_MICRO","DUPLICATE_ACTION_IDEMPOTENCY","PERSISTENCE_ROLLBACK"]:
        left=engine.run(scenario);right=engine.run(scenario);assert engine.diff(left["canonical"],right["canonical"])==[{"path":"$","status":"MATCH"}]

@pytest.mark.parametrize("position",[3,5,9])
def test_checkpoint_resume_matches_full_run(position,engine):
    full=engine.run("S01_HAPPY_PATH","FROM_SCRATCH");resumed=engine.run("S01_HAPPY_PATH","FROM_CHECKPOINT",position)
    assert resumed["checkpoint"]["action_position"]==position;assert engine.diff(full["canonical"],resumed["canonical"])==[{"path":"$","status":"MATCH"}]

def test_persistence_failure_rolls_back_before_recovery(engine):
    result=engine.run("PERSISTENCE_ROLLBACK","FAULT_INJECTED");failed=next(x for x in result["trace"] if x["error_contract"])
    assert failed["pre_revision"]==failed["post_revision"];assert failed["events_appended"]==[];assert failed["assets_appended"]==[]

def test_idempotency_repetition_does_not_inflate_revision(engine):
    result=engine.run("DUPLICATE_ACTION_IDEMPOTENCY");duplicates=[x for x in result["trace"] if x["request_summary"]["duplicate"]]
    assert len(duplicates)==4;assert all(x["pre_revision"]==x["post_revision"] and not x["events_appended"] for x in duplicates)

def test_idempotency_payload_mismatch_is_governed(tmp_path):
    service=SessionService(Repository(tmp_path/"idempotency.sqlite3"),FIXTURE);sid=service.create()["session_id"]
    service.mutate(sid,"SELECT_SHOOTING_RELATION",{"shooting_relation":"FRIEND"},"same")
    with pytest.raises(DomainError,match="different command") as caught:service.mutate(sid,"SELECT_SHOOTING_RELATION",{"shooting_relation":"SOLO"},"same")
    assert caught.value.code=="IDEMPOTENCY_MISMATCH";assert service.get(sid)["revision"]==1

def test_trace_is_bounded_and_contains_no_raw_media_or_secret(engine):
    result=engine.run("S01_HAPPY_PATH");encoded=json.dumps(result["trace"])
    assert len(result["trace"])==11;assert "base64" not in encoded.lower();assert "PRIVATE KEY" not in encoded;assert result["database_bytes"]<1_000_000

def test_asset_lineage_and_events_are_integral(engine):
    result=engine.run("S01_HAPPY_PATH");canonical=result["canonical"]
    assert [x["kind"] for x in canonical["assets"]]==["CAPTURE","REALITY_PLUS","FINAL"]
    assert len(canonical["events"])==13;assert canonical["events"][1]["event_type"]=="CONTEXT_RECONCILED";assert canonical["assets"][2]["lineage"]["source_asset_id"]=="asset-reality-plus-001"

def test_semantic_diff_reports_paths(engine):
    left={"workflow":{"stage":"FINAL"},"events":[{"event_type":"A"}]};right={"workflow":{"stage":"QA"},"events":[{"event_type":"B"}]}
    findings=engine.diff(left,right);assert {x["path"] for x in findings}=={"workflow.stage","events[0].event_type"};assert all(x["status"]=="MISMATCH" for x in findings)

def test_fault_registry_contains_required_named_faults():
    assert len(SUPPORTED_FAULTS)==12;assert {"CAPABILITY_TIMEOUT","PERSISTENCE_FAILURE_DURING_TRANSACTION","SESSION_READBACK_FAILURE","REALITY_PLUS_FAILURE"}<=SUPPORTED_FAULTS

@pytest.mark.anyio
async def test_lab_mode_disabled_by_default(tmp_path,monkeypatch):
    monkeypatch.delenv("XFX_LAB_MODE",raising=False);monkeypatch.setenv("XFX_DATABASE_PATH",str(tmp_path/"normal.sqlite3"))
    import app.main as main;importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app),base_url="http://test") as client:
        assert (await client.get("/__lab__/scenarios")).status_code==404;assert (await client.get("/health")).status_code==200

@pytest.mark.anyio
async def test_lab_mode_enabled_exposes_only_typed_surface(tmp_path,monkeypatch):
    monkeypatch.setenv("XFX_LAB_MODE","1");monkeypatch.setenv("XFX_LAB_ROOT",str(tmp_path/"lab"));monkeypatch.setenv("XFX_DATABASE_PATH",str(tmp_path/"normal.sqlite3"));monkeypatch.delenv("XFX_ENVIRONMENT",raising=False)
    import app.main as main;importlib.reload(main)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app),base_url="http://test") as client:
        assert len((await client.get("/__lab__/scenarios")).json())==12
        replay=await client.post("/__lab__/replays",json={"scenario_id":"S01_HAPPY_PATH","mode":"FROM_SCRATCH"});assert replay.status_code==201
        rid=replay.json()["replay_id"];assert (await client.get(f"/__lab__/replays/{rid}/trace")).status_code==200;assert (await client.get("/__lab__/sql")).status_code==404

def test_production_lab_mode_is_blocked(tmp_path,monkeypatch):
    monkeypatch.setenv("XFX_LAB_MODE","1");monkeypatch.setenv("XFX_ENVIRONMENT","production");monkeypatch.setenv("XFX_DATABASE_PATH",str(tmp_path/"normal.sqlite3"))
    import app.main as main
    with pytest.raises(RuntimeError,match="forbidden"):importlib.reload(main)
    monkeypatch.delenv("XFX_LAB_MODE");monkeypatch.delenv("XFX_ENVIRONMENT");importlib.reload(main)
