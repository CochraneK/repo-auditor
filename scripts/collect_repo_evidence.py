#!/usr/bin/env python3
"""Collect reproducible repository evidence from GitHub."""
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
QUICK_START = re.compile(r"(?im)^#{1,4}\\s*(quick\\s*start|getting\\s*started|快速开始|开始使用|安装|运行)")
VALIDATION = re.compile(r"(?i)(pytest|python\\s+-m\\s+unittest|npm\\s+(?:run\\s+)?test|pnpm\\s+test|yarn\\s+test|cargo\\s+test|go\\s+test|make\\s+test|visual_ux_audit\\.py|audit_reports\\.py)")
VISUAL = re.compile(r"(?i)(```mermaid|!\\[[^\\]]*\\]\\([^\\)]+\\)|<img\\b)")


def request_json(path: str) -> Any:
    request = urllib.request.Request(API + path, headers={"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "repo-auditor-evidence-collector"})
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API {exc.code}: {detail}") from exc


def optional_request_json(path: str) -> dict[str, Any]:
    """Collect optional governance evidence without turning permission gaps into false passes."""
    try:
        return {"status": "verified", "value": request_json(path)}
    except RuntimeError as exc:
        message = str(exc)
        if len(message) > 500:
            message = message[:497] + "..."
        return {"status": "unverified", "reason": message}


def content_text(repo: str, path: str, ref: str) -> str:
    encoded_path = urllib.parse.quote(path, safe="/")
    payload = request_json(f"/repos/{repo}/contents/{encoded_path}?ref={ref}")
    content = payload.get("content")
    if not isinstance(content, str):
        return ""
    return base64.b64decode(content).decode("utf-8", errors="replace")


def action_refs(repo: str, paths: list[str], ref: str) -> dict[str, Any]:
    refs = []
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
    return {"references": refs, "unpinned": [item for item in refs if not item["immutable_ref"]]}


def branch_governance(repo: str, branch: str, branch_data: dict[str, Any]) -> dict[str, Any]:
    """Capture whether CI/review controls are actually enforced on the default branch."""
    summary = branch_data.get("protection") or {}
    status_checks = summary.get("required_status_checks") or {}
    evidence: dict[str, Any] = {
        "default_branch": branch,
        "protected": bool(branch_data.get("protected")),
        "protection_enabled": bool(summary.get("enabled")),
        "summary_status_checks": {
            "enforcement_level": status_checks.get("enforcement_level"),
            "contexts": status_checks.get("contexts", []),
            "checks": status_checks.get("checks", []),
        },
    }

    # `protected: false` is already decisive evidence from the branch endpoint.
    # Avoid privileged API calls in this case: lack of protection is the finding.
    if not evidence["protected"]:
        evidence["protection_detail"] = {"status": "not-applicable", "reason": "default branch reports protected=false"}
        evidence["rulesets"] = {"status": "not-queried", "reason": "default branch is already verified unprotected"}
        evidence["assessment"] = "unprotected"
        return evidence

    encoded_branch = urllib.parse.quote(branch, safe="")
    protection = optional_request_json(f"/repos/{repo}/branches/{encoded_branch}/protection")
    if protection["status"] == "verified":
        detail = protection["value"] or {}
        required_status = detail.get("required_status_checks") or {}
        evidence["protection_detail"] = {
            "status": "verified",
            "required_pull_request_reviews": detail.get("required_pull_request_reviews") is not None,
            "required_status_checks": bool(required_status),
            "required_status_check_contexts": required_status.get("contexts", []) if isinstance(required_status, dict) else [],
            "required_conversation_resolution": bool((detail.get("required_conversation_resolution") or {}).get("enabled")),
            "required_linear_history": bool((detail.get("required_linear_history") or {}).get("enabled")),
            "enforce_admins": bool((detail.get("enforce_admins") or {}).get("enabled")),
            "allow_force_pushes": bool((detail.get("allow_force_pushes") or {}).get("enabled")),
            "allow_deletions": bool((detail.get("allow_deletions") or {}).get("enabled")),
        }
    else:
        evidence["protection_detail"] = {
            "status": "unverified",
            "reason": protection["reason"],
        }

    rulesets = optional_request_json(f"/repos/{repo}/rulesets?includes_parents=true")
    if rulesets["status"] == "verified":
        values = rulesets["value"] if isinstance(rulesets["value"], list) else []
        evidence["rulesets"] = {
            "status": "verified",
            "count": len(values),
            "items": [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "target": item.get("target"),
                    "enforcement": item.get("enforcement"),
                    "source_type": item.get("source_type"),
                }
                for item in values
            ],
        }
    else:
        evidence["rulesets"] = {
            "status": "unverified",
            "reason": rulesets["reason"],
        }

    evidence["assessment"] = (
        "protected-verified"
        if evidence["protection_detail"]["status"] == "verified"
        else "protected-details-unverified"
    )
    return evidence


def collect(repo: str, allow_private: bool = False) -> dict[str, Any]:
    metadata = request_json(f"/repos/{repo}")
    is_private = bool(metadata.get("private"))
    if is_private and not allow_private:
        raise RuntimeError("repo-auditor refuses private repositories unless --allow-private is explicit")
    branch = str(metadata["default_branch"])
    branch_data = request_json(f"/repos/{repo}/branches/{branch}")
    sha = branch_data["commit"]["sha"]
    tree = request_json(f"/repos/{repo}/git/trees/{sha}?recursive=1")
    paths = sorted(item["path"] for item in tree.get("tree", []) if item.get("type") == "blob")
    workflows = [path for path in paths if path.startswith(".github/workflows/") and path.endswith((".yml", ".yaml"))]
    runs = request_json(f"/repos/{repo}/actions/runs?branch={urllib.parse.quote(branch)}&per_page=100").get("workflow_runs", [])
    head_runs = {}
    for run in runs:
        if run.get("head_sha") != sha:
            continue
        name = str(run.get("name"))
        if name in head_runs:
            continue
        head_runs[name] = {"status": run.get("status"), "conclusion": run.get("conclusion"), "html_url": run.get("html_url")}
    common = ["README.md", "LICENSE", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "CITATION.cff", "CHANGELOG.md", "ROADMAP.md", "AGENTS.md", "HANDOFF.md", "STATUS.md", "DECISIONS.md"]
    lock_names = {"uv.lock", "poetry.lock", "Pipfile.lock", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "Cargo.lock"}
    lockfiles = [path for path in paths if Path(path).name in lock_names]
    architecture_docs = [
        path for path in paths
        if path.lower() in {"architecture.md", "docs/architecture.md", "docs/architecture/index.md"}
        or (path.lower().startswith("docs/") and ("architect" in path.lower() or "design" in path.lower()))
    ]
    readme_text = content_text(repo, "README.md", sha) if "README.md" in paths else ""
    agent_text = content_text(repo, "AGENTS.md", sha) if "AGENTS.md" in paths else ""
    handoff_text = content_text(repo, "HANDOFF.md", sha) if "HANDOFF.md" in paths else ""
    validation_documented = bool(VALIDATION.search("\\n".join((readme_text, agent_text, handoff_text))))
    ai_readiness_files = {
        "AGENTS.md": "AGENTS.md" in paths,
        "HANDOFF.md": "HANDOFF.md" in paths,
        "STATUS.md": "STATUS.md" in paths,
        "DECISIONS.md": "DECISIONS.md" in paths,
        "architecture_docs": architecture_docs,
        "validation_documented": validation_documented,
    }
    readme_quality = {
        "has_quick_start": bool(QUICK_START.search(readme_text)),
        "has_visual": bool(VISUAL.search(readme_text)),
        "has_architecture_section": bool(re.search(r"(?im)^#{1,4}\\s*(architecture|架构|系统设计|how it works)", readme_text)),
    }
    return {
        "schema_version": 1,
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "repository": repo,
        "public": not is_private,
        "visibility": "private" if is_private else "public",
        "default_branch": branch,
        "head_sha": sha,
        "metadata": {"description": metadata.get("description"), "homepage": metadata.get("homepage"), "topics": metadata.get("topics", []), "license": (metadata.get("license") or {}).get("spdx_id"), "has_issues": metadata.get("has_issues"), "has_discussions": metadata.get("has_discussions")},
        "common_files": {name: name in paths for name in common},
        "ai_readiness_files": ai_readiness_files,
        "readme_quality": readme_quality,
        "lockfiles": lockfiles,
        "workflows": workflows,
        "head_workflow_runs": head_runs,
        "branch_governance": branch_governance(repo, branch, branch_data),
        "action_supply_chain": action_refs(repo, workflows, sha),
        "file_count": len(paths),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repository", help="GitHub repository in owner/name form")
    parser.add_argument("--out", type=Path)
    parser.add_argument("--allow-private", action="store_true", help="Explicitly permit authenticated private-repository evidence collection.")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repository):
        raise SystemExit("repository must be owner/name")
    evidence = collect(args.repository, allow_private=args.allow_private)
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
