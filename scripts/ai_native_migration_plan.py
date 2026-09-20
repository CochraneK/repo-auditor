#!/usr/bin/env python3
"""Build a bounded AI-native migration plan from portfolio scan evidence."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

DEFAULT_OUT = Path("private-evidence/ai-native-migration-plan.json")


def action_plan(row: dict[str, Any]) -> list[dict[str, Any]]:
    checks = [
        ("agents", "AI-AGENTS", "Add project-specific AGENTS.md with operating constraints."),
        ("handoff", "AI-HANDOFF", "Add/fill a lightweight or full handoff entry."),
        ("status_file", "AI-STATUS", "Persist current state in STATUS.md or handoff/STATUS.md."),
        ("decisions", "AI-DECISIONS", "Persist material decisions in DECISIONS.md or handoff/DECISIONS.md."),
        ("architecture_doc", "AI-ARCHITECTURE", "Add a concise architecture/system-flow document or diagram."),
        ("validation_documented", "AI-VALIDATION", "Document exact validation/test commands."),
        ("readme_quickstart", "DOC-QUICKSTART", "Add the shortest reproducible Quick Start path."),
        ("readme_visual", "DOC-VISUAL", "Add a meaningful project/architecture visual where useful."),
    ]
    actions = []
    for key, code, title in checks:
        if not bool(row.get(key)):
            actions.append({
                "code": code,
                "title": title,
                "mode": "scaffold-then-contextualize" if key in {"handoff", "status_file", "decisions"} else "contextual-edit",
                "auto_merge": False,
            })
    return actions


def build_plan(scan: dict[str, Any], registry: dict[str, Any] | None = None) -> dict[str, Any]:
    priorities = {}
    if registry:
        for item in registry.get("repositories") or []:
            if isinstance(item, dict):
                priorities[str(item.get("name"))] = {
                    "priority_score": int(item.get("priority_score") or 0),
                    "priority_band": item.get("priority_band"),
                    "work_status": item.get("work_status"),
                }

    rows = []
    for row in scan.get("repositories") or []:
        if not isinstance(row, dict):
            continue
        repository = str(row.get("repository") or "")
        short = repository.split("/", 1)[-1]
        p = priorities.get(short, {})
        actions = action_plan(row)
        rows.append({
            "repository": repository,
            "visibility": row.get("visibility"),
            "ai_readiness_score": int(row.get("ai_readiness_score") or 0),
            "ai_readiness_state": row.get("ai_readiness_state") or "UNKNOWN",
            "priority_score": p.get("priority_score"),
            "priority_band": p.get("priority_band"),
            "work_status": p.get("work_status"),
            "action_count": len(actions),
            "actions": actions,
        })

    def sort_key(item: dict[str, Any]):
        priority = item.get("priority_score")
        priority_value = int(priority) if isinstance(priority, int) else -1
        return (-priority_value, int(item.get("ai_readiness_score") or 0), str(item.get("repository") or ""))

    rows.sort(key=sort_key)
    return {
        "schema_version": 1,
        "scope": "ai-native-migration-plan",
        "repositories": rows,
        "note": "This plan proposes bounded onboarding/documentation work. It does not auto-merge contextual handoff or README claims.",
    }


def public_summary(plan: dict[str, Any]) -> dict[str, Any]:
    rows = plan.get("repositories") or []
    public = [row for row in rows if row.get("visibility") == "public"]
    private = [row for row in rows if row.get("visibility") == "private"]
    ready = sum(row.get("ai_readiness_state") == "AI_READY" for row in rows)
    with_actions = sum(int(row.get("action_count") or 0) > 0 for row in rows)
    return {
        "schema_version": 1,
        "scope": "privacy-safe-ai-native-migration-summary",
        "repositories_observed": len(rows),
        "public_observed": len(public),
        "private_observed": len(private),
        "ai_ready": ready,
        "repositories_needing_actions": with_actions,
        "private_names_published": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("scan", type=Path)
    parser.add_argument("--registry", type=Path, default=Path("portfolio/registry.json"))
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--public-summary-out", type=Path)
    args = parser.parse_args()

    scan = json.loads(args.scan.read_text(encoding="utf-8"))
    registry = json.loads(args.registry.read_text(encoding="utf-8")) if args.registry.exists() else None
    plan = build_plan(scan, registry)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")
    print(args.out)

    if args.public_summary_out:
        summary = public_summary(plan)
        args.public_summary_out.parent.mkdir(parents=True, exist_ok=True)
        args.public_summary_out.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")
        print(args.public_summary_out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
