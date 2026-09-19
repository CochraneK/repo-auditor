# AI Agent Handoff Standard

## Goal

A repository should remain executable after switching ChatGPT conversation, account, computer, coding agent or human maintainer.

Git is the durable source of truth. Handoff artifacts summarize canonical state; they must not create a second contradictory state.

## Profile A — lightweight continuity

Recommended for ordinary active repositories:

```text
README.md
AGENTS.md
HANDOFF.md
STATUS.md
DECISIONS.md
docs/architecture.md
```

Minimum `HANDOFF.md` content:
1. current mission;
2. completed work;
3. blockers / gates;
4. immediate next action;
5. exact validation commands;
6. risky areas / do-not-break constraints;
7. canonical files.

## Profile B — full continuity

Recommended for long-lived, multi-agent, research-heavy or cross-device projects:

```text
handoff/
├── README.md
├── STATUS.md
├── TODO.md
├── DECISIONS.md
├── CONTEXT.md
├── CHATLOG.md
├── AGENT_HANDOFF.md
└── SESSION_LOG.md
```

The full profile follows the strongest continuity lesson from ARIS4C:

- `README.md` — cold-start read order and canonical-source map.
- `STATUS.md` — current snapshot, gate and blocker.
- `TODO.md` — actionable queue; completed history is not silently erased when explanatory.
- `DECISIONS.md` — append-oriented important decisions and rejected alternatives.
- `CONTEXT.md` — compact cold-start domain context.
- `CHATLOG.md` — public-safe summaries of material interactions and corrections.
- `AGENT_HANDOFF.md` — takeover brief with immediate next action and do-not constraints.
- `SESSION_LOG.md` — substantial execution, validation, commits/artifacts and remaining work.

## Checkpoint-before-switch

Before intentionally switching agent/project after a substantive bounded unit:

1. update canonical project files first;
2. synchronize state/handoff;
3. update next actions;
4. append material decisions;
5. record validation and resulting commit/artifact;
6. commit the bounded unit.

Do not treat chat-only progress as durable progress.

## Public repository safety

Continuity artifacts must not contain:
- API keys, tokens, cookies or credentials;
- hidden model chain-of-thought;
- unnecessary sensitive personal data;
- confidential third-party material;
- private repository evidence intended for a public surface.

A concise faithful public-safe summary is preferred over raw conversation dumps.

## Audit interpretation

Missing continuity reduces **AI Readiness**, not repository engineering quality. The two dimensions remain separate.

A full handoff package is optional unless a repository policy explicitly requires it; lightweight continuity is the default target for non-trivial active repositories.
