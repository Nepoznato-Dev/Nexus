import re
from typing import Dict, List


def detect_false_dilemma(question: str) -> Dict:
    q = str(question or "")
    patterns = [
        (r"should i (do|choose|pick) .+ or .+\?", "binary_choice"),
        (r"i (have to|must|can only) (do|choose) .+ or .+", "false_necessity"),
        (r"it'?s (either|both|just) .+ or .+", "limited_scope"),
    ]
    for pattern, dilemma_type in patterns:
        if re.search(pattern, q, flags=re.IGNORECASE):
            return {"isFalseDilemma": True, "type": dilemma_type, "question": q}
    return {"isFalseDilemma": False}


def question_premise(question: str) -> Dict:
    q = str(question or "")
    assumptions = [
        (r"how (do|can) i (convince|persuade|get|make) .+", "Assumes persuasion is needed - validate the real blocker first.", "Use evidence and constraints instead of persuasion framing."),
        (r"should i (quit|leave|switch|change)", "Assumes staying vs leaving is the core issue.", "Is the issue fixable in current context before switching?"),
        (r"i (can't|unable to|impossible to) .+", "Assumes impossible instead of constrained.", "Identify whether the blocker is time, money, knowledge, or priority."),
        (r"best way to .+", "Assumes one universal best path.", "Best depends on speed, cost, quality, and risk constraints."),
    ]
    for pattern, assumption, reframe in assumptions:
        if re.search(pattern, q, flags=re.IGNORECASE):
            return {
                "questionedAssumption": True,
                "assumption": assumption,
                "reframe": reframe,
                "original": q,
            }
    return {"questionedAssumption": False}


def find_handbrake(question: str) -> Dict:
    q = str(question or "")
    solutions: List[Dict] = []

    if re.search(r"money|cost|expensive|afford|budget", q, flags=re.IGNORECASE):
        solutions.append({"type": "avoid_spending", "idea": "Check free/borrow/rent/trade options first."})
    if re.search(r"don't have time|too busy|deadline|rush", q, flags=re.IGNORECASE):
        solutions.append({"type": "reduce_scope", "idea": "Ship a reduced-scope MVP instead of full scope."})
    if re.search(r"error|bug|broken|doesn't work|fail", q, flags=re.IGNORECASE):
        solutions.append({"type": "different_path", "idea": "Consider bypassing the failing path or swapping tools."})
    if re.search(r"disagree|conflict|argument|convince|persuade", q, flags=re.IGNORECASE):
        solutions.append({"type": "align_on_goal", "idea": "Align on shared objective before debating implementation."})

    return {"hasHandbrake": bool(solutions), "solutions": solutions}


def enhance_with_common_sense(question: str, answer: str) -> Dict:
    dilemma = detect_false_dilemma(question)
    premise = question_premise(question)
    handbrake = find_handbrake(question)

    thinking = []
    if dilemma.get("isFalseDilemma"):
        thinking.append({
            "type": "false_dilemma_detected",
            "insight": f"This may be a false {dilemma.get('type')}.",
            "priority": "high",
        })
    if premise.get("questionedAssumption"):
        thinking.append({
            "type": "assumption_questioned",
            "assumption": premise.get("assumption"),
            "reframe": premise.get("reframe"),
            "priority": "high",
        })
    if handbrake.get("hasHandbrake"):
        thinking.append({
            "type": "lateral_solutions",
            "solutions": (handbrake.get("solutions") or [])[:2],
            "priority": "high",
        })

    return {"originalAnswer": str(answer or ""), "thinkingProcess": thinking}


def score_confidence(question: str, answer: str) -> Dict:
    q = str(question or "")
    a = str(answer or "")
    confidence = 75

    if len(a) < 50:
        confidence -= 25
    elif len(a) < 200:
        confidence -= 5
    if re.search(r"\n\n", a):
        confidence += 5
    if re.search(r"\d+[\.)]\s|^[\-\*•]\s", a, flags=re.MULTILINE):
        confidence += 5
    if re.search(r"because|therefore|thus|since|as a result", a, flags=re.IGNORECASE):
        confidence += 5

    q_words = [w for w in re.split(r"\s+", q.lower()) if len(w) > 3]
    matches = sum(1 for w in q_words if w in a.lower())
    if q_words and matches < len(q_words) / 2:
        confidence -= 15

    if re.search(r"uncertain|might|could|possibly|unclear|ambiguous", a, flags=re.IGNORECASE):
        confidence -= 10
    if re.search(r"2024|2025|2026|current|latest|now|recently", q, flags=re.IGNORECASE):
        confidence -= 20

    confidence = max(0, min(100, round(confidence)))
    return {
        "confidence": confidence,
        "isUncertain": confidence < 60,
        "shouldQualify": confidence < 70,
    }


