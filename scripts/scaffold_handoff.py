#!/usr/bin/env python3
"""Safely scaffold durable AI handoff files without overwriting project state."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

FULL = [
    "handoff/README.md",
    "handoff/STATUS.md",
    "handoff/TODO.md",
    "handoff/DECISIONS.md",
    "handoff/CONTEXT.md",
    "handoff/CHATLOG.md",
    "handoff/AGENT_HANDOFF.md",
    "handoff/SESSION_LOG.md",
]
LIGHTWEIGHT = ["HANDOFF.md", "STATUS.md", "DECISIONS.md"]


def template(path: str, project: str) -> str:
    name = Path(path).name
    bodies = {
        "HANDOFF.md": f"""# Agent Handoff — {project}

## Current mission

Describe the bounded objective currently being advanced.

## Completed

- Record durable completed work.

## Blockers / gates

- None recorded.

## Next action

1. Replace this placeholder with the immediate executable next step.

## Validation

Record exact test/build/audit commands.

## Do not break

Record privacy, compatibility, IP, data, or architecture boundaries.
""",
        "STATUS.md": f"""# Status — {project}

## State

Unknown until reviewed.

## Current capabilities

- Replace with verified current capabilities.

## Current limitations

- Replace with verified limitations and blockers.
""",
        "DECISIONS.md": f"""# Decisions — {project}

Append material decisions here. Record what changed, why, rejected alternatives when relevant, and affected files/commits when known.
""",
        "README.md": f"""# Handoff — {project}

Cold-start order:

1. AGENT_HANDOFF.md
2. STATUS.md
3. TODO.md
4. DECISIONS.md
5. CONTEXT.md
6. CHATLOG.md
7. SESSION_LOG.md

Canonical project files remain authoritative; this package summarizes them.
""",
        "TODO.md": "# TODO\n\n## P0\n\n- [ ] Immediate next gate.\n\n## P1\n\n- [ ] Enabling work.\n\n## P2\n\n- [ ] Optional polish.\n",
        "CONTEXT.md": f"# Context — {project}\n\nSummarize the minimum domain, architecture, terminology and canonical-file context needed for a cold start.\n",
        "CHATLOG.md": "# Public-safe interaction log\n\nRecord concise material interaction summaries. Never store credentials, hidden chain-of-thought, or unnecessary sensitive data.\n",
        "AGENT_HANDOFF.md": f"""# Agent Handoff — {project}

## What this project is

Describe the project and canonical sources.

## What is done

- Verified completed work.

## What is not done

- Remaining work.

## Immediate next action

1. Execute one bounded unit, validate it, checkpoint it to Git.

## Current blockers / gates

- None recorded.

## Canonical files

- List canonical files.

## Do not

- Record protected boundaries.

## Session closeout

Update STATUS, TODO, DECISIONS when material, SESSION_LOG, then commit.
""",
        "SESSION_LOG.md": "# Session log\n\nAppend substantial sessions with date, executor/surface, work performed, validation, commits/artifacts and remaining work.\n",
    }
    return bodies[name]


def plan(root: Path, profile: str) -> dict:
    paths = LIGHTWEIGHT if profile == "lightweight" else FULL
    missing = [path for path in paths if not (root / path).exists()]
    existing = [path for path in paths if (root / path).exists()]
    return {"profile": profile, "root": str(root), "missing": missing, "existing": existing}


def scaffold(root: Path, profile: str, write: bool = False) -> dict:
    result = plan(root, profile)
    created: list[str] = []
    if write:
        project = root.resolve().name
        for rel in result["missing"]:
            target = root / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(template(rel, project), encoding="utf-8")
            created.append(rel)
    result["created"] = created
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", type=Path, default=Path("."))
    parser.add_argument("--profile", choices=("lightweight", "full"), default="lightweight")
    parser.add_argument("--write", action="store_true", help="Create missing files. Existing files are never overwritten.")
    args = parser.parse_args()
    result = scaffold(args.root, args.profile, args.write)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
