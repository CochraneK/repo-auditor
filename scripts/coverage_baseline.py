#!/usr/bin/env python3
"""Create a privacy-safe coverage baseline candidate from an authenticated scan."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def build_baseline(scan: dict[str, Any], kind: str, assert_complete_visibility: bool = False) -> dict[str, Any]:
    rows = [row for row in (scan.get("repositories") or []) if isinstance(row, dict)]
    failures = [row for row in (scan.get("failures") or []) if isinstance(row, dict)]
    private_count = sum(row.get("visibility") == "private" for row in rows)
    observed = len(rows) + len(failures)

    if kind == "exact":
        if not assert_complete_visibility:
            raise ValueError("exact baseline requires explicit complete-visibility assertion")
        if failures:
            raise ValueError("exact baseline cannot be created while repository evidence failures exist")

    basis = (
        "Explicitly asserted complete authenticated owner inventory."
        if kind == "exact"
        else "Observed authenticated inventory recorded as a lower bound; not proof of complete owner visibility."
    )
    return {
        "schema_version": 1,
        "kind": kind,
        "minimum_total": observed,
        "minimum_private": private_count,
        "verified_at": datetime.now(timezone.utc).date().isoformat(),
        "basis": basis,
        "private_names_published": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("scan", type=Path)
    parser.add_argument("--kind", choices=("lower-bound", "exact"), default="lower-bound")
    parser.add_argument("--assert-complete-visibility", action="store_true")
    parser.add_argument("--out", type=Path, default=Path("private-evidence/coverage-baseline-candidate.json"))
    args = parser.parse_args()
    scan = json.loads(args.scan.read_text(encoding="utf-8"))
    try:
        result = build_baseline(scan, args.kind, args.assert_complete_visibility)
    except ValueError as exc:
        raise SystemExit(str(exc))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")
    print(args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
