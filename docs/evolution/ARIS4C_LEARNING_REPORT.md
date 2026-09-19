# ARIS4C Learning Report

## Scope

This report records concrete design patterns learned from the current `CochraneK/ARIS4C` repository and how they map into repo-auditor. The goal is adaptation, not copying.

## What ARIS4C does especially well

### 1. One canonical state, many execution surfaces

ARIS4C separates:
- portfolio state from paper-specific scientific truth;
- command-center orchestration from project-native files;
- temporary chats/agents from durable Git state.

repo-auditor adopts the same rule: Pages, AI reviewers and handoff documents may summarize canonical evidence, but may not become a second contradictory source of truth.

### 2. Continuity is a first-class deliverable

ARIS4C does not treat handoff as one loose note. Its full continuity package can contain:

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

This separates current state, queue, decisions, compact context, public-safe conversation history, takeover instructions and execution history.

repo-auditor therefore supports two continuity profiles:
- **lightweight** — root AGENTS/HANDOFF/STATUS/DECISIONS + architecture/validation;
- **full** — ARIS4C-style `handoff/` package for long-lived or multi-agent repositories.

### 3. Checkpoint before switching agents/projects

ARIS4C treats a bounded work unit as incomplete until its material state is committed. Before switching contexts, canonical files and handoff state are synchronized.

repo-auditor adopts this as an agent rule:
**chat progress is not durable progress; a safe checkpoint is Git + validation + handoff update.**

### 4. Live state is not the same as “can continue”

ARIS4C distinguishes Finish / Active / Wait / Block and explicitly prevents maintenance-only activity from being mistaken for substantive progress.

repo-auditor maps this lesson into separate orthogonal signals:
- Priority
- Quality
- Audit Coverage
- AI Readiness
- Remediation state
- external-blocked / owner-choice boundaries

A repository must not be labeled healthy merely because automation ran recently.

### 5. Output contracts define completion

ARIS4C defines what “final” means instead of inferring completion from a vague progress number.

repo-auditor should likewise treat “done” as a contract:
- required evidence exists;
- relevant gates pass;
- safe findings are remediated or explicitly accepted;
- handoff is current;
- public/private boundaries are satisfied.

### 6. Generated visuals come from canonical data

ARIS4C uses generated architecture/status/readiness visuals and a public command center instead of hand-maintaining multiple status stories.

repo-auditor adopts the same pattern:
- public Pages data is generated from canonical registry/audit artifacts;
- AI-readiness aggregates are derived from evidence;
- visual surfaces must not invent private or stale state.

### 7. Public-safe continuity instead of raw hidden reasoning

ARIS4C preserves useful research conversation summaries while explicitly excluding hidden chain-of-thought, credentials and unnecessary sensitive data.

repo-auditor adopts the same principle for future session/agent logs:
store decisions, evidence, user corrections and resulting changes — not private reasoning traces or secrets.

## Adaptations already implemented

- deterministic AI-readiness runtime;
- root and `handoff/` continuity detection;
- AGENTS/HANDOFF/STATUS/DECISIONS/architecture/validation checks;
- provider-neutral semantic review with private-evidence fail-closed behavior;
- reviewer/builder workflow schema;
- self dogfooding test;
- privacy-safe AI-readiness aggregate for Pages;
- durable HANDOFF / STATUS / DECISIONS files in repo-auditor itself.

## Deliberately not copied

- ARIS4C paper-specific scientific lifecycle does not become a generic software lifecycle.
- Full continuity packages are not mandatory for trivial/small repositories.
- A progress percentage is not used as a repository quality score.
- AI semantic review cannot override deterministic evidence or owner-choice boundaries.

## Next generalization loop

When another repository reveals a useful pattern:
1. record the observed miss;
2. decide whether it generalizes;
3. if yes, create a deterministic rule/test or reusable skill;
4. if context-dependent, keep it in semantic review;
5. re-audit repo-auditor itself.

The long-term objective is not “more checks”; it is a repository control plane that becomes easier for both humans and future agents to inherit.
