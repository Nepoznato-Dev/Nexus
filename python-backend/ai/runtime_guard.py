from typing import Dict, List


def _as_float(value, default=0.0) -> float:
    try:
        return float(value)
    except Exception:
        return float(default)


def _as_int(value, default=0) -> int:
    try:
        return int(value)
    except Exception:
        return int(default)


def _extract_runtime_metrics(site_state: Dict | None) -> Dict:
    state = site_state or {}
    runtime = state.get("runtime") or {}
    performance = runtime.get("performance") or {}
    ui = runtime.get("ui") or {}

    fps = performance.get("fpsAverage", performance.get("fps", state.get("fps", 60.0)))
    long_tasks = performance.get("longTaskRate", performance.get("longTaskCount", state.get("longTaskCount", 0)))
    heap_mb = performance.get("heapUsedMB", state.get("heapUsedMB", 0.0))
    rtt = performance.get("rttMs", state.get("rttMs", 0.0))
    health = str(performance.get("health") or state.get("health") or "").lower().strip()
    interaction_latency = ui.get("interactionLatencyMs", performance.get("interactionLatencyMs", state.get("interactionLatencyMs", 0.0)))
    event_loop_lag = ui.get("eventLoopLagMs", performance.get("eventLoopLagMs", state.get("eventLoopLagMs", 0.0)))
    ui_pressure = str(ui.get("uiPressure") or performance.get("uiPressure") or state.get("uiPressure") or "").lower().strip()

    return {
        "fps": _as_float(fps, 60.0),
        "long_tasks": _as_int(long_tasks, 0),
        "heap_mb": _as_float(heap_mb, 0.0),
        "rtt": _as_float(rtt, 0.0),
        "interaction_latency": _as_float(interaction_latency, 0.0),
        "event_loop_lag": _as_float(event_loop_lag, 0.0),
        "ui_pressure": ui_pressure,
        "health": health,
        "schema_version": state.get("schemaVersion") or "flat-v0",
        "source": state.get("source") or "unknown",
        "capabilities": state.get("capabilities") or {},
    }


def evaluate_runtime_policy(site_state: Dict | None, tool_state: Dict | None) -> Dict:
    tools = tool_state or {}
    metrics = _extract_runtime_metrics(site_state)

    fps = metrics["fps"]
    long_tasks = metrics["long_tasks"]
    heap_mb = metrics["heap_mb"]
    rtt = metrics["rtt"]
    interaction_latency = metrics["interaction_latency"]
    event_loop_lag = metrics["event_loop_lag"]

    level = 0
    reasons: List[str] = []

    if fps < 54:
        level = max(level, 1)
        reasons.append("fps-below-target")
    if fps < 40:
        level = max(level, 2)
    if fps < 30:
        level = max(level, 3)
    if fps < 22:
        level = max(level, 4)

    if long_tasks >= 8:
        level = max(level, 2)
        reasons.append("long-task-pressure")
    if long_tasks >= 20:
        level = max(level, 3)
    if long_tasks >= 35:
        level = max(level, 4)

    if heap_mb >= 500:
        level = max(level, 2)
        reasons.append("heap-growth-pressure")
    if heap_mb >= 800:
        level = max(level, 3)
    if heap_mb >= 1100:
        level = max(level, 4)

    if rtt >= 300:
        level = max(level, 1)
        reasons.append("network-latency")
    if rtt >= 700:
        level = max(level, 2)

    if interaction_latency >= 80:
        level = max(level, 1)
        reasons.append("interaction-latency")
    if interaction_latency >= 140:
        level = max(level, 2)
    if interaction_latency >= 220:
        level = max(level, 4)

    if event_loop_lag >= 50:
        level = max(level, 1)
        reasons.append("event-loop-lag")
    if event_loop_lag >= 100:
        level = max(level, 2)
    if event_loop_lag >= 180:
        level = max(level, 4)

    if metrics["health"] == "degraded":
        level = max(level, 2)
        reasons.append("capability-health-degraded")
    if metrics["health"] == "critical":
        level = max(level, 4)
        reasons.append("capability-health-critical")

    if metrics["ui_pressure"] == "strained":
        level = max(level, 2)
        reasons.append("ui-pressure-strained")
    if metrics["ui_pressure"] == "degraded":
        level = max(level, 3)
        reasons.append("ui-pressure-degraded")
    if metrics["ui_pressure"] == "critical":
        level = max(level, 4)
        reasons.append("ui-pressure-critical")

    # Requested expensive tools can raise pressure floor by one level.
    if bool(tools.get("deepResearch") or tools.get("thinkLonger")) and level >= 2:
        level = min(5, level + 1)

    recommended_max_tier = "pro"
    if level >= 4:
        recommended_max_tier = "lite"
    elif level >= 2:
        recommended_max_tier = "plus"

    allow_branch_merge = level <= 2
    allow_deep_research = level <= 2

    actions: List[str] = []
    if level >= 1:
        actions.append("reduce-background-work")
    if level >= 2:
        actions.append("pause-noncritical-heavy-reasoning")
    if level >= 3:
        actions.append("disable-branch-merge")
    if level >= 4:
        actions.append("force-light-answer-path")

    return {
        "degradationLevel": level,
        "reasons": sorted(set(reasons)),
        "recommendedMaxTier": recommended_max_tier,
        "allowBranchMerge": allow_branch_merge,
        "allowDeepResearch": allow_deep_research,
        "actions": actions,
        "telemetryContract": {
            "schemaVersion": metrics["schema_version"],
            "source": metrics["source"],
            "capabilities": metrics["capabilities"],
        },
        "metrics": {
            "fps": fps,
            "longTaskCount": long_tasks,
            "heapUsedMB": heap_mb,
            "rttMs": rtt,
            "interactionLatencyMs": interaction_latency,
            "eventLoopLagMs": event_loop_lag,
            "uiPressure": metrics["ui_pressure"],
        },
    }