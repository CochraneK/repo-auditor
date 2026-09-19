# Agent Handoff Review Skill

## Purpose
Evaluate whether a repository can be safely transferred between AI agents or human maintainers.

## Checklist

- AGENTS.md defines operating instructions
- HANDOFF.md describes current mission and state
- STATUS.md records progress
- DECISIONS.md records architectural choices
- Known blockers are explicit
- Validation commands are available
- Risky areas are documented
- Ownership boundaries are clear

## Output

Return:

- handoff_score
- missing_artifacts
- continuity_risks
- evidence
- remediation
- confidence
