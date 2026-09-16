#!/usr/bin/env python3
"""Build the public GitHub Pages data bundle from the private control plane.

The public website must never depend on anonymous access to private repository
contents. This builder copies only explicitly public portfolio records and their
public audit sidecars into docs/data/, which is the only runtime data surface
used by GitHub Pages.
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "portfolio" / "registry.json"
AUDITS = ROOT / "audits"
OUT = ROOT / "docs" / "data"
OUT_AUDITS = OUT / "audits"


class PublicBundleError(ValueError):
    pass


def _load(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise PublicBundleError(f"{path} must contain a JSON object")
    return data


def build(
    registry_path: Path = REGISTRY,
    audits_dir: Path = AUDITS,
    out_dir: Path = OUT,
) -> dict[str, Any]:
    registry = _load(registry_path)
    repos = registry.get("repositories")
    if not isinstance(repos, list):
        raise PublicBundleError("registry.repositories must be a list")

    private = [
        str(item.get("name", "<unnamed>"))
        for item in repos
        if not isinstance(item, dict)
        or item.get("visibility") != "public"
    ]
    if private:
        raise PublicBundleError(
            "Public Pages bundle refuses non-public repository records: "
            + ", ".join(private)
        )

    out_audits = out_dir / "audits"
    out_audits.mkdir(parents=True, exist_ok=True)

    # Remove stale generated audit sidecars before rebuilding.
    for old in out_audits.glob("*.json"):
        old.unlink()

    copied: list[str] = []
    for repo in repos:
        latest = repo.get("latest_audit")
        if not latest:
            continue
        path = Path(str(latest))
        if path.is_absolute() or ".." in path.parts:
            raise PublicBundleError(
                f"Unsafe latest_audit path for {repo['name']}: {latest}"
            )
        if path.suffix.lower() != ".md" or not str(path).startswith("audits/"):
            raise PublicBundleError(
                f"latest_audit must point to audits/*.md: {latest}"
            )
        sidecar = audits_dir / (path.stem + ".json")
        if not sidecar.is_file():
            raise PublicBundleError(
                f"Missing audit sidecar for {repo['name']}: {sidecar.name}"
            )
        audit = _load(sidecar)
        if audit.get("repository") != f"CochraneK/{repo['name']}":
            raise PublicBundleError(
                f"Audit sidecar repository mismatch for {repo['name']}"
            )
        publication = audit.get("publication_gate")
        if (
            not isinstance(publication, dict)
            or publication.get("current_visibility") != "public"
        ):
            raise PublicBundleError(
                f"Public bundle refuses non-public audit sidecar: {sidecar.name}"
            )
        target = out_audits / sidecar.name
        shutil.copyfile(sidecar, target)
        copied.append(sidecar.name)

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "registry.json").write_text(
        json.dumps(registry, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    manifest = {
        "schema_version": 1,
        "scope": "public-pages-bundle",
        "repository_count": len(repos),
        "audit_sidecars": sorted(copied),
        "private_repository_metadata_included": False,
    }
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> int:
    manifest = build()
    print(
        "Public Pages bundle OK: "
        f"{manifest['repository_count']} repositories, "
        f"{len(manifest['audit_sidecars'])} audit sidecars"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
