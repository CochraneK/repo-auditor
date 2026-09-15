#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "portfolio" / "registry.json"

VISIBILITY = {"public", "private"}
STATUS = {"CONTINUE", "STOP", "TBD"}
REQUIRED = {"name", "visibility", "work_status", "reason", "last_commit_date"}

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
        if repo.get("visibility") not in VISIBILITY:
            errors.append(f"{repo.get('name')}: invalid visibility {repo.get('visibility')}")
        if repo.get("work_status") not in STATUS:
            errors.append(f"{repo.get('name')}: invalid work_status {repo.get('work_status')}")

    if errors:
        for err in errors:
            print(f"ERROR: {err}", file=sys.stderr)
        return 1

    v = Counter(r["visibility"] for r in repos)
    s = Counter(r["work_status"] for r in repos)

    print(f"Portfolio OK: {len(repos)} repositories")
    print(f"Visibility: public={v['public']} private={v['private']}")
    print(f"Work status: CONTINUE={s['CONTINUE']} STOP={s['STOP']} TBD={s['TBD']}")

    if s["TBD"]:
        print("Pending decisions:")
        for repo in repos:
            if repo["work_status"] == "TBD":
                print(f"  - {repo['name']} ({repo['visibility']})")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
