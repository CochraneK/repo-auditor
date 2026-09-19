#!/usr/bin/env python3
"""Audit repository text for non-canonical owner identity variants.

The canonical public identity is CochraneK. Legacy forms are assembled at
runtime so this repository does not itself re-publish them as literal strings.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

CANONICAL = "CochraneK"
LEGACY = (
    "Cunyi" + "Kang",
    "Cunyi" + " Kang",
    "cuny" + "ikang",
    "Cochrane" + " Kang",
    "Cochrane" + "Kang",
)
TEXT_SUFFIXES = {
    ".md", ".txt", ".json", ".yml", ".yaml", ".toml", ".ini", ".cfg",
    ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".xml", ".svg",
}
SKIP_PARTS = {".git", "node_modules", "dist", "build", ".venv", "venv", "__pycache__", "private-evidence"}


def is_text_candidate(path: Path) -> bool:
    return path.suffix.lower() in TEXT_SUFFIXES or path.name in {"Dockerfile", "Makefile"}


def audit(root: Path, allow_legacy_identity: bool = False) -> dict:
    if allow_legacy_identity:
        return {
            "schema_version": 1,
            "scope": "canonical-identity",
            "canonical_identity": CANONICAL,
            "status": "EXEMPT",
            "findings": [],
        }
    findings = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or not is_text_candidate(path):
            continue
        rel = path.relative_to(root)
        if any(part in SKIP_PARTS for part in rel.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for line_no, line in enumerate(text.splitlines(), 1):
            lower = line.lower()
            for legacy in LEGACY:
                if legacy.lower() in lower:
                    findings.append({
                        "code": "IDENTITY-NONCANONICAL",
                        "severity": "P1",
                        "path": rel.as_posix(),
                        "line": line_no,
                        "canonical": CANONICAL,
                    })
                    break
    return {
        "schema_version": 1,
        "scope": "canonical-identity",
        "canonical_identity": CANONICAL,
        "status": "PASS" if not findings else "FAIL",
        "findings": findings,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", type=Path, default=Path("."))
    parser.add_argument("--allow-legacy-identity", action="store_true", help="Explicit exemption for the one legacy personal-site repository.")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--fail-on-findings", action="store_true")
    args = parser.parse_args()
    result = audit(args.root, args.allow_legacy_identity)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['status']}: {len(result['findings'])} non-canonical identity occurrence(s)")
        for item in result["findings"]:
            print(f"{item['path']}:{item['line']} {item['code']} -> {item['canonical']}")
    return 2 if args.fail_on_findings and result["findings"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
