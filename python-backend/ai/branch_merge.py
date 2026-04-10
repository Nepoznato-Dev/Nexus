from __future__ import annotations

import asyncio
import re
from typing import Dict, List

from .providers.ollama_provider import generate_with_ollama


def _module_focus(module: Dict) -> str:
    module_id = str(module.get("id") or "").upper()
    if module_id == "S1":
        return "Validate concrete details quickly and flag arithmetic/syntax issues."
    if module_id == "S2":
        return "Audit logic step-by-step and look for contradictions or weak assumptions."
    if module_id == "S3":
        return "Prioritize evidence-grounded claims and source consistency."
    if module_id == "S4":
        return "Improve structure, clarity, and implementation-level actionability."
    return "Provide a concise specialist pass for this request."


async def _run_single_branch(message: str, route: Dict, module: Dict, chunks: List[Dict]) -> Dict:
    focus = _module_focus(module)
    evidence = "\n".join([f"- {c.get('id')}: {str(c.get('text') or '')[:160]}" for c in chunks[:4]])
    prompt = "\n\n".join(
        [
            "You are a specialist branch in A.L.L.O.Y's internal council.",
            f"Specialist: {module.get('id')} {module.get('title')}",
            f"Focus: {focus}",
            f"Route tier: {route.get('tier')} | model target: {route.get('model_size_b')}B {route.get('quantization')}",
            "Write a direct answer draft from this specialist perspective only.",
            "Avoid generic templates and avoid repeating capability lists.",
            f"Evidence snippets:\n{evidence if evidence else '- none'}",
            f"User message:\n{message}",
            "Specialist draft:",
        ]
    )

    result = await generate_with_ollama(prompt, str(route.get("tier") or "lite"))
    text = str(result.get("text") or "").strip()
    score = max(35, min(92, 50 + min(30, len(text) // 30)))

    return {
        "id": str(module.get("id") or "?"),
        "title": str(module.get("title") or "Specialist"),
        "focus": focus,
        "ok": bool(result.get("ok") and text),
        "text": text,
        "score": score,
    }


async def run_branch_workers(message: str, route: Dict, modules: List[Dict], chunks: List[Dict]) -> Dict:
    if not modules:
        return {"enabled": False, "branches": [], "parallelCount": 0}

    tasks = [_run_single_branch(message, route, module, chunks) for module in modules]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    branches = []
    for idx, result in enumerate(results):
        if isinstance(result, Exception):
            module = modules[idx]
            branches.append(
                {
                    "id": str(module.get("id") or "?"),
                    "title": str(module.get("title") or "Specialist"),
                    "focus": _module_focus(module),
                    "ok": False,
                    "text": "",
                    "score": 0,
                    "error": str(result),
                }
            )
        else:
            branches.append(result)

    return {
        "enabled": True,
        "branches": branches,
        "parallelCount": len(tasks),
    }


def _sentence_split(text: str) -> List[str]:
    chunks = re.split(r"(?<=[.!?])\s+|\n+", str(text or "").strip())
    seen = set()
    ordered = []
    for part in chunks:
        clean = part.strip()
        key = clean.lower()
        if len(clean) < 12:
            continue
        if key in seen:
            continue
        seen.add(key)
        ordered.append(clean)
    return ordered


def _conflicts_with(line: str, accepted: List[str]) -> bool:
    lower = line.lower()
    toggles = [
        (r"\b(always|must)\b", r"\b(never|cannot|must not)\b"),
        (r"\b(is required|required)\b", r"\b(optional|not required)\b"),
    ]
    for yes_pat, no_pat in toggles:
        line_yes = re.search(yes_pat, lower)
        line_no = re.search(no_pat, lower)
        for existing in accepted:
            existing_lower = existing.lower()
            existing_yes = re.search(yes_pat, existing_lower)
            existing_no = re.search(no_pat, existing_lower)
            if (line_yes and existing_no) or (line_no and existing_yes):
                return True
    return False


def merge_branch_outputs(base_response: str, branch_result: Dict) -> Dict:
    branches = [b for b in (branch_result.get("branches") or []) if b.get("ok") and b.get("text")]
    if not branches:
        return {
            "merged": False,
            "text": str(base_response or "").strip(),
            "acceptedBranchIds": [],
            "contradictionCount": 0,
            "proofMap": [],
        }

    accepted_lines: List[str] = _sentence_split(base_response)
    accepted_branch_ids: List[str] = []
    contradiction_count = 0
    proof_map: List[Dict] = []

    for branch in sorted(branches, key=lambda b: int(b.get("score") or 0), reverse=True):
        branch_id = str(branch.get("id") or "?")
        branch_lines = _sentence_split(str(branch.get("text") or ""))[:4]
        kept = []
        for line in branch_lines:
            if _conflicts_with(line, accepted_lines):
                contradiction_count += 1
                continue
            accepted_lines.append(line)
            kept.append(line)

        if kept:
            accepted_branch_ids.append(branch_id)
            proof_map.append({"branchId": branch_id, "kept": kept})

    final_lines = accepted_lines[:10] if accepted_lines else [str(base_response or "").strip()]
    merged_text = "\n\n".join(final_lines).strip()

    return {
        "merged": True,
        "text": merged_text,
        "acceptedBranchIds": accepted_branch_ids,
        "contradictionCount": contradiction_count,
        "proofMap": proof_map,
    }