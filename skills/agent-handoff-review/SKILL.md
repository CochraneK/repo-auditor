# Agent Handoff Review Skill

## Purpose

Evaluate whether another AI agent or human maintainer can cold-start from Git without reconstructing project state from chat history.

## Evidence order

1. canonical project metadata/state;
2. AGENTS instructions;
3. lightweight root handoff or full `handoff/` package;
4. architecture and validation docs;
5. recent commits/session records.

## Checklist

- canonical source of truth is explicit;
- AGENTS instructions exist when needed;
- lightweight `HANDOFF.md` **or** `handoff/AGENT_HANDOFF.md` / `handoff/README.md` exists;
- STATUS and DECISIONS are recoverable from root or `handoff/`;
- immediate next action is explicit;
- blocker/gate is explicit;
- exact validation commands exist;
- risky/do-not-break areas are documented;
- public continuity text is secret- and privacy-safe;
- material state is checkpointed to Git before an agent/project switch;
- full continuity package completeness is reported separately when the repository opts into it.

## Output

Return:
- handoff_profile: none | lightweight | full;
- handoff_score;
- missing_artifacts;
- continuity_risks;
- canonical_source_conflicts;
- evidence;
- remediation;
- confidence.

Do not convert handoff score into an engineering-quality score.
