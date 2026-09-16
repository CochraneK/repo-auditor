#!/usr/bin/env python3
"""Report whether the latest structured audit for each public repository is current.

By default stale audits are reported as warnings and do not fail CI. Use --strict
when a caller explicitly wants staleness to be blocking.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDITS = ROOT / "audits"
API = "https://api.github.com"


def request_json(path: str) -> Any:
    request = urllib.request.Request(
        API + path,
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "repo-auditor-freshness-check",
        },
    )
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API {exc.code}: {detail}") from exc


def load_latest_sidecars(audits_dir: Path = AUDITS) -> list[tuple[Path, dict[str, Any]]]:
    grouped: dict[str, list[tuple[Path, dict[str, Any]]]] = defaultdict(list)
    for path in sorted(audits_dir.glob("*.json")):
        if path.name in {"index.json", "schema-v1.json", "freshness.json"}:
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        repo = data.get("repository")
        if isinstance(repo, str):
            grouped[repo].append((path, data))

    latest: list[tuple[Path, dict[str, Any]]] = []
    for items in grouped.values():
        latest.append(max(items, key=lambda item: (str(item[1].get("audit_date", "")), item[0].name)))
    return sorted(latest, key=lambda item: str(item[1]["repository"]))


def default_head(repository: str) -> str:
    repo = urllib.parse.quote(repository, safe="/")
    commits = request_json(f"/repos/{repo}/commits?per_page=1")
    if not isinstance(commits, list) or not commits or not isinstance(commits[0].get("sha"), str):
        raise RuntimeError(f"Could not resolve default-branch HEAD for {repository}")
    return commits[0]["sha"]


def check(audits_dir: Path = AUDITS) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for path, data in load_latest_sidecars(audits_dir):
        repository = str(data["repository"])
        audited = str(data["audited_commit"])
        head = default_head(repository)
        results.append(
            {
                "repository": repository,
                "sidecar": path.name,
                "audit_date": data.get("audit_date"),
                "audited_commit": audited,
                "head_commit": head,
                "state": "current" if audited == head else "stale",
            }
        )
    return results


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true", help="Return non-zero if any latest audit is stale.")
    parser.add_argument("--out", type=Path, help="Optional JSON output path.")
    args = parser.parse_args()

    try:
        results = check()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")

    stale = 0
    for item in results:
        label = item["state"].upper()
        print(f"{label}: {item['repository']} audited={item['audited_commit']} head={item['head_commit']}")
        if item["state"] == "stale":
            stale += 1
            print(
                f"::warning file=audits/{item['sidecar']}::Audit is stale for {item['repository']}; "
                f"audited {item['audited_commit'][:12]}, head {item['head_commit'][:12]}"
            )

    print(f"Audit freshness: {len(results) - stale} current, {stale} stale")
    return 1 if args.strict and stale else 0


if __name__ == "__main__":
    raise SystemExit(main())
