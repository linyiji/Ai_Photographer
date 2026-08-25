from fastapi import APIRouter,HTTPException
from .engine import ReplayEngine
from .models import ReplayRequest

def create_lab_router(engine:ReplayEngine):
    router=APIRouter(prefix="/__lab__",tags=["lab"])
    @router.get("/scenarios")
    def scenarios():return engine.scenarios()
    @router.get("/platform-profiles")
    def platform_profiles():return engine.platform_profiles()
    @router.get("/platform-scenarios")
    def platform_scenarios():return engine.platform_scenarios()
    @router.post("/platform-scenarios/{scenario_id}/run")
    def run_platform_scenario(scenario_id:str):return engine.run_platform_scenario(scenario_id)
    @router.get("/user-flow-scenarios")
    def user_flow_scenarios():return engine.user_flow_scenarios()
    @router.post("/user-flow-scenarios/{scenario_id}/run")
    def run_user_flow_scenario(scenario_id:str):return engine.run_user_flow_scenario(scenario_id)
    @router.post("/replays",status_code=201)
    def create(request:ReplayRequest):return engine.run(request.scenario_id,request.mode,request.checkpoint_position,request.seed,request.platform_profile)
    @router.get("/replays/{replay_id}")
    def get(replay_id:str):
        if replay_id not in engine.results:raise HTTPException(404,"Replay not found")
        return {k:v for k,v in engine.results[replay_id].items() if k not in {"trace","canonical"}}
    @router.get("/replays/{replay_id}/trace")
    def trace(replay_id:str):
        if replay_id not in engine.results:raise HTTPException(404,"Replay not found")
        return engine.results[replay_id]["trace"]
    @router.get("/replays/{replay_id}/diff")
    def diff(replay_id:str):
        if replay_id not in engine.results:raise HTTPException(404,"Replay not found")
        return engine.results[replay_id]["diff"]
    @router.post("/replays/{replay_id}/run")
    def rerun(replay_id:str):
        if replay_id not in engine.results:raise HTTPException(404,"Replay not found")
        prior=engine.results[replay_id];return engine.run(prior["scenario_id"],prior["mode"])
    return router
