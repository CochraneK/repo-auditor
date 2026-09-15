#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "portfolio" / "registry.json"

STABLE = {"CORE", "ACTIVE", "INCUBATING", "PARKED", "ARCHIVED"}
ALLOWED = STABLE | {"UNCLASSIFIED"}
BANDS = {"0-30d", "31-90d", "91-180d", "181-365d", ">365d"}
REQUIRED = {
    "name", "visibility", "default_branch", "size_kb", "last_commit_date",
    "activity_band", "lifecycle", "review_priority", "category", "next_action"
}

def fail(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    return 1

def main():
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    repos = data.get("repositories", [])
    errors = []

    if not repos:
        errors.append("registry has no repositories")

    names = [r.get("name") for r in repos]
    dupes = sorted(n for n, c in Counter(names).items() if c > 1)
    if dupes:
        errors.append(f"duplicate repository names: {dupes}")

    for i, repo in enumerate(repos):
        missing = REQUIRED - repo.keys()
        if missing:
            errors.append(f"record {i} ({repo.get('name')}): missing {sorted(missing)}")
        if repo.get("lifecycle") not in ALLOWED:
            errors.append(f"{repo.get('name')}: invalid lifecycle {repo.get('lifecycle')}")
        if repo.get("activity_band") not in BANDS:
            errors.append(f"{repo.get('name')}: invalid activity_band {repo.get('activity_band')}")

    core_limit = data.get("governance", {}).get("core_limit", 7)
    lifecycle_counts = Counter(r.get("lifecycle") for r in repos)
    if lifecycle_counts["CORE"] > core_limit:
        errors.append(f"CORE count {lifecycle_counts['CORE']} exceeds hard limit {core_limit}")

    if errors:
        for e in errors:
            fail(e)
        return 1

    activity_counts = Counter(r["activity_band"] for r in repos)
    print(f"Portfolio OK: {len(repos)} repositories")
    print("Lifecycle:")
    for key in ["CORE", "ACTIVE", "INCUBATING", "PARKED", "ARCHIVED", "UNCLASSIFIED"]:
        print(f"  {key:13} {lifecycle_counts[key]}")
    print("Activity:")
    for key in ["0-30d", "31-90d", "91-180d", "181-365d", ">365d"]:
        print(f"  {key:13} {activity_counts[key]}")
    candidates = [r["name"] for r in repos if r["review_priority"] == "archive-review"]
    print("Archive-review candidates:")
    for name in candidates:
        print(f"  - {name}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
