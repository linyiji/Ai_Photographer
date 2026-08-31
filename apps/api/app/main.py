from __future__ import annotations
import json,os
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI,File,Header,Request,Response,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse,JSONResponse
from pydantic import BaseModel,Field
from .ai import AICapabilityLab,ModelRegistry,PromptRegistry,ProviderConfig
from .platform import DevelopmentLocalStorageAdapter,PlatformAdapterRegistry
from .product import ProductRuntimeReadiness
from .repository import Repository
from .scene_spatial import SceneSpatialService,build_scene_spatial_adapter
from .service import DomainError,SessionService

ROOT=Path(__file__).resolve().parents[3]
DB_PATH=Path(os.environ.get("XFX_DATABASE_PATH",ROOT/"apps"/"api"/".data"/"xfx-m02.sqlite3"))
repository=Repository(DB_PATH)
service=SessionService(repository,ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json")
scene_spatial_mode=os.environ.get("SCENE_SPATIAL_MODE","REAL").upper()
scene_spatial=SceneSpatialService(build_scene_spatial_adapter(scene_spatial_mode))
asset_storage=DevelopmentLocalStorageAdapter(Path(os.environ.get("XFX_ASSET_ROOT",ROOT/"apps"/"api"/".local"/"assets")),repository)
platform_registry=PlatformAdapterRegistry(ROOT/"packages"/"platform"/"catalog.json")
product_readiness=ProductRuntimeReadiness(os.environ.get("XFX_PRODUCT_MODE","INTERNAL_DEMO"))
provider_config=ProviderConfig.from_environment()
prompt_registry=PromptRegistry(ROOT/"apps"/"api"/"app"/"ai"/"registry"/"prompts.json")
model_registry=ModelRegistry(ROOT/"apps"/"api"/"app"/"ai"/"registry"/"models.json")
app=FastAPI(title="XFX Main API",version="0.4.0")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])
LAB_MODE=os.environ.get("XFX_LAB_MODE")=="1"
if LAB_MODE and os.environ.get("XFX_ENVIRONMENT","").lower()=="production":raise RuntimeError("XFX Lab mode is forbidden in production")
if LAB_MODE:
    from .lab.api import create_lab_router
    from .lab.engine import ReplayEngine
    lab_root=Path(os.environ.get("XFX_LAB_ROOT",ROOT/"apps"/"api"/".data"/"lab"))
    lab_engine=ReplayEngine(lab_root,ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json",ROOT/"packages"/"scenario-fixtures"/"m03-scenario-matrix-v2.json",ROOT/"packages"/"scenario-fixtures"/"m04-platform-scenarios-v1.json",ROOT/"packages"/"platform"/"catalog.json",ROOT/"packages"/"scenario-fixtures"/"m05-user-flow-scenarios-v1.json")
    ai_lab=AICapabilityLab(prompt_registry,model_registry,provider_config.safe_projection())
    app.include_router(create_lab_router(lab_engine,ai_lab))

class ActionBody(BaseModel):
    action:str
    payload:dict=Field(default_factory=dict)

class RecipeBody(BaseModel):
    recipe:dict

class HomeContextBody(BaseModel):
    schema_version:str="0.1.0"
    reliability:str="EXTERNAL_CONTEXT"
    city_code:str
    city_name:str
    weather:str="UNKNOWN"
    temperature_c:float|None=None
    observed_at:str|None=None
    landmark_asset_id:str|None=None

class IntentSeedBody(BaseModel):
    method_id:str
    title:str
    tag:str|None=None

class SessionCreateBody(BaseModel):
    schema_version:str="0.1.0"
    entry_source:str="LIVE"
    home_context:HomeContextBody|None=None
    reference_asset_id:str|None=None
    intent_seed:IntentSeedBody|None=None

class SceneScanCommitBody(BaseModel):
    scene_scan:dict
    frame_set:dict
    direction_map:dict
    view_evidence:dict
    spatial_precheck:dict

@app.middleware("http")
async def correlation(request:Request,call_next):
    cid=request.headers.get("X-Correlation-ID",str(uuid4()));request.state.correlation_id=cid;response=await call_next(request);response.headers["X-Correlation-ID"]=cid;return response

@app.exception_handler(DomainError)
async def domain_error(request:Request,exc:DomainError):
    category="STORAGE" if "PERSISTENCE" in exc.code or "STORAGE" in exc.code else "NETWORK" if "NETWORK" in exc.code else "PLATFORM" if exc.code in {"PLATFORM_UNSUPPORTED","SHARE_FAILURE","USER_CANCELLED"} else "WORKFLOW" if "TRANSITION" in exc.code else "VALIDATION" if any(token in exc.code for token in ("CANDIDATE","IDEMPOTENCY","ASSET","GEOMETRY","SPATIAL","SCENE_SCAN")) else "INTERNAL"
    return JSONResponse(status_code=exc.status,content={"error":{"schema_version":"1.0.0","error_code":exc.code,"category":category,"severity":"ERROR","retryable":exc.status>=500,"user_message_key":exc.code.lower(),"developer_context":{},"session_id":request.path_params.get("session_id"),"correlation_id":request.state.correlation_id,"cause":None}})

@app.get("/health")
def health():return {"status":"ok","runtime":"LOCKED_L1","database":"sqlite"}

@app.get("/capabilities")
def capabilities():return {"scenario":"S01_STORM_BEFORE_ARRIVAL","mode":"GOVERNED_REPLACEMENT","capabilities":["reality","target","shot","live","capture","qa","reality_plus","voice","agent","scene_spatial"],"fake_live_selected":True,"qa_selected_adapter":"FAKE_INTERNAL_ONLY","qa_shadow_available":True,"real_provider_configured":provider_config.configured,"scene_spatial_provider":scene_spatial_mode}

@app.get("/runtime/readiness")
def runtime_readiness(mode:str|None=None):
    try:return product_readiness.projection(mode)
    except ValueError as exc:raise DomainError("INVALID_RUNTIME_MODE",str(exc),422) from exc

@app.get("/platform/adapters")
def platform_adapters(platform:str="H5",profile:str|None=None):
    try:return {"platform":platform.upper(),"profile":profile or ("WECHAT_UNVERIFIED" if platform.upper()=="WECHAT" else "H5_FULL"),"adapters":platform_registry.descriptors(platform,profile)}
    except ValueError as exc:raise DomainError("INVALID_PLATFORM_PROFILE",str(exc),422) from exc

@app.get("/platform/capability-selection")
def capability_selection(platform:str="H5"):return {"platform":platform.upper(),"selection":platform_registry.selection(platform)}

@app.post("/assets/uploads",status_code=201)
async def upload_asset(response:Response,file:UploadFile=File(...),idempotency_key:str|None=Header(None,alias="Idempotency-Key")):
    response.headers["X-XFX-Origin-Reached"]="1"
    cache_key=f"capture-upload:{idempotency_key}" if idempotency_key else None
    if cache_key:
        with repository.connect() as connection:cached=connection.execute("SELECT response_json FROM idempotency WHERE session_id=? AND key=?",("__asset_upload__",cache_key)).fetchone()
        if cached:
            await file.close();response.headers["X-XFX-Idempotent-Replay"]="1";return json.loads(cached[0])
    metadata=await asset_storage.store_upload(file)
    if cache_key:
        with repository.connect() as connection:connection.execute("INSERT OR IGNORE INTO idempotency(session_id,key,request_hash,response_json) VALUES(?,?,?,?)",("__asset_upload__",cache_key,metadata["sha256"],json.dumps(metadata)))
    return metadata

@app.post("/sessions/{session_id}/fine-tune/derived",status_code=201)
async def upload_fine_tune_derived(session_id:str,file:UploadFile=File(...),idempotency_key:str=Header(...,alias="Idempotency-Key")):
    service.get(session_id);cache_key=f"fine-tune-derived:{idempotency_key}"
    with repository.connect() as connection:
        cached=connection.execute("SELECT response_json FROM idempotency WHERE session_id=? AND key=?",(session_id,cache_key)).fetchone()
    if cached:
        await file.close();return json.loads(cached[0])
    metadata=await asset_storage.store_upload(file)
    with repository.connect() as connection:connection.execute("INSERT OR IGNORE INTO idempotency(session_id,key,request_hash,response_json) VALUES(?,?,?,?)",(session_id,cache_key,metadata["sha256"],json.dumps(metadata)))
    return metadata

@app.get("/assets/{asset_id}")
def asset_metadata(asset_id:str):return asset_storage.metadata(asset_id)

@app.get("/assets/{asset_id}/content")
def asset_content(asset_id:str):
    path,metadata=asset_storage.content(asset_id)
    return FileResponse(path,media_type=metadata["mime_type"],filename=metadata["original_name"],headers={"X-Content-SHA256":metadata["sha256"],"X-XFX-Asset-Source":metadata["source"]})

@app.get("/sessions/{session_id}/final/content")
def final_content(session_id:str):
    session=service.get(session_id)
    if session["workflow_stage"]!="FINAL":raise DomainError("INVALID_TRANSITION","Final asset is unavailable before FINAL.",409)
    uploaded_asset_id=session["state"].get("final",{}).get("source_upload_asset_id")
    if not uploaded_asset_id:raise DomainError("ASSET_NOT_FOUND","This deterministic fixture session has no uploaded binary final.",404)
    path,metadata=asset_storage.content(uploaded_asset_id)
    extension=Path(metadata["original_name"]).suffix.lower()
    transformation=session["state"].get("final",{}).get("transformation","DETERMINISTIC_FAKE_REALITY_PLUS")
    return FileResponse(path,media_type=metadata["mime_type"],filename=f"xiangfengxing-final{extension}",headers={"X-Content-SHA256":metadata["sha256"],"X-XFX-Transformation":transformation})

@app.post("/sessions",status_code=201)
def create_session(body:SessionCreateBody|None=None):return service.create(body.model_dump(exclude_none=True) if body else None)

@app.get("/sessions")
def list_sessions(classification:str|None=None):
    normalized=classification.upper() if classification else None
    if normalized not in {None,"ACTIVE","COMPLETED"}:raise DomainError("INVALID_SESSION_CLASSIFICATION","Classification must be ACTIVE or COMPLETED.",422)
    return service.list(normalized)

@app.get("/sessions/{session_id}")
def get_session(session_id:str):return service.get(session_id)

@app.get("/sessions/{session_id}/fine-tune/source")
def fine_tune_source(session_id:str):return service.fine_tune_source(session_id)

@app.get("/sessions/{session_id}/fine-tune/source/content")
def fine_tune_source_content(session_id:str):
    source=service.fine_tune_source(session_id);path,metadata=asset_storage.content(source["content_asset_id"])
    return FileResponse(path,media_type=metadata["mime_type"],headers={"X-Content-SHA256":metadata["sha256"],"X-XFX-Source-Asset-ID":source["asset_id"]})

@app.get("/sessions/{session_id}/fine-tune/recipe")
def fine_tune_recipe(session_id:str):return service.get_recipe(session_id)

@app.post("/sessions/{session_id}/fine-tune/recipes")
def save_fine_tune_recipe(session_id:str,body:RecipeBody,idempotency_key:str=Header(...,alias="Idempotency-Key")):return service.save_recipe(session_id,body.recipe,idempotency_key)

@app.post("/sessions/{session_id}/actions")
def action(session_id:str,body:ActionBody,idempotency_key:str=Header(...,alias="Idempotency-Key")):
    result=service.mutate(session_id,body.action,body.payload,idempotency_key);return {**result,"readback":service.get(session_id)}

@app.get("/sessions/{session_id}/events")
def events(session_id:str):return service.get(session_id)["events"]

@app.get("/sessions/{session_id}/assets")
def assets(session_id:str):return service.get(session_id)["assets"]

async def _read_geometry_form(request:Request):
    form=await request.form();raw=form.get("metadata")
    if not isinstance(raw,str):raise DomainError("GEOMETRY_METADATA_REQUIRED","Geometry multipart metadata is required.",422)
    try:metadata=json.loads(raw)
    except json.JSONDecodeError as exc:raise DomainError("GEOMETRY_METADATA_INVALID","Geometry metadata is not valid JSON.",422) from exc
    if not isinstance(metadata,dict):raise DomainError("GEOMETRY_METADATA_INVALID","Geometry metadata must be a JSON object.",422)
    frames=[];opened=[]
    try:
        for frame in metadata.get("selected_geometry_frames",[]):
            part=form.get(frame.get("file_field",""))
            if part is None or not hasattr(part,"read"):raise DomainError("GEOMETRY_FRAME_REQUIRED","Every selected frame must be present as binary multipart data.",422)
            opened.append(part);frames.append(await part.read())
    finally:
        for part in opened:await part.close()
    return metadata,frames

@app.get("/scene-spatial/geometry/health")
def scene_spatial_health():return {"status":"ok","geometry_version":"p2-backend-v0.2","provider_mode":scene_spatial_mode,"authority":"FIRST_PARTY_BACKEND_GEOMETRY_SOLVER"}

@app.post("/scene-spatial/geometry/analyze")
async def standalone_scene_geometry(request:Request):
    try:
        metadata,frames=await _read_geometry_form(request);result,cache=scene_spatial.analyze(metadata,frames)
        return {"geometry_request_id":result.geometry_request_id,"spatial_evidence":result.spatial_evidence,"provider_mode":result.provider_mode,"cache_status":cache,"timing_ms":result.timing_ms}
    except DomainError:raise
    except ValueError as exc:raise DomainError(str(exc),"Scene Geometry request validation failed.",422) from exc
    except Exception as exc:raise DomainError("GEOMETRY_FAILED","Scene Geometry failed without producing SpatialEvidence.",503) from exc

@app.post("/sessions/{session_id}/scene-spatial/scans")
def commit_scene_scan(session_id:str,body:SceneScanCommitBody):
    return service.commit_scene_scan(session_id,body.scene_scan,body.frame_set,body.direction_map,body.view_evidence,body.spatial_precheck)

@app.post("/sessions/{session_id}/scene-spatial/geometry")
async def analyze_session_geometry(session_id:str,request:Request):
    metadata,frames=await _read_geometry_form(request);scan_id=str(metadata.get("scan_id",""));request_id=str(metadata.get("geometry_request_id",""))
    if not service.request_geometry(session_id,scan_id,request_id):raise DomainError("GEOMETRY_SUPERSEDED","Geometry request belongs to a superseded Scan.",409)
    try:
        result,cache=scene_spatial.analyze(metadata,frames);applied=service.apply_spatial_evidence(session_id,scan_id,request_id,result.spatial_evidence)
        return {"geometry_request_id":request_id,"spatial_evidence":result.spatial_evidence,"provider_mode":result.provider_mode,"cache_status":cache,"applied_to_active_session":applied,"session":service.get(session_id)}
    except DomainError:raise
    except ValueError as exc:
        service.fail_geometry(session_id,scan_id,request_id,str(exc));raise DomainError(str(exc),"Scene Geometry request validation failed.",422) from exc
    except Exception as exc:
        service.fail_geometry(session_id,scan_id,request_id,"GEOMETRY_FAILED");raise DomainError("GEOMETRY_FAILED","Scene Geometry failed; View evidence remains usable.",503) from exc
