#!/usr/bin/env python3
"""Collect reproducible public-repository evidence from GitHub.

This script gathers facts. It does not assign a quality score or make
portfolio decisions.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

API = "https://api.github.com"
PINNED_REF = re.compile(r"^[0-9a-f]{40}$")
USES = re.compile(r"^\s*-?\s*uses:\s*([^\s#]+)", re.MULTILINE)


def request_json(path: str) -> Any:
    request = urllib.request.Request(
        API + path,
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "repo-auditor-evidence-collector",
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


def content_text(repo: str, path: str, ref: str) -> str:
    encoded_path = urllib.parse.quote(path, safe="/")
    payload = request_json(f"/repos/{repo}/contents/{encoded_path}?ref={ref}")
    content = payload.get("content")
    if not isinstance(content, str):
        return ""
    return base64.b64decode(content).decode("utf-8", errors="replace")


def action_refs(repo: str, paths: list[str], ref: str) -> dict[str, Any]:
    refs: list[dict[str, Any]] = []
    for path in paths:
        text = content_text(repo, path, ref)
        for value in USES.findall(text):
            if value.startswith("docker://"):
                pinned = True
            elif "@" not in value:
                pinned = False
            else:
                pinned = bool(PINNED_REF.fullmatch(value.rsplit("@", 1)[1]))
            refs.append({"workflow": path, "uses": value, "immutable_ref": pinned})
    return {
        "references": refs,
        "unpinned": [item for item in refs if not item["immutable_ref"]],
    }


def collect(repo: str, allow_private: bool = False) -> dict[str, Any]:
    metadata = request_json(f"/repos/{repo}")
    is_private = bool(metadata.get("private"))
    if is_private and not allow_private:
        raise RuntimeError(
            "repo-auditor refuses private repositories unless --allow-private is explicit"
        )

    branch = str(metadata["default_branch"])
    branch_data = request_json(f"/repos/{repo}/branches/{branch}")
    sha = branch_data["commit"]["sha"]
    tree = request_json(f"/repos/{repo}/git/trees/{sha}?recursive=1")
    paths = sorted(
        item["path"]
        for item in tree.get("tree", [])
        if item.get("type") == "blob"
    )

    workflows = [
        path for path in paths
        if path.startswith(".github/workflows/")
        and path.endswith((".yml", ".yaml"))
    ]

    runs = request_json(
        f"/repos/{repo}/actions/runs?branch={urllib.parse.quote(branch)}&per_page=100"
    ).get("workflow_runs", [])
    head_runs: dict[str, dict[str, Any]] = {}
    for run in runs:
        if run.get("head_sha") != sha:
            continue
        name = str(run.get("name"))
        if name in head_runs:
            continue
        head_runs[name] = {
            "status": run.get("status"),
            "conclusion": run.get("conclusion"),
            "html_url": run.get("html_url"),
        }

    common = [
        "README.md",
        "LICENSE",
        "SECURITY.md",
        "CONTRIBUTING.md",
        "CODE_OF_CONDUCT.md",
        "CITATION.cff",
        "CHANGELOG.md",
        "ROADMAP.md",
    ]
    lockfiles = [
        path for path in paths
        if Path(path).name in {
            "uv.lock",
            "poetry.lock",
            "Pipfile.lock",
            "package-lock.json",
            "pnpm-lock.yaml",
            "yarn.lock",
            "Cargo.lock",
        }
    ]

    return {
        "schema_version": 1,
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "repository": repo,
        "public": not is_private,
        "visibility": "private" if is_private else "public",
        "default_branch": branch,
        "head_sha": sha,
        "metadata": {
            "description": metadata.get("description"),
            "homepage": metadata.get("homepage"),
            "topics": metadata.get("topics", []),
            "license": (metadata.get("license") or {}).get("spdx_id"),
            "has_issues": metadata.get("has_issues"),
            "has_discussions": metadata.get("has_discussions"),
        },
        "common_files": {name: name in paths for name in common},
        "lockfiles": lockfiles,
        "workflows": workflows,
        "head_workflow_runs": head_runs,
        "action_supply_chain": action_refs(repo, workflows, sha),
        "file_count": len(paths),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repository", help="GitHub repository in owner/name form")
    parser.add_argument("--out", type=Path)
    parser.add_argument(
        "--allow-private",
        action="store_true",
        help="Explicitly permit authenticated private-repository evidence collection.",
    )
    args = parser.parse_args()

    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repository):
        raise SystemExit("repository must be owner/name")

    evidence = collect(args.repository)
    text = json.dumps(evidence, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
        print(args.out)
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
