#!/usr/bin/env python3
"""Report whether the latest structured audit for each public repository is current.

By default stale audits are reported as warnings and do not fail CI. Use --strict
when a caller explicitly wants staleness to be blocking.

A sidecar may opt into a narrow "current-equivalent" state with:

    "freshness": {
      "ignore_paths": ["audits/**", "portfolio/registry.json"]
    }

This is intentionally explicit per audit. A moved HEAD is only treated as
current-equivalent when every changed file since the audited commit matches one
of those paths. Code, CI, UI, or other unlisted changes still make the audit stale.
"""
from __future__ import annotations

import argparse
import fnmatch
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


def _request(path: str, token: str | None) -> Any:
    request = urllib.request.Request(
        API + path,
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "repo-auditor-freshness-check",
        },
    )
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def request_json(path: str) -> Any:
    token = os.environ.get("GITHUB_TOKEN")
    try:
        return _request(path, token)
    except urllib.error.HTTPError as exc:
        # A repository-scoped Actions token can return 404/403 for another
        # public repository. Retry anonymously before declaring it inaccessible.
        if token and exc.code in {403, 404}:
            try:
                return _request(path, None)
            except urllib.error.HTTPError as public_exc:
                detail = public_exc.read().decode(
                    "utf-8",
                    errors="replace",
                )
                raise RuntimeError(
                    f"GitHub API {public_exc.code}: {detail}"
                ) from public_exc
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


def changed_files(repository: str, base: str, head: str) -> list[str]:
    repo = urllib.parse.quote(repository, safe="/")
    payload = request_json(f"/repos/{repo}/compare/{base}...{head}")
    files = payload.get("files", []) if isinstance(payload, dict) else []
    return [
        str(item["filename"])
        for item in files
        if isinstance(item, dict) and isinstance(item.get("filename"), str)
    ]


def path_is_ignored(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)


def ignore_patterns(data: dict[str, Any]) -> list[str]:
    freshness = data.get("freshness")
    if not isinstance(freshness, dict):
        return []
    value = freshness.get("ignore_paths", [])
    if not isinstance(value, list):
        return []
    return [str(item) for item in value if isinstance(item, str) and item.strip()]


def check(audits_dir: Path = AUDITS) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for path, data in load_latest_sidecars(audits_dir):
        repository = str(data["repository"])
        audited = str(data["audited_commit"])
        patterns = ignore_patterns(data)
        files: list[str] = []
        error: str | None = None

        try:
            head = default_head(repository)
            if audited == head:
                state = "current"
            elif patterns:
                files = changed_files(repository, audited, head)
                state = (
                    "current-equivalent"
                    if files
                    and all(
                        path_is_ignored(filename, patterns)
                        for filename in files
                    )
                    else "stale"
                )
            else:
                state = "stale"
        except RuntimeError as exc:
            head = ""
            state = "unknown"
            error = str(exc)

        results.append(
            {
                "repository": repository,
                "sidecar": path.name,
                "audit_date": data.get("audit_date"),
                "audited_commit": audited,
                "head_commit": head,
                "state": state,
                "ignored_paths": patterns,
                "changed_files": files,
                "error": error,
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
    equivalent = 0
    unknown = 0
    for item in results:
        label = item["state"].upper()
        print(f"{label}: {item['repository']} audited={item['audited_commit']} head={item['head_commit']}")
        if item["state"] == "stale":
            stale += 1
            print(
                f"::warning file=audits/{item['sidecar']}::Audit is stale for {item['repository']}; "
                f"audited {item['audited_commit'][:12]}, head {item['head_commit'][:12]}"
            )
        elif item["state"] == "current-equivalent":
            equivalent += 1
            print(
                f"::notice file=audits/{item['sidecar']}::Audit remains current-equivalent; "
                "all post-audit changes match explicit freshness.ignore_paths."
            )
        elif item["state"] == "unknown":
            unknown += 1
            print(
                f"::warning file=audits/{item['sidecar']}::Audit freshness is unknown for "
                f"{item['repository']}: {item.get('error') or 'repository inaccessible'}"
            )

    current = len(results) - stale - equivalent - unknown
    print(
        f"Audit freshness: {current} current, {equivalent} current-equivalent, "
        f"{stale} stale, {unknown} unknown"
    )
    return 1 if args.strict and (stale or unknown) else 0


if __name__ == "__main__":
    raise SystemExit(main())
