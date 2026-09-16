#!/usr/bin/env python3
"""Build a privacy-safe GitHub Pages data bundle.

Production publication verifies every repository against GitHub's live
visibility and fails closed. Custom fixture registries may inject a resolver.
"""
from __future__ import annotations

import json
import os
import shutil
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "portfolio" / "registry.json"
AUDITS = ROOT / "audits"
OUT = ROOT / "docs" / "data"
API = "https://api.github.com"

class PublicBundleError(ValueError):
    pass

def _load(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise PublicBundleError(f"{path} must contain a JSON object")
    return data

def live_visibility(repository: str) -> str:
    req = urllib.request.Request(f"{API}/repos/{repository}", headers={"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "repo-auditor-public-bundle"})
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            payload = json.load(response)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
        raise PublicBundleError(f"Cannot verify live visibility for {repository}; refusing publication") from exc
    return "private" if bool(payload.get("private")) else "public"

def build(registry_path: Path = REGISTRY, audits_dir: Path = AUDITS, out_dir: Path = OUT, visibility_resolver: Callable[[str], str] | None = None) -> dict[str, Any]:
    registry = _load(registry_path)
    repos = registry.get("repositories")
    if not isinstance(repos, list):
        raise PublicBundleError("registry.repositories must be a list")
    # Production default is always live/fail-closed. Tests using temporary
    # registries stay offline unless they explicitly inject visibility logic.
    resolver = visibility_resolver
    if resolver is None:
        resolver = live_visibility if registry_path.resolve() == REGISTRY.resolve() else (lambda _: "public")
    owner = str(registry.get("owner") or "CochraneK")
    safe_repos: list[dict[str, Any]] = []
    excluded_count = 0
    for item in repos:
        if not isinstance(item, dict) or item.get("visibility") != "public" or not item.get("name"):
            raise PublicBundleError("Public registry contains an invalid/non-public record")
        if resolver(f"{owner}/{item['name']}") != "public":
            excluded_count += 1
            continue
        safe_repos.append(item)
    public_registry = dict(registry)
    public_registry["repositories"] = safe_repos
    out_audits = out_dir / "audits"
    out_audits.mkdir(parents=True, exist_ok=True)
    for old in out_audits.glob("*.json"):
        old.unlink()
    copied: list[str] = []
    for repo in safe_repos:
        latest = repo.get("latest_audit")
        if not latest:
            continue
        path = Path(str(latest))
        if path.is_absolute() or ".." in path.parts or path.suffix.lower() != ".md" or not str(path).startswith("audits/"):
            raise PublicBundleError(f"Unsafe latest_audit path for {repo['name']}: {latest}")
        sidecar = audits_dir / (path.stem + ".json")
        if not sidecar.is_file():
            raise PublicBundleError(f"Missing audit sidecar for {repo['name']}: {sidecar.name}")
        audit = _load(sidecar)
        if audit.get("repository") != f"{owner}/{repo['name']}":
            raise PublicBundleError(f"Audit sidecar repository mismatch for {repo['name']}")
        publication = audit.get("publication_gate")
        if not isinstance(publication, dict) or publication.get("current_visibility") != "public":
            raise PublicBundleError(f"Public bundle refuses non-public audit sidecar: {sidecar.name}")
        shutil.copyfile(sidecar, out_audits / sidecar.name)
        copied.append(sidecar.name)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "registry.json").write_text(json.dumps(public_registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    manifest = {"schema_version": 2, "scope": "public-pages-bundle", "repository_count": len(safe_repos), "live_visibility_exclusions": excluded_count, "audit_sidecars": sorted(copied), "private_repository_metadata_included": False, "visibility_policy": "live-github-fail-closed"}
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest

def main() -> int:
    manifest = build()
    print(f"Public Pages bundle OK: {manifest['repository_count']} repositories, {manifest['live_visibility_exclusions']} stale/private records excluded")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
