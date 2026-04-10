from typing import Dict, List
import re


def _extract_signals(text: str) -> List[str]:
    candidates = re.findall(r"[A-Za-z_][A-Za-z0-9_.:-]{3,}", str(text or ""))
    unique: List[str] = []
    for token in candidates:
        if token.lower() in {"please", "should", "could", "would", "about", "because"}:
            continue
        if token not in unique:
            unique.append(token)
        if len(unique) >= 5:
            break
    return unique


def _build_code_writing_contract(message: str, response: str) -> str:
    lower = str(message or "").lower()
    signals = _extract_signals(message)

    root_cause = "Primary failure path is not isolated yet; start by reproducing with minimal scope."
    if re.search(r"error|exception|trace|fail|bug|crash", lower):
        root_cause = "Observed failure suggests a deterministic defect path; isolate the first failing operation and inputs."
    if re.search(r"refactor|architecture|design", lower):
        root_cause = "Risk likely comes from coupling and unclear boundaries; isolate responsibilities before changes."

    action = "Apply the smallest safe change, verify behavior, then expand only if tests remain stable."
    if re.search(r"ui|component|css|layout", lower):
        action = "Apply one UI change at a time, verify behavior on desktop and mobile, then proceed incrementally."

    verification = "Run targeted validation for the modified path and confirm edge cases before merging."
    if signals:
        verification = f"Validate changed path against: {', '.join(signals[:3])}."

    return (
        f"{response}\n\n"
        f"Root cause focus: {root_cause}\n"
        f"Action plan: {action}\n"
        f"Validation: {verification}"
    )


def _build_mod_log_contract(message: str, response: str, evidence: List[Dict]) -> str:
    text = "\n".join([str(message or "")] + [str((e.get("text") or "")) for e in (evidence or [])])
    lower = text.lower()
    signals = _extract_signals(text)

    observed = []
    if re.search(r"exception|traceback|stack", lower):
        observed.append("Stack trace or exception markers detected.")
    if re.search(r"null|undefined|none", lower):
        observed.append("Null/undefined access risk detected.")
    if re.search(r"timeout|latency|slow", lower):
        observed.append("Timing or timeout pressure detected.")
    if not observed:
        observed.append("Log contains mixed signals; isolate first hard error token.")

    likely_cause = "Likely root cause is malformed runtime state or missing dependency initialization."
    if re.search(r"module|import|loader|classnotfound", lower):
        likely_cause = "Likely root cause is module resolution or load-order mismatch."
    if re.search(r"permission|denied|forbidden", lower):
        likely_cause = "Likely root cause is permission policy or sandbox restriction."

    diagnostics = "Capture the first failing line, associated module, and preceding state mutation."
    if signals:
        diagnostics = f"Trace tokens in order: {', '.join(signals[:4])}."

    return (
        f"{response}\n\n"
        f"Observed signals: {' '.join(observed)}\n"
        f"Likely root cause: {likely_cause}\n"
        f"Next diagnostics: {diagnostics}"
    )


def apply_use_case_contract(use_case: str, message: str, response: str, evidence: List[Dict] | None = None) -> Dict:
    normalized = str(use_case or "general-assistance").strip().lower()
    base = str(response or "").strip()

    if normalized == "code-writing":
        final = _build_code_writing_contract(message, base)
        return {"applied": True, "useCase": normalized, "output": final, "contract": "code-writing-v1"}

    if normalized == "mod-log-analysis":
        final = _build_mod_log_contract(message, base, evidence or [])
        return {"applied": True, "useCase": normalized, "output": final, "contract": "mod-log-analysis-v1"}

    return {"applied": False, "useCase": normalized, "output": base, "contract": "none"}