#!/usr/bin/env python3
"""Deterministic static visual/UX checks for GitHub Pages.

This is intentionally dependency-free. It catches high-confidence presentation
risks in HTML/CSS before a browser/screenshot layer is available.
"""
from __future__ import annotations
import argparse, json, re
from pathlib import Path

RULES = [
    ("UI-TEXT-001", "P1", "repo descriptions are not line-clamped", lambda s: ".repo p" in s and "line-clamp" not in s),
    ("UI-WRAP-001", "P1", "long unbroken text has no overflow-wrap policy", lambda s: "overflow-wrap" not in s and "word-break" not in s),
    ("UI-CARD-001", "P2", "repository cards have no bounded/equal-height layout", lambda s: ".repo{" in s and "height:100%" not in s),
    ("UI-SEV-001", "P2", "severity presentation is not level-specific", lambda s: ".sev" in s and not re.search(r"sev[-_.]?(p0|critical)|data-severity", s, re.I)),
    ("UI-STATE-001", "P2", "loading/error states use raw engineering copy", lambda s: "loading snapshot" in s.lower() or "Load failed:" in s),
]

def audit_text(text: str) -> list[dict[str, str]]:
    findings=[]
    for rule_id,severity,message,test in RULES:
        if test(text): findings.append({"id":rule_id,"severity":severity,"message":message,"auto_fix":True})
    return findings

def audit(path: Path) -> dict:
    text=path.read_text(encoding="utf-8")
    findings=audit_text(text)
    return {"schema_version":1,"target":str(path),"dimension":"visual_ux","status":"pass" if not findings else "needs-attention","findings":findings}

def main() -> int:
    p=argparse.ArgumentParser(); p.add_argument("path",nargs="?",default="docs/index.html"); p.add_argument("--json",action="store_true"); p.add_argument("--fail-on-findings",action="store_true"); args=p.parse_args()
    report=audit(Path(args.path))
    print(json.dumps(report,ensure_ascii=False,indent=2) if args.json else "\n".join([f"{x['severity']} {x['id']} · {x['message']}" for x in report['findings']]) or "Visual UX audit: PASS")
    return 1 if args.fail_on_findings and report["findings"] else 0
if __name__=="__main__": raise SystemExit(main())