def detect_guessing_patterns(answer: str) -> Dict:
    a = str(answer or "")
    patterns = [
        (r"i (don't know|can't say|am not sure|i'm not sure)", "admitted_uncertainty", "high"),
        (r"might|could|possibly|perhaps|maybe|sort of|kind of", "hedging", "medium"),
        (r"depends on|varies|it's complicated|not always", "context_dependent", "low"),
        (r"i think|in my opinion|seems like", "opinion", "medium"),
        (r"generally|usually|often|sometimes", "generalization", "low"),
    ]
    detected = []
    for pattern, kind, severity in patterns:
        if re.search(pattern, a, flags=re.IGNORECASE):
            detected.append({"type": kind, "severity": severity})
    return {
        "isGuessing": bool(detected),
        "patterns": detected,
        "hasContradictions": bool(re.search(r"but|however|on the other hand|contrary|actually|wait", a, flags=re.IGNORECASE)),
    }


def generate_self_awareness_statement(question: str, answer: str, confidence: int, retrieval_count: int) -> Dict:
    q = str(question or "")
    reasoning = []
    verification = []
    guessing = detect_guessing_patterns(answer)

    if retrieval_count <= 0:
        reasoning.append("I am responding without retrieved evidence, so I treat this as lower-certainty reasoning.")
        verification.append("It is not logical to finalize this as factual until a source-backed check is done.")

    if re.search(r"latest|current|recent|2024|2025|2026|released|release", q, flags=re.IGNORECASE):
        reasoning.append("This question is time-sensitive, so my confidence is reduced unless a current source confirms it.")
        verification.append("I should verify against an up-to-date source before treating this as authoritative.")

    if guessing.get("isGuessing"):
        reasoning.append("I detect hedging language in my own output, which signals uncertainty.")

    if confidence < 60:
        stance = "I am uncertain here, so this should be treated as a hypothesis rather than a final claim."
    elif confidence < 75:
        stance = "I can propose a useful direction, but critical decisions still need verification."
    else:
        stance = "I am reasonably confident in this reasoning path given the available signals."

    if not reasoning:
        reasoning.append("My internal checks found no major contradiction pattern in this response.")

    return {
        "stance": stance,
        "reasoning": reasoning,
        "verification": verification,
        "guessing": guessing,
    }


def evolve_self_awareness_profile(
    previous_profile: Dict | None,
    statement: Dict,
    confidence: int,
    retrieval_count: int,
    approved_features: List[str] | None = None,
) -> Dict:
    prev = previous_profile or {}
    old_features = dict(prev.get("featureWeights") or {})
    previously_approved = set([str(x) for x in (prev.get("approvedFeatures") or []) if str(x).strip()])
    newly_approved = set([str(x) for x in (approved_features or []) if str(x).strip()])
    approved = previously_approved | newly_approved
    pending = set([str(x) for x in (prev.get("pendingApprovalFeatures") or []) if str(x).strip()])

    # Forgetting curve: older traits decay unless reinforced this turn.
    decayed = {k: round(float(v) * 0.9, 3) for k, v in old_features.items()}

    def reinforce(name: str, weight: float = 0.2):
        decayed[name] = round(min(1.0, float(decayed.get(name, 0.0)) + weight), 3)

    def propose_or_reinforce(name: str, weight: float):
        if name in decayed or name in approved:
            if name not in decayed and name in approved:
                decayed[name] = max(0.4, round(float(weight), 3))
            else:
                reinforce(name, weight)
            pending.discard(name)
        else:
            pending.add(name)

    # Promote previously pending features once explicitly approved by the user.
    for feature in sorted(list(pending)):
        if feature in approved:
            reinforce(feature, 0.4)
            pending.discard(feature)

    if retrieval_count <= 0:
        propose_or_reinforce("source_verification_gate", 0.25)
    if confidence < 60:
        propose_or_reinforce("uncertainty_disclosure", 0.3)
    if (statement.get("guessing") or {}).get("isGuessing"):
        propose_or_reinforce("hedge_detection", 0.2)
    if statement.get("verification"):
        propose_or_reinforce("verification_first_reasoning", 0.15)

    retired = [name for name, value in decayed.items() if value < 0.35]
    for name in retired:
        decayed.pop(name, None)

    active = sorted(decayed.keys())
    pending_final = sorted([name for name in pending if name not in approved])
    return {
        "featureWeights": decayed,
        "activeFeatures": active,
        "retiredFeatures": retired,
        "approvedFeatures": sorted(approved),
        "pendingApprovalFeatures": pending_final,
        "approvalRequired": bool(pending_final),
        "approvalMessage": (
            "I can add new self-awareness behaviors, but I need your approval first."
            if pending_final
            else ""
        ),
        "profileVersion": int(prev.get("profileVersion") or 0) + 1,
    }


