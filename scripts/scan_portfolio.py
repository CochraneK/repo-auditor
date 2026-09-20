#!/usr/bin/env python3
"""Account-wide evidence scan with privacy-safe coverage integrity reporting."""
from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ai_readiness import assess
from collect_repo_evidence import collect, request_json

ROOT = Path(__file__).resolve().parents[1]
PRIVATE_OUT = ROOT / "private-evidence" / "portfolio-scan.json"
PUBLIC_OUT = ROOT / "docs" / "data" / "portfolio-overview.json"
BASELINE = ROOT / "portfolio" / "coverage-baseline.json"


def list_owned_repositories(owner: str) -> list[dict[str, Any]]:
    repos: list[dict[str, Any]] = []
    page = 1
    while True:
        batch = request_json(f"/user/repos?affiliation=owner&per_page=100&page={page}&sort=full_name")
        if not isinstance(batch, list):
            raise RuntimeError("GitHub /user/repos did not return a list")
        repos.extend(
            row for row in batch
            if (row.get("owner") or {}).get("login", "").lower() == owner.lower()
        )
        if len(batch) < 100:
            break
        page += 1
    return repos


def load_baseline(path: Path = BASELINE) -> dict[str, Any]:
    if not path.exists():
        return {"kind": "none", "minimum_total": None, "minimum_private": None}
    data = json.loads(path.read_text(encoding="utf-8"))
    kind = data.get("kind")
    if kind not in {"exact", "lower-bound"}:
        raise ValueError("coverage baseline kind must be exact or lower-bound")
    return {
        "kind": kind,
        "minimum_total": data.get("minimum_total"),
        "minimum_private": data.get("minimum_private"),
        "verified_at": data.get("verified_at"),
        "basis": data.get("basis"),
    }


def compact_evidence(evidence: dict[str, Any]) -> dict[str, Any]:
    common = evidence.get("common_files") or {}
    runs = evidence.get("head_workflow_runs") or {}
    conclusions = [
        run.get("conclusion")
        for run in runs.values()
        if isinstance(run, dict)
    ]
    readiness = assess(evidence)
    checks = readiness["checks"]
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
        "head_ci_green": bool(conclusions) and all(value == "success" for value in conclusions),
        "unpinned_action_refs": len((evidence.get("action_supply_chain") or {}).get("unpinned") or []),
        "ai_readiness_score": readiness["readiness_score"],
        "ai_readiness_state": readiness["readiness_state"],
        "agents": checks["agents"],
        "handoff": checks["handoff"],
        "status_file": checks["status"],
        "decisions": checks["decisions"],
        "architecture_doc": checks["architecture"],
        "validation_documented": checks["validation"],
        "readme_visual": checks["readme_visual"],
        "readme_quickstart": checks["readme_quickstart"],
        "continuity_full": checks["continuity_full"],
    }


def public_ai_readiness_record(owner: str, row: dict[str, Any]) -> dict[str, Any]:
    prefix = owner + "/"
    repository = str(row.get("repository") or "")
    name = repository[len(prefix):] if repository.startswith(prefix) else repository
    return {
        "name": name,
        "ai_readiness_score": int(row.get("ai_readiness_score") or 0),
        "ai_readiness_state": row.get("ai_readiness_state") or "UNKNOWN",
        "agents": bool(row.get("agents")),
        "handoff": bool(row.get("handoff")),
        "status_file": bool(row.get("status_file")),
        "decisions": bool(row.get("decisions")),
        "architecture_doc": bool(row.get("architecture_doc")),
        "validation_documented": bool(row.get("validation_documented")),
        "readme_visual": bool(row.get("readme_visual")),
        "readme_quickstart": bool(row.get("readme_quickstart")),
        "continuity_full": bool(row.get("continuity_full")),
        "unpinned_action_refs": int(row.get("unpinned_action_refs") or 0),
        "head_ci_green": bool(row.get("head_ci_green")),
    }


