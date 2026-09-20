#!/usr/bin/env python3
"""Generate a privacy-safe portfolio progress report from canonical public inputs."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


def render(overview: dict[str, Any], registry: dict[str, Any]) -> str:
    inventory = overview.get("inventory") or {}
    coverage = overview.get("coverage") or {}
    repos = registry.get("repositories") or []
    public_repos = [r for r in repos if isinstance(r, dict) and r.get("visibility") == "public"]

    bands = Counter(str(r.get("priority_band") or "UNKNOWN") for r in public_repos)
    continuing = [r for r in public_repos if r.get("work_status") == "CONTINUE"]
    stopped = [r for r in public_repos if r.get("work_status") == "STOP"]
    focus = sorted(continuing, key=lambda r: (-int(r.get("priority_score") or 0), str(r.get("name") or "")))[:8]

    observed = inventory.get("observed_total", "—")
    expected = inventory.get("expected_total", "—")
    observed_private = inventory.get("private", "—")
    expected_private = inventory.get("expected_private", "—")
    evidence = coverage.get("evidence_collected", "—")
    ai_ready = coverage.get("ai_ready", "—")
    agents = coverage.get("agents_present", "—")
    handoff = coverage.get("handoff_present", "—")
    full = coverage.get("continuity_full", "—")
    status = overview.get("audit_status", "UNKNOWN")
    baseline_kind = inventory.get("baseline_kind", "exact")
    baseline_marker = "≥" if baseline_kind == "lower-bound" else ""
    generated = overview.get("generated_at", "unknown")
    snapshot = registry.get("snapshot_date", "unknown")
    reasons = coverage.get("reasons") or []

    lines = [
        "# repo-auditor Portfolio Progress Report",
        "",
        "> Generated from the public registry and privacy-safe account aggregate. "
        "Progress/priority is an operating signal, not a repository-quality score.",
        "",
        f"- Registry snapshot: **{snapshot}**",
        f"- Coverage snapshot: **{generated}**",
        f"- Audit coverage: **{status}**",
        f"- Coverage baseline: **{baseline_kind}**",
        "",
        "## Audit coverage",
        "",
        f"- Observed repositories: **{observed} / {baseline_marker}{expected} baseline**",
        f"- Observed private repositories: **{observed_private} / {baseline_marker}{expected_private} baseline**",
        f"- Evidence packages collected: **{evidence}**",
    ]
    if reasons:
        lines.extend(["- Coverage gaps:"] + [f"  - {reason}" for reason in reasons])
    else:
        lines.append("- Coverage gaps: none recorded")

    lines += [
        "",
        "## AI-native continuity",
        "",
        f"- AI-ready repositories: **{ai_ready} / {evidence} evidenced**",
        f"- Repositories with AGENTS instructions: **{agents}**",
        f"- Repositories with a handoff entry: **{handoff}**",
        f"- Repositories with a full continuity package: **{full}**",
        "",
        "## Public execution queue",
        "",
        f"- CONTINUE: **{len(continuing)}**",
        f"- STOP / maintenance-only: **{len(stopped)}**",
        f"- P0 · NOW: **{bands.get('P0-NOW', 0)}**",
        f"- P1 · NEXT: **{bands.get('P1-NEXT', 0)}**",
        f"- P2 · PLANNED: **{bands.get('P2-PLANNED', 0)}**",
        f"- P3 · LATER: **{bands.get('P3-LATER', 0)}**",
        f"- P4 · LOW: **{bands.get('P4-LOW', 0)}**",
        "",
        "## Current public focus",
        "",
    ]
    if focus:
        lines.extend(
            f"- **{r.get('name')}** — {r.get('priority_band')} · {int(r.get('priority_score') or 0)} priority"
            for r in focus
        )
    else:
        lines.append("- No CONTINUE repository in the public registry.")

    lines += ["", "## Next gates", ""]
    if status != "PASS":
        lines.append("- Restore/verify account-wide audit coverage before treating portfolio evidence as complete.")
    if baseline_kind == "lower-bound":
        lines.append("- Replace the lower-bound inventory baseline with an exact verified aggregate when a credential with complete owner visibility is available.")
    if isinstance(ai_ready, int) and isinstance(evidence, int) and ai_ready < evidence:
        lines.append("- Expand durable agent onboarding: AGENTS, handoff, status/decisions, architecture and validation paths.")
    if int(coverage.get("repositories_with_unpinned_actions") or 0) > 0:
        lines.append("- Reduce mutable GitHub Action references where a pinned immutable ref is appropriate.")
    if isinstance(coverage.get("readme_present"), int) and isinstance(evidence, int) and coverage["readme_present"] < evidence:
        lines.append("- Close remaining README/onboarding gaps.")
    if lines[-1] == "## Next gates":
        lines.append("- No aggregate next gate was derived.")

    lines += [
        "",
        "## Interpretation",
        "",
        "This report intentionally keeps **Priority**, **Quality**, **Audit Coverage**, "
        "**AI Readiness**, and **Semantic Review** separate. A green CI run or a high "
        "priority score does not imply complete coverage or high repository quality.",
        "",
    ]
    return chr(10).join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--overview", type=Path, default=Path("docs/data/portfolio-overview.json"))
    parser.add_argument("--registry", type=Path, default=Path("portfolio/registry.json"))
    parser.add_argument("--out", type=Path, default=Path("PROGRESS_REPORT.md"))
    args = parser.parse_args()
    overview = json.loads(args.overview.read_text(encoding="utf-8"))
    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    args.out.write_text(render(overview, registry), encoding="utf-8")
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
