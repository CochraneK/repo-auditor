#!/usr/bin/env python3
"""Generate README SVGs from privacy-safe canonical portfolio data."""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from typing import Any

BG = "#f3f1ea"
PANEL = "#fffef9"
SURFACE = "#faf9f5"
LINE = "#dedbd1"
TEXT = "#171a1f"
MUTED = "#73766f"
MUTED2 = "#a3a59e"
ACCENT = "#425d52"
ACCENT_SOFT = "#e6ece8"
GREEN = "#3d6f5b"
AMBER = "#986f34"


def esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def svg_head(title: str, subtitle: str, height: int) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="{height}" viewBox="0 0 1600 {height}" role="img">',
        f"<title>{esc(title)}</title>",
        f'<rect width="1600" height="{height}" rx="30" fill="{BG}"/>',
        f'<rect x="1" y="1" width="1598" height="{height-2}" rx="29" fill="none" stroke="{LINE}"/>',
        '<style>text{font-family:Inter,"Noto Sans SC","Microsoft YaHei",system-ui,sans-serif}.title{fill:#171a1f;font-size:58px;font-weight:760;letter-spacing:-1.5px}.sub{fill:#73766f;font-size:19px}.eyebrow{fill:#73766f;font-size:14px;font-weight:850;letter-spacing:2.2px}.label{fill:#73766f;font-size:14px;font-weight:700}.metric{fill:#171a1f;font-size:40px;font-weight:820}.box{fill:#fffef9;stroke:#dedbd1;stroke-width:2}.small{fill:#73766f;font-size:14px}.accent{fill:#425d52}</style>',
        '<text x="66" y="62" class="eyebrow">COCHRANEK · REPO AUDITOR</text>',
        f'<text x="66" y="136" class="title">{esc(title)}</text>',
        f'<text x="66" y="178" class="sub">{esc(subtitle)}</text>',
    ]


def hero(overview: dict[str, Any] | None = None, showcase_count: int | None = None) -> str:
    overview = overview or {}
    inventory = overview.get("inventory") or {}
    coverage = overview.get("coverage") or {}
    public_count = inventory.get("public", inventory.get("observed_total", "—"))
    ai_ready = coverage.get("ai_ready", "—")
    coverage_status = overview.get("audit_status", "UNKNOWN")
    showcases = showcase_count if showcase_count is not None else "—"

    parts = svg_head(
        "Repository quality, kept visible.",
        "A calm, public-safe control center for audit, remediation, and AI handoff.",
        520,
    )
    metrics = [
        ("Public repositories", public_count),
        ("Reviewed showcases", showcases),
        ("AI-ready", ai_ready),
        ("Coverage", coverage_status),
    ]
    for i, (label, value) in enumerate(metrics):
        x = 66 + i * 365
        parts += [
            f'<rect x="{x}" y="248" width="330" height="122" rx="18" class="box"/>',
            f'<text x="{x+22}" y="300" class="metric">{esc(value)}</text>',
            f'<text x="{x+22}" y="337" class="label">{esc(label)}</text>',
        ]
    parts += [
        f'<rect x="66" y="414" width="1468" height="54" rx="14" fill="{ACCENT_SOFT}"/>',
        f'<circle cx="91" cy="441" r="7" fill="{GREEN}"/>',
        '<text x="111" y="447" class="small">Control Center v2 · Pages live · public/private boundary fail-closed · audit evidence stays traceable</text>',
        "</svg>",
    ]
    return chr(10).join(parts) + chr(10)


def readiness(overview: dict[str, Any]) -> str:
    coverage = overview.get("coverage") or {}
    inventory = overview.get("inventory") or {}
    status = overview.get("audit_status", "UNKNOWN")
    marker = "≥" if inventory.get("baseline_kind") == "lower-bound" else ""
    metrics = [
        ("Observed", f"{inventory.get('observed_total', '—')}/{marker}{inventory.get('expected_total', '—')}"),
        ("AI-ready", coverage.get("ai_ready", "—")),
        ("AGENTS", coverage.get("agents_present", "—")),
        ("Handoff", coverage.get("handoff_present", "—")),
        ("Full continuity", coverage.get("continuity_full", "—")),
    ]
    parts = svg_head(
        "Portfolio readiness",
        "Coverage and agent-continuity signals stay separate from repository quality.",
        470,
    )
    for i, (label, value) in enumerate(metrics):
        x = 66 + i * 299
        parts += [
            f'<rect x="{x}" y="226" width="264" height="126" rx="18" class="box"/>',
            f'<text x="{x+22}" y="280" class="metric">{esc(value)}</text>',
            f'<text x="{x+22}" y="318" class="label">{esc(label)}</text>',
        ]
    state_color = GREEN if status == "PASS" else AMBER
    parts += [
        f'<circle cx="79" cy="411" r="7" fill="{state_color}"/>',
        f'<text x="99" y="417" class="small">Audit coverage · {esc(status)} · privacy-safe aggregate only</text>',
        "</svg>",
    ]
    return chr(10).join(parts) + chr(10)


def build(
    overview: dict[str, Any],
    out_dir: Path,
    showcase_count: int | None = None,
) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    outputs = {
        "hero.svg": hero(overview, showcase_count),
        "portfolio-readiness.svg": readiness(overview),
    }
    written = []
    for name, content in outputs.items():
        path = out_dir / name
        path.write_text(content, encoding="utf-8")
        written.append(path)
    return written


def _showcase_count(path: Path) -> int | None:
    if not path.exists():
        return None
    manifest = json.loads(path.read_text(encoding="utf-8"))
    entries = manifest.get("showcases")
    if not isinstance(entries, list):
        entries = manifest.get("items")
    return len(entries) if isinstance(entries, list) else None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--overview", type=Path, default=Path("docs/data/portfolio-overview.json"))
    parser.add_argument("--showcase-manifest", type=Path, default=Path("docs/showcase/manifest.json"))
    parser.add_argument("--out-dir", type=Path, default=Path("docs/assets/readme"))
    args = parser.parse_args()
    overview = json.loads(args.overview.read_text(encoding="utf-8"))
    showcase_count = _showcase_count(args.showcase_manifest)
    for path in build(overview, args.out_dir, showcase_count):
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
