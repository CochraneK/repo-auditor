#!/usr/bin/env python3
"""Deterministic AI-readiness assessment for repository evidence."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

WEIGHTS = {
    "readme": 15,
    "agents": 15,
    "handoff": 15,
    "status": 10,
    "decisions": 10,
    "architecture": 15,
    "validation": 10,
    "readme_visual": 5,
    "readme_quickstart": 5,
}


def _present(mapping: dict[str, Any], key: str) -> bool:
    return bool(mapping.get(key))


def assess(evidence: dict[str, Any]) -> dict[str, Any]:
    common = evidence.get("common_files") or {}
    ai_files = evidence.get("ai_readiness_files") or {}
    readme = evidence.get("readme_quality") or {}

    checks = {
        "readme": _present(common, "README.md"),
        "agents": _present(ai_files, "AGENTS.md"),
        "handoff": _present(ai_files, "HANDOFF.md"),
        "status": _present(ai_files, "STATUS.md"),
        "decisions": _present(ai_files, "DECISIONS.md"),
        "architecture": bool(ai_files.get("architecture_docs")),
        "validation": bool(ai_files.get("validation_documented")),
        "readme_visual": bool(readme.get("has_visual")),
        "readme_quickstart": bool(readme.get("has_quick_start")),
    }

    score = sum(WEIGHTS[name] for name, ok in checks.items() if ok)
    findings: list[dict[str, Any]] = []

    def add(code: str, severity: str, title: str, remediation: str) -> None:
        findings.append({
            "code": code,
            "severity": severity,
            "title": title,
            "remediation": remediation,
            "confidence": 1.0,
        })

    if not checks["readme"]:
        add("AI-README-MISSING", "P1", "README missing", "Add a concise human entry point with purpose, setup and validation.")
    if not checks["agents"]:
        add("AI-AGENTS-MISSING", "P2", "AGENTS.md missing", "Document agent constraints, validation commands and protected areas.")
    if not checks["handoff"]:
        add("AI-HANDOFF-MISSING", "P2", "HANDOFF.md missing", "Add current mission, completed work, blockers, next actions and validation.")
    if not checks["status"]:
        add("AI-STATUS-MISSING", "P3", "STATUS.md missing", "Record current project state so a new agent does not infer it from chat history.")
    if not checks["decisions"]:
        add("AI-DECISIONS-MISSING", "P3", "DECISIONS.md missing", "Record important architectural/product decisions and rejected alternatives.")
    if not checks["architecture"]:
        add("AI-ARCHITECTURE-MISSING", "P2", "Architecture documentation missing", "Add an architecture document or README architecture section/diagram.")
    if not checks["validation"]:
        add("AI-VALIDATION-MISSING", "P2", "Validation commands are not documented", "Document the exact test/build/audit commands an agent must run before handoff.")
    if checks["readme"] and not checks["readme_visual"]:
        add("DOC-README-VISUAL-MISSING", "P3", "README lacks a visual project map", "Add a Mermaid architecture/flow diagram or a meaningful screenshot/demo image.")
    if checks["readme"] and not checks["readme_quickstart"]:
        add("DOC-README-QUICKSTART-MISSING", "P2", "README lacks a quick-start path", "Add the shortest reproducible install/run path.")

    if score >= 85:
        state = "AI_READY"
    elif score >= 60:
        state = "PARTIAL"
    else:
        state = "NOT_READY"

    return {
        "schema_version": 1,
        "scope": "deterministic-ai-readiness",
        "repository": evidence.get("repository"),
        "readiness_score": score,
        "readiness_state": state,
        "checks": checks,
        "findings": findings,
        "note": "AI readiness is a handoff/onboarding measure, not a repository quality score.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("evidence", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--fail-below", type=int, default=None)
    args = parser.parse_args()

    result = assess(json.loads(args.evidence.read_text(encoding="utf-8")))
    text = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
    if args.fail_below is not None and result["readiness_score"] < args.fail_below:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
