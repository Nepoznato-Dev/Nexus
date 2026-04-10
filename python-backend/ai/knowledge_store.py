from pathlib import Path
from typing import Dict, List
import re


ROOT_DIR = Path(__file__).resolve().parents[2]


def _extract_keywords(message: str, limit: int = 8) -> List[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9_-]{2,}", str(message or "").lower())
    stop = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "what",
        "when",
        "where",
        "which",
        "about",
        "into",
        "have",
        "has",
        "should",
        "could",
        "would",
        "please",
    }
    uniq = []
    for word in words:
        if word in stop:
            continue
        if word not in uniq:
            uniq.append(word)
        if len(uniq) >= limit:
            break
    return uniq


def _candidate_files() -> List[Path]:
    paths = [
        ROOT_DIR / "README.md",
        ROOT_DIR / "docs" / "README.md",
        ROOT_DIR / "docs" / "IRIS_DOCUMENTATION.md",
        ROOT_DIR / "docs" / "IRIS_FEATURES.md",
        ROOT_DIR / "docs" / "MODS_CATALOG.md",
        ROOT_DIR / "docs" / "QUICK_COMMANDS.md",
        ROOT_DIR / "docs" / "development" / "ALLOY_MULTILINGUAL_CAPABILITIES.md",
        ROOT_DIR / "src" / "Components" / "A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem" / "ARCHITECTURE.md",
        ROOT_DIR / "src" / "Components" / "A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem" / "FEATURES_ROADMAP.md",
    ]
    return [p for p in paths if p.exists() and p.is_file()]


def _read_relevant_snippet(path: Path, keywords: List[str], max_chars: int = 600) -> Dict | None:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return None

    lines = text.splitlines()
    if not lines:
        return None

    best_idx = -1
    best_score = 0
    for idx, line in enumerate(lines):
        lower = line.lower()
        score = sum(1 for k in keywords if k in lower)
        if score > best_score:
            best_score = score
            best_idx = idx

    if best_idx < 0 or best_score == 0:
        return None

    start = max(0, best_idx - 3)
    end = min(len(lines), best_idx + 5)
    snippet = "\n".join(lines[start:end]).strip()
    snippet = snippet[:max_chars]

    try:
        rel = str(path.relative_to(ROOT_DIR))
    except Exception:
        rel = str(path)

    return {
        "path": rel,
        "score": best_score,
        "snippet": snippet,
    }


def build_knowledge_snapshot(message: str, context: Dict | None = None) -> Dict:
    keywords = _extract_keywords(message)
    candidates = _candidate_files()
    snippets: List[Dict] = []

    for path in candidates:
        item = _read_relevant_snippet(path, keywords)
        if item:
            snippets.append(item)

    snippets.sort(key=lambda x: x.get("score", 0), reverse=True)
    snippets = snippets[:4]

    return {
        "keywords": keywords,
        "sourceCount": len(snippets),
        "sources": snippets,
        "hasCoverage": bool(snippets),
        "requestedContext": {
            "hasAttachments": bool((context or {}).get("attachments")),
            "hasWebContext": bool((context or {}).get("webContext")),
        },
    }