from __future__ import annotations
import json
from datetime import UTC,datetime
from uuid import NAMESPACE_URL,uuid4,uuid5
from .repository import Repository
from .capabilities import build_fake_capabilities

class DomainError(Exception):
    def __init__(self,code,message,status=409):super().__init__(message);self.code,self.message,self.status=code,message,status

class SessionService:
    transitions={("ENTRY","SELECT_SHOOTING_RELATION"):"SHOOTING_RELATION_DEVICE_MODE",("SHOOTING_RELATION_DEVICE_MODE","CONFIRM_DEVICE_MODE"):"REALITY",("REALITY","ACCEPT_REALITY"):"TARGET",("TARGET","SELECT_TARGET"):"SHOT",("SHOT","ACCEPT_SHOT_DIRECTION"):"LIVE",("LIVE","ENTER_CAPTURE_WINDOW"):"CAPTURE",("CAPTURE","CREATE_CAPTURE"):"QA",("QA","ACCEPT"):"REALITY_PLUS",("QA","ACCEPT_WITH_REPAIR"):"REALITY_PLUS",("QA","RETAKE_MICRO"):"LIVE",("QA","RETAKE_POSE"):"LIVE",("QA","RETAKE_FRAMING"):"LIVE",("QA","RETAKE_POSITION"):"LIVE",("QA","REPLAN"):"SHOT",("REALITY_PLUS","ACCEPT_REALITY_PLUS"):"FINE_TUNE",("REALITY_PLUS","SKIP_FINE_TUNE"):"FINAL",("FINE_TUNE","SAVE_ADJUSTMENT_RECIPE"):"FINAL"}
    def __init__(self,repository:Repository,fixture_path):
        self.repository=repository;self.fixture=json.loads(fixture_path.read_text(encoding='utf-8'));self.capabilities=build_fake_capabilities(self.fixture)
        workflow_path=fixture_path.parent.parent/"workflow"/"workflow-v1.json";self.workflow=json.loads(workflow_path.read_text(encoding='utf-8'))
        self.transitions={(item["from"],item["action"]):item["to"] for item in self.workflow["transitions"]}
    @staticmethod
    def now():return datetime.now(UTC).isoformat()
    def create(self):
        sid,now=f"session-{uuid4().hex[:12]}",self.now();state={"scenario_id":self.fixture["scenario_id"],"shooting_relation":None,"device_mode":None}
        with self.repository.connect() as c:c.execute("INSERT INTO sessions VALUES(?,?,?,?,?,?)",(sid,"ENTRY",0,json.dumps(state),now,now));self._event(c,sid,"SESSION_CREATED",{"workflow_stage":"ENTRY"})
        return self.get(sid)
    def get(self,sid):
        with self.repository.connect() as c:
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            s=self.repository.decode(row);s["candidates"]=[self.repository.decode(x) for x in c.execute("SELECT * FROM candidates WHERE session_id=? ORDER BY candidate_id",(sid,))];s["assets"]=[self.repository.decode(x) for x in c.execute("SELECT * FROM assets WHERE session_id=? ORDER BY asset_id",(sid,))];s["events"]=[self.repository.decode(x) for x in c.execute("SELECT * FROM events WHERE session_id=? ORDER BY occurred_at",(sid,))];return s
    def mutate(self,sid,action,payload,key):
        with self.repository.connect() as c:
            cached=c.execute("SELECT response_json FROM idempotency WHERE session_id=? AND key=?",(sid,key)).fetchone()
            if cached:return json.loads(cached[0])
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            session=self.repository.decode(row);stage,state=session["workflow_stage"],session["state"];self._apply(c,sid,state,action,payload)
            if action=="GENERATE_TARGETS":next_stage=stage
            elif (stage,action) in self.transitions:next_stage=self.transitions[(stage,action)]
            else:raise DomainError("INVALID_TRANSITION",f"{action} is not valid from {stage}.")
            revision,now=int(session["revision"])+1,self.now();c.execute("UPDATE sessions SET workflow_stage=?,revision=?,state_json=?,updated_at=? WHERE session_id=?",(next_stage,revision,json.dumps(state),now,sid));self._event(c,sid,f"{action}_COMMITTED",{"from":stage,"to":next_stage,"revision":revision});result={"session_id":sid,"workflow_stage":next_stage,"revision":revision,"state":state};c.execute("INSERT INTO idempotency VALUES(?,?,?)",(sid,key,json.dumps(result)));return result
    def _apply(self,c,sid,state,action,payload):
        if action=="SELECT_SHOOTING_RELATION":state["shooting_relation"]=payload.get("shooting_relation","FRIEND")
        elif action=="CONFIRM_DEVICE_MODE":state["device_mode"]=payload.get("device_mode","SINGLE")
        elif action=="ACCEPT_REALITY":state["reality"]=self.capabilities["reality"].execute("observe",state)
        elif action=="GENERATE_TARGETS":
            for item in self.capabilities["target"].execute("generate",state):self._candidate(c,sid,item["id"],"TARGET","PROPOSED",item)
        elif action=="SELECT_TARGET":
            candidate_id=payload.get("candidate_id","target-cinematic");found=c.execute("SELECT payload_json FROM candidates WHERE session_id=? AND candidate_id=?",(sid,candidate_id)).fetchone()
            if not found:raise DomainError("CANDIDATE_NOT_FOUND","Generate target candidates first.",404)
            state["selected_target"]=json.loads(found[0]);c.execute("UPDATE candidates SET disposition='ACCEPTED' WHERE candidate_id=?",(candidate_id,))
        elif action=="ACCEPT_SHOT_DIRECTION":state["shot"]=self.capabilities["shot"].execute("plan",state)
        elif action=="ENTER_CAPTURE_WINDOW":
            steps=self.capabilities["live"].execute("advance",state);state["live"]={"step":len(steps),"instruction":steps[-1],"ready":True}
        elif action=="CREATE_CAPTURE":
            capture={"asset_id":"asset-capture-001",**self.capabilities["capture"].execute("capture",state)};state["capture"]=capture;self._asset(c,sid,"asset-capture-001","CAPTURE",capture["storage_ref"],{"scenario_id":self.fixture["scenario_id"]});self._candidate(c,sid,"capture-candidate-001","CAPTURE","PROPOSED",capture)
        elif action in {"ACCEPT","ACCEPT_WITH_REPAIR"}:state["evaluation"]={**self.capabilities["qa"].execute("evaluate",state),"decision":action};state["capture_decision"]=action;c.execute("UPDATE candidates SET disposition='ACCEPTED' WHERE session_id=? AND kind='CAPTURE'",(sid,))
        elif action.startswith("RETAKE_") or action=="REPLAN":state["retake_plan"]={"decision":action,"preserved":self._preserved(action)}
        elif action=="ACCEPT_REALITY_PLUS":
            item={"asset_id":"asset-reality-plus-001",**self.capabilities["reality_plus"].execute("enhance",state)};state["reality_plus"]=item;self._asset(c,sid,item["asset_id"],"REALITY_PLUS",item["storage_ref"],{"source_asset_id":"asset-capture-001"})
        elif action=="SKIP_FINE_TUNE":state["final"]=self.fixture["final"]
        elif action=="SAVE_ADJUSTMENT_RECIPE":state["adjustment_recipe"]={**self.fixture["recipe"],**payload};state["final"]=self.fixture["final"];self._asset(c,sid,"asset-final-001","FINAL",self.fixture["final"]["storage_ref"],{"source_asset_id":"asset-reality-plus-001"})
    @staticmethod
    def _preserved(action):return {"RETAKE_MICRO":["REALITY","TARGET","SHOT","CAMERA_POSITION","SUBJECT_POSITION","FRAMING","MAJOR_POSE"],"RETAKE_POSE":["REALITY","TARGET","SHOT","CAMERA_POSITION","SUBJECT_POSITION","FRAMING"],"RETAKE_FRAMING":["REALITY","TARGET","SHOT","SUBJECT_POSITION"],"RETAKE_POSITION":["REALITY","TARGET","SHOT","CAMERA_POSITION"],"REPLAN":["REALITY","TARGET"]}[action]
    def _candidate(self,c,sid,cid,kind,disposition,payload):c.execute("INSERT OR REPLACE INTO candidates VALUES(?,?,?,?,?)",(cid,sid,kind,disposition,json.dumps(payload)))
    def _asset(self,c,sid,aid,kind,ref,lineage):c.execute("INSERT OR REPLACE INTO assets VALUES(?,?,?,?,?,?)",(aid,sid,kind,"AVAILABLE",ref,json.dumps(lineage)))
    def _event(self,c,sid,event_type,payload):c.execute("INSERT OR IGNORE INTO events VALUES(?,?,?,?,?)",(str(uuid5(NAMESPACE_URL,f"{sid}:{event_type}:{json.dumps(payload,sort_keys=True)}")),sid,event_type,json.dumps(payload),self.now()))
