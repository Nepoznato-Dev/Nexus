from typing import Any, Dict

from .knowledge_store import build_knowledge_snapshot
from .orchestrator import run_ai_turn


async def run_knowledge_turn(payload: Dict[str, Any]) -> Dict[str, Any]:
    message = str(payload.get("message") or "").strip()
    context = payload.get("context") or {}
    snapshot = build_knowledge_snapshot(message, context)

    enriched_payload = dict(payload)
    enriched_context = dict(context)

    existing_sources = list(enriched_context.get("sources") or [])
    knowledge_sources = [
        f"[{item.get('path')}] {item.get('snippet')}"
        for item in snapshot.get("sources") or []
        if item.get("snippet")
    ]
    enriched_context["sources"] = existing_sources + knowledge_sources
    enriched_context["knowledgeSnapshot"] = snapshot
    enriched_payload["context"] = enriched_context

    result = await run_ai_turn(enriched_payload)
    metadata = dict(result.get("metadata") or {})
    metadata["knowledgeSnapshot"] = snapshot
    result["metadata"] = metadata

    transparency = dict(result.get("transparencyReport") or {})
    transparency["knowledgeSnapshot"] = {
        "keywords": snapshot.get("keywords") or [],
        "sourceCount": snapshot.get("sourceCount") or 0,
        "hasCoverage": bool(snapshot.get("hasCoverage")),
    }
    result["transparencyReport"] = transparency

    return result