from __future__ import annotations
from typing import Any,Literal
from pydantic import BaseModel,Field

ReplayMode=Literal["FROM_SCRATCH","FROM_CHECKPOINT","FAULT_INJECTED","DRY_EVALUATION"]

class ReplayRequest(BaseModel):
    scenario_id:str="S01_HAPPY_PATH"
    mode:ReplayMode="FROM_SCRATCH"
    checkpoint_position:int|None=None
    seed:int=301
    platform_profile:str="H5_FULL"

class TraceStep(BaseModel):
    step_index:int;action_name:str;idempotency_key_ref:str;pre_stage:str;pre_revision:int
    request_summary:dict[str,Any]=Field(default_factory=dict);capability_name:str|None=None
    candidate_summary:dict[str,Any]=Field(default_factory=dict);acceptance:str|None=None
    events_appended:list[str]=Field(default_factory=list);assets_appended:list[str]=Field(default_factory=list)
    post_stage:str;post_revision:int;error_contract:dict[str,Any]|None=None;duration_ms:float
    warnings:list[str]=Field(default_factory=list)
