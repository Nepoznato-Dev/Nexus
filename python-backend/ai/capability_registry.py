from typing import Any, Dict, List


def build_capability_registry(site_state: Dict | None, tool_state: Dict | None) -> Dict[str, Any]:
    state = site_state or {}
    capabilities = state.get("capabilities") or {}
    runtime = state.get("runtime") or {}
    performance = runtime.get("performance") or {}
    ui_state = runtime.get("ui") or {}
    tools = tool_state or {}

    registry: List[Dict[str, Any]] = [
        {
            "id": "browser-performance",
            "owner": capabilities.get("owner") or "javascript",
            "runtime": "browser-js",
            "status": "active" if capabilities.get("canCollectRealtimeMetrics", True) else "inactive",
            "signals": {
                "fps": performance.get("fpsAverage", performance.get("fps", state.get("fps", 60))),
                "longTaskRate": performance.get("longTaskRate", performance.get("longTaskCount", state.get("longTaskCount", 0))),
                "interactionLatencyMs": ui_state.get("interactionLatencyMs", 0),
                "eventLoopLagMs": ui_state.get("eventLoopLagMs", 0),
                "uiPressure": ui_state.get("uiPressure", "stable"),
            },
        },
        {
            "id": "ui-throttle",
            "owner": "javascript",
            "runtime": "browser-js",
            "status": "active" if capabilities.get("canThrottleUIWork", True) else "inactive",
            "signals": {
                "shouldSelfProtect": ui_state.get("uiPressure") in {"strained", "degraded", "critical"},
            },
        },
        {
            "id": "reasoning-policy",
            "owner": "python",
            "runtime": "python-core",
            "status": "active",
            "signals": {
                "deepResearchRequested": bool(tools.get("deepResearch")),
                "thinkLongerRequested": bool(tools.get("thinkLonger")),
            },
        },
        {
            "id": "branch-merge",
            "owner": "python",
            "runtime": "python-core",
            "status": "active",
            "signals": {
                "requested": bool(tools.get("deepResearch") or tools.get("thinkLonger")),
            },
        },
    ]

    active_owners = sorted({entry["owner"] for entry in registry if entry.get("status") == "active"})
    return {
        "schemaVersion": state.get("schemaVersion") or "flat-v0",
        "activeOwners": active_owners,
        "capabilities": registry,
    }