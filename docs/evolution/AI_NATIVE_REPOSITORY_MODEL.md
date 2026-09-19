# AI-Native Repository Model

## Goal

A mature repository should be understandable by both humans and AI agents.

## Recommended structure

```text
README.md
AGENTS.md
HANDOFF.md
STATUS.md
DECISIONS.md
CHANGELOG.md
docs/
  architecture.md
```

## AI readiness dimensions

| Dimension | Question |
|---|---|
| Context | Can an agent understand the project? |
| Handoff | Can another agent continue work? |
| Decisions | Are important choices recorded? |
| Validation | Is success measurable? |
| Architecture | Is the system explainable? |

## Audit integration

Future repo-auditor versions will score AI readiness separately from code quality.

Quality, priority, and AI readiness must not be conflated.
