from typing import Dict, List


def _get_ui_pressure(capability_registry: Dict | None) -> str:
    registry = capability_registry or {}
    for entry in registry.get("capabilities") or []:
        if entry.get("id") == "browser-performance":
            signals = entry.get("signals") or {}
            return str(signals.get("uiPressure") or "stable").lower().strip()
    return "stable"


def schedule_modules(
    message: str,
    route: Dict,
    flux_tags: List[str],
    tool_state: Dict,
    user_requires_proof: bool,
    capability_registry: Dict | None = None,
    use_case: str = "general-assistance",
) -> List[Dict]:
    lower = (message or "").lower()
    tags = [str(t).lower() for t in (flux_tags or [])]
    modules = []
    ui_pressure = _get_ui_pressure(capability_registry)

    use_case_prefers_audit = use_case in {"code-writing", "mod-log-analysis"}
    use_case_prefers_library = use_case in {"feature-search", "mod-log-analysis"}
    use_case_prefers_arch = use_case in {"ui-editing", "code-writing"}

    needs_validation = (
        "math" in lower
        or "syntax" in lower
        or bool(tool_state.get("thinkLonger"))
        or "high-code-density" in tags
        or use_case_prefers_audit
    )
    needs_audit = (
        user_requires_proof
        or "logic-trap" in tags
        or route.get("tier") == "pro"
        or bool(tool_state.get("deepResearch"))
        or use_case_prefers_audit
    )
    needs_library = (
        bool(tool_state.get("searchWeb"))
        or "high-strain" in tags
        or len(lower) > 800
        or use_case_prefers_library
    )
    needs_arch = route.get("requiresDualMerge") or "architecture" in lower or "refactor" in lower or use_case_prefers_arch

    if ui_pressure in {"degraded", "critical"}:
        needs_audit = False
        needs_arch = False
    elif ui_pressure == "strained":
        needs_arch = False

    if needs_validation:
        modules.append({"id": "S1", "title": "Sprinter", "note": "Fast validation and arithmetic/syntax checks."})
    if needs_audit:
        modules.append({"id": "S2", "title": "Auditor", "note": "Step-by-step audit and contradiction scan."})
    if needs_library:
        modules.append({"id": "S3", "title": "Librarian", "note": "Context retrieval and evidence anchoring."})
    if needs_arch:
        modules.append({"id": "S4", "title": "Architect", "note": "Structure, refactor, and output shaping."})

    return modules
