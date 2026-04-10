from typing import Dict, List
import re


def derive_flux_tags(message: str, web_context: str = "") -> List[str]:
    lower = (message or "").lower()
    tags: List[str] = []

    if re.search(r"proof|paradox|contradiction|assumption|logic trap|hallucinat", lower):
        tags.append("logic-trap")
    if re.search(r"code|stack trace|exception|typescript|javascript|python|compiler|refactor", lower):
        tags.append("high-code-density")
    if len(web_context or "") > 1200 or re.search(r"85k|dataset|logs?|massive|large context", lower):
        tags.append("high-strain")

    return sorted(set(tags))


def scrub_web_context(raw_web_context: str) -> Dict:
    text = str(raw_web_context or "")
    if not text:
        return {"cleaned": "", "removed": 0}

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned_lines = [line for line in lines if not re.search(r"sponsored|advertisement|cookie policy|subscribe", line.lower())]

    return {
        "cleaned": "\n".join(cleaned_lines),
        "removed": max(0, len(lines) - len(cleaned_lines)),
    }
