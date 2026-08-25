from __future__ import annotations
from typing import Any,Protocol

class Capability(Protocol):
    name:str
    mode:str
    def execute(self,operation:str,context:dict[str,Any])->Any:...

class DeterministicFixtureCapability:
    """M02 adapter. Each named slot can be replaced without changing handlers or M01 contracts."""
    mode="DETERMINISTIC_FAKE"
    def __init__(self,name:str,fixture:dict[str,Any]):self.name,self.fixture=name,fixture
    def execute(self,operation:str,context:dict[str,Any])->Any:
        mapping={"reality":"reality","target":"targets","shot":"shot","live":"live_steps","capture":"capture","qa":"evaluation","reality_plus":"reality_plus","voice":"live_steps","agent":"shot"}
        return self.fixture[mapping[self.name]]

def build_fake_capabilities(fixture:dict[str,Any])->dict[str,Capability]:
    return {name:DeterministicFixtureCapability(name,fixture) for name in ("reality","target","shot","live","capture","qa","reality_plus","voice","agent")}