def suggest_verification(question: str) -> List[Dict]:
    q = str(question or "")
    items = []
    if re.search(r"code|program|technical|algorithm|function|method", q, flags=re.IGNORECASE):
        items.append({"type": "test_it", "suggestion": "Write a minimal test case to verify behavior."})
    if re.search(r"fact|true|false|is it|does it|does", q, flags=re.IGNORECASE):
        items.append({"type": "primary_source", "suggestion": "Check a primary source for factual confirmation."})
    items.append({"type": "small_scale", "suggestion": "Try on a small scale before full commitment."})
    return items


def analyze_user_context(conversation_history: List[Dict] | None = None) -> Dict:
    history = conversation_history or []
    if not history:
        return {"topics": [], "expertise": "unknown", "pace": "unknown"}

    recent = history[-10:]
    all_text = " ".join([str(m.get("text") or "") for m in recent]).lower()
    patterns = {
        "coding": r"code|javascript|python|function|loop|variable|debug|api",
        "learning": r"learn|study|understand|explain|tutorial|practice",
        "career": r"job|career|interview|resume|salary|promotion",
        "business": r"startup|business|product|market|customer|revenue",
    }
    topics = [topic for topic, pattern in patterns.items() if re.search(pattern, all_text, flags=re.IGNORECASE)]

    expertise = "intermediate"
    if re.search(r"beginner|new to|just started|how do i start", all_text, flags=re.IGNORECASE):
        expertise = "beginner"
    if re.search(r"advanced|optimize|architecture|algorithm", all_text, flags=re.IGNORECASE):
        expertise = "advanced"

    pace = "normal"
    if re.search(r"deadline|rush|urgent|quick|fast|asap", all_text, flags=re.IGNORECASE):
        pace = "fast"
    if re.search(r"long term|gradually|step by step|careful", all_text, flags=re.IGNORECASE):
        pace = "deliberate"

    return {"topics": topics, "expertise": expertise, "pace": pace, "messageCount": len(history)}


def suggest_next_step(last_question: str, context: Dict | None = None) -> List[Dict]:
    q = str(last_question or "")
    ctx = context or {}
    suggestions = []
    if re.search(r"how do i (start|learn) .+", q, flags=re.IGNORECASE):
        suggestions.append({"type": "practice", "question": "Ready to build a tiny project with this?", "why": "Building reinforces learning."})
    if re.search(r"how do i (fix|solve|debug) .+", q, flags=re.IGNORECASE):
        suggestions.append({"type": "prevent", "question": "How can this failure be prevented next time?", "why": "Prevention compounds value."})
    if re.search(r"should i|best way|which|option", q, flags=re.IGNORECASE):
        suggestions.append({"type": "tradeoffs", "question": "Which tradeoff matters most here?", "why": "Context determines best choice."})
    if ctx.get("expertise") == "beginner" and not suggestions:
        suggestions.append({"type": "fundamentals", "question": "Want a fundamentals-first version?", "why": "Foundations prevent confusion."})
    return suggestions


def proactive_warnings(user_message: str, context: Dict | None = None) -> List[Dict]:
    text = str(user_message or "")
    ctx = context or {}
    warnings: List[Dict] = []

    if re.search(r"deploy|production|go live|release|ship", text, flags=re.IGNORECASE):
        warnings.append({
            "severity": "high",
            "message": "Wait - have you tested this thoroughly?",
            "why": "Production issues affect real users.",
            "suggestion": "Run a pre-release checklist.",
        })
    if re.search(r"decided|going to|going with|picked|chose", text, flags=re.IGNORECASE) and ctx.get("pace") == "fast":
        warnings.append({
            "severity": "medium",
            "message": "Pause and check decision reversibility.",
            "why": "Fast irreversible decisions are high risk.",
            "suggestion": "Time-box and review before finalizing.",
        })

    return warnings