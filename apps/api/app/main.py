from __future__ import annotations
import os
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI,Header,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel,Field
from .repository import Repository
from .service import DomainError,SessionService

ROOT=Path(__file__).resolve().parents[3]
DB_PATH=Path(os.environ.get("XFX_DATABASE_PATH",ROOT/"apps"/"api"/".data"/"xfx-m02.sqlite3"))
service=SessionService(Repository(DB_PATH),ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json")
app=FastAPI(title="XFX M02 API",version="0.2.0")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])
LAB_MODE=os.environ.get("XFX_LAB_MODE")=="1"
if LAB_MODE and os.environ.get("XFX_ENVIRONMENT","").lower()=="production":raise RuntimeError("XFX Lab mode is forbidden in production")
if LAB_MODE:
    from .lab.api import create_lab_router
    from .lab.engine import ReplayEngine
    lab_root=Path(os.environ.get("XFX_LAB_ROOT",ROOT/"apps"/"api"/".data"/"lab"))
    lab_engine=ReplayEngine(lab_root,ROOT/"packages"/"scenario-fixtures"/"s01-storm-before-arrival.json",ROOT/"packages"/"scenario-fixtures"/"m03-scenario-matrix-v2.json")
    app.include_router(create_lab_router(lab_engine))

class ActionBody(BaseModel):
    action:str
    payload:dict=Field(default_factory=dict)

@app.middleware("http")
async def correlation(request:Request,call_next):
    cid=request.headers.get("X-Correlation-ID",str(uuid4()));request.state.correlation_id=cid;response=await call_next(request);response.headers["X-Correlation-ID"]=cid;return response

@app.exception_handler(DomainError)
async def domain_error(request:Request,exc:DomainError):
    category="STORAGE" if "PERSISTENCE" in exc.code else "WORKFLOW" if "TRANSITION" in exc.code else "VALIDATION" if "CANDIDATE" in exc.code or "IDEMPOTENCY" in exc.code else "INTERNAL"
    return JSONResponse(status_code=exc.status,content={"error":{"schema_version":"1.0.0","error_code":exc.code,"category":category,"severity":"ERROR","retryable":exc.status>=500,"user_message_key":exc.code.lower(),"developer_context":{},"session_id":request.path_params.get("session_id"),"correlation_id":request.state.correlation_id,"cause":None}})

@app.get("/health")
def health():return {"status":"ok","runtime":"LOCKED_L1","database":"sqlite"}

@app.get("/capabilities")
def capabilities():return {"scenario":"S01_STORM_BEFORE_ARRIVAL","mode":"DETERMINISTIC_FAKE","capabilities":["reality","target","shot","live","capture","qa","reality_plus","voice","agent"]}

@app.post("/sessions",status_code=201)
def create_session():return service.create()

@app.get("/sessions/{session_id}")
def get_session(session_id:str):return service.get(session_id)

@app.post("/sessions/{session_id}/actions")
def action(session_id:str,body:ActionBody,idempotency_key:str=Header(...,alias="Idempotency-Key")):
    result=service.mutate(session_id,body.action,body.payload,idempotency_key);return {**result,"readback":service.get(session_id)}

@app.get("/sessions/{session_id}/events")
def events(session_id:str):return service.get(session_id)["events"]

@app.get("/sessions/{session_id}/assets")
def assets(session_id:str):return service.get(session_id)["assets"]
