from typing import Dict, List
import re

from ai.legacy_alloy_modules import (
    analyze_user_context,
    evolve_self_awareness_profile,
    generate_self_awareness_statement,
    enhance_with_common_sense,
    proactive_warnings,
    score_confidence,
    suggest_next_step,
    suggest_verification,
)


def analyze_context(message: str, conversation: List[Dict] | None = None) -> Dict:
    text = (message or "").strip()
    lower = text.lower()
    history = conversation or []

    topics = []
    if re.search(r"javascript|python|typescript|code|debug|function|class|api", lower):
        topics.append("coding")
    if re.search(r"learn|study|practice|explain|understand", lower):
        topics.append("learning")
    if re.search(r"career|job|interview|resume", lower):
        topics.append("career")

    if not topics:
        topics = ["general"]

    has_beginner_signal = bool(re.search(r"help me learn|beginner|new to|start", lower))
    has_advanced_signal = bool(re.search(r"optimi[sz]e|architecture|distributed|compiler|formal proof", lower))

    if has_beginner_signal:
        expertise = "beginner"
    elif has_advanced_signal:
        expertise = "advanced"
    else:
        expertise = "intermediate"

    if len(text) < 60:
        pace = "fast"
    elif len(text) > 260:
        pace = "deliberate"
    else:
        pace = "casual"

    return {
        "topics": sorted(set(topics)),
        "expertise": expertise,
        "pace": pace,
        "historyCount": len(history),
    }


def apply_common_sense(answer: str, user_message: str) -> Dict:
    enhanced = enhance_with_common_sense(user_message, answer)
    text = str(enhanced.get("originalAnswer") or answer or "").strip()
    hints: List[str] = []

    for item in enhanced.get("thinkingProcess") or []:
        item_type = item.get("type")
        if item_type == "false_dilemma_detected" and item.get("insight"):
            hints.append(str(item["insight"]))
        if item_type == "assumption_questioned":
            if item.get("assumption"):
                hints.append(str(item["assumption"]))
            if item.get("reframe"):
                hints.append(f"Reframe: {item['reframe']}")
        if item_type == "lateral_solutions":
            for solution in item.get("solutions") or []:
                if solution.get("idea"):
                    hints.append(str(solution["idea"]))

    if hints:
        text = f"{text}\n\nCommon-sense check: {' '.join(dict.fromkeys(hints))}"

    return {
        "response": text,
        "insights": hints,
    }


def apply_personality(answer: str, context_profile: Dict) -> Dict:
    text = str(answer or "").strip()
    pace = context_profile.get("pace") or "casual"
    expertise = context_profile.get("expertise") or "intermediate"

    prefix = ""
    if expertise == "beginner":
        prefix = "You are on the right track. "
    elif expertise == "advanced":
        prefix = "Let us keep this concise and technical. "

    if pace == "fast":
        suffix = "\n\nIf you want, I can give a shorter checklist version."
    elif pace == "deliberate":
        suffix = "\n\nIf useful, I can expand this into a structured study plan."
    else:
        suffix = ""

    return {
        "response": f"{prefix}{text}{suffix}".strip(),
        "style": {
            "expertiseTone": expertise,
            "paceTone": pace,
        },
    }


def score_self_awareness(
    question: str,
    answer: str,
    retrieval_count: int,
    complexity_score: int,
    previous_profile: Dict | None = None,
    approved_features: List[str] | None = None,
) -> Dict:
    scored = score_confidence(question, answer)
    score = int(scored.get("confidence") or 75)

    if retrieval_count <= 0:
        score -= 8
    if complexity_score >= 75:
        score -= 5

    score = max(30, min(95, score))
    uncertain = bool(scored.get("isUncertain")) or score < 60
    statement = generate_self_awareness_statement(question, answer, score, retrieval_count)
    profile = evolve_self_awareness_profile(
        previous_profile,
        statement,
        score,
        retrieval_count,
        approved_features=approved_features,
    )

    return {
        "confidence": score,
        "isUncertain": uncertain,
        "caveat": statement.get("stance") if uncertain else "",
        "statement": statement,
        "profile": profile,
    }


def apply_self_awareness(answer: str, awareness: Dict) -> Dict:
    text = str(answer or "").strip()
    statement = awareness.get("statement") or {}
    reasoning = statement.get("reasoning") or []
    verification_lines = statement.get("verification") or []

    if awareness.get("isUncertain"):
        verification = suggest_verification("")
        verify_text = verification[0]["suggestion"] if verification else "Verify key assumptions before acting."
        lines = [f"Self-awareness: {awareness.get('caveat')}"]
        lines.extend(reasoning[:2])
        lines.extend(verification_lines[:2])
        lines.append(verify_text)
        text = f"{text}\n\n" + " ".join([line for line in lines if line])
    elif reasoning:
        text = f"{text}\n\nSelf-awareness: {reasoning[0]}"

    profile = awareness.get("profile") or {}
    pending = profile.get("pendingApprovalFeatures") or []
    if pending:
        approval_message = profile.get("approvalMessage") or "I need your approval before adding new self-awareness behaviors."
        text = f"{text}\n\n{approval_message} Pending: {', '.join(pending[:4])}."

    return {
        "response": text,
        "profile": profile,
        "statement": statement,
    }


