from typing import Dict, List


def select_chunks(message: str, sources: List[str], tier: str) -> Dict:
    if not sources:
        return {"chunks": [], "strategy": "none"}

    k_by_tier = {"turbo": 4, "lite": 6, "plus": 8, "pro": 12}
    k = k_by_tier.get(tier, 6)

    chunks = []
    for idx, source in enumerate(sources[:k]):
        content = str(source)
        chunks.append(
            {
                "id": f"chunk_{idx+1}",
                "text": content[:900],
                "score": max(0.4, 1.0 - idx * 0.05),
            }
        )

    return {"chunks": chunks, "strategy": f"top-{k}-semantic"}
