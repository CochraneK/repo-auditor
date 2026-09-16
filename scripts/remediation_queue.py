#!/usr/bin/env python3
"""List open findings that repo-auditor may remediate automatically in GO mode."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDITS = ROOT / "audits"
AUTO_FIX = "auto-fix"


def latest_sidecars(root: Path) -> list[tuple[Path, dict[str, Any]]]:
    latest: dict[str, tuple[Path, dict[str, Any]]] = {}
    for path in sorted(root.glob("*.json")):
        if path.name in {"index.json", "schema-v1.json"}:
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        repo = str(data.get("repository", ""))
        if not repo:
            continue
        current = latest.get(repo)
        if current is None or str(data.get("audit_date", "")) >= str(current[1].get("audit_date", "")):
            latest[repo] = (path, data)
    return sorted(latest.values(), key=lambda item: str(item[1].get("repository", "")))


def remediation_queue(root: Path = AUDITS, repository: str | None = None) -> list[dict[str, Any]]:
    queue: list[dict[str, Any]] = []
    for path, data in latest_sidecars(root):
        repo = str(data.get("repository", ""))
        if repository and repo != repository:
            continue
        for finding in data.get("findings", []):
            if finding.get("status") != "open":
                continue
            if finding.get("remediation_class") != AUTO_FIX:
                continue
            queue.append({
                "repository": repo,
                "audit": path.name,
                "id": finding.get("id"),
                "severity": finding.get("severity"),
                "title": finding.get("title"),
                "recommendation": finding.get("recommendation"),
            })
    severity_rank = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
    queue.sort(key=lambda item: (severity_rank.get(str(item["severity"]), 9), str(item["repository"]), str(item["id"])))
    return queue


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repository", help="Optional owner/name filter")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    args = parser.parse_args()

    queue = remediation_queue(repository=args.repository)
    if args.json:
        print(json.dumps(queue, ensure_ascii=False, indent=2))
        return 0

    if not queue:
        print("No open auto-fix findings.")
        return 0

    for item in queue:
        print(f'{item["severity"]} {item["repository"]} {item["id"]}: {item["title"]}')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