def public_summary(
    owner: str,
    records: list[dict[str, Any]],
    failures: list[dict[str, Any]],
    expected_total: int | None = None,
    expected_private: int | None = None,
    private_requested: bool = False,
    baseline_kind: str = "exact",
    baseline_verified_at: str | None = None,
) -> dict[str, Any]:
    public = [row for row in records if row["visibility"] == "public"]
    private = [row for row in records if row["visibility"] == "private"]
    observed = len(records) + len(failures)
    reasons: list[str] = []

    if failures:
        reasons.append("one or more repositories failed evidence collection")
    if expected_total is not None and observed < expected_total:
        reasons.append("authenticated inventory is smaller than the trusted coverage baseline")
    if private_requested and expected_private and len(private) < expected_private:
        reasons.append("private repository coverage is below the trusted coverage baseline")
    if baseline_kind == "lower-bound":
        reasons.append("trusted coverage baseline is a lower bound, not an exact verified inventory")
    if baseline_kind == "none" and expected_total is None and expected_private is None:
        reasons.append("no trusted coverage baseline is available")

    complete = not reasons
    return {
        "schema_version": 4,
        "scope": "privacy-preserving-account-audit-summary",
        "owner": owner,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "audit_status": "PASS" if complete else "PARTIAL",
        "inventory": {
            "observed_total": observed,
            "public": len(public),
            "private": len(private),
            "scan_failures": len(failures),
            "expected_total": expected_total,
            "expected_private": expected_private,
            "baseline_kind": baseline_kind,
            "baseline_verified_at": baseline_verified_at,
            "private_names_published": False,
        },
        "coverage": {
            "status": "complete" if complete else "partial",
            "reasons": reasons,
            "evidence_collected": len(records),
            "readme_present": sum(bool(row.get("readme")) for row in records),
            "license_present": sum(bool(row.get("license")) for row in records),
            "security_policy_present": sum(bool(row.get("security_policy")) for row in records),
            "repositories_with_workflows": sum(int(row.get("workflow_count", 0)) > 0 for row in records),
            "repositories_with_unpinned_actions": sum(int(row.get("unpinned_action_refs", 0)) > 0 for row in records),
            "head_ci_green": sum(bool(row.get("head_ci_green")) for row in records),
            "ai_ready": sum(row.get("ai_readiness_state") == "AI_READY" for row in records),
            "agents_present": sum(bool(row.get("agents")) for row in records),
            "handoff_present": sum(bool(row.get("handoff")) for row in records),
            "continuity_full": sum(bool(row.get("continuity_full")) for row in records),
        },
        "public_ai_readiness": [
            public_ai_readiness_record(owner, row)
            for row in sorted(public, key=lambda item: str(item.get("repository") or ""))
        ],
        "privacy": {
            "private_details_location": "private-evidence/portfolio-scan.json (gitignored; never Pages)",
            "pages_contains_private_details": False,
        },
        "self_audit": {
            "included": any(row["repository"] == f"{owner}/repo-auditor" for row in records),
            "repository": "repo-auditor",
        },
    }


def scan(
    owner: str,
    allow_private: bool,
    expected_total: int | None = None,
    expected_private: int | None = None,
    baseline_kind: str = "exact",
    baseline_verified_at: str | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    records: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    for meta in list_owned_repositories(owner):
        full_name = str(meta["full_name"])
        is_private = bool(meta.get("private"))
        if is_private and not allow_private:
            failures.append({"repository": full_name, "error": "private scan not enabled"})
            continue
        try:
            records.append(compact_evidence(collect(full_name, allow_private=allow_private)))
        except Exception as exc:
            failures.append({"repository": full_name, "error": str(exc)})

    private = {
        "schema_version": 3,
        "scope": "authenticated-account-audit",
        "owner": owner,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "repositories": records,
        "failures": failures,
    }
    summary = public_summary(
        owner,
        records,
        failures,
        expected_total,
        expected_private,
        allow_private,
        baseline_kind,
        baseline_verified_at,
    )
    return private, summary


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", default=os.environ.get("GITHUB_REPOSITORY_OWNER", "CochraneK"))
    parser.add_argument("--allow-private", action="store_true")
    parser.add_argument("--baseline", type=Path, default=BASELINE)
    parser.add_argument("--expected-total", type=int)
    parser.add_argument("--expected-private", type=int)
    parser.add_argument("--require-complete", action="store_true")
    parser.add_argument("--private-out", type=Path, default=PRIVATE_OUT)
    parser.add_argument("--public-out", type=Path, default=PUBLIC_OUT)
    args = parser.parse_args()

    if not os.environ.get("GITHUB_TOKEN"):
        raise SystemExit("GITHUB_TOKEN is required for account-wide scanning")

    baseline = load_baseline(args.baseline)
    env_total = os.environ.get("PORTFOLIO_EXPECTED_TOTAL")
    env_private = os.environ.get("PORTFOLIO_EXPECTED_PRIVATE")

    if args.expected_total is not None or args.expected_private is not None or env_total or env_private:
        expected_total = args.expected_total if args.expected_total is not None else (int(env_total) if env_total else None)
        expected_private = args.expected_private if args.expected_private is not None else (int(env_private) if env_private else None)
        baseline_kind = "exact"
        verified_at = "explicit-runtime-override"
    else:
        expected_total = baseline.get("minimum_total")
        expected_private = baseline.get("minimum_private")
        baseline_kind = str(baseline.get("kind") or "none")
        verified_at = baseline.get("verified_at")

    private, summary = scan(
        args.owner,
        args.allow_private,
        expected_total,
        expected_private,
        baseline_kind,
        verified_at,
    )
    args.private_out.parent.mkdir(parents=True, exist_ok=True)
    args.private_out.write_text(json.dumps(private, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")
    args.public_out.parent.mkdir(parents=True, exist_ok=True)
    args.public_out.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 2 if args.require_complete and summary["coverage"]["status"] != "complete" else 0


if __name__ == "__main__":
    raise SystemExit(main())
