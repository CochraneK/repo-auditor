#!/usr/bin/env python3
"""Provider-agnostic execution-mode router for repo-auditor."""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass

MODES = ("CHAT", "PLAN", "CODE", "WORK", "WATCH", "HUMAN")


@dataclass
class Task:
    scope: int = 0
    ambiguity: int = 0
    repo_execution: int = 0
    iteration_depth: int = 0
    cross_system_dependency: int = 0
    verification_cost: int = 0
    context_cost: int = 0
    autonomy_need: int = 0
    risk: int = 0
    recurring: bool = False
    owner_choice: bool = False

    def validate(self) -> None:
        for key, value in asdict(self).items():
            if isinstance(value, bool):
                continue
            if not 0 <= value <= 5:
                raise ValueError(f"{key} must be between 0 and 5")


def route(task: Task) -> dict:
    """Return an explainable mode recommendation; scores are routing fit, not quality."""
    task.validate()
    scores = {
        "CHAT": 10 + 2 * (5 - task.scope) + 2 * (5 - task.repo_execution) + (5 - task.iteration_depth),
        "PLAN": 6 + 4 * task.ambiguity + 2 * task.scope + task.verification_cost,
        "CODE": 5 + 4 * task.repo_execution + 3 * task.iteration_depth + 2 * task.verification_cost + task.scope,
        "WORK": 5 + 4 * task.cross_system_dependency + 3 * task.autonomy_need + 2 * task.scope + task.iteration_depth,
        "WATCH": 30 if task.recurring else 0,
        "HUMAN": 40 if task.owner_choice or task.risk >= 5 else task.risk,
    }

    if task.owner_choice or task.risk >= 5:
        recommended = "HUMAN"
        route_modes = ["HUMAN"]
        reason = "Authority/risk boundary requires a human decision before execution."
    elif task.recurring:
        recommended = "WATCH"
        route_modes = ["WATCH"]
        reason = "The task derives value from repeated future checks."
    else:
        candidates = ("CHAT", "PLAN", "CODE", "WORK")
        recommended = max(candidates, key=lambda mode: scores[mode])
        route_modes = []
        if task.ambiguity >= 3 and recommended in {"CODE", "WORK"}:
            route_modes.append("PLAN")
        route_modes.append(recommended)
        reason = {
            "CHAT": "Bounded interactive work is sufficient; avoid unnecessary autonomous exploration.",
            "PLAN": "Resolve ambiguity/dependencies before committing execution resources.",
            "CODE": "Repository edits and executable verification dominate the task.",
            "WORK": "Cross-system dependencies or long-horizon autonomy dominate the task.",
        }[recommended]

    best_capability = max(MODES, key=lambda mode: scores[mode])
    # Efficiency preference: CHAT < PLAN < CODE < WORK for equally sufficient one-off work.
    efficiency_order = ("CHAT", "PLAN", "CODE", "WORK", "WATCH", "HUMAN")
    threshold = max(scores[m] for m in MODES) * 0.72
    sufficient = [m for m in efficiency_order if scores[m] >= threshold]
    best_value = sufficient[0] if sufficient else recommended

    escalate = []
    if recommended == "CHAT":
        escalate = ["scope expands across several coupled files", "shell/build/test loop becomes necessary", "repeated debugging is required"]
    elif recommended == "PLAN":
        escalate = ["plan is accepted and implementation begins"]
    elif recommended == "CODE":
        escalate = ["work becomes cross-system or needs browser/app orchestration"]
    elif recommended == "WORK":
        escalate = ["an owner-choice, permission, or irreversible boundary is reached"]
    elif recommended == "WATCH":
        escalate = ["a detected condition requires remediation"]

    return {
        "recommended": recommended,
        "route": route_modes,
        "best_capability": best_capability,
        "best_value": best_value,
        "scores": scores,
        "reason": reason,
        "escalate_when": escalate,
        "note": "Scores represent execution-mode fit, not repository quality.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Recommend an execution mode for a repository task")
    for field in ("scope", "ambiguity", "repo_execution", "iteration_depth", "cross_system_dependency", "verification_cost", "context_cost", "autonomy_need", "risk"):
        parser.add_argument(f"--{field.replace('_', '-')}", type=int, default=0)
    parser.add_argument("--recurring", action="store_true")
    parser.add_argument("--owner-choice", action="store_true")
    args = parser.parse_args()
    print(json.dumps(route(Task(**vars(args))), indent=2))


if __name__ == "__main__":
    main()
