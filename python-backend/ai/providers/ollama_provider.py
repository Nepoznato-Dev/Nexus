from typing import Dict
import httpx
from config import settings


async def generate_with_ollama(prompt: str, tier: str) -> Dict:
    model = {
        "turbo": settings.OLLAMA_MODEL_TURBO,
        "lite": settings.OLLAMA_MODEL_LITE,
        "plus": settings.OLLAMA_MODEL_PLUS,
        "pro": settings.OLLAMA_MODEL_PRO,
    }.get(tier, settings.OLLAMA_MODEL_LITE)

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.65,
            "top_p": 0.92,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            resp = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
            if resp.status_code != 200:
                return {"ok": False, "text": "", "error": f"ollama_http_{resp.status_code}"}
            data = resp.json()
            return {"ok": True, "text": str(data.get("response") or "").strip(), "model": model}
    except Exception as exc:
        return {"ok": False, "text": "", "error": str(exc), "model": model}
