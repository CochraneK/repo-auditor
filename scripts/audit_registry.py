#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "portfolio" / "registry.json"

VISIBILITY = {"public", "private"}
STATUS = {"CONTINUE", "STOP"}
BANDS = {"P0-NOW", "P1-NEXT", "P2-PLANNED", "P3-LATER", "P4-LOW", "STOP"}
REQUIRED = {
    "name", "visibility", "work_status", "priority_score",
    "priority_band", "reason", "last_commit_date"
}

def expected_band(score, status):
    if status == "STOP":
        return "STOP"
    if score >= 90:
        return "P0-NOW"
    if score >= 70:
        return "P1-NEXT"
    if score >= 50:
        return "P2-PLANNED"
    if score >= 20:
        return "P3-LATER"
    return "P4-LOW"

def main():
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    repos = data.get("repositories", [])
    errors = []

    names = [r.get("name") for r in repos]
    dupes = sorted(n for n, c in Counter(names).items() if c > 1)
    if dupes:
        errors.append(f"duplicate repository names: {dupes}")

    for i, repo in enumerate(repos):
        missing = REQUIRED - repo.keys()
        if missing:
            errors.append(f"record {i} ({repo.get('name')}): missing {sorted(missing)}")
            continue

        name = repo["name"]
        status = repo["work_status"]
        score = repo["priority_score"]
        band = repo["priority_band"]

        if repo["visibility"] not in VISIBILITY:
            errors.append(f"{name}: invalid visibility {repo['visibility']}")
        if status not in STATUS:
            errors.append(f"{name}: invalid work_status {status}")
        if not isinstance(score, int) or not 0 <= score <= 100:
            errors.append(f"{name}: priority_score must be integer 0..100")
        if band not in BANDS:
            errors.append(f"{name}: invalid priority_band {band}")

        if isinstance(score, int):
            if status == "STOP" and score != 0:
                errors.append(f"{name}: STOP must have score 0")
            if status == "CONTINUE" and score <= 0:
                errors.append(f"{name}: CONTINUE must have score > 0")
            expected = expected_band(score, status)
            if band != expected:
                errors.append(f"{name}: band {band} does not match score/status; expected {expected}")

    if errors:
        for err in errors:
            print(f"ERROR: {err}", file=sys.stderr)
        return 1

    v = Counter(r["visibility"] for r in repos)
    s = Counter(r["work_status"] for r in repos)
    b = Counter(r["priority_band"] for r in repos)

    print(f"Portfolio OK: {len(repos)} repositories")
    print(f"Visibility: public={v['public']} private={v['private']}")
    print(f"Work status: CONTINUE={s['CONTINUE']} STOP={s['STOP']}")
    print(
        "Priority: "
        f"P0={b['P0-NOW']} P1={b['P1-NEXT']} P2={b['P2-PLANNED']} "
        f"P3={b['P3-LATER']} P4={b['P4-LOW']} STOP={b['STOP']}"
    )

    print("Top priorities:")
    active = sorted(
        (r for r in repos if r["work_status"] == "CONTINUE"),
        key=lambda r: (-r["priority_score"], r["name"].lower()),
    )
    for repo in active[:10]:
        print(f"  {repo['priority_score']:3}  {repo['name']}")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
