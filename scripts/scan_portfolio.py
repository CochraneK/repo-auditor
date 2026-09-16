#!/usr/bin/env python3
"""Scan every repository visible to the authenticated GitHub account.

Private evidence is written only under private-evidence/ (gitignored). The only
Pages-safe output is an aggregate summary that contains no private repository
names, URLs, notes, SHAs, or findings.
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from collect_repo_evidence import collect, request_json

ROOT = Path(__file__).resolve().parents[1]
PRIVATE_OUT = ROOT / "private-evidence" / "portfolio-scan.json"
PUBLIC_OUT = ROOT / "docs" / "data" / "portfolio-overview.json"


def list_owned_repositories(owner: str) -> list[dict[str, Any]]:
    repos: list[dict[str, Any]] = []
    page = 1
    while True:
        batch = request_json(f"/user/repos?affiliation=owner&per_page=100&page={page}&sort=full_name")
        if not isinstance(batch, list):
            raise RuntimeError("GitHub /user/repos did not return a list")
        repos.extend(r for r in batch if (r.get("owner") or {}).get("login", "").lower() == owner.lower())
        if len(batch) < 100:
            break
        page += 1
    return repos


def compact_evidence(evidence: dict[str, Any]) -> dict[str, Any]:
    common = evidence.get("common_files") or {}
    runs = evidence.get("head_workflow_runs") or {}
    conclusions = [r.get("conclusion") for r in runs.values() if isinstance(r, dict)]
    return {
        "repository": evidence["repository"],
        "visibility": evidence["visibility"],
        "head_sha": evidence["head_sha"],
        "file_count": evidence.get("file_count", 0),
        "readme": bool(common.get("README.md")),
        "license": bool(common.get("LICENSE")),
        "security_policy": bool(common.get("SECURITY.md")),
        "contributing": bool(common.get("CONTRIBUTING.md")),
        "workflow_count": len(evidence.get("workflows") or []),
        "head_ci_green": bool(conclusions) and all(c == "success" for c in conclusions),
        "unpinned_action_refs": len((evidence.get("action_supply_chain") or {}).get("unpinned") or []),
    }


def public_summary(owner: str, records: list[dict[str, Any]], failures: list[dict[str, str]]) -> dict[str, Any]:
    public = [r for r in records if r["visibility"] == "public"]
    private = [r for r in records if r["visibility"] == "private"]
    all_records = public + private
    return {
        "schema_version": 1,
        "scope": "privacy-preserving-account-audit-summary",
        "owner": owner,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "inventory": {
            "total": len(all_records) + len(failures),
            "public": len(public),
            "private": len(private),
            "scan_failures": len(failures),
            "private_names_published": False,
        },
        "coverage": {
            "evidence_collected": len(all_records),
            "readme_present": sum(r["readme"] for r in all_records),
            "license_present": sum(r["license"] for r in all_records),
            "security_policy_present": sum(r["security_policy"] for r in all_records),
            "repositories_with_workflows": sum(r["workflow_count"] > 0 for r in all_records),
            "repositories_with_unpinned_actions": sum(r["unpinned_action_refs"] > 0 for r in all_records),
            "head_ci_green": sum(r["head_ci_green"] for r in all_records),
        },
        "privacy": {
            "private_details_location": "private-evidence/portfolio-scan.json (gitignored; never Pages)",
            "pages_contains_private_details": False,
            "note": "Private repositories participate in authenticated scanning; Pages receives aggregate counts only.",
        },
        "self_audit": {
            "included": any(r["repository"] == f"{owner}/repo-auditor" for r in all_records),
            "repository": "repo-auditor",
        },
    }


def scan(owner: str, allow_private: bool) -> tuple[dict[str, Any], dict[str, Any]]:
    repos = list_owned_repositories(owner)
    records: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    for meta in repos:
        full_name = str(meta["full_name"])
        is_private = bool(meta.get("private"))
        if is_private and not allow_private:
            failures.append({"repository": full_name, "error": "private scan not enabled"})
            continue
        try:
            records.append(compact_evidence(collect(full_name, allow_private=allow_private)))
        except Exception as exc:  # keep the portfolio scan moving
            failures.append({"repository": full_name, "error": str(exc)})

    private_report = {
        "schema_version": 1,
        "scope": "authenticated-account-audit",
        "owner": owner,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "repositories": records,
        "failures": failures,
    }
    return private_report, public_summary(owner, records, failures)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", default=os.environ.get("GITHUB_REPOSITORY_OWNER", "CochraneK"))
    parser.add_argument("--allow-private", action="store_true")
    parser.add_argument("--private-out", type=Path, default=PRIVATE_OUT)
    parser.add_argument("--public-out", type=Path, default=PUBLIC_OUT)
    args = parser.parse_args()

    if not os.environ.get("GITHUB_TOKEN"):
        raise SystemExit("GITHUB_TOKEN is required for account-wide scanning")

    private_report, summary = scan(args.owner, args.allow_private)
    args.private_out.parent.mkdir(parents=True, exist_ok=True)
    args.private_out.write_text(json.dumps(private_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.public_out.parent.mkdir(parents=True, exist_ok=True)
    args.public_out.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
