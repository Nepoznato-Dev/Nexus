from typing import Any, Dict, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

from ai.knowledge_router import run_knowledge_turn
from ai.orchestrator import run_ai_turn
from ai.runtime_guard import evaluate_runtime_policy


class AIRequest(BaseModel):
    message: str
    userName: Optional[str] = "Friend"
    mode: Optional[str] = None
    toolState: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)
    fluxTags: list[str] = Field(default_factory=list)
    deviceProfile: Dict[str, Any] = Field(default_factory=dict)
    siteState: Dict[str, Any] = Field(default_factory=dict)
    requireProof: bool = False


app = FastAPI(title="A.L.L.O.Y/F.L.U.X Python Core", version="0.1.0")


@app.get("/api/ai/health")
async def health() -> Dict[str, Any]:
    return {
        "success": True,
        "status": "python-core-running",
        "version": "0.1.0",
    }


@app.post("/api/ai/spark-ask")
async def spark_ask(req: AIRequest) -> Dict[str, Any]:
    payload = req.model_dump()
    result = await run_ai_turn(payload)
    return {"success": True, **result}


@app.post("/api/ai/iris-chat")
async def iris_chat(req: AIRequest) -> Dict[str, Any]:
    payload = req.model_dump()
    result = await run_ai_turn(payload)
    return {"success": True, **result}


@app.post("/api/ai/performance-eval")
async def performance_eval(req: AIRequest) -> Dict[str, Any]:
    payload = req.model_dump()
    policy = evaluate_runtime_policy(payload.get("siteState") or {}, payload.get("toolState") or {})
    return {"success": True, "policy": policy}


@app.post("/api/ai/knowledge-generate")
async def knowledge_generate(req: AIRequest) -> Dict[str, Any]:
    payload = req.model_dump()
    result = await run_knowledge_turn(payload)
    return {"success": True, **result}
