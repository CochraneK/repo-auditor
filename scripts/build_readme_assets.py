#!/usr/bin/env python3
"""Generate crisp README SVGs from privacy-safe canonical portfolio data."""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from typing import Any

BG = "#08111f"
PANEL = "#0f1d31"
LINE = "#274260"
TEXT = "#f8fafc"
MUTED = "#9fb2ca"
ACCENT = "#7c8cff"
GREEN = "#49d49d"
AMBER = "#f5b85c"


def esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def svg_head(title: str, subtitle: str, height: int) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="{height}" viewBox="0 0 1600 {height}" role="img">',
        f"<title>{esc(title)}</title>",
        f'<rect width="1600" height="{height}" rx="30" fill="{BG}"/>',
        '<style>text{font-family:Inter,"Noto Sans SC","Microsoft YaHei",system-ui,sans-serif}.title{fill:#f8fafc;font-size:48px;font-weight:800}.sub{fill:#9fb2ca;font-size:20px}.label{fill:#9fb2ca;font-size:15px;font-weight:700}.metric{fill:#f8fafc;font-size:42px;font-weight:850}.box{fill:#0f1d31;stroke:#274260;stroke-width:2}.node{fill:#111f37;stroke:#7c8cff;stroke-width:2}.nodeText{fill:#f8fafc;font-size:18px;font-weight:750}.small{fill:#9fb2ca;font-size:14px}</style>',
        '<text x="64" y="62" fill="#7c8cff" font-size="19" font-weight="850">CochraneK · REPO AUDITOR</text>',
        f'<text x="64" y="126" class="title">{esc(title)}</text>',
        f'<text x="64" y="164" class="sub">{esc(subtitle)}</text>',
    ]


def hero() -> str:
    parts = svg_head("Audit → Fix → Re-audit", "Evidence-backed repository control plane for humans and AI agents", 520)
    nodes = [
        ("Inventory", 70), ("Evidence", 340), ("Audit", 610), ("Remediate", 880), ("Review", 1150), ("Learn", 1420)
    ]
    for index, (label, x) in enumerate(nodes):
        width = 190 if index < 5 else 115
        parts += [
            f'<rect x="{x}" y="245" width="{width}" height="95" rx="20" class="node"/>',
            f'<text x="{x + width/2}" y="302" text-anchor="middle" class="nodeText">{esc(label)}</text>',
        ]
        if index < len(nodes) - 1:
            next_x = nodes[index + 1][1]
            parts += [
                f'<line x1="{x + width + 12}" y1="292" x2="{next_x - 20}" y2="292" stroke="{ACCENT}" stroke-width="4"/>',
                f'<path d="M{next_x-24} 282 L{next_x-8} 292 L{next_x-24} 302 Z" fill="{ACCENT}"/>',
            ]
    parts += [
        '<rect x="70" y="395" width="1465" height="64" rx="18" fill="#0b213c" stroke="#274260"/>',
        '<text x="100" y="434" fill="#49d49d" font-size="16" font-weight="800">Privacy-safe Pages · deterministic assurance · optional semantic review · durable handoff · meta-learning</text>',
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
    parts = svg_head("Portfolio readiness", "Audit coverage and agent-continuity signals stay separate from repository quality", 470)
    for i, (label, value) in enumerate(metrics):
        x = 65 + i * 300
        parts += [
            f'<rect x="{x}" y="220" width="255" height="135" rx="22" class="box"/>',
            f'<text x="{x+22}" y="275" class="metric">{esc(value)}</text>',
            f'<text x="{x+22}" y="315" class="label">{esc(label)}</text>',
        ]
    state_color = GREEN if status == "PASS" else AMBER
    parts += [
        f'<circle cx="78" cy="410" r="9" fill="{state_color}"/>',
        f'<text x="100" y="416" class="small">Audit Coverage · {esc(status)} · generated from privacy-safe aggregate only</text>',
        "</svg>",
    ]
    return chr(10).join(parts) + chr(10)


def build(overview: dict[str, Any], out_dir: Path) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    outputs = {
        "hero.svg": hero(),
        "portfolio-readiness.svg": readiness(overview),
    }
    written = []
    for name, content in outputs.items():
        path = out_dir / name
        path.write_text(content, encoding="utf-8")
        written.append(path)
    return written


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--overview", type=Path, default=Path("docs/data/portfolio-overview.json"))
    parser.add_argument("--out-dir", type=Path, default=Path("docs/assets/readme"))
    args = parser.parse_args()
    overview = json.loads(args.overview.read_text(encoding="utf-8"))
    for path in build(overview, args.out_dir):
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
