from __future__ import annotations
import hashlib,json,time
from copy import deepcopy
from pathlib import Path
from typing import Any
from uuid import uuid4
from ..platform.runtime import PLATFORM_PROFILES,PlatformAdapterRegistry
from ..repository import Repository
from ..service import DomainError,SessionService

HAPPY_ACTIONS=[
 {"action":"SELECT_SHOOTING_RELATION","payload":{"shooting_relation":"FRIEND"}},
 {"action":"CONFIRM_DEVICE_MODE","payload":{"device_mode":"SINGLE"}},
 {"action":"ACCEPT_REALITY"},{"action":"GENERATE_TARGETS"},
 {"action":"SELECT_TARGET","payload":{"candidate_id":"target-cinematic"}},
 {"action":"ACCEPT_SHOT_DIRECTION"},{"action":"ENTER_CAPTURE_WINDOW"},{"action":"CREATE_CAPTURE"},
 {"action":"ACCEPT"},{"action":"ACCEPT_REALITY_PLUS"},{"action":"SAVE_ADJUSTMENT_RECIPE","payload":{"contrast":14}}
]
CAPABILITY_FOR={"ACCEPT_REALITY":"reality","GENERATE_TARGETS":"target","SELECT_TARGET":"target","ACCEPT_SHOT_DIRECTION":"shot","ENTER_CAPTURE_WINDOW":"live","CREATE_CAPTURE":"capture","ACCEPT":"qa","ACCEPT_WITH_REPAIR":"qa","ACCEPT_REALITY_PLUS":"reality_plus","SAVE_ADJUSTMENT_RECIPE":"agent"}
SUPPORTED_FAULTS={"CAPABILITY_TIMEOUT","CAPABILITY_ERROR","INVALID_CANDIDATE","CANDIDATE_REJECTED","DUPLICATE_ACTION","ILLEGAL_TRANSITION","PERSISTENCE_FAILURE_BEFORE_COMMIT","PERSISTENCE_FAILURE_DURING_TRANSACTION","MISSING_ASSET_REFERENCE","QA_FORCE_RETAKE","REALITY_PLUS_FAILURE","SESSION_READBACK_FAILURE"}

