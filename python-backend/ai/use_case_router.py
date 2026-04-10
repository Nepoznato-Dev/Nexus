from typing import Any, Dict, List
import re


def route_use_case(message: str, context: Dict | None = None, flux_tags: List[str] | None = None) -> Dict[str, Any]:
    text = str(message or "")
    lower = text.lower()
    ctx = context or {}
    tags = [str(t).lower() for t in (flux_tags or [])]

    task_type = str(ctx.get("taskType") or "").lower().strip()

    use_case = "general-assistance"
    confidence = 0.45
    reasons: List[str] = []

    is_code = bool(re.search(r"\b(write|generate|implement|code|function|class|api|bug|debug|refactor|typescript|javascript|python|compile)\b", lower))
    is_ui = bool(re.search(r"\b(ui|ux|layout|component|style|css|tailwind|responsive|frontend|button|color|theme)\b", lower))
    is_mod_log = bool(re.search(r"\b(mod\s*log|logs?|trace|stack\s*trace|crash|error\s*log|diagnostic|telemetry)\b", lower))
    is_feature_search = bool(re.search(r"\b(search|find|where is|locate|lookup|feature|setting|option|command palette|shortcut)\b", lower))

    if task_type in {"refine", "rewrite", "edit"}:
        use_case = "editing"
        confidence = 0.7
        reasons.append("context-task-type-editing")

    if is_code:
        use_case = "code-writing"
        confidence = max(confidence, 0.9)
        reasons.append("code-keywords")

    if is_ui:
        use_case = "ui-editing"
        confidence = max(confidence, 0.85)
        reasons.append("ui-keywords")

    if is_mod_log:
        use_case = "mod-log-analysis"
        confidence = max(confidence, 0.88)
        reasons.append("log-analysis-keywords")

    if is_feature_search and not is_mod_log:
        use_case = "feature-search"
        confidence = max(confidence, 0.82)
        reasons.append("feature-search-keywords")

    if "high-code-density" in tags and use_case == "general-assistance":
        use_case = "code-writing"
        confidence = max(confidence, 0.72)
        reasons.append("flux-high-code-density")

    recommended_modules: List[str] = []
    if use_case in {"code-writing", "mod-log-analysis"}:
        recommended_modules.extend(["S1", "S2"])
    if use_case in {"feature-search", "mod-log-analysis"}:
        recommended_modules.append("S3")
    if use_case in {"ui-editing", "code-writing"}:
        recommended_modules.append("S4")

    return {
        "useCase": use_case,
        "confidence": round(confidence, 2),
        "reasons": sorted(set(reasons)),
        "recommendedModules": sorted(set(recommended_modules)),
    }