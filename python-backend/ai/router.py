from dataclasses import dataclass
from typing import Dict, List, Optional
import re


@dataclass
class RouteDecision:
    tier: str
    complexity_score: int
    model_size_b: int
    quantization: str
    cores: int
    context_words: int
    requires_dual_merge: bool
    clamps: Dict[str, int]


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def score_complexity(message: str, attachments: int = 0, has_web_context: bool = False) -> int:
    lower = (message or "").lower()
    score = _clamp(len(lower) // 30, 0, 25)
    if "?" in lower:
        score += 8
    if re.search(r"architecture|distributed|consensus|compiler|concurrency|deadlock|race", lower):
        score += 22
    if re.search(r"proof|paradox|contradiction|calculus|linear algebra|statistics|equation", lower):
        score += 18
    if re.search(r"refactor|pipeline|optimi[sz]e|design|workflow", lower):
        score += 12
    score += min(attachments * 4, 16)
    if has_web_context:
        score += 8
    return _clamp(score, 0, 100)


def choose_tier(complexity_score: int, requested_mode: Optional[str], flux_tags: Optional[List[str]] = None) -> str:
    tags = [str(t).lower() for t in (flux_tags or [])]
    if requested_mode in {"turbo", "lite", "plus", "pro"}:
        return requested_mode

    if any(t in tags for t in ["logic-trap", "high-strain", "high-code-density"]):
        return "pro" if complexity_score > 70 else "plus"

    if complexity_score <= 25:
        return "turbo"
    if complexity_score <= 45:
        return "lite"
    if complexity_score <= 70:
        return "plus"
    return "pro"


def apply_clamps(tier: str, vram_free_gb: float, complexity_score: int) -> Dict[str, int | str]:
    specs = {
        "turbo": {"floor": 8, "ceiling": 12, "base": 8, "cores": 1, "context": 10000},
        "lite": {"floor": 12, "ceiling": 24, "base": 18, "cores": 1, "context": 18000},
        "plus": {"floor": 30, "ceiling": 55, "base": 50, "cores": 2, "context": 40000},
        "pro": {"floor": 40, "ceiling": 120, "base": 70, "cores": 3, "context": 85000},
    }[tier]

    scaled = int(specs["base"] + (complexity_score - 50) * 0.2)
    model_b = _clamp(scaled, specs["floor"], specs["ceiling"])

    if vram_free_gb >= 20:
        quant = "q5"
    elif vram_free_gb >= 12:
        quant = "q4"
    elif vram_free_gb >= 8:
        quant = "q3"
    else:
        quant = "q2"
        model_b = specs["floor"]

    cores = specs["cores"]
    if tier == "pro":
        if complexity_score > 85:
            cores = 5
        elif complexity_score > 75:
            cores = 4
        else:
            cores = 3

    return {
        "model_b": model_b,
        "quantization": quant,
        "cores": cores,
        "context_words": specs["context"],
        "floor": specs["floor"],
        "ceiling": specs["ceiling"],
    }


def resolve_route(message: str, requested_mode: Optional[str], flux_tags: Optional[List[str]], device_profile: Optional[Dict]) -> RouteDecision:
    device = device_profile or {}
    vram = float(device.get("vramFreeGB") or 0)
    attachments = int(device.get("attachmentsCount") or 0)
    has_web = bool(device.get("hasWebContext"))

    complexity = score_complexity(message, attachments=attachments, has_web_context=has_web)
    tier = choose_tier(complexity, requested_mode, flux_tags)
    clamped = apply_clamps(tier, vram, complexity)

    return RouteDecision(
        tier=tier,
        complexity_score=complexity,
        model_size_b=clamped["model_b"],
        quantization=clamped["quantization"],
        cores=clamped["cores"],
        context_words=clamped["context_words"],
        requires_dual_merge=tier in {"plus", "pro"},
        clamps={"floor": clamped["floor"], "ceiling": clamped["ceiling"]},
    )