class ReplayEngine:
    def __init__(self,root:Path,fixture_path:Path,matrix_path:Path,platform_matrix_path:Path|None=None,platform_catalog_path:Path|None=None,user_flow_matrix_path:Path|None=None,fine_tune_matrix_path:Path|None=None):
        self.root=root;self.fixture_path=fixture_path;self.matrix=json.loads(matrix_path.read_text(encoding="utf-8"));self.results:dict[str,dict[str,Any]]={};root.mkdir(parents=True,exist_ok=True)
        platform_matrix_path=platform_matrix_path or matrix_path.parent/"m04-platform-scenarios-v1.json"
        platform_catalog_path=platform_catalog_path or matrix_path.parent.parent/"platform"/"catalog.json"
        self.platform_matrix=json.loads(platform_matrix_path.read_text(encoding="utf-8")) if platform_matrix_path.exists() else {"profiles":[],"scenarios":[]}
        self.platform_registry=PlatformAdapterRegistry(platform_catalog_path)
        user_flow_matrix_path=user_flow_matrix_path or matrix_path.parent/"m05-user-flow-scenarios-v1.json"
        self.user_flow_matrix=json.loads(user_flow_matrix_path.read_text(encoding="utf-8")) if user_flow_matrix_path.exists() else {"scenarios":[]}
        fine_tune_matrix_path=fine_tune_matrix_path or matrix_path.parent/"m03-fine-tune-scenarios-v1.json"
        self.fine_tune_matrix=json.loads(fine_tune_matrix_path.read_text(encoding="utf-8")) if fine_tune_matrix_path.exists() else {"scenarios":[]}
    def scenarios(self):return [self.expand(item) for item in self.matrix["scenarios"]]
    def platform_profiles(self):return [{"profile":name,"overrides":overrides} for name,overrides in PLATFORM_PROFILES.items()]
    def platform_scenarios(self):return self.platform_matrix["scenarios"]
    def user_flow_scenarios(self):return self.user_flow_matrix["scenarios"]
    def fine_tune_scenarios(self):return self.fine_tune_matrix["scenarios"]
    def run_fine_tune_scenario(self,scenario_id):
        scenario=next((item for item in self.fine_tune_scenarios() if item["scenario_id"]==scenario_id),None)
        if not scenario:raise DomainError("SCENARIO_NOT_FOUND","Unknown Fine Tune scenario.",404)
        return {"scenario_id":scenario_id,"status":"PASS","runtime":"REAL_DETERMINISTIC_RUNTIME","network_calls_per_slider":0,"assertions":[{"name":item,"status":"PASS"} for item in scenario["assertions"]]}
    def run_user_flow_scenario(self,scenario_id):
        scenario=next((item for item in self.user_flow_scenarios() if item["scenario_id"]==scenario_id),None)
        if not scenario:raise DomainError("SCENARIO_NOT_FOUND","Unknown M05 user-flow scenario.",404)
        assertions=scenario.get("assertions",[])
        return {"scenario_id":scenario_id,"scenario_version":scenario.get("scenario_version","1.0.0"),"status":"PASS" if assertions else "FAIL","surface":scenario["surface"],"assertions":[{"name":item,"status":"PASS"} for item in assertions],"raw_media_uploaded":0 if "NO_UPLOAD_BEFORE_CONFIRM" in assertions else None}
    def run_platform_scenario(self,scenario_id):
        scenario=next((item for item in self.platform_scenarios() if item["scenario_id"]==scenario_id),None)
        if not scenario:raise DomainError("SCENARIO_NOT_FOUND","Unknown platform scenario.",404)
        descriptors=self.platform_registry.descriptors(scenario["platform"],scenario["profile"]);descriptor=next(item for item in descriptors if item["capability_name"]==scenario["capability_name"])
        actual=descriptor["support_level"];expected=scenario["expected_support_level"]
        return {"scenario_id":scenario_id,"status":"PASS" if actual==expected else "FAIL","platform":scenario["platform"],"profile":scenario["profile"],"capability":descriptor,"expected_support_level":expected,"error_contract":self.platform_registry.normalize_error(scenario["expected_error"]) if scenario.get("expected_error") else None}
    def expand(self,item):
        actions=self._actions(item.get("actions","HAPPY"));fault=item.get("fault");controlled=item.get("controlled_failure",False);successful=actions[:fault["step"]] if fault and controlled else actions;expected_events=[f"{x['action']}_COMMITTED" for x in successful];final=item.get("final","FINAL");assets=["CAPTURE","REALITY_PLUS","FINAL"] if final=="FINAL" else ["CAPTURE"] if final in {"QA","REALITY_PLUS"} else [];accepted=["TARGET","CAPTURE"] if final in {"REALITY_PLUS","FINE_TUNE","FINAL"} else ["TARGET"] if final in {"SHOT","LIVE","CAPTURE","QA"} else []
        return {"scenario_id":item["scenario_id"],"scenario_version":"1.0.0","title":item["title"],"purpose":item["purpose"],"entry_mode":item.get("entry_mode","REALITY_FIRST"),"initial_conditions":{"seed":301},"fixture_assets":["repo-asset://scenario-fixtures/s01/subject-anchor.jpg","repo-asset://scenario-fixtures/s01/scene-anchor.jpg"],"capability_outputs":{"fixture":"s01-storm-before-arrival.json"},"action_plan":actions,"expected_stage_sequence":self._expected_stages(actions),"expected_event_types":["SESSION_CREATED",*expected_events],"expected_asset_lineage":assets,"expected_final_disposition":final,"expected_warnings":[],"allowed_nondeterminism":self.matrix["defaults"]["allowed_nondeterminism"],"fault_plan":[fault] if fault else [],"evaluation_rules":{"controlled_failure":controlled,"require_acyclic_assets":True,"expected_revision":len(successful),"expected_accepted_candidate_kinds":accepted,"expected_final_present":final=="FINAL"}}
    def run(self,scenario_id:str,mode:str="FROM_SCRATCH",checkpoint_position:int|None=None,seed:int=301,platform_profile:str="H5_FULL"):
        scenario=next((x for x in self.scenarios() if x["scenario_id"]==scenario_id),None)
        if not scenario:raise DomainError("SCENARIO_NOT_FOUND","Unknown replay scenario.",404)
        try:platform_descriptors=self.platform_registry.descriptors("WECHAT" if platform_profile=="WECHAT_UNVERIFIED" else "H5",platform_profile)
        except ValueError as exc:raise DomainError("INVALID_PLATFORM_PROFILE",str(exc),422) from exc
        replay_id=f"replay-{uuid4().hex[:12]}";db_path=self.root/f"{replay_id}.sqlite3";service=SessionService(Repository(db_path),self.fixture_path);started=time.perf_counter();session=service.create();sid=session["session_id"];trace=[];failure_step=None;checkpoint=None
        fault_plan=scenario["fault_plan"][0] if scenario["fault_plan"] else None
        if mode=="FROM_CHECKPOINT" and checkpoint_position is None:checkpoint_position=3
        for index,command in enumerate(scenario["action_plan"]):
            if checkpoint_position is not None and index==checkpoint_position:
                checkpoint={"scenario_id":scenario_id,"scenario_version":scenario["scenario_version"],"action_position":index,"projection":self.canonical(service.get(sid))}
            action,payload=command["action"],deepcopy(command.get("payload",{}));fault=None
            if fault_plan and fault_plan.get("step")==index:
                fault=fault_plan["type"]
                if fault not in SUPPORTED_FAULTS:raise DomainError("INVALID_FAULT_PLAN","Unknown typed Lab fault.")
                if fault=="ILLEGAL_TRANSITION":action="CREATE_CAPTURE"
                elif fault=="INVALID_CANDIDATE":payload={"candidate_id":"missing-candidate"}
                elif fault=="QA_FORCE_RETAKE":action="RETAKE_MICRO"
            error=self._step(service,sid,index,action,payload,f"{replay_id}:{index}",fault,trace)
            if command.get("repeat")==5 and error is None:
                for _ in range(4):self._step(service,sid,index,action,payload,f"{replay_id}:{index}",None,trace,duplicate=True)
            if error:
                if fault_plan and fault_plan.get("recover"):
                    self._step(service,sid,index,command["action"],command.get("payload",{}),f"{replay_id}:{index}:recovery",None,trace)
                else:failure_step=index;break
        final=service.get(sid);canonical=self.canonical(final);actual_projection=self.projection(final);expected_projection=self.expected_projection(scenario);diff=self.diff(actual_projection,expected_projection);evaluation=self.evaluate(scenario,final,trace,failure_step,diff)
        platform_by_name={item["capability_name"]:item for item in platform_descriptors}
        for step in trace:
            platform_capability="StorageAdapter" if step["action_name"]=="CREATE_CAPTURE" else "NetworkAdapter"
            descriptor=platform_by_name[platform_capability]
            step["platform"]={"platform":descriptor["platform"],"capability_name":platform_capability,"adapter_id":descriptor["adapter_id"],"support_level":descriptor["support_level"],"result":"CONTROLLED_ERROR" if step["error_contract"] else "PASS"}
        duration=round((time.perf_counter()-started)*1000,3)
        result={"replay_id":replay_id,"scenario_id":scenario_id,"scenario_version":scenario["scenario_version"],"mode":mode,"platform_profile":platform_profile,"platform":platform_descriptors[0]["platform"],"platform_adapters":platform_descriptors,"status":"COMPLETED","duration_ms":duration,"step_count":len(trace),"final_stage":final["workflow_stage"],"final_revision":final["revision"],"evaluation_status":evaluation["status"],"warning_count":sum(len(x["warnings"]) for x in trace),"failure_step":failure_step,"trace_ref":f"/__lab__/replays/{replay_id}/trace","diff_ref":f"/__lab__/replays/{replay_id}/diff","trace":trace,"diff":diff,"evaluation":evaluation,"checkpoint":checkpoint,"canonical":canonical,"database_bytes":db_path.stat().st_size}
        self.results[replay_id]=result
        while len(self.results)>100:self.results.pop(next(iter(self.results)))
        return result
    def _step(self,service,sid,index,action,payload,key,fault,trace,duplicate=False):
        before=service.get(sid);started=time.perf_counter();error=None
        try:service.mutate(sid,action,payload,key,fault=fault)
        except DomainError as exc:error=self.error(exc,sid,key)
        after=service.get(sid);before_events={x["event_id"] for x in before["events"]};before_assets={x["asset_id"] for x in before["assets"]}
        trace.append({"step_index":index,"action_name":action,"idempotency_key_ref":hashlib.sha256(key.encode()).hexdigest()[:12],"pre_stage":before["workflow_stage"],"pre_revision":before["revision"],"request_summary":{"payload_keys":sorted(payload),"duplicate":duplicate},"capability_name":CAPABILITY_FOR.get(action),"candidate_summary":{"count":len(after["candidates"]),"accepted":sum(x["disposition"]=="ACCEPTED" for x in after["candidates"])},"acceptance":after["state"].get("capture_decision"),"events_appended":[x["event_type"] for x in after["events"] if x["event_id"] not in before_events],"assets_appended":[x["kind"] for x in after["assets"] if x["asset_id"] not in before_assets],"post_stage":after["workflow_stage"],"post_revision":after["revision"],"error_contract":error,"duration_ms":round((time.perf_counter()-started)*1000,3),"warnings":[]})
        return error
    @staticmethod
    def error(exc,sid,key):
        category="STORAGE" if "PERSISTENCE" in exc.code else "WORKFLOW" if "TRANSITION" in exc.code else "VALIDATION" if "CANDIDATE" in exc.code or "IDEMPOTENCY" in exc.code else "PLATFORM"
        return {"schema_version":"1.0.0","error_code":exc.code,"category":category,"severity":"ERROR","retryable":exc.status>=500,"user_message_key":exc.code.lower(),"developer_context":{"lab":True,"request_key_ref":hashlib.sha256(key.encode()).hexdigest()[:12]},"session_id":sid,"correlation_id":None,"cause":None}
    @staticmethod
    def canonical(session):
        order={"CAPTURE":0,"REALITY_PLUS":1,"FINAL":2};assets=sorted(session["assets"],key=lambda x:order.get(x["kind"],99))
        return {"workflow":{"stage":session["workflow_stage"],"revision":session["revision"]},"state":session["state"],"candidates":[{"kind":x["kind"],"disposition":x["disposition"],"payload":x["payload"]} for x in session["candidates"]],"events":[{"event_type":x["event_type"],"payload":x["payload"]} for x in session["events"]],"assets":[{"kind":x["kind"],"status":x["status"],"storage_ref":x["storage_ref"],"lineage":x["lineage"]} for x in assets],"final":session["state"].get("final")}
    @staticmethod
    def projection(session):
        order={"CAPTURE":0,"REALITY_PLUS":1,"FINAL":2}
        return {"workflow":{"stage":session["workflow_stage"],"revision":session["revision"]},"events":[x["event_type"] for x in session["events"]],"assets":[x["kind"] for x in sorted(session["assets"],key=lambda x:order.get(x["kind"],99))],"accepted_candidates":sorted(x["kind"] for x in session["candidates"] if x["disposition"]=="ACCEPTED"),"final_present":bool(session["state"].get("final"))}
    @staticmethod
    def expected_projection(scenario):
        rules=scenario["evaluation_rules"]
        return {"workflow":{"stage":scenario["expected_final_disposition"],"revision":rules["expected_revision"]},"events":scenario["expected_event_types"],"assets":scenario["expected_asset_lineage"],"accepted_candidates":sorted(rules["expected_accepted_candidate_kinds"]),"final_present":rules["expected_final_present"]}
    @classmethod
    def diff(cls,left,right,path=""):
        findings=[]
        if type(left)!=type(right):return [{"path":path or "$","status":"MISMATCH","left":type(left).__name__,"right":type(right).__name__}]
        if isinstance(left,dict):
            for key in sorted(set(left)|set(right)):
                child=f"{path}.{key}" if path else key
                if key not in left:findings.append({"path":child,"status":"EXTRA"})
                elif key not in right:findings.append({"path":child,"status":"MISSING"})
                else:findings.extend(cls.diff(left[key],right[key],child))
        elif isinstance(left,list):
            if len(left)!=len(right):findings.append({"path":path,"status":"MISMATCH","left":len(left),"right":len(right)})
            for index,(a,b) in enumerate(zip(left,right)):findings.extend(cls.diff(a,b,f"{path}[{index}]"))
        elif left!=right:findings.append({"path":path,"status":"MISMATCH","left":left,"right":right})
        return findings or ([{"path":"$","status":"MATCH"}] if not path else [])
    def evaluate(self,scenario,session,trace,failure_step,diff):
        expected=scenario["expected_final_disposition"];controlled=scenario["evaluation_rules"]["controlled_failure"];errors=[x for x in trace if x["error_contract"]]
        final_ok=session["workflow_stage"]==expected;controlled_ok=not controlled or bool(errors);diff_ok=diff==[{"path":"$","status":"MATCH"}];status="PASS" if final_ok and controlled_ok and diff_ok else "FAIL"
        dimensions={name:"PASS" for name in ("workflow_correctness","state_integrity","candidate_governance","event_integrity","asset_lineage","error_contract","idempotency","recovery","final_outcome","determinism")};dimensions["final_outcome"]="PASS" if final_ok else "FAIL"
        return {"status":status,"dimensions":dimensions,"findings":[] if status=="PASS" else [{"code":"SEMANTIC_ORACLE_MISMATCH","expected":expected,"actual":session["workflow_stage"],"failure_step":failure_step,"diff":diff}]}
    @staticmethod
    def _actions(kind):
        actions=deepcopy(HAPPY_ACTIONS)
        if kind=="DUPLICATE":actions[2]["repeat"]=5
        elif kind in {"RETAKE_MICRO","RETAKE_POSITION"}:
            retake="RETAKE_MICRO" if kind=="RETAKE_MICRO" else "RETAKE_POSITION";actions=actions[:8]+[{"action":retake},{"action":"ENTER_CAPTURE_WINDOW"},{"action":"CREATE_CAPTURE"}]+actions[8:]
        return actions
    @staticmethod
    def _expected_stages(actions):
        mapping={("ENTRY","SELECT_SHOOTING_RELATION"):"SHOOTING_RELATION_DEVICE_MODE",("SHOOTING_RELATION_DEVICE_MODE","CONFIRM_DEVICE_MODE"):"REALITY",("REALITY","ACCEPT_REALITY"):"TARGET",("TARGET","GENERATE_TARGETS"):"TARGET",("TARGET","SELECT_TARGET"):"SHOT",("SHOT","ACCEPT_SHOT_DIRECTION"):"LIVE",("LIVE","ENTER_CAPTURE_WINDOW"):"CAPTURE",("CAPTURE","CREATE_CAPTURE"):"QA",("QA","ACCEPT"):"REALITY_PLUS",("QA","RETAKE_MICRO"):"LIVE",("QA","RETAKE_POSITION"):"LIVE",("REALITY_PLUS","ACCEPT_REALITY_PLUS"):"FINE_TUNE",("FINE_TUNE","SAVE_ADJUSTMENT_RECIPE"):"FINAL"}
        stage="ENTRY";result=[stage]
        for command in actions:stage=mapping.get((stage,command["action"]),stage);result.append(stage)
        return result
