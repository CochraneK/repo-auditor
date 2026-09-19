#!/usr/bin/env python3
"""Turn semantic-review regression candidates into auditable rule candidates."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def normalized_candidate(value: Any) -> dict[str, Any] | None:
    if isinstance(value, str):
        title = value.strip()
        rationale = ""
    elif isinstance(value, dict):
        title = str(value.get("title") or value.get("rule") or value.get("code") or "").strip()
        rationale = str(value.get("rationale") or value.get("reason") or value.get("description") or "").strip()
    else:
        return None
    if not title:
        return None
    fingerprint_input = title.lower() + chr(10) + rationale.lower()
    fingerprint = hashlib.sha256(fingerprint_input.encode("utf-8")).hexdigest()[:16]
    return {
        "id": "RULE-" + fingerprint.upper(),
        "title": title,
        "rationale": rationale,
        "status": "candidate",
        "promotion_gate": "human-or-tested-generalization",
    }


def extract(report: dict[str, Any]) -> list[dict[str, Any]]:
    values = report.get("regression_candidates") or []
    if not isinstance(values, list):
        raise ValueError("regression_candidates must be a list")
    out = []
    seen = set()
    for value in values:
        item = normalized_candidate(value)
        if item and item["id"] not in seen:
            seen.add(item["id"])
            out.append(item)
    return out


def merge_registry(registry: dict[str, Any], candidates: list[dict[str, Any]]) -> dict[str, Any]:
    existing = registry.get("candidates")
    if not isinstance(existing, list):
        raise ValueError("registry.candidates must be a list")
    ids = {str(item.get("id")) for item in existing if isinstance(item, dict)}
    merged = list(existing)
    for item in candidates:
        if item["id"] not in ids:
            merged.append(item)
            ids.add(item["id"])
    result = dict(registry)
    result["candidates"] = merged
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("semantic_report", type=Path)
    parser.add_argument("--source-visibility", choices=("public", "private"), required=True)
    parser.add_argument("--registry", type=Path, default=Path("meta/rule_candidates.json"))
    parser.add_argument("--out", type=Path)
    parser.add_argument("--write-public-registry", action="store_true")
    args = parser.parse_args()

    report = json.loads(args.semantic_report.read_text(encoding="utf-8"))
    candidates = extract(report)

    if args.write_public_registry:
        if args.source_visibility != "public":
            raise SystemExit("refusing to publish rule candidates derived from private evidence")
        registry = json.loads(args.registry.read_text(encoding="utf-8"))
        merged = merge_registry(registry, candidates)
        args.registry.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")

    result = {
        "schema_version": 1,
        "scope": "meta-learning-candidates",
        "source_visibility": args.source_visibility,
        "candidate_count": len(candidates),
        "candidates": candidates,
        "public_registry_written": bool(args.write_public_registry),
    }
    output = json.dumps(result, ensure_ascii=False, indent=2) + chr(10)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(output, encoding="utf-8")
    else:
        print(output, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
