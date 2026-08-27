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
from .service import DomainError,SessionService

ROOT=Path(__file__).resolve().parents[3]
DB_PATH=Path(os.environ.get("XFX_DATABASE_PATH",ROOT/"apps"/"api"/".data"/"xfx-m02.sqlite3"))
repository=Repository(DB_PATH)
service=SessionService(repository,ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json")
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

@app.middleware("http")
async def correlation(request:Request,call_next):
    cid=request.headers.get("X-Correlation-ID",str(uuid4()));request.state.correlation_id=cid;response=await call_next(request);response.headers["X-Correlation-ID"]=cid;return response

@app.exception_handler(DomainError)
async def domain_error(request:Request,exc:DomainError):
    category="STORAGE" if "PERSISTENCE" in exc.code or "STORAGE" in exc.code else "NETWORK" if "NETWORK" in exc.code else "PLATFORM" if exc.code in {"PLATFORM_UNSUPPORTED","SHARE_FAILURE","USER_CANCELLED"} else "WORKFLOW" if "TRANSITION" in exc.code else "VALIDATION" if "CANDIDATE" in exc.code or "IDEMPOTENCY" in exc.code or "ASSET" in exc.code else "INTERNAL"
    return JSONResponse(status_code=exc.status,content={"error":{"schema_version":"1.0.0","error_code":exc.code,"category":category,"severity":"ERROR","retryable":exc.status>=500,"user_message_key":exc.code.lower(),"developer_context":{},"session_id":request.path_params.get("session_id"),"correlation_id":request.state.correlation_id,"cause":None}})

@app.get("/health")
def health():return {"status":"ok","runtime":"LOCKED_L1","database":"sqlite"}

@app.get("/capabilities")
def capabilities():return {"scenario":"S01_STORM_BEFORE_ARRIVAL","mode":"GOVERNED_REPLACEMENT","capabilities":["reality","target","shot","live","capture","qa","reality_plus","voice","agent"],"fake_live_selected":True,"qa_selected_adapter":"FAKE_INTERNAL_ONLY","qa_shadow_available":True,"real_provider_configured":provider_config.configured}

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
