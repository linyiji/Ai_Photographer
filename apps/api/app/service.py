from __future__ import annotations
import hashlib,json,math
from datetime import UTC,datetime
from uuid import NAMESPACE_URL,uuid4,uuid5
from .repository import Repository
from .capabilities import build_fake_capabilities

class DomainError(Exception):
    def __init__(self,code,message,status=409):super().__init__(message);self.code,self.message,self.status=code,message,status

class SessionService:
    FINE_TUNE_PARAMETERS={"BRIGHTNESS","WARMTH","SATURATION","SOFTNESS","BLUR"}
    FINE_TUNE_SCOPES={"ALL","PERSON","BACKGROUND","LOCAL_REGION"}
    FINE_TUNE_RUNTIME_VERSION="main-fine-tune-1.0.0"
    transitions={("ENTRY","SELECT_SHOOTING_RELATION"):"SHOOTING_RELATION_DEVICE_MODE",("SHOOTING_RELATION_DEVICE_MODE","CONFIRM_DEVICE_MODE"):"REALITY",("REALITY","ACCEPT_REALITY"):"TARGET",("TARGET","SELECT_TARGET"):"SHOT",("SHOT","ACCEPT_SHOT_DIRECTION"):"LIVE",("LIVE","ENTER_CAPTURE_WINDOW"):"CAPTURE",("CAPTURE","CREATE_CAPTURE"):"QA",("QA","ACCEPT"):"REALITY_PLUS",("QA","ACCEPT_WITH_REPAIR"):"REALITY_PLUS",("QA","RETAKE_MICRO"):"LIVE",("QA","RETAKE_POSE"):"LIVE",("QA","RETAKE_FRAMING"):"LIVE",("QA","RETAKE_POSITION"):"LIVE",("QA","REPLAN"):"SHOT",("REALITY_PLUS","ACCEPT_REALITY_PLUS"):"FINE_TUNE",("REALITY_PLUS","SKIP_FINE_TUNE"):"FINAL",("FINE_TUNE","SAVE_ADJUSTMENT_RECIPE"):"FINAL"}
    def __init__(self,repository:Repository,fixture_path):
        self.repository=repository;self.fixture=json.loads(fixture_path.read_text(encoding='utf-8'));self.capabilities=build_fake_capabilities(self.fixture)
        workflow_path=fixture_path.parent.parent/"workflow"/"workflow-v1.json";self.workflow=json.loads(workflow_path.read_text(encoding='utf-8'))
        self.transitions={(item["from"],item["action"]):item["to"] for item in self.workflow["transitions"]}
    @staticmethod
    def now():return datetime.now(UTC).isoformat()
    def create(self,create_input=None):
        normalized=self._normalize_create_input(create_input);sid,now=f"session-{uuid4().hex[:12]}",self.now();state={"scenario_id":self.fixture["scenario_id"],"shooting_relation":None,"device_mode":None,"entry_input":normalized,"context_reconcile":self._reconcile_context(normalized)}
        with self.repository.connect() as c:
            c.execute("INSERT INTO sessions VALUES(?,?,?,?,?,?)",(sid,"ENTRY",0,json.dumps(state),now,now));self._event(c,sid,"SESSION_CREATED",{"workflow_stage":"ENTRY","entry_source":normalized["entry_source"]});self._event(c,sid,"CONTEXT_RECONCILED",state["context_reconcile"])
        return self.get(sid)
    @staticmethod
    def _normalize_create_input(value):
        data=dict(value or {});entry=data.get("entry_source","LIVE")
        if entry not in {"LIVE","REFERENCE","RECOMMENDED_METHOD"}:raise DomainError("INVALID_SESSION_ENTRY","Unsupported Home entry source.",422)
        if entry=="REFERENCE" and not data.get("reference_asset_id"):raise DomainError("INVALID_SESSION_ENTRY","REFERENCE requires a persisted reference asset.",422)
        if entry=="RECOMMENDED_METHOD" and not data.get("intent_seed"):raise DomainError("INVALID_SESSION_ENTRY","RECOMMENDED_METHOD requires an intent seed.",422)
        return {"schema_version":"0.1.0","entry_source":entry,**{key:data[key] for key in ("home_context","reference_asset_id","intent_seed") if data.get(key) is not None}}
    @staticmethod
    def _reconcile_context(create_input):
        context=create_input.get("home_context") or {};accepted=[];discarded=[]
        if context:
            accepted.extend([key for key in ("city_code","city_name","weather","temperature_c","observed_at") if context.get(key) is not None])
            if context.get("landmark_asset_id"):discarded.append("landmark_asset_id:DECORATIVE_ONLY")
        if create_input.get("intent_seed"):accepted.append("intent_seed:USER_INTENT")
        if create_input.get("reference_asset_id"):accepted.append("reference_asset_id:USER_INTENT")
        return {"schema_version":"0.1.0","ordering":["OBSERVED","USER_INTENT","EXTERNAL_CONTEXT","DECORATIVE"],"accepted":accepted,"discarded":discarded,"landmark_authority":"DECORATIVE_ONLY"}
    def get(self,sid):
        with self.repository.connect() as c:
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            s=self.repository.decode(row);s["candidates"]=[self.repository.decode(x) for x in c.execute("SELECT * FROM candidates WHERE session_id=? ORDER BY candidate_id",(sid,))];s["assets"]=[self.repository.decode(x) for x in c.execute("SELECT * FROM assets WHERE session_id=? ORDER BY asset_id",(sid,))];s["events"]=[self.repository.decode(x) for x in c.execute("SELECT * FROM events WHERE session_id=? ORDER BY occurred_at",(sid,))];s["adjustment_recipes"]=[{**self.repository.decode(x),"recipe":json.loads(x["recipe_json"])} for x in c.execute("SELECT * FROM adjustment_recipes WHERE session_id=? ORDER BY updated_at",(sid,))];return s
    def list(self,classification=None):
        with self.repository.connect() as c:
            rows=c.execute("SELECT * FROM sessions ORDER BY updated_at DESC").fetchall()
            result=[]
            for row in rows:
                session=self.repository.decode(row);completed=session["workflow_stage"]=="FINAL"
                category="COMPLETED" if completed else "ACTIVE"
                if classification and classification!=category:continue
                state=session["state"];capture=state.get("capture",{});final=state.get("final",{})
                result.append({"session_id":session["session_id"],"created_at":session["created_at"],"updated_at":session["updated_at"],"workflow_stage":session["workflow_stage"],"status":category,"thumbnail_asset_id":capture.get("uploaded_asset_id"),"final_asset_id":final.get("source_upload_asset_id")})
            return result
    def mutate(self,sid,action,payload,key,fault=None):
        request_hash=hashlib.sha256(json.dumps({"action":action,"payload":payload},sort_keys=True,separators=(",",":")).encode()).hexdigest()
        with self.repository.connect() as c:
            cached=c.execute("SELECT request_hash,response_json FROM idempotency WHERE session_id=? AND key=?",(sid,key)).fetchone()
            if cached:
                if cached[0]!=request_hash:raise DomainError("IDEMPOTENCY_MISMATCH","Idempotency key was already used for a different command.")
                return json.loads(cached[1])
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            session=self.repository.decode(row);stage,state=session["workflow_stage"],session["state"]
            if fault in {"CAPABILITY_TIMEOUT","CAPABILITY_ERROR","CANDIDATE_REJECTED","MISSING_ASSET_REFERENCE","REALITY_PLUS_FAILURE"}:raise DomainError(fault,f"Lab fault: {fault}",504 if fault=="CAPABILITY_TIMEOUT" else 409)
            if fault=="PERSISTENCE_FAILURE_BEFORE_COMMIT":raise DomainError("PERSISTENCE_FAILURE","Lab persistence failure before mutation.",503)
            self._apply(c,sid,state,action,payload)
            if fault=="PERSISTENCE_FAILURE_DURING_TRANSACTION":raise DomainError("PERSISTENCE_FAILURE","Lab persistence failure during transaction.",503)
            if action=="GENERATE_TARGETS":next_stage=stage
            elif (stage,action) in self.transitions:next_stage=self.transitions[(stage,action)]
            else:raise DomainError("INVALID_TRANSITION",f"{action} is not valid from {stage}.")
            revision,now=int(session["revision"])+1,self.now();c.execute("UPDATE sessions SET workflow_stage=?,revision=?,state_json=?,updated_at=? WHERE session_id=?",(next_stage,revision,json.dumps(state),now,sid));self._event(c,sid,f"{action}_COMMITTED",{"from":stage,"to":next_stage,"revision":revision});result={"session_id":sid,"workflow_stage":next_stage,"revision":revision,"state":state};c.execute("INSERT INTO idempotency(session_id,key,request_hash,response_json) VALUES(?,?,?,?)",(sid,key,request_hash,json.dumps(result)));return result
    def fine_tune_source(self,sid):
        session=self.get(sid);state=session["state"]
        if session["workflow_stage"] not in {"REALITY_PLUS","FINE_TUNE"}:raise DomainError("INVALID_TRANSITION","Fine Tune source is available only after processing.")
        source=state.get("reality_plus")
        if not source:raise DomainError("ASSET_NOT_FOUND","Accepted RealityPlus source is unavailable.",404)
        upload_id=state.get("capture",{}).get("uploaded_asset_id")
        if not upload_id:raise DomainError("ASSET_NOT_FOUND","Fine Tune requires an immutable uploaded source binary.",404)
        with self.repository.connect() as c:stored=c.execute("SELECT mime_type,size_bytes,sha256,storage_ref FROM stored_assets WHERE asset_id=?",(upload_id,)).fetchone()
        if not stored:raise DomainError("ASSET_NOT_FOUND","Fine Tune source binary is unavailable.",404)
        return {"schema_version":"1.0.0","asset_id":source["asset_id"],"asset_kind":"REALITY_PLUS","version":1,"status":"ACCEPTED","storage_ref":source["storage_ref"],"created_at":session["updated_at"],"producer":"reality-plus-capability","source_asset_ids":[state["capture"]["asset_id"]],"checksum":{"algorithm":"SHA256","value":stored["sha256"]},"mime_type":stored["mime_type"],"size_bytes":stored["size_bytes"],"content_asset_id":upload_id}
    def get_recipe(self,sid):
        self.get(sid)
        with self.repository.connect() as c:row=c.execute("SELECT * FROM adjustment_recipes WHERE session_id=? ORDER BY updated_at DESC LIMIT 1",(sid,)).fetchone()
        if not row:return None
        result=self.repository.decode(row);result["recipe"]=json.loads(row["recipe_json"]);return result
    def save_recipe(self,sid,recipe,key):
        source=self.fine_tune_source(sid);self._validate_recipe(recipe,sid,source["asset_id"])
        canonical=json.dumps(recipe,sort_keys=True,separators=(",",":"));digest=hashlib.sha256(canonical.encode()).hexdigest();request_hash=hashlib.sha256(("SAVE_RECIPE:"+canonical).encode()).hexdigest();cache_key=f"fine-tune-recipe:{key}"
        with self.repository.connect() as c:
            cached=c.execute("SELECT request_hash,response_json FROM idempotency WHERE session_id=? AND key=?",(sid,cache_key)).fetchone()
            if cached:
                if cached[0]!=request_hash:raise DomainError("IDEMPOTENCY_MISMATCH","Recipe idempotency key was reused with different content.")
                return json.loads(cached[1])
            existing=c.execute("SELECT version,recipe_hash,created_at FROM adjustment_recipes WHERE session_id=? AND recipe_id=?",(sid,recipe["recipe_id"])).fetchone();now=self.now()
            version=existing["version"] if existing and existing["recipe_hash"]==digest else (existing["version"]+1 if existing else 1);created=existing["created_at"] if existing else recipe["created_at"]
            c.execute("INSERT INTO adjustment_recipes VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(session_id,recipe_id) DO UPDATE SET source_asset_id=excluded.source_asset_id,version=excluded.version,recipe_hash=excluded.recipe_hash,recipe_json=excluded.recipe_json,updated_at=excluded.updated_at",(recipe["recipe_id"],sid,source["asset_id"],version,digest,canonical,created,now))
            result={"recipe":recipe,"version":version,"recipe_hash":digest,"persistence":"MAIN_SQLITE_BUSINESS_OBJECT"};c.execute("INSERT INTO idempotency(session_id,key,request_hash,response_json) VALUES(?,?,?,?)",(sid,cache_key,request_hash,json.dumps(result)));return result
    def commit_scene_scan(self,sid,scan,frame_set,direction_map,view_evidence,precheck):
        scan_id=scan.get("scan_id")
        if not scan_id or any(value.get("source_scan_id")!=scan_id for value in (frame_set,direction_map,view_evidence,precheck)):
            raise DomainError("SCENE_SPATIAL_LINEAGE_INVALID","Scene Spatial evidence must share one Scan identity.",422)
        if scan.get("privacy",{}).get("raw_video_uploaded")!=0 or scan.get("privacy",{}).get("frame_stream_uploaded")!=0:
            raise DomainError("SCENE_SPATIAL_PRIVACY_INVALID","Raw video and frame stream upload are forbidden.",422)
        with self.repository.connect() as c:
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            session=self.repository.decode(row);state=session["state"];prior=state.get("scene_spatial")
            history=list(prior.get("history",[])) if prior else []
            if prior and prior.get("active_scan_id")!=scan_id:
                history.append({"scan_id":prior.get("active_scan_id"),"geometry_job":prior.get("geometry_job"),"spatial_evidence_ref":prior.get("spatial_evidence_ref")})
                self._event(c,sid,"GEOMETRY_SUPERSEDED",{"scan_id":prior.get("active_scan_id"),"superseded_by_scan_id":scan_id})
            scene_spatial={"schema_version":"0.1.0","active_scan_id":scan_id,"scene_scan_ref":{"scan_id":scan_id,"schema_version":scan.get("schema_version")},"scene_scan":scan,"scene_frame_set":frame_set,"scene_direction_map":direction_map,"view_evidence_ref":{"source_scan_id":scan_id,"schema_version":view_evidence.get("schema_version")},"view_evidence":view_evidence,"spatial_precheck":precheck,"geometry_job":{"request_id":None,"status":"PENDING","geometry_version":"p2-backend-v0.2","outcome":None},"spatial_evidence_ref":None,"spatial_evidence":None,"evidence_lineage":[scan_id,*frame_set.get("frame_refs",[])],"history":history,"view_path_usable":True}
            state["scene_spatial"]=scene_spatial
            revision,now=int(session["revision"])+1,self.now();c.execute("UPDATE sessions SET revision=?,state_json=?,updated_at=? WHERE session_id=?",(revision,json.dumps(state),now,sid))
            self._event(c,sid,"SCENE_SCAN_COMPLETED",{"scan_id":scan_id,"revision":revision})
            self._event(c,sid,"VIEW_EVIDENCE_READY",{"scan_id":scan_id,"view_candidate_count":len(view_evidence.get("view_candidates",[])),"geometry_status":"PENDING"})
        return self.get(sid)
    def request_geometry(self,sid,scan_id,request_id):
        with self.repository.connect() as c:
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            session=self.repository.decode(row);state=session["state"];spatial=state.get("scene_spatial")
            if not spatial:raise DomainError("SCENE_SCAN_NOT_FOUND","Commit P0/P1 evidence before Geometry.",409)
            if spatial.get("active_scan_id")!=scan_id:
                self._event(c,sid,"GEOMETRY_SUPERSEDED",{"scan_id":scan_id,"active_scan_id":spatial.get("active_scan_id"),"geometry_request_id":request_id});return False
            prior_request=spatial.get("geometry_job",{}).get("request_id")
            if prior_request and prior_request!=request_id:self._event(c,sid,"GEOMETRY_SUPERSEDED",{"scan_id":scan_id,"geometry_request_id":prior_request,"superseded_by_request_id":request_id})
            spatial["geometry_job"]={"request_id":request_id,"status":"RUNNING","geometry_version":"p2-backend-v0.2","outcome":None}
            revision,now=int(session["revision"])+1,self.now();c.execute("UPDATE sessions SET revision=?,state_json=?,updated_at=? WHERE session_id=?",(revision,json.dumps(state),now,sid));self._event(c,sid,"GEOMETRY_REQUESTED",{"scan_id":scan_id,"geometry_request_id":request_id,"geometry_version":"p2-backend-v0.2","revision":revision});return True
    def apply_spatial_evidence(self,sid,scan_id,request_id,evidence):
        if evidence.get("source_scan_id")!=scan_id or evidence.get("status_authority")!="FIRST_PARTY_BACKEND_GEOMETRY_SOLVER":raise DomainError("SPATIAL_EVIDENCE_AUTHORITY_INVALID","Only first-party backend Geometry evidence may update Session.",422)
        with self.repository.connect() as c:
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:raise DomainError("SESSION_NOT_FOUND","Session does not exist.",404)
            session=self.repository.decode(row);state=session["state"];spatial=state.get("scene_spatial")
            if not spatial or spatial.get("active_scan_id")!=scan_id:
                self._event(c,sid,"GEOMETRY_SUPERSEDED",{"scan_id":scan_id,"active_scan_id":spatial.get("active_scan_id") if spatial else None,"geometry_request_id":request_id});return False
            if spatial.get("geometry_job",{}).get("request_id")!=request_id:
                self._event(c,sid,"GEOMETRY_SUPERSEDED",{"scan_id":scan_id,"geometry_request_id":request_id,"active_geometry_request_id":spatial.get("geometry_job",{}).get("request_id")});return False
            status=evidence.get("status");spatial["geometry_job"]={"request_id":request_id,"status":"INSUFFICIENT" if status=="INSUFFICIENT" else "AVAILABLE","geometry_version":"p2-backend-v0.2","outcome":"SPATIAL_EVIDENCE"};spatial["spatial_evidence_ref"]={"source_scan_id":scan_id,"schema_version":evidence.get("schema_version"),"status":status};spatial["spatial_evidence"]=evidence;spatial["evidence_lineage"]=[*spatial.get("evidence_lineage",[]),*evidence.get("evidence_refs",[])]
            revision,now=int(session["revision"])+1,self.now();c.execute("UPDATE sessions SET revision=?,state_json=?,updated_at=? WHERE session_id=?",(revision,json.dumps(state),now,sid));event="SPATIAL_EVIDENCE_INSUFFICIENT" if status=="INSUFFICIENT" else "SPATIAL_EVIDENCE_AVAILABLE";self._event(c,sid,event,{"scan_id":scan_id,"geometry_request_id":request_id,"status":status,"revision":revision});return True
    def fail_geometry(self,sid,scan_id,request_id,error_code):
        with self.repository.connect() as c:
            row=c.execute("SELECT * FROM sessions WHERE session_id=?",(sid,)).fetchone()
            if not row:return False
            session=self.repository.decode(row);state=session["state"];spatial=state.get("scene_spatial")
            if not spatial or spatial.get("active_scan_id")!=scan_id:return False
            if spatial.get("geometry_job",{}).get("request_id")!=request_id:return False
            spatial["geometry_job"]={"request_id":request_id,"status":"FAILED","geometry_version":"p2-backend-v0.2","outcome":"NOT_PRODUCED"};spatial["spatial_evidence_ref"]=None;spatial["spatial_evidence"]=None
            revision,now=int(session["revision"])+1,self.now();c.execute("UPDATE sessions SET revision=?,state_json=?,updated_at=? WHERE session_id=?",(revision,json.dumps(state),now,sid));self._event(c,sid,"GEOMETRY_FAILED",{"scan_id":scan_id,"geometry_request_id":request_id,"error_code":error_code,"spatial_evidence":"NOT_PRODUCED","view_path_usable":True,"revision":revision});return True
    @classmethod
    def _validate_recipe(cls,recipe,sid,source_asset_id):
        required={"schema_version","recipe_id","session_id","source_asset_id","created_at","semantic_edit_allowed","adjustments"}
        if not isinstance(recipe,dict) or set(recipe)!=required:raise DomainError("INVALID_RECIPE","Recipe shape does not match M01.",422)
        if recipe["schema_version"]!="1.0.0" or recipe["semantic_edit_allowed"] is not False or recipe["session_id"]!=sid or recipe["source_asset_id"]!=source_asset_id:raise DomainError("INVALID_RECIPE","Recipe identity or semantic policy is invalid.",422)
        if not all(isinstance(recipe.get(name),str) and recipe[name] for name in ("recipe_id","session_id","source_asset_id","created_at")) or not isinstance(recipe["adjustments"],list):raise DomainError("INVALID_RECIPE","Recipe metadata is invalid.",422)
        regions={}
        for item in recipe["adjustments"]:
            if not isinstance(item,dict) or not {"scope","parameter","value"}.issubset(item) or set(item)-{"scope","parameter","value","region"}:raise DomainError("INVALID_RECIPE","Adjustment shape is invalid.",422)
            scope,parameter,value=item["scope"],item["parameter"],item["value"]
            if scope not in cls.FINE_TUNE_SCOPES or parameter not in cls.FINE_TUNE_PARAMETERS or isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not -1<=value<=1:raise DomainError("INVALID_RECIPE","Adjustment uses a deferred or unsafe value.",422)
            if parameter=="BLUR" and scope!="BACKGROUND":raise DomainError("INVALID_RECIPE","BLUR requires BACKGROUND scope.",422)
            region=item.get("region")
            if scope=="LOCAL_REGION":
                if not isinstance(region,dict) or set(region)!={"id","x","y","width","height","feather"}:raise DomainError("INVALID_RECIPE","LOCAL_REGION requires local-v1 geometry.",422)
                if not isinstance(region["id"],str) or not region["id"]:raise DomainError("INVALID_RECIPE","Region identity is invalid.",422)
                values=[region[name] for name in ("x","y","width","height","feather")]
                if any(isinstance(x,bool) or not isinstance(x,(int,float)) or not math.isfinite(x) for x in values):raise DomainError("INVALID_RECIPE","Region geometry must be finite.",422)
                if not (0<=region["x"]<=1-region["width"] and 0<=region["y"]<=1-region["height"] and .04<=region["width"]<=1 and .04<=region["height"]<=1 and .04<=region["feather"]<=.45):raise DomainError("INVALID_RECIPE","Region geometry is outside local-v1 bounds.",422)
                prior=regions.setdefault(region["id"],region)
                if prior!=region:raise DomainError("INVALID_RECIPE","One region id cannot carry conflicting geometry.",422)
            elif region is not None:raise DomainError("INVALID_RECIPE","Only LOCAL_REGION may include geometry.",422)
        if len(regions)>3:raise DomainError("INVALID_RECIPE","Local-v1 permits at most three regions.",422)
    def _apply(self,c,sid,state,action,payload):
        if action=="SELECT_SHOOTING_RELATION":state["shooting_relation"]=payload.get("shooting_relation","FRIEND")
        elif action=="CONFIRM_DEVICE_MODE":state["device_mode"]=payload.get("device_mode","SINGLE")
        elif action=="ACCEPT_REALITY":state["reality"]=self.capabilities["reality"].execute("observe",state)
        elif action=="GENERATE_TARGETS":
            for item in self.capabilities["target"].execute("generate",state):self._candidate(c,sid,item["id"],"TARGET","PROPOSED",item)
        elif action=="SELECT_TARGET":
            candidate_id=payload.get("candidate_id","target-cinematic");found=c.execute("SELECT payload_json FROM candidates WHERE session_id=? AND candidate_id=?",(sid,candidate_id)).fetchone()
            if not found:raise DomainError("CANDIDATE_NOT_FOUND","Generate target candidates first.",404)
            state["selected_target"]=json.loads(found[0]);c.execute("UPDATE candidates SET disposition='ACCEPTED' WHERE session_id=? AND candidate_id=?",(sid,candidate_id))
        elif action=="ACCEPT_SHOT_DIRECTION":state["shot"]=self.capabilities["shot"].execute("plan",state)
        elif action=="ENTER_CAPTURE_WINDOW":
            steps=self.capabilities["live"].execute("advance",state);state["live"]={"step":len(steps),"instruction":steps[-1],"ready":True}
        elif action=="CREATE_CAPTURE":
            uploaded_asset_id=payload.get("uploaded_asset_id")
            if uploaded_asset_id:
                stored=c.execute("SELECT asset_id,mime_type,size_bytes,sha256,source,storage_ref FROM stored_assets WHERE asset_id=?",(uploaded_asset_id,)).fetchone()
                if not stored:raise DomainError("INVALID_ASSET","Uploaded asset does not exist or is not accepted.",422)
                capture={"asset_id":"asset-capture-001","capture_mode":"STATIC_MANUAL","storage_ref":stored["storage_ref"],"uploaded_asset_id":stored["asset_id"],"mime_type":stored["mime_type"],"size_bytes":stored["size_bytes"],"checksum":{"algorithm":"SHA256","value":stored["sha256"]},"source":stored["source"]}
                lineage={"source_asset_id":stored["asset_id"],"source":"AUTHORIZED_MULTIPART_UPLOAD"}
            else:
                capture={"asset_id":"asset-capture-001",**self.capabilities["capture"].execute("capture",state)}
                lineage={"scenario_id":self.fixture["scenario_id"]}
            state["capture"]=capture;self._asset(c,sid,"asset-capture-001","CAPTURE",capture["storage_ref"],lineage);self._candidate(c,sid,"capture-candidate-001","CAPTURE","PROPOSED",capture)
        elif action in {"ACCEPT","ACCEPT_WITH_REPAIR"}:state["evaluation"]={**self.capabilities["qa"].execute("evaluate",state),"decision":action};state["capture_decision"]=action;c.execute("UPDATE candidates SET disposition='ACCEPTED' WHERE session_id=? AND kind='CAPTURE'",(sid,))
        elif action.startswith("RETAKE_") or action=="REPLAN":state["retake_plan"]={"decision":action,"preserved":self._preserved(action)}
        elif action=="ACCEPT_REALITY_PLUS":
            item={"asset_id":"asset-reality-plus-001",**self.capabilities["reality_plus"].execute("enhance",state)};state["reality_plus"]=item;self._asset(c,sid,item["asset_id"],"REALITY_PLUS",item["storage_ref"],{"source_asset_id":"asset-capture-001"})
        elif action=="SKIP_FINE_TUNE":state["final"]=self._final_projection(state)
        elif action=="SAVE_ADJUSTMENT_RECIPE":
            if "adjustment_recipe_id" not in payload:
                state["adjustment_recipe"]={**self.fixture["recipe"],**payload};state["final"]=self._final_projection(state);self._asset(c,sid,"asset-final-001","FINAL",self.fixture["final"]["storage_ref"],{"source_asset_id":"asset-reality-plus-001"})
            else:self._finalize_fine_tune(c,sid,state,payload)
    def _finalize_fine_tune(self,c,sid,state,payload):
        recipe_id=payload.get("adjustment_recipe_id");upload_id=payload.get("derived_upload_asset_id");runtime=payload.get("runtime_version")
        recipe_row=c.execute("SELECT * FROM adjustment_recipes WHERE session_id=? AND recipe_id=?",(sid,recipe_id)).fetchone();stored=c.execute("SELECT * FROM stored_assets WHERE asset_id=?",(upload_id,)).fetchone() if upload_id else None
        if not recipe_row:raise DomainError("INVALID_RECIPE","Persisted recipe is required before Finalize.",422)
        source=state.get("reality_plus",{}).get("asset_id")
        if recipe_row["source_asset_id"]!=source:raise DomainError("SOURCE_INVALIDATED","Recipe source no longer matches the accepted source.",409)
        if runtime!=self.FINE_TUNE_RUNTIME_VERSION:raise DomainError("INVALID_RUNTIME","Finalize runtime version is not admitted.",422)
        recipe=json.loads(recipe_row["recipe_json"]);identity=hashlib.sha256(f"{source}:{recipe_row['recipe_hash']}:{runtime}".encode()).hexdigest();now=self.now()
        if not recipe["adjustments"]:
            if upload_id or payload.get("neutral") is not True:raise DomainError("INVALID_ASSET","Neutral Finalize must select the accepted source without a derived upload.",422)
            state["adjustment_recipe"]=recipe;state["my_final_photo"]={"schema_version":"1.0.0","final_photo_id":f"final-photo-{identity[:16]}","session_id":sid,"selected_asset_id":source,"selected_at":now,"adjustment_recipe_id":recipe_id,"lineage_asset_ids":[state["capture"]["asset_id"],source]};state["final"]={**self._final_projection(state),"selected_asset_id":source,"adjustment_recipe_id":recipe_id,"runtime_version":runtime,"render_backend":None,"render_metrics":{},"transformation":"FINE_TUNE_NEUTRAL_SOURCE_SELECTION"};return
        if not stored or stored["mime_type"]!="image/jpeg":raise DomainError("INVALID_ASSET","Finalize requires a persisted derived JPEG.",422)
        asset_id=f"asset-fine-tune-{identity[:16]}"
        lineage={"source_asset_ids":[source],"adjustment_recipe_id":recipe_id,"adjustment_recipe_version":recipe_row["version"],"runtime_version":runtime,"checksum":{"algorithm":"SHA256","value":stored["sha256"]},"mime_type":stored["mime_type"],"size_bytes":stored["size_bytes"],"mask_identity":payload.get("mask_identity"),"region_semantics":"INTEGRATION_LOCAL_V1_SEMANTICS"}
        self._asset(c,sid,asset_id,"FINE_TUNE_DERIVED",stored["storage_ref"],lineage,"DERIVED")
        state["adjustment_recipe"]=recipe;state["asset_manifest"]={"schema_version":"1.0.0","manifest_id":f"manifest-{sid}","version":recipe_row["version"],"updated_at":now,"assets":[{"asset_id":asset_id,"asset_kind":"FINE_TUNE_DERIVED","version":1,"status":"DERIVED","storage_ref":stored["storage_ref"],"created_at":stored["created_at"],"updated_at":now,"producer":runtime,"source_asset_ids":[source],"checksum":{"algorithm":"SHA256","value":stored["sha256"]},"policy_ref":"INTEGRATION_LOCAL_V1_SEMANTICS","validation_evidence_refs":[]}]}
        state["my_final_photo"]={"schema_version":"1.0.0","final_photo_id":f"final-photo-{identity[:16]}","session_id":sid,"selected_asset_id":asset_id,"selected_at":now,"adjustment_recipe_id":recipe_id,"lineage_asset_ids":[state["capture"]["asset_id"],source,asset_id]}
        state["final"]={**self._final_projection(state),"source_upload_asset_id":upload_id,"selected_asset_id":asset_id,"adjustment_recipe_id":recipe_id,"runtime_version":runtime,"render_backend":payload.get("render_backend"),"render_metrics":payload.get("render_metrics",{}),"transformation":"REAL_DETERMINISTIC_FINE_TUNE"}
    @staticmethod
    def _preserved(action):return {"RETAKE_MICRO":["REALITY","TARGET","SHOT","CAMERA_POSITION","SUBJECT_POSITION","FRAMING","MAJOR_POSE"],"RETAKE_POSE":["REALITY","TARGET","SHOT","CAMERA_POSITION","SUBJECT_POSITION","FRAMING"],"RETAKE_FRAMING":["REALITY","TARGET","SHOT","SUBJECT_POSITION"],"RETAKE_POSITION":["REALITY","TARGET","SHOT","CAMERA_POSITION"],"REPLAN":["REALITY","TARGET"]}[action]
    def _final_projection(self,state):
        final=dict(self.fixture["final"])
        uploaded_asset_id=state.get("capture",{}).get("uploaded_asset_id")
        if uploaded_asset_id:final["source_upload_asset_id"]=uploaded_asset_id
        return final
    def _candidate(self,c,sid,cid,kind,disposition,payload):c.execute("INSERT OR REPLACE INTO candidates VALUES(?,?,?,?,?)",(cid,sid,kind,disposition,json.dumps(payload)))
    def _asset(self,c,sid,aid,kind,ref,lineage,status="AVAILABLE"):c.execute("INSERT OR REPLACE INTO assets VALUES(?,?,?,?,?,?)",(aid,sid,kind,status,ref,json.dumps(lineage)))
    def _event(self,c,sid,event_type,payload):c.execute("INSERT OR IGNORE INTO events VALUES(?,?,?,?,?)",(str(uuid5(NAMESPACE_URL,f"{sid}:{event_type}:{json.dumps(payload,sort_keys=True)}")),sid,event_type,json.dumps(payload),self.now()))
