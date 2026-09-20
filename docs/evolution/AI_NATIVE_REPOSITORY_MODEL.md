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

repo-auditor scores AI readiness separately from code quality and can publish privacy-safe per-public-repository readiness signals.

Quality, priority, Audit Coverage, AI readiness, semantic review and publication/IP gates must not be conflated.


## Learned cross-cutting gates

Downstream migrations have shown that AI-native readiness alone is insufficient. A repository can be easy for an agent to inherit while still carrying unresolved privacy, claim-validity or asset-provenance risks.

Reusable semantic review skills therefore cover:
- privacy/data-flow boundaries;
- third-party asset and model provenance;
- inference-claim drift from weak proxies to stronger human conclusions.

These remain orthogonal to AI readiness.
