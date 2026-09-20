#!/usr/bin/env python3
"""Render a workflow-safe summary of an L4 semantic review."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


def is_private_evidence(evidence: dict[str, Any]) -> bool:
    return (
        str(evidence.get("visibility", "")).lower() == "private"
        or evidence.get("public") is False
    )


def render(evidence: dict[str, Any], report: dict[str, Any]) -> str:
    private = is_private_evidence(evidence)
    findings = report.get("findings") or []
    severities = Counter(
        str(item.get("severity") or "UNKNOWN")
        for item in findings
        if isinstance(item, dict)
    )
    confidence = report.get("confidence", "—")
    provider = report.get("provider", "unknown")
    model = report.get("model", "unknown")

    lines = [
        "## L4 Semantic Review",
        "",
        f"- Status: **completed**",
        f"- Evidence visibility: **{'private' if private else 'public'}**",
        f"- Provider: **{provider}**",
        f"- Model: **{model}**",
        f"- Review confidence: **{confidence}**",
        f"- Findings: **{len(findings)}**",
        f"- Severity counts: **P0 {severities.get('P0', 0)} · P1 {severities.get('P1', 0)} · P2 {severities.get('P2', 0)} · P3 {severities.get('P3', 0)}**",
        "",
    ]

    if private:
        lines += [
            "> Private repository details are intentionally omitted from this workflow summary.",
            "> The full evidence and semantic report remain ephemeral on the runner.",
            "",
        ]
        return chr(10).join(lines)

    repository = evidence.get("repository")
    if repository:
        lines.insert(2, f"- Repository: **{repository}**")

    summary = report.get("summary")
    if isinstance(summary, str) and summary.strip():
        lines += ["### Summary", "", summary.strip(), ""]

    if findings:
        lines += ["### Findings", ""]
        for item in findings:
            if not isinstance(item, dict):
                continue
            title = str(item.get("title") or "Untitled finding")
            severity = str(item.get("severity") or "UNKNOWN")
            code = str(item.get("code") or "NO-CODE")
            remediation = str(item.get("remediation") or "").strip()
            lines.append(f"- **{severity} · {code}** — {title}")
            if remediation:
                lines.append(f"  - Remediation: {remediation}")
        lines.append("")

    candidates = report.get("regression_candidates") or []
    lines += [
        "### Meta-learning",
        "",
        f"- Regression candidates: **{len(candidates) if isinstance(candidates, list) else 0}**",
        "- Candidates remain suggestions until generalized, tested, and promoted through the L7 gate.",
        "",
    ]
    return chr(10).join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("evidence", type=Path)
    parser.add_argument("report", type=Path)
    args = parser.parse_args()
    evidence = json.loads(args.evidence.read_text(encoding="utf-8"))
    report = json.loads(args.report.read_text(encoding="utf-8"))
    print(render(evidence, report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
