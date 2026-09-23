#!/usr/bin/env python3
"""Fail-closed audit for public showcase mirrors."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOWCASE = ROOT / "docs" / "showcase"
MANIFEST = SHOWCASE / "manifest.json"

TEXT_SUFFIXES = {".html", ".htm", ".js", ".css", ".json", ".md", ".txt", ".svg"}

SECRET_PATTERNS = {
    "github_pat": re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    "github_classic_pat": re.compile(r"\bghp_[A-Za-z0-9]{20,}\b"),
    "openai_key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}

DISALLOWED_PATTERNS = {
    "private_source_github_link": re.compile(
        r"https?://(?:raw\.)?github(?:usercontent)?\.com/CochraneK/", re.I
    ),
    "cloudbase_backend": re.compile(
        r"https?://[^\s\"'<>]*\.(?:tcloudbase\.com|ap-shanghai\.app\.tcloudbase\.com)[^\s\"'<>]*",
        re.I,
    ),
    "admin_surface_link": re.compile(
        r"""(?:href|src)\s*=\s*["'][^"']*(?:^|/)admin(?:/|\.|["'])""", re.I
    ),
}

# The CRIS public mirror deliberately points at the non-routable example.invalid
# domain so its original CloudBase is never touched.
ALLOWED_HOST_SNIPPETS = {"https://example.invalid/crisApi"}


def load_manifest() -> dict:
    if not MANIFEST.exists():
        raise SystemExit("showcase manifest missing")
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if data.get("policy") != "explicit-public-safe-static-mirror":
        raise SystemExit("unexpected showcase policy")
    return data


def audit_manifest(data: dict) -> list[str]:
    errors: list[str] = []
    rows = data.get("showcases")
    if not isinstance(rows, list):
        return ["manifest.showcases must be a list"]
    seen: set[str] = set()
    for row in rows:
        slug = (row or {}).get("slug")
        if not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
            errors.append(f"invalid showcase slug: {slug!r}")
            continue
        if slug in seen:
            errors.append(f"duplicate showcase slug: {slug}")
        seen.add(slug)
        index = SHOWCASE / slug / "index.html"
        if not index.exists():
            errors.append(f"missing showcase entrypoint: {index.relative_to(ROOT)}")

    actual = {
        path.parent.name
        for path in SHOWCASE.glob("*/index.html")
        if path.parent != SHOWCASE
    }
    unregistered = sorted(actual - seen)
    missing_dirs = sorted(seen - actual)
    for slug in unregistered:
        errors.append(f"unregistered showcase directory: docs/showcase/{slug}")
    for slug in missing_dirs:
        errors.append(f"allowlisted showcase directory missing: docs/showcase/{slug}")
    return errors


def audit_files() -> list[str]:
    errors: list[str] = []
    for path in sorted(SHOWCASE.rglob("*")):
        if not path.is_file() or path == MANIFEST or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        rel = path.relative_to(ROOT)

        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"{rel}: secret pattern detected ({label})")

        scan_text = text
        for allowed in ALLOWED_HOST_SNIPPETS:
            scan_text = scan_text.replace(allowed, "")

        for label, pattern in DISALLOWED_PATTERNS.items():
            match = pattern.search(scan_text)
            if match:
                preview = match.group(0)[:140].replace("\n", " ")
                errors.append(f"{rel}: disallowed public mirror content ({label}): {preview}")
    return errors


def main() -> int:
    if not SHOWCASE.exists():
        print("showcase directory absent; nothing to audit")
        return 0

    data = load_manifest()
    errors = audit_manifest(data) + audit_files()

    if errors:
        print("Public showcase audit: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "Public showcase audit: PASS "
        f"({len(data.get('showcases', []))} allowlisted showcases)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