def apply_proactive_help(answer: str, context_profile: Dict) -> Dict:
    text = str(answer or "").strip()
    topics = context_profile.get("topics") or []
    synthetic_context = {
        "topics": topics,
        "expertise": context_profile.get("expertise") or "intermediate",
        "pace": context_profile.get("pace") or "normal",
    }
    user_like_message = " ".join(topics)

    suggestion = ""
    next_steps = suggest_next_step(user_like_message, synthetic_context)
    warnings = proactive_warnings(user_like_message, synthetic_context)

    if next_steps:
        suggestion = next_steps[0].get("question") or ""
    if warnings:
        warning_suggestion = warnings[0].get("suggestion") or ""
        if warning_suggestion:
            suggestion = f"{suggestion} {warning_suggestion}".strip()

    if not suggestion:
        inferred = analyze_user_context([{"text": user_like_message}])
        if "learning" in inferred.get("topics", []) and "coding" in inferred.get("topics", []):
            suggestion = "Next step: build one tiny project and validate with tests."

    if suggestion:
        text = f"{text}\n\nProactive next step: {suggestion}"

    return {
        "response": text,
        "suggestion": suggestion,
    }


def build_memory_artifact(
    user_message: str,
    final_response: str,
    context_profile: Dict,
    confidence: int,
    self_awareness_profile: Dict | None = None,
) -> Dict:
    return {
        "userMessage": str(user_message or "")[:2000],
        "assistantResponse": str(final_response or "")[:4000],
        "topics": context_profile.get("topics") or [],
        "pace": context_profile.get("pace") or "casual",
        "expertise": context_profile.get("expertise") or "intermediate",
        "confidence": int(confidence),
        "selfAwarenessProfile": self_awareness_profile or {},
    }


def render_thought_trace(stage_artifacts: Dict) -> List[str]:
    context = stage_artifacts.get("contextAnalysis") or {}
    use_case = stage_artifacts.get("useCaseRouting") or {}
    runtime = stage_artifacts.get("runtimeGuard") or {}
    capability_registry = stage_artifacts.get("capabilityRegistry") or {}
    routing = stage_artifacts.get("complexityRouting") or {}
    common_sense = stage_artifacts.get("commonSense") or {}
    awareness = stage_artifacts.get("selfAwareness") or {}
    proactive = stage_artifacts.get("proactiveHelp") or {}
    branch_merge = stage_artifacts.get("branchMerge") or {}

    lines = [
        f"Context: expertise={context.get('expertise', 'intermediate')}, pace={context.get('pace', 'casual')}, topics={', '.join(context.get('topics') or ['general'])}.",
        f"Use-case routing: {use_case.get('useCase', 'general-assistance')} (confidence={use_case.get('confidence', 0)}).",
        f"Runtime guard: level={runtime.get('degradationLevel', 0)}, max_tier={runtime.get('recommendedMaxTier', 'pro')}, actions={', '.join(runtime.get('actions') or ['none'])}.",
        f"Routing: tier={routing.get('tier', 'lite')}, complexity={routing.get('complexity_score', 0)}, model={routing.get('model_size_b', 0)}B {routing.get('quantization', 'q4')}.",
    ]

    active_owners = capability_registry.get("activeOwners") or []
    if active_owners:
        ui_pressure = ((runtime.get("metrics") or {}).get("uiPressure") or "stable")
        lines.append(f"Capabilities: owners={', '.join(active_owners)}, ui_pressure={ui_pressure}.")

    if branch_merge.get("enabled"):
        lines.append(
            "Branch merge: "
            f"parallel={branch_merge.get('parallelCount', 0)}, "
            f"accepted={', '.join(branch_merge.get('acceptedBranchIds') or ['none'])}, "
            f"contradictions_pruned={branch_merge.get('contradictionCount', 0)}."
        )

    insights = common_sense.get("insights") or []
    if insights:
        lines.append(f"Common sense: {insights[0]}")
    else:
        lines.append("Common sense: no major logic traps detected.")

    confidence = awareness.get("confidence", 50)
    if awareness.get("isUncertain"):
        lines.append(f"Self-awareness: confidence={confidence}, uncertainty declared.")
    else:
        lines.append(f"Self-awareness: confidence={confidence}, stable answer confidence.")

    awareness_profile = awareness.get("profile") or {}
    pending = awareness_profile.get("pendingApprovalFeatures") or []
    if pending:
        lines.append(f"Self-awareness governance: pending user approval for {', '.join(pending[:3])}.")

    suggestion = proactive.get("suggestion") or ""
    if suggestion:
        lines.append(f"Proactive: {suggestion}")

    return lines